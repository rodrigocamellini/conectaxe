
import React, { useState, useEffect } from 'react';
import { ArrowLeft, Search, QrCode, UserCheck, X, Check, Filter, Users, UserX, Clock, Ticket } from 'lucide-react';
import { TerreiroEvent, EventTicket, SystemConfig } from '../../types';
import { Html5QrcodeScanner } from 'html5-qrcode';

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
  const [showScanner, setShowScanner] = useState(false);

  useEffect(() => {
    if (showScanner) {
      const scanner = new Html5QrcodeScanner(
        "reader",
        { fps: 10, qrbox: { width: 250, height: 250 } },
        false
      );
      
      scanner.render((decodedText) => {
        // Try to find ticket by ID or Ticket Number
        const ticket = tickets.find(t => t.id === decodedText || t.ticketNumber.toString() === decodedText);
        
        if (ticket) {
          if (ticket.attendance === 'presente') {
            alert(`Participante ${ticket.guestName || 'Anônimo'} já fez check-in!`);
          } else {
            onUpdateTicket(ticket.id, { attendance: 'presente' });
            alert(`Check-in confirmado para ${ticket.guestName || 'Participante'}!`);
          }
          scanner.clear().catch(console.error);
          setShowScanner(false);
        } else {
          alert('Ticket não encontrado ou inválido!');
        }
      }, (error) => {
        // console.warn(error);
      });

      return () => {
        scanner.clear().catch(console.error);
      };
    }
  }, [showScanner, tickets, onUpdateTicket]);

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
          className="p-2 hover:bg-gray-100 rounded-lg text-gray-400 hover:text-gray-600 transition-colors"
        >
          <ArrowLeft size={20} />
        </button>
        <div>
          <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
            Check-in: {event.title}
            <span className={`px-2 py-0.5 rounded text-xs font-bold uppercase bg-indigo-100 text-indigo-700`}>
              {event.status}
            </span>
          </h2>
          <p className="text-sm text-gray-500">
            {new Date(event.date).toLocaleDateString()} • {event.time}
          </p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {showScanner && (
          <div className="col-span-2 md:col-span-4 bg-white p-4 rounded-xl border border-gray-100 shadow-sm">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-bold text-lg">Leitor de QR Code</h3>
              <button onClick={() => setShowScanner(false)} className="p-1 hover:bg-gray-100 rounded-full">
                <X size={20} />
              </button>
            </div>
            <div id="reader" className="w-full max-w-sm mx-auto"></div>
          </div>
        )}
        
        {!showScanner && (
          <>
            <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Inscritos</p>
            <div className="p-1.5 bg-indigo-50 text-indigo-600 rounded-lg">
              <Ticket size={16} />
            </div>
          </div>
          <p className="text-2xl font-black text-gray-800">{stats.total}</p>
        </div>
        
        <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <p className="text-xs font-bold text-emerald-600 uppercase tracking-wider">Presentes</p>
            <div className="p-1.5 bg-emerald-50 text-emerald-600 rounded-lg">
              <UserCheck size={16} />
            </div>
          </div>
          <p className="text-2xl font-black text-gray-800">{stats.presente}</p>
        </div>

        <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <p className="text-xs font-bold text-amber-500 uppercase tracking-wider">Pendentes</p>
            <div className="p-1.5 bg-amber-50 text-amber-500 rounded-lg">
              <Clock size={16} />
            </div>
          </div>
          <p className="text-2xl font-black text-gray-800">{stats.pendente}</p>
        </div>

        <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <p className="text-xs font-bold text-red-500 uppercase tracking-wider">Faltas</p>
            <div className="p-1.5 bg-red-50 text-red-500 rounded-lg">
              <UserX size={16} />
            </div>
          </div>
          <p className="text-2xl font-black text-gray-800">{stats.faltou}</p>
        </div>
          </>
        )}
      </div>

      {/* Search & Actions */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-2.5 text-gray-400" size={18} />
          <input
            type="text"
            placeholder="Buscar por nome ou número da senha..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-white border border-gray-200 rounded-xl text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all shadow-sm"
          />
        </div>
        
        <div className="flex gap-2">
           {/* Mobile Scanner Button */}
           <button 
             onClick={() => setShowScanner(true)}
             className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold text-sm transition-colors shadow-sm shadow-indigo-200"
           >
             <QrCode size={18} />
             <span className="hidden md:inline">Ler QR Code</span>
           </button>
        </div>
      </div>

      {/* List */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-gray-50/50 border-b border-gray-100">
              <tr>
                <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider">Senha</th>
                <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider">Participante</th>
                <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider">Tipo</th>
                <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider">Pagamento</th>
                <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider text-right">Presença</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filteredTickets.map(ticket => (
                <tr key={ticket.id} className="hover:bg-gray-50/50 transition-colors">
                  <td className="px-6 py-4">
                    <span className="font-mono text-sm font-bold text-indigo-600 bg-indigo-50 px-2 py-1 rounded-md">#{ticket.ticketNumber}</span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="font-bold text-gray-800 text-sm">{ticket.guestName || 'Anônimo'}</div>
                    {ticket.guestPhone && <div className="text-[10px] font-medium text-gray-400 mt-0.5">{ticket.guestPhone}</div>}
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wide ${
                      ticket.type === 'preferencial' ? 'bg-purple-50 text-purple-600 border border-purple-100' : 'bg-gray-100 text-gray-500 border border-gray-200'
                    }`}>
                      {ticket.type}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    {event.isPaid ? (
                      <span className={`px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wide ${
                        ticket.paymentStatus === 'pago' ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' : 'bg-amber-50 text-amber-600 border border-amber-100'
                      }`}>
                        {ticket.paymentStatus}
                      </span>
                    ) : (
                      <span className="text-gray-400 text-xs font-medium italic">Gratuito</span>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex justify-end gap-1">
                      <button
                        onClick={() => onUpdateTicket(ticket.id, { attendance: 'presente' })}
                        className={`w-8 h-8 rounded-lg flex items-center justify-center transition-all ${
                          ticket.attendance === 'presente' 
                            ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/30 scale-110' 
                            : 'bg-gray-100 text-gray-400 hover:bg-emerald-100 hover:text-emerald-600'
                        }`}
                        title="Marcar Presente"
                      >
                        <Check size={16} strokeWidth={2.5} />
                      </button>
                      <button
                        onClick={() => onUpdateTicket(ticket.id, { attendance: 'faltou' })}
                        className={`w-8 h-8 rounded-lg flex items-center justify-center transition-all ${
                          ticket.attendance === 'faltou' 
                            ? 'bg-red-500 text-white shadow-lg shadow-red-500/30 scale-110' 
                            : 'bg-gray-100 text-gray-400 hover:bg-red-100 hover:text-red-600'
                        }`}
                        title="Marcar Falta"
                      >
                        <X size={16} strokeWidth={2.5} />
                      </button>
                      <button
                        onClick={() => onUpdateTicket(ticket.id, { attendance: 'justificado' })}
                        className={`w-8 h-8 rounded-lg flex items-center justify-center transition-all ${
                          ticket.attendance === 'justificado' 
                            ? 'bg-amber-400 text-white shadow-lg shadow-amber-400/30 scale-110' 
                            : 'bg-gray-100 text-gray-400 hover:bg-amber-100 hover:text-amber-600'
                        }`}
                        title="Marcar Justificado"
                      >
                        <Filter size={16} strokeWidth={2.5} />
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
