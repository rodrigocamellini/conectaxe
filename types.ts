
export interface EventTicket {
  id: string;
  eventId: string;
  name: string;
  email?: string;
  phone?: string;
  type: string;
  price: number;
  status: 'pendente' | 'confirmado' | 'cancelado';
  createdAt: string;
  attendance: 'nao_marcado' | 'presente' | 'ausente';
}

export interface TerreiroEvent {
  id: string;
  title: string;
  description: string;
  date: string; // ISO
  time: string;
  type: 'gira' | 'festa' | 'curso' | 'outros';
  status: 'agendado' | 'realizado' | 'cancelado' | 'acontecendo' | 'encerrado';
  ticketsTotal: number;
  ticketsIssued: number;
  price?: number;
  location?: string;
  responsible?: string;
  color?: string;
  icon?: string;
}

export interface SaaSPlan {
  id: string;
  name: string;
  price: number;
  durationDays: number | null;
  description?: string;
  maxMembers?: number;
  maxStorage?: number; // MB
  enabledModules?: string[];
  limits?: any;
}

export interface StoredSnapshot {
  id: string;
  date: string;
  type: string;
  data: any;
  size: string;
}

export interface SystemLicense {
  clientId: string;
  planName: string;
  status: 'active' | 'inactive' | 'frozen' | 'blocked';
  expirationDate: string;
  affiliateLink?: string;
}

export interface SystemConfig {
  systemName: string;
  logoUrl?: string;
  license?: SystemLicense;
  menuConfig?: any[];
  autoBackupFrequency?: 'disabled' | '7' | '15' | '30';
  theme?: any;
}
