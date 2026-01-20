
import React, { useState } from 'react';
import { ArrowLeft, Search, QrCode, UserCheck, X, Check, Filter } from 'lucide-react';
import { TerreiroEvent, EventTicket, SystemConfig } from '../../types';

interface EventCheckinProps {
  event: TerreiroEvent;
  tickets: EventTicket[];
  onBack: () => void;
  onUpdateTicket: (ticketId: string, updates: Partial<EventTicket>) => void;
  config: SystemConfig;
}

export function EventCheckin({ event, tickets, onBack, onUpdateTicket, config }: EventCheckinProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'todos' | 'presente' | 'faltou' | 'pendente'>('todos');

  const filteredTickets = tickets.filter(t => {
    const matchesSearch = 
      t.ticketNumber.toString().includes(searchTerm) ||
      (t.guestName || '').toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'todos' 
      ? true 
      : statusFilter === 'pendente' 
        ? t.attendance === 'nao_marcado' 
        : t.attendance === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const stats = {
    total: tickets.length,
    presente: tickets.filter(t => t.attendance === 'presente').length,
    faltou: tickets.filter(t => t.attendance === 'faltou').length,
    pendente: tickets.filter(t => t.attendance === 'nao_marcado').length,
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <button 
          onClick={onBack}
          className="p-2 hover:bg-white/10 rounded-lg text-slate-400 hover:text-white transition-colors"
        >
          <ArrowLeft size={20} />
        </button>
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            Check-in: {event.title}
            <span className={`px-2 py-0.5 rounded text-xs font-bold uppercase bg-white/10 text-white/70`}>
              {event.status}
            </span>
          </h2>
          <p className="text-sm text-slate-400">
            {new Date(event.date).toLocaleDateString()} • {event.time}
          </p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-slate-800 p-4 rounded-xl border border-slate-700">
          <p className="text-xs font-medium text-slate-400 uppercase">Inscritos</p>
          <p className="text-2xl font-bold text-white">{stats.total}</p>
        </div>
        <div className="bg-green-900/20 p-4 rounded-xl border border-green-900/50">
          <p className="text-xs font-medium text-green-400 uppercase">Presentes</p>
          <p className="text-2xl font-bold text-green-400">{stats.presente}</p>
        </div>
        <div className="bg-yellow-900/20 p-4 rounded-xl border border-yellow-900/50">
          <p className="text-xs font-medium text-yellow-400 uppercase">Pendentes</p>
          <p className="text-2xl font-bold text-yellow-400">{stats.pendente}</p>
        </div>
        <div className="bg-red-900/20 p-4 rounded-xl border border-red-900/50">
          <p className="text-xs font-medium text-red-400 uppercase">Faltas</p>
          <p className="text-2xl font-bold text-red-400">{stats.faltou}</p>
        </div>
      </div>

      {/* Search & Actions */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-2.5 text-slate-400" size={18} />
          <input
            type="text"
            placeholder="Buscar por nome ou número da senha..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
          />
        </div>
        
        <div className="flex gap-2">
           {/* Mobile Scanner Button Placeholder */}
           <button className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition-colors">
             <QrCode size={18} />
             <span className="hidden md:inline">Ler QR Code</span>
           </button>
        </div>
      </div>

      {/* List */}
      <div className="bg-slate-800 rounded-xl border border-slate-700 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-slate-900/50 text-slate-400 text-xs uppercase font-bold">
              <tr>
                <th className="px-6 py-3">Senha</th>
                <th className="px-6 py-3">Participante</th>
                <th className="px-6 py-3">Tipo</th>
                <th className="px-6 py-3">Pagamento</th>
                <th className="px-6 py-3 text-right">Presença</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-700">
              {filteredTickets.map(ticket => (
                <tr key={ticket.id} className="hover:bg-white/5 transition-colors">
                  <td className="px-6 py-4">
                    <span className="font-mono text-lg font-bold text-white">#{ticket.ticketNumber}</span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="font-medium text-white">{ticket.guestName || 'Anônimo'}</div>
                    {ticket.guestPhone && <div className="text-xs text-slate-400">{ticket.guestPhone}</div>}
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-0.5 rounded text-xs font-bold uppercase ${
                      ticket.type === 'preferencial' ? 'bg-purple-500/20 text-purple-400' : 'bg-slate-700 text-slate-300'
                    }`}>
                      {ticket.type}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    {event.isPaid ? (
                      <span className={`px-2 py-0.5 rounded text-xs font-bold uppercase ${
                        ticket.paymentStatus === 'pago' ? 'bg-green-500/20 text-green-400' : 'bg-yellow-500/20 text-yellow-400'
                      }`}>
                        {ticket.paymentStatus}
                      </span>
                    ) : (
                      <span className="text-slate-500 text-xs">Gratuito</span>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex justify-end gap-2">
                      <button
                        onClick={() => onUpdateTicket(ticket.id, { attendance: 'presente' })}
                        className={`p-1.5 rounded-lg transition-colors ${
                          ticket.attendance === 'presente' 
                            ? 'bg-green-500 text-white shadow-lg shadow-green-500/20' 
                            : 'bg-slate-700 text-slate-400 hover:bg-slate-600'
                        }`}
                        title="Marcar Presente"
                      >
                        <Check size={16} />
                      </button>
                      <button
                        onClick={() => onUpdateTicket(ticket.id, { attendance: 'faltou' })}
                        className={`p-1.5 rounded-lg transition-colors ${
                          ticket.attendance === 'faltou' 
                            ? 'bg-red-500 text-white shadow-lg shadow-red-500/20' 
                            : 'bg-slate-700 text-slate-400 hover:bg-slate-600'
                        }`}
                        title="Marcar Falta"
                      >
                        <X size={16} />
                      </button>
                      <button
                        onClick={() => onUpdateTicket(ticket.id, { attendance: 'justificado' })}
                        className={`p-1.5 rounded-lg transition-colors ${
                          ticket.attendance === 'justificado' 
                            ? 'bg-yellow-500 text-white shadow-lg shadow-yellow-500/20' 
                            : 'bg-slate-700 text-slate-400 hover:bg-slate-600'
                        }`}
                        title="Marcar Justificado"
                      >
                        <Filter size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
