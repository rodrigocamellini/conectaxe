
import React, { useState } from 'react';
import { Plus, Calendar, Clock, MapPin, Users, MoreVertical, Edit2, Trash2, Link, Copy, CheckCircle, Archive, RotateCcw } from 'lucide-react';
import { TerreiroEvent, SystemConfig } from '../../types';

interface EventListProps {
  events: TerreiroEvent[];
  onEdit: (event: TerreiroEvent) => void;
  onDelete: (id: string) => void;
  onNewEvent: () => void;
  onViewCheckin: (event: TerreiroEvent) => void;
  onStatusChange: (id: string, newStatus: 'agendado' | 'acontecendo' | 'encerrado' | 'cancelado') => void;
  config: SystemConfig;
}

export function EventList({ events, onEdit, onDelete, onNewEvent, onViewCheckin, onStatusChange, config }: EventListProps) {
  const [filter, setFilter] = useState<'todos' | 'agendado' | 'encerrado'>('todos');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const filteredEvents = events
    .filter(e => filter === 'todos' ? true : e.status === filter)
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'agendado': return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'acontecendo': return 'bg-green-100 text-green-700 border-green-200 animate-pulse';
      case 'encerrado': return 'bg-slate-100 text-slate-600 border-slate-200';
      case 'cancelado': return 'bg-red-100 text-red-700 border-red-200';
      default: return 'bg-slate-100 text-slate-600';
    }
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'gira': return 'Gira de Atendimento';
      case 'festa': return 'Festa / Comemoração';
      case 'curso': return 'Curso / Workshop';
      default: return 'Evento Geral';
    }
  };

  const copyLink = (id: string) => {
    const url = `${window.location.origin}/eventos/${id}`;
    navigator.clipboard.writeText(url);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="space-y-6">
      {/* Header e Filtros */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex gap-2 p-1 bg-slate-100 rounded-lg w-fit">
          <button
            onClick={() => setFilter('todos')}
            className={`px-4 py-1.5 rounded-md text-sm font-medium transition-all ${
              filter === 'todos' ? 'bg-white shadow text-indigo-600' : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            Todos
          </button>
          <button
            onClick={() => setFilter('agendado')}
            className={`px-4 py-1.5 rounded-md text-sm font-medium transition-all ${
              filter === 'agendado' ? 'bg-white shadow text-indigo-600' : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            Próximos
          </button>
          <button
            onClick={() => setFilter('encerrado')}
            className={`px-4 py-1.5 rounded-md text-sm font-medium transition-all ${
              filter === 'encerrado' ? 'bg-white shadow text-indigo-600' : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            Histórico
          </button>
        </div>

        <button
          onClick={onNewEvent}
          className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg shadow-sm transition-all"
        >
          <Plus size={18} />
          <span>Novo Evento</span>
        </button>
      </div>

      {/* Grid de Eventos */}
      {filteredEvents.length === 0 ? (
        <div className="text-center py-12 bg-slate-50 rounded-2xl border border-dashed border-slate-200">
          <Calendar className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h3 className="text-lg font-medium text-slate-600">Nenhum evento encontrado</h3>
          <p className="text-slate-400 text-sm">Crie um novo evento para começar a gerenciar.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {filteredEvents.map(event => (
            <div key={event.id} className="bg-white rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow group relative overflow-hidden">
              {/* Status Badge */}
              <div className="absolute top-4 right-4 z-10">
                <span className={`px-2.5 py-1 rounded-full text-xs font-bold uppercase tracking-wider border ${getStatusColor(event.status)}`}>
                  {event.status}
                </span>
              </div>

              <div className="p-5">
                {/* Cabeçalho */}
                <div className="mb-4 pr-16">
                  <h3 className="font-bold text-lg text-slate-800 line-clamp-1">{event.title}</h3>
                  <p className="text-xs font-medium text-slate-500 uppercase tracking-wide mt-1">
                    {getTypeLabel(event.type)}
                  </p>
                </div>

                {/* Detalhes */}
                <div className="space-y-3 mb-6">
                  <div className="flex items-center gap-3 text-slate-600 text-sm">
                    <Calendar size={16} className="text-indigo-500" />
                    <span>{new Date(event.date).toLocaleDateString()}</span>
                  </div>
                  <div className="flex items-center gap-3 text-slate-600 text-sm">
                    <Clock size={16} className="text-indigo-500" />
                    <span>{event.time}</span>
                  </div>
                  <div className="flex items-center gap-3 text-slate-600 text-sm">
                    <Users size={16} className="text-indigo-500" />
                    <div className="flex-1">
                      <div className="flex justify-between mb-1">
                        <span>{event.ticketsIssued} / {event.capacity} inscritos</span>
                        <span className="font-medium text-indigo-600">
                          {Math.round((event.ticketsIssued / event.capacity) * 100)}%
                        </span>
                      </div>
                      <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
                        <div 
                          className="bg-indigo-500 h-full rounded-full transition-all"
                          style={{ width: `${(event.ticketsIssued / event.capacity) * 100}%` }}
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Ações */}
                <div className="flex items-center gap-2 pt-4 border-t border-slate-100">
                  <button
                    onClick={() => onViewCheckin(event)}
                    className="flex-1 px-3 py-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 rounded-lg text-sm font-medium transition-colors"
                  >
                    Gerenciar / Check-in
                  </button>
                  
                  <div className="flex gap-1">
                    <button
                      onClick={() => copyLink(event.id)}
                      title="Copiar Link de Inscrição"
                      className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-slate-50 rounded-lg transition-colors relative"
                    >
                      {copiedId === event.id ? <CheckCircle size={18} className="text-green-500" /> : <Link size={18} />}
                    </button>
                    {(event.status === 'agendado' || event.status === 'acontecendo') && (
                      <button
                        onClick={() => onStatusChange(event.id, 'encerrado')}
                        title="Finalizar Evento"
                        className="p-2 text-slate-400 hover:text-green-600 hover:bg-slate-50 rounded-lg transition-colors"
                      >
                        <Archive size={18} />
                      </button>
                    )}
                    {(event.status === 'encerrado' || event.status === 'realizado') && (
                      <button
                        onClick={() => onStatusChange(event.id, 'agendado')}
                        title="Reabrir Evento"
                        className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-slate-50 rounded-lg transition-colors"
                      >
                        <RotateCcw size={18} />
                      </button>
                    )}
                    <button
                      onClick={() => onEdit(event)}
                      title="Editar"
                      className="p-2 text-slate-400 hover:text-blue-600 hover:bg-slate-50 rounded-lg transition-colors"
                    >
                      <Edit2 size={18} />
                    </button>
                    <button
                      onClick={() => onDelete(event.id)}
                      title="Excluir"
                      className="p-2 text-slate-400 hover:text-red-600 hover:bg-slate-50 rounded-lg transition-colors"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
