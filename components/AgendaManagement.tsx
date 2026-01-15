
import React, { useState, useMemo } from 'react';
import { CalendarEvent, SystemConfig, User, Member } from '../types';
import { 
  Plus, 
  ChevronLeft, 
  ChevronRight, 
  Printer, 
  X, 
  Calendar as CalendarIcon, 
  Clock, 
  Trash2, 
  GripVertical,
  Palette,
  Info,
  Sparkles,
  Flame,
  Droplets,
  Zap,
  Wind,
  Moon,
  Sun,
  Star,
  Heart,
  Anchor,
  Coffee,
  Leaf,
  Cake,
  Gift,
  PartyPopper,
  Trophy,
  Medal,
  Award,
  Hash,
  CalendarDays,
  Ghost
} from 'lucide-react';
import { 
  format, 
  addMonths, 
  endOfMonth, 
  endOfWeek, 
  eachDayOfInterval, 
  isSameMonth, 
  isSameDay, 
  addDays,
  differenceInYears
} from 'date-fns';
import { ptBR } from 'date-fns/locale/pt-BR';
import { DEFAULT_LOGO_URL } from '../constants';

interface AgendaManagementProps {
  events: CalendarEvent[];
  members: Member[];
  config: SystemConfig;
  user: User;
  onAddEvent: (event: Partial<CalendarEvent>) => void;
  onUpdateEvent: (id: string, event: Partial<CalendarEvent>) => void;
  onDeleteEvent: (id: string) => void;
}

const EVENT_COLORS = [
  { name: 'Branco', hex: '#ffffff' },
  { name: 'Vermelho', hex: '#ef4444' },
  { name: 'Azul', hex: '#3b82f6' },
  { name: 'Verde', hex: '#22c55e' },
  { name: 'Amarelo', hex: '#eab308' },
  { name: 'Rosa', hex: '#ec4899' },
  { name: 'Roxo', hex: '#a855f7' },
  { name: 'Laranja', hex: '#f97316' },
  { name: 'Ciano', hex: '#06b6d4' },
  { name: 'Indigo', hex: '#6366f1' },
  { name: 'Marrom', hex: '#78350f' },
  { name: 'Preto', hex: '#18181b' },
];

const EVENT_ICONS = [
  { name: 'sparkles', icon: Sparkles },
  { name: 'flame', icon: Flame },
  { name: 'droplets', icon: Droplets },
  { name: 'zap', icon: Zap },
  { name: 'moon', icon: Moon },
  { name: 'sun', icon: Sun },
  { name: 'star', icon: Star },
  { name: 'heart', icon: Heart },
  { name: 'anchor', icon: Anchor },
  { name: 'leaf', icon: Leaf },
  { name: 'cake', icon: Cake },
  { name: 'gift', icon: Gift },
  { name: 'party', icon: PartyPopper },
  { name: 'trophy', icon: Trophy },
  { name: 'medal', icon: Medal },
  { name: 'award', icon: Award },
];

const RenderIcon = ({ name, size = 16, className = "" }: { name?: string, size?: number, className?: string }) => {
  const IconComp = EVENT_ICONS.find(i => i.name === name)?.icon || Sparkles;
  return <IconComp size={size} className={className} />;
};

export const AgendaManagement: React.FC<AgendaManagementProps> = ({
  events,
  members,
  config,
  user,
  onAddEvent,
  onUpdateEvent,
  onDeleteEvent
}) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [showModal, setShowModal] = useState(false);
  const [showPrintPreview, setShowPrintPreview] = useState(false);
  const [selectedDay, setSelectedDay] = useState<Date | null>(null);
  const [draggedEventId, setDraggedEventId] = useState<string | null>(null);
  const [dragOverDate, setDragOverDate] = useState<string | null>(null);

  const [formData, setFormData] = useState<Partial<CalendarEvent>>({
    title: '',
    description: '',
    time: '20:00',
    color: '#ffffff',
    icon: 'sparkles'
  });

  const calendarDays = useMemo(() => {
    const monthStart = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
    const monthEnd = endOfMonth(monthStart);
    const startDate = addDays(monthStart, -monthStart.getDay());
    const endDate = endOfWeek(monthEnd, { weekStartsOn: 0 });
    return eachDayOfInterval({ start: startDate, end: endDate });
  }, [currentDate]);

  const scheduledEvents = events.filter(e => e.date);
  const draftEvents = events.filter(e => !e.date);

  const handlePrevMonth = () => setCurrentDate(addMonths(currentDate, -1));
  const handleNextMonth = () => setCurrentDate(addMonths(currentDate, 1));

  const handleAddEvent = (e: React.FormEvent) => {
    e.preventDefault();
    onAddEvent({ ...formData, id: Math.random().toString(36).substr(2, 9), createdBy: user.id });
    setShowModal(false);
    setFormData({ title: '', description: '', time: '20:00', color: '#ffffff', icon: 'sparkles' });
  };

  const onDragStart = (e: React.DragEvent, eventId: string) => {
    setDraggedEventId(eventId);
    e.dataTransfer.setData('text/plain', eventId);
    e.dataTransfer.effectAllowed = 'move';
    document.body.classList.add('is-dragging-event');
  };

  const onDragEnd = () => {
    setDraggedEventId(null);
    setDragOverDate(null);
    document.body.classList.remove('is-dragging-event');
  };

  const onDrop = (e: React.DragEvent, date: Date) => {
    e.preventDefault();
    e.stopPropagation();
    
    const dateKey = format(date, 'yyyy-MM-dd');
    const eventId = draggedEventId || e.dataTransfer.getData('text/plain');
    
    if (eventId) {
      onUpdateEvent(eventId, { date: dateKey });
    }
    
    onDragEnd();
  };

  const onDragOver = (e: React.DragEvent, date: Date) => {
    e.preventDefault();
    e.stopPropagation();
    e.dataTransfer.dropEffect = 'move';
    
    const dateKey = format(date, 'yyyy-MM-dd');
    if (dragOverDate !== dateKey) {
      setDragOverDate(dateKey);
    }
  };

  const onDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragOverDate(null);
  };

  const handlePrint = () => {
    window.print();
  };

  const getDayBirthdays = (day: Date) => {
    return members.filter(m => {
      if (!m.birthDate) return false;
      try {
        const bDate = new Date(m.birthDate);
        if (isNaN(bDate.getTime())) return false;
        return bDate.getDate() === day.getDate() && bDate.getMonth() === day.getMonth();
      } catch {
        return false;
      }
    });
  };

  const calculateAgeAt = (birthDate: string, targetDate: Date) => {
    if (!birthDate) return 0;
    try {
      const bDate = new Date(birthDate);
      if (isNaN(bDate.getTime())) return 0;
      return differenceInYears(targetDate, bDate);
    } catch {
      return 0;
    }
  };

  return (
    <div className="space-y-6">
      <style>{`
        @media print {
          body * { visibility: hidden; }
          #agenda-print-area, #agenda-print-area * { visibility: visible; }
          #agenda-print-area { 
            position: absolute; 
            left: 0; 
            top: 0; 
            width: 100%; 
            height: 100%;
            background: white;
            padding: 1cm;
          }
          .no-print { display: none !important; }
        }
        /* Garantir que nada roube o drop do quadrado do dia */
        .is-dragging-event .calendar-cell-content {
          pointer-events: none !important;
        }
      `}</style>

      <div className="flex flex-col lg:flex-row gap-6 h-[calc(100vh-12rem)]">
        
        {/* Painel Lateral: Eventos rascunhos */}
        <div className="w-full lg:w-80 bg-white rounded-2xl shadow-sm border border-gray-100 flex flex-col overflow-hidden">
          <div className="p-4 bg-indigo-50 border-b border-indigo-100 flex items-center justify-between">
            <h3 className="text-xs font-black text-indigo-900 uppercase tracking-widest flex items-center gap-2">
              <Plus size={14} /> Rascunhos de Eventos
            </h3>
            <button 
              onClick={() => setShowModal(true)}
              className="p-1.5 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-all shadow-md active:scale-95"
            >
              <Plus size={18} />
            </button>
          </div>
          
          <div className="flex-1 overflow-y-auto p-4 space-y-3" style={{ scrollbarWidth: 'thin' }}>
            <div className="p-3 bg-blue-50 border border-blue-100 rounded-xl mb-4">
              <p className="text-[10px] text-blue-700 font-bold flex items-center gap-2">
                <Info size={12} /> Arraste para o dia no calendário.
              </p>
            </div>

            {draftEvents.map(event => (
              <div
                key={event.id}
                draggable
                onDragStart={(e) => onDragStart(e, event.id)}
                onDragEnd={onDragEnd}
                className={`p-3 rounded-xl border border-gray-200 bg-white cursor-grab active:cursor-grabbing hover:border-indigo-300 transition-all group relative shadow-sm hover:shadow-md ${draggedEventId === event.id ? 'opacity-40 border-indigo-500 scale-95' : ''}`}
              >
                <div className="flex items-start gap-3">
                  <div className="p-1 text-gray-300 group-hover:text-indigo-400">
                    <GripVertical size={18} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <div className="p-1.5 rounded-lg border shadow-sm" style={{ backgroundColor: `${event.color}15`, borderColor: event.color, color: event.color === '#ffffff' ? '#1f2937' : event.color }}>
                        <RenderIcon name={event.icon} size={14} />
                      </div>
                      <p className="font-black text-sm text-gray-800 truncate">{event.title}</p>
                    </div>
                    {event.time && (
                      <p className="text-[10px] text-gray-400 font-bold flex items-center gap-1 ml-9">
                        <Clock size={10} /> {event.time}
                      </p>
                    )}
                  </div>
                </div>
                <button 
                  onClick={() => onDeleteEvent(event.id)}
                  className="absolute top-2 right-2 p-1.5 text-gray-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            ))}
            {draftEvents.length === 0 && (
              <div className="h-40 flex flex-col items-center justify-center text-gray-400 border-2 border-dashed border-gray-100 rounded-2xl">
                <CalendarIcon size={24} className="opacity-20 mb-2" />
                <p className="text-[10px] font-black uppercase tracking-widest">Sem rascunhos</p>
              </div>
            )}
          </div>
        </div>

        {/* Área Principal: Calendário */}
        <div className="flex-1 bg-white rounded-2xl shadow-sm border border-gray-100 flex flex-col overflow-hidden">
          <header className="p-6 border-b border-gray-100 flex items-center justify-between bg-white sticky top-0 z-10">
            <div className="flex items-center gap-6">
              <h2 className="text-2xl font-black text-gray-800 capitalize">
                {format(currentDate, 'MMMM yyyy', { locale: ptBR })}
              </h2>
              <div className="flex items-center bg-gray-100 rounded-xl p-1">
                <button onClick={handlePrevMonth} className="p-2 hover:bg-white rounded-lg transition-all text-gray-500"><ChevronLeft size={20} /></button>
                <button onClick={() => setCurrentDate(new Date())} className="px-4 text-[10px] font-black uppercase text-gray-400 hover:text-indigo-600 transition-colors">Hoje</button>
                <button onClick={handleNextMonth} className="p-2 hover:bg-white rounded-lg transition-all text-gray-500"><ChevronRight size={20} /></button>
              </div>
            </div>
            
            <button 
              onClick={() => setShowPrintPreview(true)}
              className="flex items-center gap-2 px-6 py-2.5 bg-indigo-600 text-white rounded-xl font-black text-xs shadow-lg shadow-indigo-100 hover:scale-[1.02] active:scale-95 transition-all"
            >
              <Printer size={18} /> Visualizar Impressão
            </button>
          </header>

          <div className="flex-1 grid grid-cols-7 border-l border-gray-100 overflow-y-auto" style={{ scrollbarWidth: 'thin' }}>
            {['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'].map(day => (
              <div key={day} className="py-3 text-center bg-gray-50 border-r border-b border-gray-100 text-[10px] font-black uppercase text-gray-400 tracking-widest sticky top-0 z-20">
                {day}
              </div>
            ))}

            {calendarDays.map((day, idx) => {
              const dayStr = format(day, 'yyyy-MM-dd');
              const dayEvents = scheduledEvents.filter(e => e.date === dayStr);
              const dayBirthdays = getDayBirthdays(day);
              const isToday = isSameDay(day, new Date());
              const isCurrentMonth = isSameMonth(day, currentDate);
              const isBeingDraggedOver = dragOverDate === dayStr;

              return (
                <div 
                  key={idx}
                  onDragOver={(e) => onDragOver(e, day)}
                  onDragLeave={onDragLeave}
                  onDrop={(e) => onDrop(e, day)}
                  onClick={() => setSelectedDay(day)}
                  className={`
                    min-h-[140px] p-2 border-r border-b border-gray-100 transition-all cursor-pointer relative group/cell
                    ${!isCurrentMonth ? 'bg-gray-50/50 opacity-60' : 'bg-white hover:bg-gray-50/80'}
                    ${isToday ? 'ring-2 ring-inset ring-indigo-100' : ''}
                    ${isBeingDraggedOver ? 'bg-indigo-50 ring-2 ring-indigo-500 z-10 shadow-inner' : ''}
                  `}
                >
                  {/* Container de conteúdo que ganha pointer-events-none durante o arraste */}
                  <div className="calendar-cell-content h-full w-full pointer-events-auto">
                    <div className="flex justify-between items-center mb-2">
                      <span className={`
                        text-xs font-black w-6 h-6 flex items-center justify-center rounded-lg transition-all
                        ${isToday ? 'bg-indigo-600 text-white shadow-md' : isCurrentMonth ? 'text-gray-800 group-hover/cell:bg-gray-200' : 'text-gray-300'}
                      `}>
                        {format(day, 'd')}
                      </span>
                    </div>
                    
                    <div className="space-y-1">
                      {dayBirthdays.map(m => (
                        <div 
                          key={m.id}
                          className="p-1 rounded bg-gradient-to-r from-pink-50 to-rose-50 border border-pink-100 text-pink-600 shadow-sm overflow-hidden"
                        >
                           <div className="flex items-center gap-1">
                             <Cake size={10} className="shrink-0" />
                             <span className="text-[9px] font-black uppercase truncate">{m.name.split(' ')[0]}</span>
                           </div>
                        </div>
                      ))}

                      {dayEvents.map(event => (
                        <div
                          key={event.id}
                          draggable
                          onDragStart={(e) => onDragStart(e, event.id)}
                          onDragEnd={onDragEnd}
                          onClick={(e) => { e.stopPropagation(); setSelectedDay(day); }}
                          className={`group relative p-1 rounded border text-[9px] font-black shadow-sm cursor-grab active:cursor-grabbing transition-all hover:scale-[1.02] ${draggedEventId === event.id ? 'opacity-20' : 'bg-white'}`}
                          style={{ 
                            backgroundColor: `${event.color}15`, 
                            borderColor: event.color,
                            color: event.color === '#ffffff' ? '#1f2937' : event.color 
                          }}
                        >
                          <div className="flex items-center gap-1">
                            <RenderIcon name={event.icon} size={10} className="shrink-0" />
                            <span className="truncate">{event.title}</span>
                          </div>
                          <button 
                            onClick={(e) => { e.stopPropagation(); onUpdateEvent(event.id, { date: undefined }); }}
                            className="absolute -top-1.5 -right-1.5 p-0.5 bg-white border border-gray-200 rounded-full text-gray-400 hover:text-red-500 opacity-0 group-hover:opacity-100 shadow-sm transition-all z-20"
                          >
                            <X size={8} />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {selectedDay && (
        <div 
          className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[80] p-4 animate-in fade-in duration-200"
          onClick={() => setSelectedDay(null)}
        >
          <div 
            className="bg-white rounded-[2rem] shadow-2xl max-w-lg w-full overflow-hidden animate-in zoom-in duration-300"
            onClick={e => e.stopPropagation()}
          >
            <div className="p-8 text-white relative flex flex-col gap-2" style={{ backgroundColor: config.primaryColor }}>
              <button 
                onClick={() => setSelectedDay(null)}
                className="absolute top-6 right-6 p-2 bg-black/20 hover:bg-black/40 text-white rounded-full transition-all"
              >
                <X size={20} />
              </button>
              <p className="text-[10px] font-black uppercase tracking-[0.3em] opacity-60">Programação do Dia</p>
              <h3 className="text-3xl font-black uppercase tracking-tighter">
                {format(selectedDay, "dd 'de' MMMM", { locale: ptBR })}
              </h3>
              <p className="text-sm font-bold opacity-80">{format(selectedDay, "EEEE, yyyy", { locale: ptBR })}</p>
            </div>

            <div className="p-8 max-h-[60vh] overflow-y-auto space-y-6" style={{ scrollbarWidth: 'thin' }}>
              {getDayBirthdays(selectedDay).length > 0 && (
                <div className="space-y-3">
                  <h4 className="text-[10px] font-black text-pink-400 uppercase tracking-widest flex items-center gap-2">
                    <Cake size={14} /> Aniversariantes do Dia
                  </h4>
                  <div className="space-y-2">
                    {getDayBirthdays(selectedDay).map(m => (
                      <div key={m.id} className="flex items-center gap-4 p-4 bg-pink-50 border border-pink-100 rounded-2xl shadow-sm">
                        <div className="w-10 h-10 rounded-xl bg-white border border-pink-200 flex items-center justify-center text-pink-500 shadow-sm shrink-0">
                          <PartyPopper size={20} />
                        </div>
                        <div>
                          <p className="font-black text-gray-800 text-sm">{m.name}</p>
                          <p className="text-[10px] font-bold text-pink-600 uppercase tracking-tight">
                            Celebrando {calculateAgeAt(m.birthDate, selectedDay)} anos
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="space-y-3">
                <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-2">
                  <CalendarDays size={14} /> Rituais e Atividades
                </h4>
                
                <div className="space-y-3">
                  {scheduledEvents.filter(e => e.date === format(selectedDay, 'yyyy-MM-dd')).length > 0 ? (
                    scheduledEvents.filter(e => e.date === format(selectedDay, 'yyyy-MM-dd')).map(event => (
                      <div 
                        key={event.id}
                        className="flex items-center gap-4 p-5 rounded-2xl border transition-all hover:scale-[1.01] shadow-sm"
                        style={{ backgroundColor: `${event.color}08`, borderColor: `${event.color}40` }}
                      >
                        <div 
                          className="w-12 h-12 rounded-2xl flex items-center justify-center shadow-md shrink-0"
                          style={{ backgroundColor: event.color, color: event.color === '#ffffff' ? '#000' : '#fff' }}
                        >
                          <RenderIcon name={event.icon} size={24} />
                        </div>
                        <div className="flex-1">
                          <div className="flex justify-between items-start">
                            <h5 className="font-black text-gray-800 text-base leading-tight uppercase">{event.title}</h5>
                            {event.time && (
                              <div className="flex items-center gap-1.5 px-3 py-1 bg-gray-100 rounded-full text-gray-500 font-bold text-[10px] shadow-inner">
                                <Clock size={12} /> {event.time}
                              </div>
                            )}
                          </div>
                          {event.description && (
                            <p className="text-xs text-gray-500 mt-1 font-medium">{event.description}</p>
                          )}
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="py-12 flex flex-col items-center justify-center text-center bg-gray-50 rounded-[2rem] border-2 border-dashed border-gray-100 space-y-4">
                      <div className="p-4 bg-white rounded-full shadow-lg text-gray-200">
                        <Ghost size={40} />
                      </div>
                      <div>
                        <p className="text-sm font-black text-gray-400 uppercase tracking-widest">Vazio</p>
                        <p className="text-xs text-gray-400 font-bold px-8">Não existem eventos agendados para este dia até o momento.</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="p-6 bg-gray-50 flex justify-center">
              <button 
                onClick={() => setSelectedDay(null)}
                className="px-8 py-3 bg-white border border-gray-200 rounded-2xl font-black text-xs text-gray-500 uppercase shadow-sm transition-all hover:bg-gray-100 active:scale-95"
              >
                Voltar ao Calendário
              </button>
            </div>
          </div>
        </div>
      )}

      {showModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-[70] p-4">
          <div className="bg-white rounded-3xl shadow-2xl max-w-2xl w-full overflow-hidden animate-in zoom-in duration-200">
            <div className="p-6 bg-indigo-600 text-white flex justify-between items-center" style={{ backgroundColor: config.primaryColor }}>
              <h3 className="text-xl font-black uppercase tracking-tighter">Configurar Novo Ritual</h3>
              <button onClick={() => setShowModal(false)} className="text-white/60 hover:text-white"><X size={24} /></button>
            </div>
            <form onSubmit={handleAddEvent} className="p-8 space-y-8">
              <div className="space-y-6">
                <div>
                  <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Título do Evento / Gira</label>
                  <input 
                    required 
                    className="w-full p-4 bg-gray-50 border border-gray-200 rounded-2xl outline-none focus:ring-2 font-black text-gray-700 text-lg"
                    style={{ '--tw-ring-color': config.primaryColor } as any}
                    placeholder="Ex: Gira de Pretos Velhos"
                    value={formData.title} 
                    onChange={e => setFormData({...formData, title: e.target.value})} 
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3">Escolha um Ícone</label>
                    <div className="grid grid-cols-6 gap-2 bg-gray-50 p-3 rounded-2xl border border-gray-100">
                       {EVENT_ICONS.map(item => (
                         <button 
                           key={item.name}
                           type="button"
                           onClick={() => setFormData({...formData, icon: item.name})}
                           className={`p-2.5 rounded-xl border-2 transition-all flex items-center justify-center ${formData.icon === item.name ? 'bg-white border-indigo-500 shadow-md text-indigo-600 scale-110' : 'bg-transparent border-transparent text-gray-400 hover:text-gray-600'}`}
                         >
                           <item.icon size={20} />
                         </button>
                       ))}
                    </div>
                  </div>

                  <div className="space-y-3">
                    <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest">Tabela de Cores</label>
                    <div className="grid grid-cols-6 gap-2 bg-gray-50 p-3 rounded-2xl border border-gray-100">
                       {EVENT_COLORS.map(c => (
                         <button 
                           key={c.hex}
                           type="button"
                           onClick={() => setFormData({...formData, color: c.hex})}
                           className={`w-7 h-7 rounded-full border-2 transition-all ${formData.color?.toLowerCase() === c.hex.toLowerCase() ? 'border-gray-800 scale-110 shadow-lg' : 'border-white hover:scale-105'}`}
                           style={{ backgroundColor: c.hex }}
                           title={c.name}
                         />
                       ))}
                    </div>
                    <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-2xl border border-gray-100">
                      <div className="relative">
                        <input 
                          type="color" 
                          value={formData.color?.startsWith('#') ? formData.color : '#ffffff'} 
                          onChange={e => setFormData({...formData, color: e.target.value})}
                          className="w-10 h-10 rounded-xl cursor-pointer border-none p-0 bg-transparent"
                        />
                      </div>
                      <div className="flex-1">
                        <p className="text-[9px] font-black text-gray-400 uppercase mb-1">Código Hexadecimal</p>
                        <div className="relative">
                          <Hash className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-300" size={12} />
                          <input 
                            type="text"
                            placeholder="FFFFFF"
                            className="w-full bg-white border border-gray-200 rounded-lg pl-8 pr-3 py-1.5 text-xs font-mono font-bold outline-none focus:ring-1"
                            style={{ '--tw-ring-color': config.primaryColor } as any}
                            value={formData.color?.replace('#', '')}
                            onChange={e => {
                              const val = e.target.value;
                              if (val.length <= 6) setFormData({...formData, color: `#${val}`});
                            }}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Horário de Início</label>
                    <input 
                      type="time"
                      className="w-full p-4 bg-gray-50 border border-gray-200 rounded-2xl outline-none focus:ring-2 font-black text-gray-700"
                      style={{ '--tw-ring-color': config.primaryColor } as any}
                      value={formData.time} 
                      onChange={e => setFormData({...formData, time: e.target.value})} 
                    />
                  </div>
                  <div className="flex flex-col justify-end">
                     <div className="p-4 bg-indigo-50 rounded-2xl border border-indigo-100 flex items-center gap-3">
                        <div className="p-2 bg-white rounded-lg border shadow-sm" style={{ color: formData.color === '#ffffff' ? '#000' : formData.color }}>
                           <RenderIcon name={formData.icon} />
                        </div>
                        <span className="text-[10px] font-black uppercase text-indigo-900 tracking-tight">Prévia Visual</span>
                     </div>
                  </div>
                </div>
              </div>

              <div className="pt-4 flex gap-4">
                <button type="button" onClick={() => setShowModal(false)} className="flex-1 py-4 border border-gray-200 rounded-2xl text-gray-400 font-black uppercase text-xs transition-all hover:bg-gray-50">Cancelar</button>
                <button type="submit" className="flex-1 py-4 bg-indigo-600 text-white rounded-2xl font-black uppercase text-xs shadow-xl shadow-indigo-100 transition-all active:scale-[0.98]">Salvar Rascunho</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showPrintPreview && (
        <div className="fixed inset-0 bg-black/95 backdrop-blur-2xl flex flex-col z-[100] animate-in fade-in duration-300 no-print">
          <header className="p-6 border-b border-white/10 flex justify-between items-center text-white">
            <div className="flex items-center gap-4">
               <div className="p-3 bg-indigo-600 rounded-2xl shadow-lg">
                  <CalendarIcon size={24} />
               </div>
               <div>
                  <h3 className="text-xl font-black uppercase tracking-tighter">Agenda Mensal do Terreiro</h3>
                  <p className="text-xs text-white/50 font-bold uppercase tracking-widest">Mês de {format(currentDate, 'MMMM yyyy', { locale: ptBR })}</p>
               </div>
            </div>
            <div className="flex gap-4">
              <button 
                onClick={() => setShowPrintPreview(false)}
                className="px-6 py-3 bg-white/10 hover:bg-white/20 rounded-2xl font-black uppercase text-xs transition-all"
              >
                Voltar
              </button>
              <button 
                onClick={handlePrint}
                className="px-8 py-3 bg-indigo-600 text-white rounded-2xl font-black uppercase text-xs shadow-xl hover:scale-105 active:scale-95 transition-all flex items-center gap-3"
              >
                <Printer size={18} /> Imprimir Agora
              </button>
            </div>
          </header>

          <div className="flex-1 overflow-y-auto p-12 flex justify-center bg-gray-900/50" style={{ scrollbarWidth: 'thin' }}>
             <div id="agenda-print-area" className="bg-white w-full max-w-[29.7cm] min-h-[21cm] p-12 flex flex-col font-serif text-black shadow-2xl">
                <div className="flex justify-between items-center border-b-4 border-black pb-8 mb-10">
                   <div className="flex items-center gap-8">
                      <div className="w-28 h-28 border-2 border-black flex items-center justify-center bg-white p-3">
                         <img src={config.logoUrl || DEFAULT_LOGO_URL} className="w-full h-full object-contain" alt="Logo" />
                      </div>
                      <div>
                         <h1 className="text-5xl font-black uppercase tracking-tighter leading-none mb-2">{config.systemName}</h1>
                         <p className="text-lg font-bold uppercase tracking-[0.3em] text-gray-500">Cronograma de Atividades Espirituais</p>
                      </div>
                   </div>
                   <div className="text-right">
                      <p className="text-5xl font-black uppercase font-sans text-indigo-600">{format(currentDate, 'MMMM', { locale: ptBR })}</p>
                      <p className="text-2xl font-bold font-sans tracking-widest text-gray-400">{format(currentDate, 'yyyy')}</p>
                   </div>
                </div>

                <div className="flex-1 grid grid-cols-7 border-l-2 border-t-2 border-black font-sans">
                   {['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'].map(day => (
                      <div key={day} className="py-3 text-center bg-gray-100 border-r-2 border-b-2 border-black text-[10px] font-black uppercase tracking-widest">
                        {day}
                      </div>
                   ))}

                   {calendarDays.map((day, idx) => {
                      const dayEvents = scheduledEvents.filter(e => e.date === format(day, 'yyyy-MM-dd'));
                      const dayBirthdays = getDayBirthdays(day);
                      const isMonth = isSameMonth(day, currentDate);
                      
                      return (
                        <div key={idx} className={`min-h-[4.2cm] p-3 border-r-2 border-b-2 border-black ${isMonth ? 'bg-white' : 'bg-gray-100/40'}`}>
                           <p className={`text-2xl font-black mb-2 ${isMonth ? 'text-black' : 'text-gray-200'}`}>{format(day, 'd')}</p>
                           <div className="space-y-2">
                              {dayBirthdays.map(m => (
                                <div key={m.id} className="text-[9px] font-black uppercase border-l-4 border-pink-500 p-1.5 bg-pink-50 text-pink-700">
                                   🍰 NIVER: {m.name}
                                </div>
                              ))}

                              {dayEvents.map(e => (
                                <div key={e.id} className="text-[10px] font-black leading-tight border-l-[6px] p-2 bg-gray-50 rounded-r-md shadow-sm" style={{ borderColor: e.color }}>
                                   <div className="flex items-center gap-1.5 mb-1">
                                      <div style={{ color: e.color === '#ffffff' ? '#000' : e.color }}>
                                         <RenderIcon name={e.icon} size={12} />
                                      </div>
                                      <p className="font-mono text-[9px] text-gray-400">{e.time}</p>
                                   </div>
                                   <p className="uppercase break-words">{e.title}</p>
                                </div>
                              ))}
                           </div>
                        </div>
                      )
                   })}
                </div>

                <div className="mt-10 flex justify-between items-end border-t-2 border-gray-100 pt-8">
                   <div className="max-w-md">
                      <p className="text-[10px] text-gray-400 uppercase font-black italic mb-2">Aviso aos Médiuns e Consulentes:</p>
                      <p className="text-xs text-gray-600 leading-relaxed">Este cronograma está sujeito a alterações conforme orientação da espiritualidade. Celebremos com alegria os aniversários de nossos irmãos de fé.</p>
                   </div>
                   <div className="grid grid-cols-4 gap-4">
                      {EVENT_COLORS.slice(0, 8).map(c => (
                        <div key={c.hex} className="flex items-center gap-2">
                           <div className="w-4 h-4 rounded-full border-2 border-black/5 shadow-sm" style={{ backgroundColor: c.hex }} />
                           <span className="text-[9px] font-black text-gray-400 uppercase tracking-tight">{c.name}</span>
                        </div>
                      ))}
                   </div>
                </div>
             </div>
          </div>
        </div>
      )}
    </div>
  );
};
