
import React, { useState, useEffect } from 'react';
import { EventList } from './EventList';
import { EventForm } from './EventForm';
import { EventCheckin } from './EventCheckin';
import { TerreiroEvent, EventTicket, SystemConfig } from '../../types';
import { Calendar, LayoutDashboard, Ticket, Users, Percent } from 'lucide-react';

interface EventsManagerProps {
  events: TerreiroEvent[];
  tickets: EventTicket[];
  config: SystemConfig;
  onUpdateEvents: (events: TerreiroEvent[]) => void;
  onUpdateTickets: (tickets: EventTicket[]) => void;
  onTicketUpdate?: (ticket: EventTicket) => void;
}

export function EventsManager({ events, tickets, config, onUpdateEvents, onUpdateTickets, onTicketUpdate }: EventsManagerProps) {
  const [view, setView] = useState<'list' | 'checkin'>('list');
  const [showForm, setShowForm] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<TerreiroEvent | null>(null);
  const [editingEvent, setEditingEvent] = useState<TerreiroEvent | null>(null);

  // Auto-finalize past events
  useEffect(() => {
    const now = new Date();
    // Only check if we have events loaded
    if (events.length === 0) return;

    const updates = events
      .filter(e => (e.status === 'agendado' || e.status === 'acontecendo'))
      .filter(e => {
        try {
          // Construct date object safely
          const dateStr = e.date.includes('T') ? e.date.split('T')[0] : e.date;
          const eventDateTime = new Date(`${dateStr}T${e.time}`);
          
          // Consider event finished 24 hours after start time
          const eventEnd = new Date(eventDateTime.getTime() + 24 * 60 * 60 * 1000);
          return eventEnd < now;
        } catch (err) {
          return false;
        }
      });

    if (updates.length > 0) {
      const updatedEvents = events.map(e => {
        const shouldUpdate = updates.find(u => u.id === e.id);
        return shouldUpdate ? { ...e, status: 'encerrado' as const } : e;
      });
      // Defer update to avoid render cycle issues if this runs during render
      setTimeout(() => onUpdateEvents(updatedEvents), 0);
    }
  }, [events]); // Run when events change

  // Stats Logic
  const upcomingEvents = events.filter(e => e.status === 'agendado' || e.status === 'acontecendo').length;
  const activeWaitlist = tickets.filter(t => t.status === 'lista_espera').length;
  const totalParticipants = events
    .filter(e => e.status === 'agendado')
    .reduce((acc, e) => acc + e.ticketsIssued, 0);
  
  const pastEvents = events.filter(e => e.status === 'encerrado');
  const avgAttendance = pastEvents.length > 0 
    ? Math.round(pastEvents.reduce((acc, ev) => {
        const evTickets = tickets.filter(t => t.eventId === ev.id && t.status === 'confirmado');
        const present = evTickets.filter(t => t.attendance === 'presente').length;
        return acc + (evTickets.length > 0 ? (present / evTickets.length) * 100 : 0);
      }, 0) / pastEvents.length)
    : 0;

  const handleSaveEvent = (event: TerreiroEvent) => {
    if (editingEvent) {
      onUpdateEvents(events.map(e => e.id === event.id ? event : e));
    } else {
      onUpdateEvents([...events, event]);
    }
    setShowForm(false);
    setEditingEvent(null);
  };

  const handleDeleteEvent = (id: string) => {
    if (confirm('Tem certeza que deseja excluir este evento?')) {
      onUpdateEvents(events.filter(e => e.id !== id));
      // Also cleanup tickets
      onUpdateTickets(tickets.filter(t => t.eventId !== id));
    }
  };

  const handleUpdateTicket = (ticketId: string, updates: Partial<EventTicket>) => {
    const updatedTicket = tickets.find(t => t.id === ticketId);
    if (updatedTicket) {
      const newTicket = { ...updatedTicket, ...updates };
      if (onTicketUpdate) {
        onTicketUpdate(newTicket);
      }
      onUpdateTickets(tickets.map(t => t.id === ticketId ? newTicket : t));
    }
  };

  const handleStatusChange = (id: string, newStatus: 'agendado' | 'acontecendo' | 'encerrado' | 'cancelado') => {
    onUpdateEvents(events.map(e => e.id === id ? { ...e, status: newStatus } : e));
  };

  if (view === 'checkin' && selectedEvent) {
    const eventTickets = tickets.filter(t => t.eventId === selectedEvent.id);
    return (
      <div className="space-y-6">
        <EventCheckin 
          event={selectedEvent}
          tickets={eventTickets}
          onBack={() => {
            setView('list');
            setSelectedEvent(null);
          }}
          onUpdateTicket={handleUpdateTicket}
          config={config}
        />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Gestão de Giras e Eventos</h1>
          <p className="text-slate-500">Gerencie o calendário, inscrições e portaria do terreiro</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-indigo-100 rounded-lg text-indigo-600">
              <Calendar size={20} />
            </div>
            <span className="text-slate-500 font-medium text-sm">Próximos Eventos</span>
          </div>
          <div className="text-2xl font-bold text-slate-800">{upcomingEvents}</div>
        </div>

        <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-green-100 rounded-lg text-green-600">
              <Ticket size={20} />
            </div>
            <span className="text-slate-500 font-medium text-sm">Inscritos Ativos</span>
          </div>
          <div className="text-2xl font-bold text-slate-800">{totalParticipants}</div>
        </div>

        <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-amber-100 rounded-lg text-amber-600">
              <Users size={20} />
            </div>
            <span className="text-slate-500 font-medium text-sm">Fila de Espera</span>
          </div>
          <div className="text-2xl font-bold text-slate-800">{activeWaitlist}</div>
        </div>

        <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-blue-100 rounded-lg text-blue-600">
              <Percent size={20} />
            </div>
            <span className="text-slate-500 font-medium text-sm">Presença Média</span>
          </div>
          <div className="text-2xl font-bold text-slate-800">{avgAttendance}%</div>
        </div>
      </div>

      <EventList
        events={events}
        config={config}
        onNewEvent={() => {
          setEditingEvent(null);
          setShowForm(true);
        }}
        onEdit={(event) => {
          setEditingEvent(event);
          setShowForm(true);
        }}
        onDelete={handleDeleteEvent}
        onViewCheckin={(event) => {
          setSelectedEvent(event);
          setView('checkin');
        }}
        onStatusChange={handleStatusChange}
      />

      {showForm && (
        <EventForm
          config={config}
          initialData={editingEvent}
          onClose={() => {
            setShowForm(false);
            setEditingEvent(null);
          }}
          onSave={handleSaveEvent}
        />
      )}
    </div>
  );
}
