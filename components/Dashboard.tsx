
import React, { useState, useEffect } from 'react';
import { Member, SystemConfig, CalendarEvent, ReleaseNote, GlobalBroadcast, TerreiroEvent } from '../types';
import { format, differenceInYears } from 'date-fns';
import { ptBR } from 'date-fns/locale/pt-BR';
import { 
  UserCheck, 
  UserMinus, 
  UserX, 
  HandHelping,
  Calendar,
  Clock,
  Camera,
  Cake,
  Phone,
  Contact,
  X,
  Mail,
  MapPin,
  Trophy,
  Star,
  CalendarClock,
  Sparkles,
  Flame,
  Droplets,
  Zap,
  Moon,
  Sun,
  Anchor,
  Leaf,
  PartyPopper,
  Medal,
  Award,
  Gift,
  ChevronRight,
  Info,
  Map as MapIcon,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useData } from '../contexts/DataContext';

interface DashboardProps {
  members: Member[];
  config: SystemConfig;
  events: CalendarEvent[];
  roadmap?: ReleaseNote[];
  broadcasts?: GlobalBroadcast[];
}

const MEDALS = {
  diamond: { icon: '💎', label: 'Diamante', color: 'text-cyan-500', bg: 'bg-cyan-50' },
  gold: { icon: '🥇', label: 'Ouro', color: 'text-amber-500', bg: 'bg-amber-50' },
  silver: { icon: '🥈', label: 'Prata', color: 'text-slate-400', bg: 'bg-slate-50' },
  bronze: { icon: '🥉', label: 'Bronze', color: 'text-orange-600', bg: 'bg-orange-50' },
};

const EVENT_ICONS = [
  { name: 'sparkles', icon: Sparkles },
  { name: 'flame', icon: Flame },
  { name: 'droplets', icon: Droplets },
  { name: 'zap', icon: Zap },
  { name: 'moon', icon: Moon },
  { name: 'sun', icon: Sun },
  { name: 'star', icon: Star },
  { name: 'heart', icon: Star }, 
  { name: 'anchor', icon: Anchor },
  { name: 'leaf', icon: Leaf },
  { name: 'cake', icon: Cake },
  { name: 'gift', icon: Gift },
  { name: 'party', icon: PartyPopper },
  { name: 'trophy', icon: Trophy },
  { name: 'medal', icon: Medal },
  { name: 'award', icon: Award },
];

const RenderEventIcon = ({ name, size = 16, className = "" }: { name?: string, size?: number, className?: string }) => {
  const IconComp = EVENT_ICONS.find(i => i.name === name)?.icon || Sparkles;
  return <IconComp size={size} className={className} />;
};

export const Dashboard: React.FC<DashboardProps> = ({ members, config, events, terreiroEvents, roadmap = [], broadcasts = [] }) => {
  const [selectedMember, setSelectedMember] = useState<Member | null>(null);
  const { user } = useAuth();
  const { userPreferences, updateUserPreferences } = useData();
  
  const dismissedRoadmapIds = userPreferences.dismissedRoadmapIds || [];
  const dismissedBroadcastIds = userPreferences.dismissedBroadcastIds || [];

  const currentYear = new Date().getFullYear();
  const today = new Date();
  const todayStr = format(today, 'yyyy-MM-dd');

  // Calcular aniversariantes do mês

  const handleDismissRoadmap = (id: string) => {
    updateUserPreferences({ dismissedRoadmapIds: [...dismissedRoadmapIds, id] });
  };

  const handleDismissBroadcast = (id: string) => {
    updateUserPreferences({ dismissedBroadcastIds: [...dismissedBroadcastIds, id] });
  };

  const fontSizes = {
    small: { title: 'text-lg', value: 'text-2xl', label: 'text-[9px]', body: 'text-xs' },
    medium: { title: 'text-xl', value: 'text-3xl', label: 'text-[10px]', body: 'text-sm' },
    large: { title: 'text-2xl', value: 'text-4xl', label: 'text-xs', body: 'text-base' }
  };

  const fs = fontSizes[config.dashboardFontSize];

  const calculateAge = (birthDate: string) => {
    if (!birthDate) return 0;
    try {
      const bDate = new Date(birthDate);
      if (isNaN(bDate.getTime())) return 0;
      return differenceInYears(new Date(), bDate);
    } catch {
      return 0;
    }
  };

  const getMedal = (member: Member, year: number) => {
    if (!member.monthlyPayments) return null;
    const yearPrefix = `${year}-`;
    const paidMonths = Object.keys(member.monthlyPayments).filter(
      key => key.startsWith(yearPrefix) && member.monthlyPayments![key] === 'paid'
    ).length;

    if (paidMonths >= 12) return MEDALS.diamond;
    if (paidMonths >= 10) return MEDALS.gold;
    if (paidMonths >= 8) return MEDALS.silver;
    if (paidMonths >= 6) return MEDALS.bronze;
    return null;
  };

  const stats = {
    ativos: members.filter(m => m.status === 'ativo').length,
    inativos: members.filter(m => m.status === 'inativo').length,
    desligados: members.filter(m => m.status === 'desligado').length,
    consulente: members.filter(m => m.status === 'consulente').length,
  };

  const total = members.length || 1;
  const percentages = {
    ativos: (stats.ativos / total) * 100,
    consulente: (stats.consulente / total) * 100,
    inativos: (stats.inativos / total) * 100,
    desligados: (stats.desligados / total) * 100,
  };

  const birthdaysThisMonth = members.filter(m => {
    if (!m.birthDate) return false;
    try {
      const bDate = new Date(m.birthDate);
      if (isNaN(bDate.getTime())) return false;
      return bDate.getMonth() === today.getMonth();
    } catch {
      return false;
    }
  });

  const recentMembers = [...members]
    .sort((a, b) => {
      const dateA = new Date(a.createdAt).getTime();
      const dateB = new Date(b.createdAt).getTime();
      return (isNaN(dateB) ? 0 : dateB) - (isNaN(dateA) ? 0 : dateA);
    })
    .slice(0, 5);

  const todayEvents = [
    ...events.filter(e => e.date === todayStr),
    ...terreiroEvents
      .filter(e => e.date.split('T')[0] === todayStr && e.status !== 'cancelado')
      .map(e => ({
        id: e.id,
        title: e.title,
        time: e.time,
        color: config.primaryColor || '#4f46e5',
        icon: e.type === 'gira' ? 'sparkles' : e.type === 'festa' ? 'party' : 'calendar',
        date: e.date.split('T')[0],
        description: e.description
      } as CalendarEvent))
  ];

  const ranking = members
    .filter(m => m.isMedium || m.isCambone)
    .map(m => ({
      member: m,
      medal: getMedal(m, currentYear),
      paidCount: Object.keys(m.monthlyPayments || {}).filter(k => k.startsWith(`${currentYear}-`) && m.monthlyPayments![k] === 'paid').length
    }))
    .filter(item => item.paidCount >= 6)
    .sort((a, b) => b.paidCount - a.paidCount)
    .slice(0, 5);

  const statCards = [
    { label: 'Ativos', value: stats.ativos, color: 'text-white', bg: 'bg-green-600', icon: UserCheck },
    { label: 'Inativos', value: stats.inativos, color: 'text-white', bg: 'bg-yellow-500', icon: UserMinus },
    { label: 'Desligados', value: stats.desligados, color: 'text-white', bg: 'bg-red-600', icon: UserX },
    { label: 'Consulentes', value: stats.consulente, color: 'text-white', bg: 'bg-blue-600', icon: HandHelping },
  ];

  const visibleRoadmap = roadmap
    .filter(item => !dismissedRoadmapIds.includes(item.id))
    .slice(0, 2);

  const visibleBroadcasts = broadcasts
    .filter(b => b.active && !dismissedBroadcastIds.includes(b.id));

  return (
    <div className={`space-y-8 animate-in fade-in duration-500 ${fs.body}`}>
      
      {/* SEÇÃO DE AVISOS GLOBAIS (BROADCASTS) - COM BOTÃO DE FECHAR */}
      {visibleBroadcasts.length > 0 && (
        <div className="space-y-3 animate-in slide-in-from-top-4 duration-500">
           {visibleBroadcasts.map(b => (
             <div key={b.id} className={`p-5 rounded-3xl flex items-center gap-5 shadow-lg border-l-[12px] relative overflow-hidden group/alert ${
               b.type === 'warning' ? 'bg-amber-50 border-amber-500 text-amber-900' :
               b.type === 'success' ? 'bg-emerald-50 border-emerald-500 text-emerald-900' :
               'bg-indigo-50 border-indigo-500 text-indigo-900'
             }`}>
                <div className={`p-3 rounded-2xl shrink-0 ${
                    b.type === 'warning' ? 'bg-amber-500 text-white' :
                    b.type === 'success' ? 'bg-emerald-500 text-white' :
                    'bg-indigo-600 text-white'
                }`}>
                   {b.type === 'warning' ? <AlertCircle size={24} /> : <Zap size={24} fill="currentColor" />}
                </div>
                
                <div className="flex-1 min-w-0 pr-10">
                  <p className="text-[10px] font-black uppercase opacity-40 tracking-widest mb-0.5">Aviso do Desenvolvedor • {format(new Date(b.createdAt), 'dd/MM HH:mm')}</p>
                  <p className="text-sm font-black uppercase tracking-tight leading-tight">{b.message}</p>
                  <button 
                    onClick={() => handleDismissBroadcast(b.id)}
                    className="mt-2 flex items-center gap-1.5 text-[9px] font-black uppercase hover:underline opacity-60 hover:opacity-100"
                  >
                     <CheckCircle2 size={12} /> Entendido, ocultar aviso
                  </button>
                </div>

                <button 
                  onClick={() => handleDismissBroadcast(b.id)}
                  className="absolute top-4 right-4 p-2 bg-black/5 hover:bg-black/10 rounded-xl transition-all text-current opacity-40 group-hover/alert:opacity-100"
                  title="Fechar"
                >
                   <X size={18} />
                </button>
             </div>
           ))}
        </div>
      )}

      {/* SEÇÃO DE ROADMAP (NOVIDADES DO DEVS) */}
      {visibleRoadmap.length > 0 && (
        <div className="bg-indigo-900 p-8 rounded-[2.5rem] text-white shadow-2xl relative overflow-hidden group">
           <div className="absolute top-0 right-0 p-10 opacity-10 group-hover:opacity-20 transition-opacity transform group-hover:scale-110 duration-700">
              <Zap size={180} fill="white" />
           </div>
           <div className="relative z-10 space-y-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                   <div className="p-2 bg-white/20 rounded-xl"><Info size={18} /></div>
                   <h3 className="text-sm font-black uppercase tracking-widest">O que há de novo no sistema</h3>
                </div>
                <p className="text-[10px] font-black uppercase opacity-60">Fique por dentro das atualizações</p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                 {visibleRoadmap.map(item => (
                   <div key={item.id} className="bg-white/10 backdrop-blur-md p-5 rounded-3xl border border-white/10 hover:bg-white/15 transition-all group/item">
                      <div className="flex justify-between items-start mb-2">
                         <span className="text-[10px] font-black bg-indigo-500 px-2 py-0.5 rounded uppercase">{item.version}</span>
                         <button 
                          onClick={() => handleDismissRoadmap(item.id)}
                          className="p-1 hover:bg-white/20 rounded-lg transition-colors text-white/40 hover:text-white"
                          title="Ocultar esta nota"
                         >
                            <X size={14} />
                         </button>
                      </div>
                      <h4 className="font-black text-sm uppercase mb-1">{item.title}</h4>
                      <p className="text-[11px] opacity-80 line-clamp-2 mb-4">{item.content}</p>
                      <button 
                        onClick={() => handleDismissRoadmap(item.id)}
                        className="flex items-center gap-1.5 text-[9px] font-black uppercase text-[#ADFF2F] hover:underline"
                      >
                         <CheckCircle2 size={12} /> Marcar como lido
                      </button>
                   </div>
                 ))}
              </div>
           </div>
        </div>
      )}

      {/* 1. SEÇÃO DE ESTATÍSTICAS E DISTRIBUIÇÃO */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col items-center justify-center">
          <h3 className={`${fs.label} font-black text-gray-400 uppercase tracking-widest mb-6`}>Distribuição de Membros</h3>
          <div className="relative w-48 h-48">
            <svg viewBox="0 0 36 36" className="w-full h-full transform -rotate-90">
              <circle cx="18" cy="18" r="16" fill="none" className="stroke-gray-100" strokeWidth="3" />
              <circle cx="18" cy="18" r="16" fill="none" stroke="#16a34a" strokeWidth="3" 
                strokeDasharray={`${percentages.ativos} 100`} strokeDashoffset="0" />
              <circle cx="18" cy="18" r="16" fill="none" stroke="#2563eb" strokeWidth="3" 
                strokeDasharray={`${percentages.consulente} 100`} strokeDashoffset={`-${percentages.ativos}`} />
              <circle cx="18" cy="18" r="16" fill="none" stroke="#eab308" strokeWidth="3" 
                strokeDasharray={`${percentages.inativos} 100`} strokeDashoffset={`-${percentages.ativos + percentages.consulente}`} />
              <circle cx="18" cy="18" r="16" fill="none" stroke="#dc2626" strokeWidth="3" 
                strokeDasharray={`${percentages.desligados} 100`} strokeDashoffset={`-${percentages.ativos + percentages.consulente + percentages.inativos}`} />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className={`${fs.value} font-black text-gray-800`}>{members.length}</span>
              <span className={`${fs.label} text-gray-400 font-black uppercase`}>Total</span>
            </div>
          </div>
          <div className={`grid grid-cols-2 gap-x-6 gap-y-2 mt-6 w-full ${fs.label} font-black uppercase`}>
            <div className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-green-600" /> Ativos</div>
            <div className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-blue-600" /> Consulentes</div>
            <div className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-yellow-500" /> Inativos</div>
            <div className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-red-600" /> Desligados</div>
          </div>
        </div>

        <div className="lg:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-4">
          {statCards.map((stat, idx) => (
            <div key={idx} className={`p-6 rounded-2xl border-none ${stat.bg} ${stat.color} flex items-center gap-6 transition-all hover:scale-[1.02] shadow-lg`}>
              <div className="p-4 rounded-2xl bg-white/20 backdrop-blur-sm">
                <stat.icon size={28} />
              </div>
              <div>
                <p className={`${fs.label} font-black text-white/70 uppercase tracking-widest`}>{stat.label}</p>
                <p className={`${fs.value} font-black`}>{stat.value}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="p-5 border-b border-gray-100 bg-gray-50 flex items-center justify-between">
            <div className="flex items-center gap-2 text-indigo-600" style={{ color: config.primaryColor }}>
              <CalendarClock size={18} />
              <h3 className={`${fs.body} font-black uppercase tracking-widest`}>Atividades de Hoje</h3>
            </div>
            <span className={`${fs.label} font-black px-2 py-1 rounded-full bg-indigo-50 text-indigo-600`}>
              {format(today, 'dd/MM')}
            </span>
          </div>
          <div className="overflow-y-auto max-h-[320px]">
            {todayEvents.length > 0 ? (
              <div className="divide-y divide-gray-50">
                {todayEvents.map((event) => (
                  <div key={event.id} className="p-4 flex items-center gap-4 hover:bg-gray-50 transition-colors">
                    <div 
                      className="w-10 h-10 rounded-xl flex items-center justify-center shadow-sm shrink-0"
                      style={{ backgroundColor: event.color, color: event.color === '#ffffff' ? '#1f2937' : '#ffffff' }}
                    >
                      <RenderEventIcon name={event.icon} size={20} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-bold text-gray-800 text-sm truncate uppercase">{event.title}</p>
                      <div className="flex items-center gap-1.5 mt-0.5">
                        <Clock size={12} className="text-gray-400" />
                        <span className="text-[10px] font-black text-gray-400 uppercase">{event.time || '--:--'}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="py-12 flex flex-col items-center justify-center text-center text-gray-400 px-8">
                <CalendarClock size={32} className="opacity-10 mb-2" />
                <p className="text-[10px] font-black uppercase tracking-widest italic">Nenhuma atividade agendada para hoje.</p>
              </div>
            )}
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="p-5 border-b border-gray-100 bg-gray-50 flex items-center justify-between">
            <div className="flex items-center gap-2 text-indigo-600" style={{ color: config.primaryColor }}>
              <Calendar size={18} />
              <h3 className={`${fs.body} font-black uppercase tracking-widest`}>Aniversariantes do Mês</h3>
            </div>
            <span className={`${fs.label} font-black px-2 py-1 rounded-full`} style={{ backgroundColor: `${config.primaryColor}20`, color: config.primaryColor }}>
              {birthdaysThisMonth.length} Membros
            </span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <tbody className="divide-y divide-gray-50">
                {birthdaysThisMonth.length > 0 ? (
                  birthdaysThisMonth.map((m, idx) => (
                    <tr key={m.id} className={`${idx % 2 === 0 ? 'bg-white' : 'bg-gray-50/50'} hover:bg-indigo-50/30 transition-colors`}>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <Cake size={16} className="text-pink-500" />
                          <div>
                            <span className="font-bold text-gray-700">{m.name}</span>
                            <span className={`${fs.label} ml-2 text-gray-400 font-black uppercase`}>({calculateAge(m.birthDate)} anos)</span>
                          </div>
                        </div>
                      </td>
                      <td className={`px-6 py-4 text-right text-gray-500 font-bold ${fs.label}`}>
                        {m.birthDate && !isNaN(new Date(m.birthDate).getTime()) ? format(new Date(m.birthDate), "dd 'de' MMMM", { locale: ptBR }) : 'Data inválida'}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td className={`px-6 py-12 text-center text-gray-400 italic ${fs.body}`}>
                      Nenhum aniversariante encontrado para este mês.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="p-5 border-b border-gray-100 bg-gray-50 flex items-center gap-2 text-indigo-600" style={{ color: config.primaryColor }}>
            <Clock size={18} />
            <h3 className={`${fs.body} font-black uppercase tracking-widest`}>Últimos Cadastros</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <tbody className="divide-y divide-gray-50">
                {recentMembers.length > 0 ? (
                  recentMembers.map((m, idx) => (
                    <tr 
                      key={m.id} 
                      onClick={() => setSelectedMember(m)}
                      className={`${idx % 2 === 0 ? 'bg-white' : 'bg-gray-50/50'} hover:bg-gray-50 cursor-pointer transition-all active:scale-[0.99]`}
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-lg bg-gray-100 border border-gray-200 overflow-hidden flex items-center justify-center flex-shrink-0">
                            {m.photo ? (
                              <img src={m.photo} alt={m.name} className="w-full h-full object-cover" />
                            ) : (
                              <Camera size={12} className="text-gray-400" />
                            )}
                          </div>
                          <span className="font-bold text-gray-700 truncate">{m.name}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <span className={`px-2 py-0.5 rounded-full ${fs.label} font-black uppercase ${
                          m.status === 'ativo' ? 'bg-green-100 text-green-700' :
                          m.status === 'consulente' ? 'bg-blue-100 text-blue-700' :
                          'bg-gray-200 text-gray-600'
                        }`}>
                          {m.status}
                        </span>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td className={`px-6 py-12 text-center text-gray-400 italic ${fs.body}`}>
                      Nenhum registro.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="p-5 border-b border-gray-100 bg-gray-50 flex items-center justify-between">
            <div className="flex items-center gap-2 text-indigo-600" style={{ color: config.primaryColor }}>
              <Trophy size={18} />
              <h3 className={`${fs.body} font-black uppercase tracking-widest`}>Ranking de Colaboradores ({currentYear})</h3>
            </div>
            <Star size={18} className="text-yellow-400 fill-yellow-400" />
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-gray-50/50 text-gray-400 uppercase tracking-widest">
                <tr>
                  <th className={`px-6 py-3 font-black ${fs.label}`}>Membro</th>
                  <th className={`px-6 py-3 font-black text-center ${fs.label}`}>Meses Pagos</th>
                  <th className={`px-6 py-3 font-black text-right ${fs.label}`}>Medalha</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {ranking.length > 0 ? (
                  ranking.map((item, idx) => (
                    <tr key={item.member.id} className={`${idx % 2 === 0 ? 'bg-white' : 'bg-gray-50/30'} hover:bg-indigo-50/30 transition-colors`}>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <span className="font-bold text-gray-400 font-mono w-4">{idx + 1}º</span>
                          <div className="w-8 h-8 rounded-full bg-gray-100 border border-gray-200 overflow-hidden flex items-center justify-center flex-shrink-0">
                            {item.member.photo ? (
                              <img src={item.member.photo} alt={item.member.name} className="w-full h-full object-cover" />
                            ) : (
                              <Camera size={12} className="text-gray-400" />
                            )}
                          </div>
                          <span className="font-bold text-gray-700 truncate max-w-[150px]">{item.member.name}</span>
                        </div>
                      </td>
                      <td className={`px-6 py-4 text-center font-black ${fs.body} text-indigo-600`}>
                        {item.paidCount}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full ${item.medal.bg} ${item.medal.color} border border-current/10`}>
                          <span className="text-sm">{item.medal.icon}</span>
                          <span className={`${fs.label} font-black uppercase tracking-wider`}>{item.medal.label}</span>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={3} className={`px-6 py-12 text-center text-gray-400 italic ${fs.body}`}>
                      Nenhum colaborador elegível para o ranking ainda.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {selectedMember && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-[60] p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-sm overflow-hidden animate-in zoom-in duration-300">
            <div className="relative h-32 bg-indigo-600" style={{ backgroundColor: config.primaryColor }}>
              <button 
                onClick={() => setSelectedMember(null)}
                className="absolute top-4 right-4 p-2 bg-black/20 hover:bg-black/40 text-white rounded-full transition-colors z-10"
              >
                <X size={20} />
              </button>
              <div className="absolute -bottom-12 left-1/2 -translate-x-1/2">
                <div className="w-24 h-24 rounded-full border-4 border-white bg-gray-100 shadow-lg overflow-hidden flex items-center justify-center">
                  {selectedMember.photo ? <img src={selectedMember.photo} alt={selectedMember.name} className="w-full h-full object-cover" /> : <Camera size={24} className="text-gray-300" />}
                </div>
              </div>
            </div>
            
            <div className={`pt-16 pb-8 px-8 text-center max-h-[70vh] overflow-y-auto ${fs.body}`}>
              <h4 className={`${fs.title} font-black text-gray-800 mb-1`}>{selectedMember.name}</h4>
              <p className={`${fs.label} font-black uppercase tracking-widest mb-6`} style={{ color: config.primaryColor }}>
                {selectedMember.status}
              </p>
              
              <div className="space-y-3 text-left">
                {[
                  { icon: Phone, label: 'Telefone Principal', value: selectedMember.phone, color: 'text-green-600' },
                  { icon: Contact, label: 'Emergência', value: selectedMember.emergencyPhone, color: 'text-pink-600' },
                  { icon: Mail, label: 'E-mail', value: selectedMember.email, color: 'text-blue-600' },
                  { icon: MapPin, label: 'Endereço', value: `${selectedMember.address}${selectedMember.bairro ? `, ${selectedMember.bairro}` : ''}`, color: 'text-orange-600' }
                ].map((item, i) => (
                  <div key={i} className="flex items-center gap-4 p-3 bg-gray-50 rounded-2xl">
                    <div className={`p-2 bg-white rounded-xl shadow-sm ${item.color}`}>
                      <item.icon size={18} />
                    </div>
                    <div className="overflow-hidden">
                      <p className={`${fs.label} text-gray-400 font-black uppercase`}>{item.label}</p>
                      <p className="font-bold text-gray-700 truncate">{item.value || 'Não informado'}</p>
                    </div>
                  </div>
                ))}
              </div>

              <button 
                onClick={() => setSelectedMember(null)}
                className="w-full mt-8 py-4 text-white font-black rounded-2xl shadow-lg transition-all active:scale-[0.98]"
                style={{ backgroundColor: config.primaryColor }}
              >
                Fechar Detalhes
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
