
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
  status: 'agendado' | 'realizado' | 'cancelado';
  ticketsTotal: number;
  ticketsIssued: number;
  price?: number;
  location?: string;
  responsible?: string;
  color?: string;
  icon?: string;
}
