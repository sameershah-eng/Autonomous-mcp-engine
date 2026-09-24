import type { MCPResource } from '../../types/mcp';

export const mcpResources: MCPResource[] = [
  {
    uri: 'company://policies/refunds',
    name: 'Customer Refund & Credit Policy',
    mimeType: 'text/markdown',
    description: 'Official corporate refund guidelines, qualification periods, approval matrices, and escalation procedures.',
    content: `# Relay Platform - Official Refund & Dispute Policy (Rev. 2026.3)

## 1. Standard 30-Day Window
All Relay SaaS subscriptions and automated agent seats carry an unconditional 30-day money-back guarantee for first-time purchases. Customers may request full refunds via support ticket or account representative.

## 2. Thresholds & Authorization Matrix
- **Tier 1 (Up to $500)**: Customer Support Specialists may immediately approve and trigger credit card refunds via Stripe.
- **Tier 2 ($501 - $2,500)**: Requires Team Lead review and customer satisfaction log.
- **Tier 3 (Above $2,500)**: Requires Director of Finance sign-off and enterprise contract amendment.

## 3. SLA Breach Deductions
If platform uptime falls below the 99.95% enterprise commitment during any calendar month, automated service credits are issued as follows:
- 99.0% - 99.94%: 10% monthly invoice credit.
- Below 99.0%: 30% monthly invoice credit.

## 4. Exceptions
Custom AI model training compute allocations and dedicated agent sandboxes are non-refundable once compute cycles have been provisioned.`,
  },
  {
    uri: 'company://docs/pricing',
    name: 'Relay Enterprise Pricing & Tier Specifications',
    mimeType: 'text/markdown',
    description: 'Current tier pricing structures, monthly quotas, seat limits, and add-on rates.',
    content: `# Relay Platform - Commercial Pricing Guide

## Tier Architecture

### Starter Tier - $49 / month
- **Agent Workflows**: Up to 10 active automations
- **Execution Concurrency**: 2 parallel agent loops
- **Tool Invocations**: 2,500 tool calls included per month ($0.008 / additional)
- **Support**: Community forums + 48h email ticket SLA
- **Human-in-the-Loop**: Standard approval modals

### Growth Tier - $199 / month
- **Agent Workflows**: Up to 50 active automations
- **Execution Concurrency**: 8 parallel agent loops
- **Tool Invocations**: 15,000 tool calls included per month ($0.005 / additional)
- **Knowledge Base**: 25,000 chunk RAG index
- **Integrations**: Unlimited CRM, PostgreSQL, and Webhook bridges
- **Support**: 12h priority ticketing SLA

### Enterprise Tier - $899 / month (Billed Annually)
- **Agent Workflows**: Unlimited automations
- **Execution Concurrency**: 32 parallel agent loops
- **Tool Invocations**: 100,000 tool calls included per month ($0.002 / additional)
- **Knowledge Base**: Unlimited vector embeddings with dedicated namespace
- **SLA**: 99.95% uptime guarantee with 1h critical escalation
- **Security**: Custom MCP server gateways, audit log streaming, SOC2 Type II compliance`,
  },
];
