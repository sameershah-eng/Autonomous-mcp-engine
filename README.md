# Relay - Autonomous AI Automation Platform with MCP

Relay is a production-quality enterprise AI automation platform where AI agents interpret natural language instructions, determine which Model Context Protocol (MCP) tools to invoke, enforce human-in-the-loop permission guards, and execute real actions through an in-memory MCP server.

---

## Architecture Overview

### 1. LLM Provider Layer (`/src/lib/llm`)
All LLM reasoning is abstracted behind the `LLMProvider` interface:
```typescript
export interface LLMProvider {
  id: string;
  name: string;
  chat(params: LLMChatParams): Promise<LLMChatResponse>;
  embed?(text: string): Promise<number[]>;
  isConfigured(): Promise<boolean>;
}
```
- **Gemini Native (`GeminiProvider`)**: Operates server-side via `server.ts` using `@google/genai` with `gemini-3.8-flash` and `gemini-embedding-2-preview`.
- **Autonomous Simulation Mode (`DemoProvider`)**: Realistic in-browser agent simulator that executes multi-step tool calls, schema validation, and summary generation even if no external API key is attached.
- **OpenAI Adapter (`OpenAIProvider`)**: Includes complete request/response specifications and function calling schema conversions for standard OpenAI GPT-4o endpoints.

---

### 2. Autonomous Agent Loop (`/src/lib/agent/agentLoop.ts`)
The execution engine coordinates a multi-turn reasoning and tool invocation lifecycle:
1. **Schema Injection**: Injects registered MCP tool JSON schemas into the model request.
2. **Context Compression**: Retains active message history, summarizing older context when message history exceeds 20 messages.
3. **Model Step Evaluation**: Decodes native tool calls or yields final synthesized answer.
4. **Zod Runtime Guardrail**: Every tool argument is validated against a strict Zod schema before invocation. If invalid, the error message is fed back to the model for automated self-correction.
5. **Human-in-the-Loop Guard**: Reads tool permissions (`read`, `write`, `sensitive`). Write/sensitive tools pause execution and display an approval card with **Approve**, **Edit Arguments**, or **Decline**. Rejection causes the model to adapt its plan without modifying state.
6. **Execution & Backoff**: Executes tools against the MCP server with 10-second timeouts and exponential backoff retry (3 attempts).
7. **Structured Output Summary**: Requests and validates a structured JSON summary (`summary`, `actionsTaken[]`, `followUps[]`) rendered as an executive summary card.

---

### 3. Simulated MCP Server (`/src/lib/mcp`)
Follows standard Anthropic Model Context Protocol concepts:
- **`listTools()`**: Returns tool manifests with JSON Schema inputs, descriptions, and permission levels.
- **`callTool(name, args)`**: Dispatches to in-memory business stores.
- **`listResources()` & `readResource(uri)`**: Serves corporate documentation (`company://policies/refunds`, `company://docs/pricing`).
- **Seeded Tools**:
  1. `crm_search_contacts` (read)
  2. `crm_update_deal_stage` (write)
  3. `db_query_orders` (read - PostgreSQL orders table)
  4. `create_support_ticket` (write)
  5. `send_email` (sensitive, write)
  6. `calendar_find_slots` (read)
  7. `http_fetch_weather` (read - simulated 25% transient flakiness to demonstrate backoff retry)
  8. `knowledge_search` (read - semantic cosine similarity over vector chunks)

---

### 4. Connecting a Remote MCP Server over HTTP / SSE
To connect Relay to an external remote MCP server running over HTTP with Server-Sent Events (SSE):

1. **Protocol Adapter**:
   Implement an `MCPRemoteClient`:
   ```typescript
   export class RemoteMCPClient {
     private eventSource: EventSource;

     constructor(private sseEndpoint: string, private postEndpoint: string) {
       this.eventSource = new EventSource(this.sseEndpoint);
     }

     async listTools(): Promise<MCPTool[]> {
       const res = await fetch(`${this.postEndpoint}/tools/list`, { credentials: 'omit' });
       return (await res.json()).tools;
     }

     async callTool(name: string, args: Record<string, unknown>): Promise<ToolCallResult> {
       const res = await fetch(`${this.postEndpoint}/tools/call`, {
         method: 'POST',
         headers: { 'Content-Type': 'application/json' },
         body: JSON.stringify({ method: 'tools/call', params: { name, arguments: args } }),
       });
       return await res.json();
     }
   }
   ```
2. **Server Swap**:
   Replace `mcpServer` in `/src/lib/mcp/server.ts` with the remote client instance or proxy endpoint via `server.ts`.
