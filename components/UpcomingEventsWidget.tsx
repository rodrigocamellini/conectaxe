import React from 'react';
import { Calendar, Clock, MapPin, ChevronRight } from 'lucide-react';
import { TerreiroEvent, SystemConfig } from '../types';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface UpcomingEventsWidgetProps {
  events: TerreiroEvent[];
  config: SystemConfig;
  onEventClick?: (event: TerreiroEvent) => void;
}

export function UpcomingEventsWidget({ events, config, onEventClick }: UpcomingEventsWidgetProps) {
  const todayStr = format(new Date(), 'yyyy-MM-dd');

  const upcomingEvents = (events || [])
    .filter(event => {
      // Compara apenas a parte da data (YYYY-MM-DD) para evitar problemas de fuso horário
      const eventDateStr = event.date.split('T')[0];
      return event.status === 'agendado' && eventDateStr >= todayStr;
    })
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
    .slice(0, 5);

  const fs = {
    body: config.dashboardFontSize === 'small' ? 'text-xs' : config.dashboardFontSize === 'medium' ? 'text-sm' : 'text-base',
    label: config.dashboardFontSize === 'small' ? 'text-[9px]' : config.dashboardFontSize === 'medium' ? 'text-[10px]' : 'text-xs',
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden h-full">
      <div className="p-5 border-b border-gray-100 bg-gray-50 flex items-center justify-between">
        <div className="flex items-center gap-2 text-indigo-600" style={{ color: config.primaryColor }}>
          <Calendar size={18} />
          <h3 className={`${fs.body} font-black uppercase tracking-widest`}>Próximas Giras e Eventos</h3>
        </div>
        <span className={`${fs.label} font-black px-2 py-1 rounded-full bg-indigo-50 text-indigo-600`}>
          {upcomingEvents.length} Próximos
        </span>
      </div>
      
      <div className="overflow-y-auto max-h-[320px]">
        {upcomingEvents.length > 0 ? (
          <div className="divide-y divide-gray-50">
            {upcomingEvents.map((event) => (
              <div 
                key={event.id} 
                className="p-4 flex items-center gap-4 hover:bg-gray-50 transition-colors group cursor-pointer"
                onClick={() => onEventClick && onEventClick(event)}
              >
                <div className="flex-shrink-0 w-12 h-12 bg-indigo-50 rounded-xl flex flex-col items-center justify-center text-indigo-600 border border-indigo-100">
                  <span className="text-[10px] font-black uppercase">{format(new Date(event.date), 'MMM', { locale: ptBR })}</span>
                  <span className="text-lg font-black leading-none">{format(new Date(event.date), 'dd')}</span>
                </div>
                
                <div className="flex-1 min-w-0">
                  <h4 className="font-bold text-gray-800 text-sm truncate">{event.title}</h4>
                  <div className="flex items-center gap-3 mt-1">
                    <span className="flex items-center gap-1 text-[10px] font-bold text-gray-400 uppercase">
                      <Clock size={10} />
                      {event.time}
                    </span>
                    <span className={`px-1.5 py-0.5 rounded text-[9px] font-bold uppercase tracking-wide ${
                        event.type === 'gira' 
                          ? 'bg-purple-50 text-purple-600 border border-purple-100' 
                          : 'bg-blue-50 text-blue-600 border border-blue-100'
                    }`}>
                      {event.type}
                    </span>
                  </div>
                </div>

                <ChevronRight size={16} className="text-gray-300 group-hover:text-indigo-400 transition-colors" />
              </div>
            ))}
          </div>
        ) : (
          <div className="py-12 flex flex-col items-center justify-center text-center text-gray-400 px-8">
            <Calendar size={32} className="opacity-10 mb-2" />
            <p className="text-[10px] font-black uppercase tracking-widest italic">Nenhum evento futuro agendado.</p>
          </div>
        )}
      </div>
    </div>
  );
}
