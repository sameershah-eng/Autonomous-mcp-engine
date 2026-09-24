import { mcpServer } from '../mcp/server';
import { getProvider } from '../llm/providerFactory';
import { validateToolArgs, agentSummarySchema } from './validator';
import { executeWithRetryAndTimeout } from './retry';
import { useAgentStore } from '../../store/agentStore';
import { useSettingsStore } from '../../store/settingsStore';
import { useHistoryStore } from '../../store/historyStore';
import { useIntegrationsStore } from '../../store/integrationsStore';
import type { ExecutionStep, AgentRun, AgentSummary } from '../../types/agent';
import type { LLMMessage } from '../llm/types';

export async function runAgentLoop(prompt: string, customRunId?: string): Promise<void> {
  const agentStore = useAgentStore.getState();
  const settings = useSettingsStore.getState();
  const historyStore = useHistoryStore.getState();
  const integrationsStore = useIntegrationsStore.getState();

  const runId = customRunId || `run_${Date.now()}`;
  agentStore.startRun(runId, prompt);

  // Sync allowed tools based on active integrations
  integrationsStore.syncMCPServerTools();
  const availableTools = await mcpServer.listTools();

  // Determine active provider (Gemini or Demo fallback)
  let provider = getProvider(settings.activeProviderId);
  const isConfigured = await provider.isConfigured();
  if (!isConfigured) {
    provider = getProvider('demo');
  }

  const startTime = Date.now();
  let totalRetries = 0;
  const executionSteps: ExecutionStep[] = [];

  // Conversation history for LLM
  const conversation: LLMMessage[] = [
    { role: 'user', content: prompt },
  ];

  try {
    for (let stepIndex = 1; stepIndex <= settings.maxSteps; stepIndex++) {
      // Context management: keep last 20 messages
      let activeMessages = conversation;
      if (conversation.length > 20) {
        const olderCount = conversation.length - 20;
        activeMessages = [
          { role: 'system', content: `[Summarized Context: ${olderCount} prior execution messages omitted]` },
          ...conversation.slice(-20),
        ];
      }

      // Query LLM
      const response = await provider.chat({
        messages: activeMessages,
        tools: availableTools,
        systemPrompt: settings.systemPrompt,
        temperature: settings.temperature,
        model: settings.model,
      });

      if (response.usage) {
        agentStore.setTokenUsage(response.usage);
      }

      // Check if model returned tool calls or final answer
      if (!response.toolCalls || response.toolCalls.length === 0) {
        // Model provided final answer!
        const finalAnswer = response.content || 'Workflow completed.';

        // Stream final text simulation for smooth UX
        agentStore.setIsStreaming(true);
        agentStore.appendMessage({
          id: `msg_${Date.now()}`,
          role: 'assistant',
          content: '',
          timestamp: Date.now(),
        });

        // Fast streaming typewriter
        const chunks = finalAnswer.split(' ');
        let accumulated = '';
        for (let i = 0; i < chunks.length; i++) {
          accumulated += (i > 0 ? ' ' : '') + chunks[i];
          agentStore.updateLastMessage(accumulated);
          agentStore.setStreamingText(accumulated);
          await new Promise((r) => setTimeout(r, 18));
        }
        agentStore.setIsStreaming(false);

        // Fetch structured summary
        let summaryObj: AgentSummary | null = null;
        try {
          const summaryResp = await provider.chat({
            messages: conversation,
            structuredOutputSchema: { type: 'object' },
            systemPrompt: 'Generate a structured JSON summary with fields: summary (string), actionsTaken (string[]), followUps (string[]).',
          });
          const parsed = JSON.parse(summaryResp.content.trim().replace(/^```json|```$/g, ''));
          const validSummary = agentSummarySchema.safeParse(parsed);
          if (validSummary.success) {
            summaryObj = validSummary.data;
            agentStore.setSummary(summaryObj);
          }
        } catch {
          // Graceful fallback summary
          summaryObj = {
            summary: finalAnswer.slice(0, 160) + '...',
            actionsTaken: executionSteps.map((s) => `Executed tool ${s.toolName}`),
            followUps: ['Review results in execution timeline'],
          };
          agentStore.setSummary(summaryObj);
        }

        // Save completed run
        const completedRun: AgentRun = {
          id: runId,
          instruction: prompt,
          status: 'completed',
          steps: executionSteps,
          finalAnswer,
          summaryCard: summaryObj || undefined,
          tokenUsage: agentStore.tokenUsage,
          startedAt: startTime,
          completedAt: Date.now(),
          durationMs: Date.now() - startTime,
          retriesTotal: totalRetries,
        };
        historyStore.addRun(completedRun);
        agentStore.finishRun();
        return;
      }

      // Handle Tool Calls
      conversation.push({
        role: 'assistant',
        content: response.content || '',
        toolCalls: response.toolCalls,
      });

      for (const call of response.toolCalls) {
        const stepId = `step_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`;
        const toolDef = mcpServer.getTool(call.name);
        const permission = toolDef?.permission || 'read';

        const newStep: ExecutionStep = {
          id: stepId,
          stepNumber: executionSteps.length + 1,
          thought: response.content || undefined,
          toolName: call.name,
          args: call.args,
          status: 'running',
          permission,
          timestamp: Date.now(),
        };

        executionSteps.push(newStep);
        agentStore.addStep(newStep);

        // 1. Zod Argument Validation Guardrail
        const validation = validateToolArgs(call.name, call.args);
        if (!validation.valid) {
          newStep.status = 'failed';
          newStep.error = validation.error;
          agentStore.updateStep(stepId, { status: 'failed', error: validation.error });

          // Send validation error back to LLM to self-correct
          conversation.push({
            role: 'tool',
            toolCallId: call.id,
            name: call.name,
            content: JSON.stringify({ error: validation.error, correctionPrompt: 'Please review schema requirements and provide valid arguments.' }),
          });
          continue;
        }

        let effectiveArgs = validation.data as Record<string, unknown>;

        // 2. Permission & Human-In-The-Loop Approval Check
        let requiresApproval = false;
        if (settings.approvalPolicy === 'ask_all_writes' && (permission === 'write' || permission === 'sensitive')) {
          requiresApproval = true;
        } else if (settings.approvalPolicy === 'ask_sensitive_only' && permission === 'sensitive') {
          requiresApproval = true;
        }

        if (requiresApproval) {
          newStep.status = 'awaiting_approval';
          agentStore.updateStep(stepId, { status: 'awaiting_approval' });

          const approvalDecision = await new Promise<{ approved: boolean; modifiedArgs?: Record<string, unknown> }>(
            (resolve) => {
              agentStore.setApprovalRequest({
                id: `appr_${Date.now()}`,
                stepId,
                toolName: call.name,
                args: effectiveArgs,
                permission,
                resolve,
              });
            }
          );

          agentStore.setApprovalRequest(null);

          if (!approvalDecision.approved) {
            newStep.status = 'rejected';
            newStep.error = 'Action rejected by user approval guard.';
            agentStore.updateStep(stepId, { status: 'rejected', error: newStep.error });

            conversation.push({
              role: 'tool',
              toolCallId: call.id,
              name: call.name,
              content: JSON.stringify({ status: 'rejected', message: 'User explicitly declined execution of this action. Adapt your plan.' }),
            });
            continue;
          }

          if (approvalDecision.modifiedArgs) {
            effectiveArgs = approvalDecision.modifiedArgs;
            newStep.args = effectiveArgs;
            agentStore.updateStep(stepId, { args: effectiveArgs });
          }
        }

        // 3. Execution with Timeout & Exponential Backoff Retry
        newStep.status = 'running';
        agentStore.updateStep(stepId, { status: 'running' });
        const execStartTime = performance.now();

        try {
          const { result: toolResult, attempts } = await executeWithRetryAndTimeout(
            () => mcpServer.callTool(call.name, effectiveArgs),
            {
              maxAttempts: 3,
              baseDelayMs: 400,
              timeoutMs: 10000,
              onRetry: (attempt) => {
                totalRetries += 1;
                newStep.status = 'retrying';
                newStep.retryCount = attempt;
                agentStore.updateStep(stepId, { status: 'retrying', retryCount: attempt });
              },
            }
          );

          const durationMs = Math.round(performance.now() - execStartTime);
          newStep.durationMs = durationMs;
          newStep.retryCount = attempts > 1 ? attempts - 1 : undefined;

          if (toolResult.success) {
            newStep.status = 'success';
            newStep.result = toolResult.data;
            agentStore.updateStep(stepId, { status: 'success', result: toolResult.data, durationMs });

            conversation.push({
              role: 'tool',
              toolCallId: call.id,
              name: call.name,
              content: JSON.stringify(toolResult.data),
            });
          } else {
            newStep.status = 'failed';
            newStep.error = toolResult.error;
            agentStore.updateStep(stepId, { status: 'failed', error: toolResult.error, durationMs });

            conversation.push({
              role: 'tool',
              toolCallId: call.id,
              name: call.name,
              content: JSON.stringify({ error: toolResult.error }),
            });
          }
        } catch (err) {
          const durationMs = Math.round(performance.now() - execStartTime);
          const errorMsg = err instanceof Error ? err.message : String(err);
          newStep.status = 'failed';
          newStep.error = errorMsg;
          agentStore.updateStep(stepId, { status: 'failed', error: errorMsg, durationMs });

          conversation.push({
            role: 'tool',
            toolCallId: call.id,
            name: call.name,
            content: JSON.stringify({ error: errorMsg }),
          });
        }
      }
    }

    // Step limit reached
    agentStore.setError('Maximum execution steps reached without termination.');
    agentStore.finishRun();
  } catch (err) {
    const errorMsg = err instanceof Error ? err.message : String(err);
    agentStore.setError(errorMsg);
    agentStore.finishRun();
  }
}
