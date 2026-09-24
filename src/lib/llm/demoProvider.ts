import type { LLMProvider, LLMChatParams, LLMChatResponse, LLMToolCall } from './types';

export class DemoProvider implements LLMProvider {
  public id = 'demo';
  public name = 'Relay Autonomous Agent (Simulation Mode)';

  public async isConfigured(): Promise<boolean> {
    return true;
  }

  public async chat(params: LLMChatParams): Promise<LLMChatResponse> {
    // Artificial small latency to feel realistic (300-600ms)
    await new Promise((r) => setTimeout(r, 400));

    // If structured output schema is requested (e.g. final summary extraction)
    if (params.structuredOutputSchema) {
      return this.generateStructuredSummary(params);
    }

    const messages = params.messages;
    const lastMsg = messages[messages.length - 1];

    // Find the original user prompt
    const userPrompt = messages.find((m) => m.role === 'user')?.content.toLowerCase() || '';

    // Count how many tool results we have received so far in this conversation
    const toolResults = messages.filter((m) => m.role === 'tool');

    // Scenario A: Orders & High Priority Tickets workflow
    // "Find all pending orders from last week and open a high priority ticket for any over $500."
    if (userPrompt.includes('order') || userPrompt.includes('500') || userPrompt.includes('pending')) {
      if (toolResults.length === 0) {
        // Step 1: Query orders
        return {
          content: 'I will query the database for all pending orders to evaluate which ones exceed $500.',
          toolCalls: [
            {
              id: `call_${Date.now()}_1`,
              name: 'db_query_orders',
              args: { status: 'pending', dateRange: 'last_week' },
            },
          ],
          usage: { promptTokens: 380, completionTokens: 45, totalTokens: 425 },
        };
      } else if (toolResults.length === 1) {
        // Step 2: Open ticket for high value order
        return {
          content: 'Found 3 pending orders exceeding $500: ORD-2026-901 ($1,450.00), ORD-2026-902 ($620.00), and ORD-2026-906 ($780.00). I will now create an urgent escalation ticket for the highest-value order (ORD-2026-901 for Sarah Chen).',
          toolCalls: [
            {
              id: `call_${Date.now()}_2`,
              name: 'create_support_ticket',
              args: {
                title: 'High-Value Order Escalation: ORD-2026-901 ($1,450.00) pending fulfillment',
                priority: 'urgent',
                customerId: 'cnt_101',
              },
            },
          ],
          usage: { promptTokens: 620, completionTokens: 68, totalTokens: 688 },
        };
      } else {
        // Final completion text
        return {
          content: `All actions completed successfully.\n\n### Order Audit & Escalation Report\n- **Database Query**: Examined 4 pending orders from PostgreSQL table \`customer_orders\`.\n- **Discovered Threshold Matches**:\n  - \`ORD-2026-901\` - **$1,450.00** (Acme Holdings - Sarah Chen)\n  - \`ORD-2026-902\` - **$620.00** (Brody Analytics - Marcus Brody)\n  - \`ORD-2026-906\` - **$780.00** (Brody Analytics - Marcus Brody)\n- **Action Executed**: Opened high-priority escalation ticket **TCK-1092** assigned to Tier-2 Critical Incident Team.\n- **Status**: The customer record has been flagged and ops notifications dispatched.`,
          usage: { promptTokens: 890, completionTokens: 140, totalTokens: 1030 },
        };
      }
    }

    // Scenario B: CRM search, deal update & email
    // "Search CRM for Marcus Brody, update deal stage to negotiation, and send a summary email."
    if (userPrompt.includes('marcus') || userPrompt.includes('deal') || (userPrompt.includes('crm') && userPrompt.includes('email'))) {
      if (toolResults.length === 0) {
        return {
          content: 'Searching the CRM database for contact details associated with Marcus Brody.',
          toolCalls: [
            {
              id: `call_${Date.now()}_1`,
              name: 'crm_search_contacts',
              args: { query: 'Marcus Brody', limit: 3 },
            },
          ],
          usage: { promptTokens: 320, completionTokens: 35, totalTokens: 355 },
        };
      } else if (toolResults.length === 1) {
        return {
          content: 'Found contact Marcus Brody (cnt_102, Brody Analytics). Advancing deal stage to negotiation.',
          toolCalls: [
            {
              id: `call_${Date.now()}_2`,
              name: 'crm_update_deal_stage',
              args: { dealId: 'cnt_102', stage: 'negotiation' },
            },
          ],
          usage: { promptTokens: 510, completionTokens: 42, totalTokens: 552 },
        };
      } else if (toolResults.length === 2) {
        return {
          content: 'Deal stage successfully advanced. Now preparing an official notification email to Marcus.',
          toolCalls: [
            {
              id: `call_${Date.now()}_3`,
              name: 'send_email',
              args: {
                to: 'marcus@brodyanalytics.io',
                subject: 'Relay Platform - Commercial Proposal & Terms in Negotiation',
                body: 'Dear Marcus,\n\nFollowing our review, your Brody Analytics deal terms have progressed into the formal Negotiation stage. We look forward to finalizing the worker seats SLA.\n\nWarm regards,\nRelay Automated Account Team',
              },
            },
          ],
          usage: { promptTokens: 710, completionTokens: 82, totalTokens: 792 },
        };
      } else {
        return {
          content: `CRM pipeline update completed.\n\n- **Contact Verified**: Marcus Brody (CDO at Brody Analytics, Deal Value: $75,000).\n- **Pipeline Updated**: Promoted from \`proposal_sent\` to \`negotiation\`.\n- **Outbound Email**: Notification dispatched to \`marcus@brodyanalytics.io\` via Relay Communications Gateway.`,
          usage: { promptTokens: 920, completionTokens: 110, totalTokens: 1030 },
        };
      }
    }

    // Scenario C: Calendar Slots & Weather
    // "Find open meeting slots for tomorrow and check weather in San Francisco."
    if (userPrompt.includes('calendar') || userPrompt.includes('slot') || userPrompt.includes('weather') || userPrompt.includes('meeting')) {
      if (toolResults.length === 0) {
        return {
          content: 'Checking calendar schedule for open appointment windows.',
          toolCalls: [
            {
              id: `call_${Date.now()}_1`,
              name: 'calendar_find_slots',
              args: { date: 'tomorrow', durationMinutes: 45 },
            },
          ],
          usage: { promptTokens: 290, completionTokens: 30, totalTokens: 320 },
        };
      } else if (toolResults.length === 1 && !toolResults.some((t) => t.name === 'http_fetch_weather')) {
        return {
          content: 'Calendar slots retrieved. Now fetching real-time weather conditions for San Francisco.',
          toolCalls: [
            {
              id: `call_${Date.now()}_2`,
              name: 'http_fetch_weather',
              args: { city: 'San Francisco' },
            },
          ],
          usage: { promptTokens: 480, completionTokens: 35, totalTokens: 515 },
        };
      } else {
        return {
          content: `Schedule and atmospheric briefing:\n\n- **Available Consultation Slots**: Tomorrow between 09:00 AM - 09:45 AM, 02:00 PM - 02:45 PM, and 03:30 PM - 04:15 PM (America/New_York EST).\n- **Atmospheric Conditions**: San Francisco is currently 70°F (21°C), clear & sunny, with 48% humidity and gentle 9 mph NW winds.`,
          usage: { promptTokens: 710, completionTokens: 95, totalTokens: 805 },
        };
      }
    }

    // Scenario D: Knowledge / Policy Search
    if (userPrompt.includes('refund') || userPrompt.includes('policy') || userPrompt.includes('pricing') || userPrompt.includes('knowledge')) {
      if (toolResults.length === 0) {
        return {
          content: 'Querying Relay enterprise RAG vector index for official refund authorization policies.',
          toolCalls: [
            {
              id: `call_${Date.now()}_1`,
              name: 'knowledge_search',
              args: { query: 'refund policies credit authorization limits', limit: 3 },
            },
          ],
          usage: { promptTokens: 340, completionTokens: 40, totalTokens: 380 },
        };
      } else {
        return {
          content: `### Knowledge Base Retrieval Analysis\n\n- **Standard Guarantee**: All Relay SaaS subscriptions include an unconditional 30-day money-back guarantee for first-time purchases.\n- **Support Discretion**: Customer Support Specialists may immediately approve and trigger credit card refunds **up to $500** directly via Stripe.\n- **Escalation Levels**:\n  - $501 - $2,500 requires Team Lead authorization.\n  - Above $2,500 requires Director of Finance sign-off.\n- **Exceptions**: Dedicated custom AI model training compute allocations are non-refundable.`,
          usage: { promptTokens: 680, completionTokens: 110, totalTokens: 790 },
        };
      }
    }

    // Fallback: Generic tool execution or direct response
    if (toolResults.length === 0) {
      return {
        content: 'Analyzing request and inspecting customer data records in the CRM.',
        toolCalls: [
          {
            id: `call_${Date.now()}_default`,
            name: 'crm_search_contacts',
            args: { query: userPrompt.slice(0, 15) || 'Sarah', limit: 3 },
          },
        ],
        usage: { promptTokens: 250, completionTokens: 30, totalTokens: 280 },
      };
    }

    return {
      content: `I have processed your instruction using the connected MCP tools. All data queries and state validations succeeded with zero errors.`,
      usage: { promptTokens: 450, completionTokens: 60, totalTokens: 510 },
    };
  }

  private generateStructuredSummary(params: LLMChatParams): LLMChatResponse {
    const userPrompt = params.messages.find((m) => m.role === 'user')?.content || 'Automated task execution';
    const hasOrder = userPrompt.toLowerCase().includes('order');
    const hasCrm = userPrompt.toLowerCase().includes('crm') || userPrompt.toLowerCase().includes('deal');

    const summaryObj = {
      summary: hasOrder
        ? 'Successfully audited recent pending customer orders, identified high-value contracts exceeding $500, and filed an expedited escalation ticket with priority dispatch.'
        : hasCrm
        ? 'Queried CRM account record, elevated enterprise deal stage in the active sales pipeline, and transmitted a signed status notification to the client.'
        : 'Completed agent execution sequence across connected MCP services with schema verification and audit trail logging.',
      actionsTaken: hasOrder
        ? [
            'Queried PostgreSQL table `customer_orders` for pending status',
            'Filtered 4 order records against $500 capital threshold',
            'Dispatched High-Priority support ticket (TCK-1092) for $1,450 order',
          ]
        : hasCrm
        ? [
            'Searched CRM contacts for Marcus Brody at Brody Analytics',
            'Updated deal stage from proposal_sent to negotiation',
            'Dispatched confirmation email via outbound communication gateway',
          ]
        : [
            'Validated input schemas against Zod runtime guardrails',
            'Executed tool calls with exponential backoff resiliency',
            'Recorded execution traces in observability storage',
          ],
      followUps: hasOrder
        ? [
            'Monitor Tier-2 support desk for response time on ticket TCK-1092',
            'Notify Sarah Chen at Acme Holdings once fulfillment block is cleared',
          ]
        : [
            'Schedule calendar follow-up for next review milestone',
            'Verify webhook delivery status with external partner systems',
          ],
    };

    return {
      content: JSON.stringify(summaryObj),
      usage: { promptTokens: 320, completionTokens: 110, totalTokens: 430 },
    };
  }

  public async embed(text: string): Promise<number[]> {
    // Deterministic pseudo-vector for local simulation (128 dimensions)
    const vec: number[] = [];
    let hash = 0;
    for (let i = 0; i < text.length; i++) {
      hash = (hash << 5) - hash + text.charCodeAt(i);
      hash |= 0;
    }
    for (let j = 0; j < 128; j++) {
      const val = Math.sin(hash + j) * Math.cos(j);
      vec.push(Number(val.toFixed(4)));
    }
    return vec;
  }
}
