import { z } from 'zod';

export const crmSearchContactsSchema = z.object({
  query: z.string().min(1, 'Query must not be empty'),
  limit: z.number().int().positive().max(50).optional(),
});

export const crmUpdateDealStageSchema = z.object({
  dealId: z.string().min(1, 'dealId is required'),
  stage: z.enum([
    'discovery',
    'qualified',
    'proposal_sent',
    'negotiation',
    'closed_won',
    'closed_lost',
  ]),
});

export const dbQueryOrdersSchema = z.object({
  status: z.enum(['all', 'pending', 'processing', 'completed', 'cancelled']),
  dateRange: z.enum(['last_week', 'this_month', 'all']).optional(),
});

export const createSupportTicketSchema = z.object({
  title: z.string().min(3, 'Ticket title must have at least 3 characters'),
  priority: z.enum(['low', 'medium', 'high', 'urgent']),
  customerId: z.string().min(1, 'customerId is required'),
});

export const sendEmailSchema = z.object({
  to: z.string().email('Must provide a valid email address'),
  subject: z.string().min(2, 'Subject must be at least 2 characters'),
  body: z.string().min(5, 'Email body must have meaningful content'),
});

export const calendarFindSlotsSchema = z.object({
  date: z.string().min(1, 'Date is required'),
  durationMinutes: z.number().positive().max(480, 'Meeting cannot exceed 8 hours'),
});

export const httpFetchWeatherSchema = z.object({
  city: z.string().min(1, 'City name is required'),
});

export const knowledgeSearchSchema = z.object({
  query: z.string().min(1, 'Search query is required'),
  limit: z.number().int().positive().max(20).optional(),
});

export const agentSummarySchema = z.object({
  summary: z.string().min(10, 'Summary must describe the run outcome'),
  actionsTaken: z.array(z.string()).min(1, 'Must list at least 1 action taken'),
  followUps: z.array(z.string()),
});

export const toolValidators: Record<string, z.ZodType<any>> = {
  crm_search_contacts: crmSearchContactsSchema,
  crm_update_deal_stage: crmUpdateDealStageSchema,
  db_query_orders: dbQueryOrdersSchema,
  create_support_ticket: createSupportTicketSchema,
  send_email: sendEmailSchema,
  calendar_find_slots: calendarFindSlotsSchema,
  http_fetch_weather: httpFetchWeatherSchema,
  knowledge_search: knowledgeSearchSchema,
};

export function validateToolArgs(toolName: string, args: Record<string, unknown>): { valid: true; data: any } | { valid: false; error: string } {
  const schema = toolValidators[toolName];
  if (!schema) {
    return { valid: true, data: args };
  }
  const result = schema.safeParse(args);
  if (!result.success) {
    const issues = (result.error as any).issues || (result.error as any).errors || [];
    const errorMessages = Array.isArray(issues)
      ? issues.map((e: any) => `${e.path?.join('.') || 'param'}: ${e.message}`).join('; ')
      : result.error.message;
    return {
      valid: false,
      error: `Validation error for "${toolName}": ${errorMessages}`,
    };
  }
  return { valid: true, data: result.data };
}
