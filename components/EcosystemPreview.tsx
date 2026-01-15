
import React, { useState } from 'react';
import { 
  Globe, 
  ShieldCheck, 
  Layout, 
  Smartphone, 
  Users, 
  TrendingUp, 
  CheckCircle2, 
  Calendar, 
  Zap, 
  CreditCard, 
  ArrowRight,
  Menu,
  Bell,
  Home,
  BookOpen,
  User,
  X,
  Star,
  Activity,
  ChevronRight,
  ArrowUpRight,
  // Fix: Added missing icons from lucide-react to resolve compilation errors
  AlertCircle,
  Clock,
  Sparkles,
  ArrowLeft
} from 'lucide-react';

export const EcosystemPreview: React.FC<{ onBack: () => void }> = ({ onBack }) => {
  const [activePreview, setActivePreview] = useState<'landing' | 'master' | 'admin' | 'mobile'>('landing');

  // Sub-componentes conceituais para cada ambiente
  const LandingPageView = () => (
    <div className="bg-white text-slate-900 min-h-full flex flex-col font-sans">
      <nav className="p-6 flex justify-between items-center border-b border-gray-100">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center text-white"><ShieldCheck size={20} /></div>
          <span className="font-black uppercase tracking-tighter">SaaS Terreiro</span>
        </div>
        <div className="hidden md:flex gap-8 text-xs font-bold uppercase text-gray-500">
          <span className="text-indigo-600">Funcionalidades</span>
          <span>Depoimentos</span>
          <span>Preços</span>
        </div>
        <button className="px-5 py-2 bg-indigo-600 text-white rounded-full text-[10px] font-black uppercase shadow-lg shadow-indigo-100">Testar Grátis</button>
      </nav>
      
      <main className="flex-1 p-10 flex flex-col items-center text-center justify-center space-y-8 animate-in fade-in slide-in-from-bottom-4">
        <div className="space-y-4 max-w-2xl">
          <h1 className="text-5xl font-black text-slate-800 leading-tight">A tecnologia sagrada para a sua casa de caridade.</h1>
          <p className="text-lg text-slate-500 font-medium leading-relaxed">O sistema de gestão mais completo para Terreiros de Umbanda e Candomblé. Membros, Financeiro, EAD e Estoque em um só lugar.</p>
        </div>
        
        <div className="flex gap-4">
          <button className="px-8 py-4 bg-indigo-600 text-white rounded-2xl font-black text-sm uppercase shadow-xl hover:scale-105 transition-all flex items-center gap-2">
            Começar Agora <ArrowRight size={18} />
          </button>
          <button className="px-8 py-4 bg-white border border-gray-200 text-gray-600 rounded-2xl font-black text-sm uppercase">Ver Demonstração</button>
        </div>

        <div className="grid grid-cols-3 gap-6 w-full max-w-4xl mt-12">
          {[
            { icon: Users, label: 'Gestão de Corrente', color: 'bg-indigo-50 text-indigo-600' },
            { icon: CreditCard, label: 'Arrecadação Automática', color: 'bg-emerald-50 text-emerald-600' },
            { icon: BookOpen, label: 'Plataforma EAD', color: 'bg-purple-50 text-purple-600' }
          ].map((feat, i) => (
            <div key={i} className="p-6 bg-white border border-gray-100 rounded-3xl shadow-sm text-left space-y-3">
              <div className={`p-3 w-fit rounded-xl ${feat.color}`}><feat.icon size={24} /></div>
              <h4 className="font-black text-slate-800 text-sm">{feat.label}</h4>
            </div>
          ))}
        </div>
      </main>
    </div>
  );

  const MasterPanelView = () => (
    <div className="bg-slate-950 text-slate-200 min-h-full flex flex-col font-mono">
      <header className="p-6 border-b border-slate-800 flex justify-between items-center">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-indigo-500 rounded-lg flex items-center justify-center text-white animate-pulse"><Zap size={18} fill="white" /></div>
          <div>
            <h2 className="text-sm font-black text-white uppercase tracking-widest">Master Console v1.0</h2>
            <p className="text-[8px] text-indigo-400 font-bold uppercase">Status: Live & Synchronized</p>
          </div>
        </div>
        <div className="flex gap-4">
          <div className="px-3 py-1 bg-slate-900 border border-slate-800 rounded-md text-[10px] font-bold"><span className="text-emerald-500 mr-2">●</span> Servidores OK</div>
        </div>
      </header>
      
      <div className="p-8 grid grid-cols-1 md:grid-cols-3 gap-6 flex-1 overflow-y-auto">
        <div className="bg-slate-900 p-6 rounded-2xl border border-slate-800 shadow-xl space-y-4">
           <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Receita Global (MRR)</p>
           <h3 className="text-3xl font-black text-emerald-400 tracking-tighter">R$ 14.580,00</h3>
           <div className="h-12 w-full bg-slate-800 rounded-lg overflow-hidden flex items-end">
              {[40, 70, 45, 90, 65, 80, 100].map((h, i) => <div key={i} className="flex-1 bg-emerald-500/30 border-t border-emerald-500" style={{ height: `${h}%` }} />)}
           </div>
        </div>

        <div className="bg-slate-900 p-6 rounded-2xl border border-slate-800 shadow-xl space-y-4">
           <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Instâncias Ativas</p>
           <div className="flex items-center justify-between">
              <h3 className="text-4xl font-black text-white">42</h3>
              <Globe className="text-indigo-500" size={32} />
           </div>
           <p className="text-[9px] text-slate-600 font-bold uppercase">+3 nas últimas 24h</p>
        </div>

        <div className="bg-slate-900 p-6 rounded-2xl border border-slate-800 shadow-xl flex flex-col justify-between">
           <div className="flex items-center justify-between">
              <p className="text-[10px] font-black text-slate-500 uppercase">Alertas</p>
              <div className="w-2 h-2 rounded-full bg-red-500 animate-ping" />
           </div>
           <div className="space-y-2">
              <p className="text-[10px] font-bold text-red-400">#TK-882: Erro em produção (Terreiro AXÉ)</p>
              <p className="text-[10px] font-bold text-slate-400">#TK-881: Dúvida sobre plano anual</p>
           </div>
        </div>

        <div className="md:col-span-3 bg-slate-900 rounded-3xl border border-slate-800 overflow-hidden">
           <div className="p-4 bg-slate-950/50 border-b border-slate-800 flex justify-between items-center">
              <span className="text-[10px] font-black uppercase text-indigo-400">Logs de Transações Recentes</span>
              <Activity size={14} className="text-slate-700" />
           </div>
           <div className="p-6 space-y-4">
              {[
                { client: 'Terreiro Estrela Guia', value: 'R$ 49,90', type: 'Assinatura Mensal' },
                { client: 'Ilê Axé Opô Afonjá', value: 'R$ 450,00', type: 'Plano Anual' },
                { client: 'Centro de Umbanda Pai Tomé', value: 'R$ 49,90', type: 'Assinatura Mensal' }
              ].map((log, i) => (
                <div key={i} className="flex items-center justify-between text-xs border-b border-slate-800 pb-3 last:border-0 last:pb-0">
                  <div className="flex items-center gap-3">
                     <div className="w-2 h-2 rounded-full bg-emerald-500" />
                     <span className="font-bold text-white uppercase">{log.client}</span>
                  </div>
                  <span className="text-slate-500">{log.type}</span>
                  <span className="font-black text-emerald-400">{log.value}</span>
                </div>
              ))}
           </div>
        </div>
      </div>
    </div>
  );

  const AdminPanelView = () => (
    <div className="bg-gray-50 text-slate-800 min-h-full flex flex-col font-sans">
      <div className="flex-1 flex overflow-hidden">
        <aside className="w-48 bg-indigo-900 text-white p-6 space-y-6 hidden md:block">
           <div className="flex items-center gap-2 mb-10">
              <div className="w-8 h-8 bg-white/20 rounded flex items-center justify-center"><Layout size={16} /></div>
              <span className="text-[10px] font-black uppercase">Admin Panel</span>
           </div>
           <div className="space-y-4">
              {['Dashboard', 'Membros', 'Financeiro', 'Estoque', 'Cursos'].map((item, i) => (
                <div key={i} className={`flex items-center gap-3 text-[10px] font-black uppercase ${i === 0 ? 'text-white' : 'text-indigo-300 opacity-60'}`}>
                  <div className="w-1.5 h-1.5 rounded-full bg-current" />
                  {item}
                </div>
              ))}
           </div>
        </aside>
        
        <main className="flex-1 p-8 overflow-y-auto space-y-8">
           <header className="flex justify-between items-center">
              <h2 className="text-xl font-black uppercase tracking-tight">Resumo de Hoje</h2>
              <div className="flex items-center gap-3">
                 <button className="p-2 bg-white rounded-lg shadow-sm border border-gray-100"><Bell size={18} /></button>
                 <div className="w-10 h-10 bg-indigo-600 rounded-full flex items-center justify-center text-white font-black">A</div>
              </div>
           </header>

           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {[
                { label: 'Corrente Ativa', val: '124', icon: Users, color: 'text-indigo-600' },
                { label: 'Saldo Caixa', val: 'R$ 2.450', icon: TrendingUp, color: 'text-emerald-600' },
                { label: 'Estoque Baixo', val: '12 itens', icon: AlertCircle, color: 'text-rose-500' },
                { label: 'Próxima Gira', val: '20:00', icon: Calendar, color: 'text-amber-500' }
              ].map((st, i) => (
                <div key={i} className="p-5 bg-white rounded-3xl shadow-sm border border-gray-100 flex items-center justify-between">
                   <div>
                      <p className="text-[8px] font-black text-gray-400 uppercase tracking-widest">{st.label}</p>
                      <p className="text-lg font-black text-slate-800">{st.val}</p>
                   </div>
                   <st.icon className={st.color} size={24} />
                </div>
              ))}
           </div>

           <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
              <div className="p-5 bg-gray-50 border-b border-gray-100 flex justify-between items-center">
                 <h4 className="text-[10px] font-black uppercase text-gray-500 tracking-widest">Últimas Mensalidades Recebidas</h4>
                 <button className="text-[9px] font-black text-indigo-600 uppercase">Ver Todas</button>
              </div>
              <div className="p-6 space-y-4">
                 {[1, 2, 3].map(i => (
                   <div key={i} className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0">
                      <div className="flex items-center gap-3">
                         <div className="w-8 h-8 bg-indigo-50 rounded-full flex items-center justify-center text-indigo-600"><User size={14} /></div>
                         <span className="text-xs font-bold uppercase">Membro Exemplo #{i}</span>
                      </div>
                      <span className="text-[9px] font-black bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full uppercase">PAGO</span>
                   </div>
                 ))}
              </div>
           </div>
        </main>
      </div>
    </div>
  );

  const MobileAppView = () => (
    <div className="bg-indigo-900 min-h-full flex items-center justify-center p-6 font-sans">
      <div className="w-full max-w-[280px] aspect-[9/19] bg-white rounded-[2.5rem] shadow-2xl border-[6px] border-indigo-950 overflow-hidden relative flex flex-col">
        {/* Notch / Speaker */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-20 h-6 bg-indigo-950 rounded-b-2xl z-20 flex items-center justify-center">
           <div className="w-8 h-1 bg-white/20 rounded-full" />
        </div>

        <header className="pt-10 pb-6 px-6 bg-indigo-600 text-white">
           <div className="flex justify-between items-center mb-4">
              <p className="text-[10px] font-medium opacity-70">Olá, Rodrigo!</p>
              <div className="w-8 h-8 bg-white/20 rounded-xl flex items-center justify-center"><Bell size={16} /></div>
           </div>
           <h3 className="text-lg font-black uppercase tracking-tight">Minha Corrente</h3>
        </header>

        <main className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50" style={{ scrollbarWidth: 'none' }}>
           <div className="p-5 bg-indigo-600 rounded-3xl text-white shadow-lg space-y-4 relative overflow-hidden">
              <div className="relative z-10">
                 <p className="text-[9px] font-black uppercase opacity-70">Gira de Hoje</p>
                 <h4 className="text-sm font-black uppercase">Pretos Velhos</h4>
                 <div className="flex items-center gap-2 mt-2">
                    <Clock size={12} />
                    <span className="text-[10px] font-bold uppercase">Início às 20:00</span>
                 </div>
              </div>
              <button className="w-full py-2.5 bg-white text-indigo-600 rounded-2xl font-black text-[10px] uppercase shadow-inner">Confirmar Presença</button>
              <Sparkles className="absolute -right-2 -bottom-2 opacity-20" size={80} />
           </div>

           <div className="space-y-2">
              <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest ml-1">Meus Cursos</p>
              <div className="p-4 bg-white rounded-2xl border border-gray-100 flex items-center gap-4 shadow-sm">
                 <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center text-purple-600"><BookOpen size={20} /></div>
                 <div className="flex-1 overflow-hidden">
                    <p className="font-black text-[11px] uppercase truncate">Fundamentos da Umbanda</p>
                    <div className="w-full h-1 bg-gray-100 rounded-full mt-1"><div className="w-3/4 h-full bg-indigo-500 rounded-full" /></div>
                 </div>
              </div>
           </div>

           <div className="p-4 bg-emerald-50 border border-emerald-100 rounded-2xl flex items-center justify-between">
              <div className="flex items-center gap-3">
                 <div className="p-2 bg-emerald-500 text-white rounded-lg"><Star size={14} fill="currentColor" /></div>
                 <p className="text-[10px] font-black text-emerald-800 uppercase leading-tight">Você é Membro<br/>Diamante</p>
              </div>
              <ChevronRight size={14} className="text-emerald-300" />
           </div>
        </main>

        <nav className="h-16 bg-white border-t border-gray-100 px-6 flex justify-between items-center">
           <Home size={20} className="text-indigo-600" />
           <Calendar size={20} className="text-gray-300" />
           <div className="w-10 h-10 bg-indigo-600 rounded-2xl flex items-center justify-center text-white -mt-10 shadow-xl border-4 border-white shadow-indigo-100"><Users size={20} /></div>
           <BookOpen size={20} className="text-gray-300" />
           <User size={20} className="text-gray-300" />
        </nav>
      </div>
    </div>
  );

  return (
    <div className="fixed inset-0 bg-slate-950 z-[1000] flex flex-col animate-in fade-in duration-500 overflow-hidden">
      <header className="p-6 bg-slate-900 border-b border-slate-800 flex flex-col md:flex-row justify-between items-center gap-6">
        <div className="flex items-center gap-4">
          <button onClick={onBack} className="p-2 text-slate-400 hover:text-white"><ArrowLeft size={24} /></button>
          <div>
            <h1 className="text-2xl font-black text-white uppercase tracking-tighter">Ecosystem Concept</h1>
            <p className="text-xs text-indigo-400 font-bold uppercase tracking-[0.2em]">Arquitetura de Conexão SaaS</p>
          </div>
        </div>
        
        <div className="flex bg-slate-950 p-1 rounded-2xl border border-slate-800">
           {[
             { id: 'landing', label: 'Landing Page', icon: Globe },
             { id: 'master', label: 'Painel Master', icon: Zap },
             { id: 'admin', label: 'Painel Cliente', icon: Layout },
             { id: 'mobile', label: 'App Médium', icon: Smartphone }
           ].map(tab => (
             <button 
              key={tab.id}
              onClick={() => setActivePreview(tab.id as any)}
              className={`px-6 py-2.5 rounded-xl text-[10px] font-black uppercase transition-all flex items-center gap-2 ${activePreview === tab.id ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-500 hover:text-slate-300'}`}
             >
                <tab.icon size={14} />
                <span className="hidden sm:inline">{tab.label}</span>
             </button>
           ))}
        </div>

        <button onClick={onBack} className="p-3 bg-white/5 text-slate-400 hover:text-white rounded-xl"><X size={20} /></button>
      </header>

      <div className="flex-1 relative overflow-hidden bg-slate-900/50">
        <div className="absolute inset-0 flex items-center justify-center p-4 md:p-12">
           <div className="w-full h-full max-w-6xl bg-white rounded-[3rem] shadow-2xl overflow-hidden border border-white/10 ring-8 ring-slate-900/50">
              {activePreview === 'landing' && <LandingPageView />}
              {activePreview === 'master' && <MasterPanelView />}
              {activePreview === 'admin' && <AdminPanelView />}
              {activePreview === 'mobile' && <MobileAppView />}
           </div>
        </div>

        {/* Labels explicativos flutuantes */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex gap-4 no-print">
           <div className="px-6 py-3 bg-white/10 backdrop-blur-md border border-white/10 rounded-2xl text-[10px] font-black text-white uppercase flex items-center gap-3">
              <CheckCircle2 size={16} className="text-emerald-500" />
              Banco de Dados Único (Firebase Realtime)
           </div>
           <div className="px-6 py-3 bg-white/10 backdrop-blur-md border border-white/10 rounded-2xl text-[10px] font-black text-white uppercase flex items-center gap-3">
              <CheckCircle2 size={16} className="text-indigo-400" />
              Sincronização em Tempo Real entre Painéis
           </div>
        </div>
      </div>
    </div>
  );
};
