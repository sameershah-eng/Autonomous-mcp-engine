export interface Contact {
  id: string;
  name: string;
  email: string;
  company: string;
  role: string;
  dealStage: string;
  dealValue: number;
}

export interface Order {
  id: string;
  orderNumber: string;
  customerId: string;
  customerName: string;
  customerEmail: string;
  amount: number;
  status: 'pending' | 'processing' | 'completed' | 'cancelled';
  itemsCount: number;
  createdAt: string;
  itemDescription: string;
}

export interface SupportTicket {
  id: string;
  ticketNumber: string;
  title: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  customerId: string;
  status: 'open' | 'in_progress' | 'resolved';
  createdAt: string;
}

export interface SentEmail {
  id: string;
  to: string;
  subject: string;
  body: string;
  sentAt: string;
}

export interface CalendarSlot {
  id: string;
  startTime: string;
  endTime: string;
  available: boolean;
  host: string;
}

export const initialContacts: Contact[] = [
  {
    id: 'cnt_101',
    name: 'Sarah Chen',
    email: 'sarah.chen@acmeholdings.com',
    company: 'Acme Holdings',
    role: 'VP of Technology',
    dealStage: 'negotiation',
    dealValue: 125000,
  },
  {
    id: 'cnt_102',
    name: 'Marcus Brody',
    email: 'marcus@brodyanalytics.io',
    company: 'Brody Analytics',
    role: 'Chief Data Officer',
    dealStage: 'proposal_sent',
    dealValue: 75000,
  },
  {
    id: 'cnt_103',
    name: 'Elena Rostova',
    email: 'elena@novapharma.org',
    company: 'Nova Pharma Labs',
    role: 'Operations Director',
    dealStage: 'qualified',
    dealValue: 220000,
  },
  {
    id: 'cnt_104',
    name: 'David Kim',
    email: 'dkim@fintechprime.net',
    company: 'Fintech Prime',
    role: 'Principal Engineer',
    dealStage: 'closed_won',
    dealValue: 98000,
  },
  {
    id: 'cnt_105',
    name: 'Amara Okafor',
    email: 'amara@helixventures.co',
    company: 'Helix Ventures',
    role: 'Managing Partner',
    dealStage: 'discovery',
    dealValue: 45000,
  },
];

export const initialOrders: Order[] = [
  {
    id: 'ord_901',
    orderNumber: 'ORD-2026-901',
    customerId: 'cnt_101',
    customerName: 'Sarah Chen',
    customerEmail: 'sarah.chen@acmeholdings.com',
    amount: 1450.00,
    status: 'pending',
    itemsCount: 12,
    createdAt: '2026-09-19T14:32:00Z',
    itemDescription: 'Enterprise Relay Nodes x 12 (Dedicated cluster deployment)',
  },
  {
    id: 'ord_902',
    orderNumber: 'ORD-2026-902',
    customerId: 'cnt_102',
    customerName: 'Marcus Brody',
    customerEmail: 'marcus@brodyanalytics.io',
    amount: 620.00,
    status: 'pending',
    itemsCount: 4,
    createdAt: '2026-09-20T11:15:00Z',
    itemDescription: 'Standard Worker Seats x 4 + Priority Support add-on',
  },
  {
    id: 'ord_903',
    orderNumber: 'ORD-2026-903',
    customerId: 'cnt_104',
    customerName: 'David Kim',
    customerEmail: 'dkim@fintechprime.net',
    amount: 240.00,
    status: 'pending',
    itemsCount: 2,
    createdAt: '2026-09-21T09:45:00Z',
    itemDescription: 'Developer Tier Sandbox license',
  },
  {
    id: 'ord_904',
    orderNumber: 'ORD-2026-904',
    customerId: 'cnt_103',
    customerName: 'Elena Rostova',
    customerEmail: 'elena@novapharma.org',
    amount: 3200.00,
    status: 'completed',
    itemsCount: 20,
    createdAt: '2026-09-15T16:20:00Z',
    itemDescription: 'Annual HIPAA Compliance Agent Suite',
  },
  {
    id: 'ord_905',
    orderNumber: 'ORD-2026-905',
    customerId: 'cnt_105',
    customerName: 'Amara Okafor',
    customerEmail: 'amara@helixventures.co',
    amount: 890.00,
    status: 'processing',
    itemsCount: 5,
    createdAt: '2026-09-22T08:10:00Z',
    itemDescription: 'Multi-workspace Orchestration Add-on',
  },
  {
    id: 'ord_906',
    orderNumber: 'ORD-2026-906',
    customerId: 'cnt_102',
    customerName: 'Marcus Brody',
    customerEmail: 'marcus@brodyanalytics.io',
    amount: 780.00,
    status: 'pending',
    itemsCount: 6,
    createdAt: '2026-09-23T15:00:00Z',
    itemDescription: 'Custom Webhook Gateway Pipeline',
  },
];

export const initialTickets: SupportTicket[] = [
  {
    id: 'tck_301',
    ticketNumber: 'TCK-301',
    title: 'SSO SAML Certificate rotation assistance',
    priority: 'medium',
    customerId: 'cnt_101',
    status: 'open',
    createdAt: '2026-09-22T10:00:00Z',
  },
  {
    id: 'tck_302',
    ticketNumber: 'TCK-302',
    title: 'API rate limit threshold alert investigation',
    priority: 'low',
    customerId: 'cnt_104',
    status: 'resolved',
    createdAt: '2026-09-20T17:30:00Z',
  },
];

export const initialCalendarSlots: CalendarSlot[] = [
  { id: 'slot_1', startTime: '09:00 AM', endTime: '09:45 AM', available: true, host: 'Engineering Solutions Desk' },
  { id: 'slot_2', startTime: '11:00 AM', endTime: '11:45 AM', available: false, host: 'Engineering Solutions Desk' },
  { id: 'slot_3', startTime: '02:00 PM', endTime: '02:45 PM', available: true, host: 'Engineering Solutions Desk' },
  { id: 'slot_4', startTime: '03:30 PM', endTime: '04:15 PM', available: true, host: 'Engineering Solutions Desk' },
  { id: 'slot_5', startTime: '04:45 PM', endTime: '05:30 PM', available: true, host: 'Engineering Solutions Desk' },
];
