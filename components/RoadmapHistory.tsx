
import React, { useState, useEffect } from 'react';
import { ReleaseNote, GlobalBroadcast } from '../types';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale/pt-BR';
import { Sparkles, Calendar, CheckCircle2, Zap, Bell, Info, AlertTriangle, CheckCircle, X } from 'lucide-react';

interface NotificationsCenterProps {
  roadmap: ReleaseNote[];
  broadcasts: GlobalBroadcast[];
  clientId: string;
}

export const RoadmapHistory: React.FC<NotificationsCenterProps> = ({ roadmap, broadcasts, clientId }) => {
  const [activeSubTab, setActiveSubTab] = useState<'news' | 'announcements'>('news');
  
  const [dismissedRoadmapIds, setDismissedRoadmapIds] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem(`dismissed_roadmap_${clientId}`);
      return saved ? JSON.parse(saved) : [];
    } catch (error) {
      console.error('Error loading dismissed roadmap:', error);
      return [];
    }
  });

  const [dismissedBroadcastIds, setDismissedBroadcastIds] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem(`dismissed_broadcasts_${clientId}`);
      return saved ? JSON.parse(saved) : [];
    } catch (error) {
      console.error('Error loading dismissed broadcasts:', error);
      return [];
    }
  });

  useEffect(() => {
    localStorage.setItem(`dismissed_roadmap_${clientId}`, JSON.stringify(dismissedRoadmapIds));
  }, [dismissedRoadmapIds, clientId]);

  useEffect(() => {
    localStorage.setItem(`dismissed_broadcasts_${clientId}`, JSON.stringify(dismissedBroadcastIds));
  }, [dismissedBroadcastIds, clientId]);

  const handleDismissRoadmap = (id: string) => {
    if (!dismissedRoadmapIds.includes(id)) setDismissedRoadmapIds(prev => [...prev, id]);
  };

  const handleDismissBroadcast = (id: string) => {
    if (!dismissedBroadcastIds.includes(id)) setDismissedBroadcastIds(prev => [...prev, id]);
  };

  const sortedRoadmap = [...roadmap].sort((a, b) => b.date.localeCompare(a.date));
  const activeBroadcasts = broadcasts.filter(b => b.active);

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-20">
      <div className="bg-white p-10 rounded-[3rem] border border-gray-100 shadow-sm flex flex-col md:flex-row items-center gap-8 relative overflow-hidden">
        <div className="absolute top-0 right-0 p-12 opacity-5"><Bell size={140} className="text-indigo-600" /></div>
        <div className="w-20 h-20 bg-indigo-600 rounded-[2rem] flex items-center justify-center text-white shadow-xl shrink-0">
           <Bell size={32} />
        </div>
        <div className="flex-1 text-center md:text-left">
           <h3 className="text-3xl font-black text-gray-800 uppercase tracking-tighter">Central de Avisos e Novidades</h3>
           <p className="text-slate-500 font-medium">Mantenha-se informado sobre comunicados e melhorias técnicas do sistema.</p>
        </div>
      </div>

      <div className="flex justify-center">
         <div className="bg-white p-1 rounded-2xl border border-gray-100 shadow-sm flex">
            <button 
              onClick={() => setActiveSubTab('news')}
              className={`px-8 py-2.5 rounded-xl text-[10px] font-black uppercase transition-all flex items-center gap-2 ${activeSubTab === 'news' ? 'bg-indigo-600 text-white shadow-lg' : 'text-gray-400 hover:bg-gray-50'}`}
            >
               <Sparkles size={14} /> Novidades do Sistema
            </button>
            <button 
              onClick={() => setActiveSubTab('announcements')}
              className={`px-8 py-2.5 rounded-xl text-[10px] font-black uppercase transition-all flex items-center gap-2 relative ${activeSubTab === 'announcements' ? 'bg-indigo-600 text-white shadow-lg' : 'text-gray-400 hover:bg-gray-50'}`}
            >
               <Zap size={14} /> Comunicados Ativos
               {activeBroadcasts.filter(b => !dismissedBroadcastIds.includes(b.id)).length > 0 && (
                 <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white rounded-full flex items-center justify-center text-[7px] border-2 border-white">{activeBroadcasts.filter(b => !dismissedBroadcastIds.includes(b.id)).length}</span>
               )}
            </button>
         </div>
      </div>

      <div className="max-w-4xl mx-auto">
        {activeSubTab === 'news' ? (
           <div className="space-y-12 relative before:absolute before:left-8 before:top-4 before:bottom-4 before:w-1 before:bg-indigo-50 before:rounded-full">
           {sortedRoadmap.length > 0 ? sortedRoadmap.map((note) => {
             const isRead = dismissedRoadmapIds.includes(note.id);
             return (
               <div key={note.id} className={`relative pl-20 group ${isRead ? 'opacity-60 grayscale-[0.5]' : ''}`}>
                  <div className={`absolute left-[27px] top-4 w-3 h-3 bg-white border-2 rounded-full z-10 transition-all shadow-sm ${isRead ? 'border-gray-300 bg-gray-100' : 'border-indigo-400 group-hover:bg-indigo-600 group-hover:border-indigo-600'}`} />
                  
                  <div className={`bg-white p-8 rounded-[2.5rem] border shadow-sm hover:shadow-xl transition-all duration-500 relative ${isRead ? 'border-gray-100' : 'border-indigo-50 group-hover:border-indigo-200'}`}>
                     <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
                        <div className="space-y-1">
                           <div className="flex items-center gap-3">
                              <span className={`px-3 py-1 text-[10px] font-black rounded-lg uppercase tracking-widest ${isRead ? 'bg-gray-100 text-gray-500' : 'bg-indigo-50 text-indigo-600'}`}>{note.version}</span>
                              <h4 className="text-xl font-black text-gray-800 uppercase tracking-tight">{note.title}</h4>
                           </div>
                           <div className="flex items-center gap-2 text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                              <Calendar size={12} />
                              {format(new Date(note.date), "dd 'de' MMMM, yyyy", { locale: ptBR })}
                           </div>
                        </div>
                        <div className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-tighter ${
                          note.status === 'released'
                            ? 'bg-emerald-100 text-emerald-700'
                            : note.status === 'planned'
                            ? 'bg-amber-100 text-amber-700'
                            : note.status === 'fixed'
                            ? 'bg-sky-100 text-sky-700'
                            : note.status === 'updated'
                            ? 'bg-indigo-100 text-indigo-700'
                            : 'bg-purple-100 text-purple-700'
                        }`}>
                           {note.status === 'released'
                             ? 'Implementado'
                             : note.status === 'planned'
                             ? 'Planejado'
                             : note.status === 'fixed'
                             ? 'Corrigido'
                             : note.status === 'updated'
                             ? 'Atualizado'
                             : 'Melhoria'}
                        </div>
                     </div>
                     
                     <div className="prose prose-indigo max-w-none mb-6">
                        <p className="text-gray-600 leading-relaxed font-medium">{note.content}</p>
                     </div>

                     {!isRead && (
                       <button 
                        onClick={() => handleDismissRoadmap(note.id)}
                        className="flex items-center gap-1.5 text-[9px] font-black uppercase text-indigo-600 hover:underline"
                       >
                          <CheckCircle2 size={12} /> Marcar como lido
                       </button>
                     )}
                  </div>
               </div>
             )
           }) : (
             <div className="text-center py-20 bg-white rounded-[3rem] border-2 border-dashed border-gray-100">
                <Sparkles size={48} className="mx-auto text-gray-100 mb-4" />
                <p className="text-gray-400 font-bold uppercase text-xs tracking-widest">Aguardando novos lançamentos</p>
             </div>
           )}
         </div>
        ) : (
          <div className="space-y-4">
             {activeBroadcasts.length > 0 ? activeBroadcasts.map(b => {
               const isRead = dismissedBroadcastIds.includes(b.id);
               return (
                 <div key={b.id} className={`p-8 rounded-[2.5rem] border-2 flex items-center gap-6 shadow-lg animate-in slide-in-from-top-4 transition-all group/bcard ${
                   isRead ? 'bg-gray-50 border-gray-100 opacity-60 grayscale' :
                   b.type === 'warning' ? 'bg-amber-50 border-amber-500/20' :
                   b.type === 'success' ? 'bg-emerald-50 border-emerald-500/20' :
                   'bg-indigo-50 border-indigo-500/20'
                 }`}>
                    <div className={`p-4 rounded-2xl shrink-0 transition-transform group-hover/bcard:scale-110 ${
                      isRead ? 'bg-gray-200 text-gray-400' :
                      b.type === 'warning' ? 'bg-amber-500 text-white' :
                      b.type === 'success' ? 'bg-emerald-500 text-white' :
                      'bg-indigo-600 text-white'
                    }`}>
                       {b.type === 'warning' ? <AlertTriangle size={28} /> : b.type === 'success' ? <CheckCircle size={28} /> : <Info size={28} />}
                    </div>
                    <div className="flex-1 min-w-0">
                       <p className="text-[10px] font-black uppercase text-gray-400 tracking-[0.2em] mb-1">Comunicado Oficial • {format(new Date(b.createdAt), 'dd/MM HH:mm')}</p>
                       <p className={`text-xl font-black uppercase leading-tight mb-3 ${
                         isRead ? 'text-gray-400' :
                         b.type === 'warning' ? 'text-amber-900' :
                         b.type === 'success' ? 'text-emerald-900' :
                         'text-indigo-900'
                       }`}>{b.message}</p>
                       
                       {!isRead && (
                         <button 
                          onClick={() => handleDismissBroadcast(b.id)}
                          className={`flex items-center gap-1.5 text-[9px] font-black uppercase hover:underline ${
                            b.type === 'warning' ? 'text-amber-600' :
                            b.type === 'success' ? 'text-emerald-600' :
                            'text-indigo-600'
                          }`}
                         >
                            <CheckCircle2 size={12} /> Marcar como lido / Ocultar do Início
                         </button>
                       )}
                       {isRead && (
                         <span className="text-[8px] font-black uppercase text-gray-300 tracking-widest flex items-center gap-1.5">
                            <CheckCircle size={10} /> Este aviso foi lido e arquivado
                         </span>
                       )}
                    </div>
                    
                    {!isRead && (
                      <button 
                        onClick={() => handleDismissBroadcast(b.id)}
                        className="p-3 bg-white/50 hover:bg-white rounded-2xl text-gray-400 transition-all opacity-0 group-hover/bcard:opacity-100"
                        title="Fechar e Marcar como lido"
                      >
                         <X size={20} />
                      </button>
                    )}
                 </div>
               )
             }) : (
              <div className="text-center py-20 bg-white rounded-[3rem] border-2 border-dashed border-gray-100">
                <Zap size={48} className="mx-auto text-gray-100 mb-4" />
                <p className="text-gray-400 font-bold uppercase text-xs tracking-widest">Sem comunicados ativos no momento</p>
              </div>
             )}
          </div>
        )}
      </div>
    </div>
  );
};
