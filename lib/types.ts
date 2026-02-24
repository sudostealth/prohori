// Common interfaces for the application

export interface Subscription {
  id: string;
  plan: string;
  status: string;
  price_bdt: number;
  expires_at: string | null;
  companies: { name: string } | null;
}

export interface Alert {
  id: string;
  title: string;
  description: string;
  severity: string;
  status: string;
  created_at: string;
  source_ip?: string;
}

export interface Agent {
  id: string;
  name: string;
  status: string;
  ip_address?: string;
  last_seen?: string;
}

export interface Invoice {
  id: string;
  date: string;
  amount: string;
  status: string;
  method: string;
}
