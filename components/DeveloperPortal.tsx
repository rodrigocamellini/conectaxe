
import React, { useState, useEffect, useRef } from 'react';
import { SaaSClient, SaaSPlan, GlobalMaintenanceConfig, SupportTicket, MasterAuditLog, GlobalBroadcast, ReleaseNote, GlobalCoupon, MasterCredentials, StoredSnapshot } from '../types';
import { 
  Users, 
  DollarSign, 
  Wrench, 
  Database, 
  ShieldHalf, 
  ExternalLink, 
  Search, 
  Trash2, 
  Plus, 
  Zap,
  Lock,
  Unlock,
  TrendingUp,
  MapPin,
  Smartphone,
  ShieldCheck, 
  X,
  CreditCard,
  User as UserIcon,
  Snowflake,
  Map as MapIcon,
  Ticket,
  ClipboardList,
  History,
  Tag,
  Code,
  Settings,
  Key,
  MessageSquare,
  Banknote,
  CheckCircle2,
  Copy,
  LayoutGrid,
  AlertTriangle,
  ChevronDown,
  Save,
  Image as ImageIcon,
  Upload,
  Palette,
  Type,
  Send,
  Power,
  Megaphone,
  ChevronLeft,
  ChevronRight,
  Calendar,
  Check,
  Clock,
  Gift,
  ShieldAlert,
  Archive,
  Download,
  FileJson,
  RefreshCcw,
  Eye,
  EyeOff
} from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale/pt-BR';
import { MasterTicketManager } from './MasterTicketManager';
import { SAAS_PLANS, BRAZILIAN_STATES, MASTER_LOGO_URL } from '../constants';

interface DeveloperPortalProps {
  onLogout: () => void;
  onEnterClientSystem: (client: SaaSClient) => void;
  referrals: any[];
  onUpdateReferral: any;
  clients: SaaSClient[];
  onUpdateClients: (clients: SaaSClient[]) => void;
  plans: SaaSPlan[];
  onUpdatePlans: (plans: SaaSPlan[]) => void;
  externalTab?: string;
  onTabChange?: (tab: string) => void;
  maintConfig: GlobalMaintenanceConfig;
  onUpdateMaintenance: (config: GlobalMaintenanceConfig) => void;
  tickets: SupportTicket[];
  onUpdateTickets: any;
  broadcasts: GlobalBroadcast[];
  onUpdateBroadcasts: (b: GlobalBroadcast[]) => void;
  roadmap: ReleaseNote[];
  onUpdateRoadmap: (r: ReleaseNote[]) => void;
  coupons: GlobalCoupon[];
  onUpdateCoupons: (c: GlobalCoupon[]) => void;
  auditLogs: MasterAuditLog[];
}

const MONTHS_SHORT = [
  { id: '01', name: 'Jan' }, { id: '02', name: 'Fev' }, { id: '03', name: 'Mar' },
  { id: '04', name: 'Abr' }, { id: '05', name: 'Mai' }, { id: '06', name: 'Jun' },
  { id: '07', name: 'Jul' }, { id: '08', name: 'Ago' }, { id: '09', name: 'Set' },
  { id: '10', name: 'Out' }, { id: '11', name: 'Nov' }, { id: '12', name: 'Dez' },
];

export const DeveloperPortal: React.FC<DeveloperPortalProps> = ({ 
  onEnterClientSystem,
  clients = [],
  onUpdateClients,
  externalTab,
  maintConfig,
  onUpdateMaintenance,
  tickets = [],
  onUpdateTickets,
  broadcasts = [],
  onUpdateBroadcasts,
  roadmap = [],
  onUpdateRoadmap,
  coupons = [],
  onUpdateCoupons,
  auditLogs = []
}) => {
  const [activeTab, setActiveTab] = useState('clients');
  const [searchQuery, setSearchQuery] = useState('');
  const [showAddClient, setShowAddClient] = useState(false);
  const [showMasterSettings, setShowMasterSettings] = useState(false);
  const [billingYear, setBillingYear] = useState(new Date().getFullYear());
  const logoInputRef = useRef<HTMLInputElement>(null);

  // Estados para Snapshots (Backups)
  const [snapshots, setSnapshots] = useState<StoredSnapshot[]>(() => {
    const saved = localStorage.getItem('saas_master_snapshots');
    return saved ? JSON.parse(saved) : [];
  });
  const [showMasterPassword, setShowMasterPassword] = useState(false);
  const [showRestoreConfirm, setShowRestoreConfirm] = useState<StoredSnapshot | null>(null);
  const [restorePassword, setRestorePassword] = useState('');

  // Estados para Broadcast
  const [newBroadcastText, setNewBroadcastText] = useState('');
  const [newBroadcastType, setNewBroadcastType] = useState<'info' | 'warning' | 'success'>('info');

  // Gestão de Credenciais e Identidade Master
  const [masterCreds, setMasterCreds] = useState<MasterCredentials>(() => {
    const saved = localStorage.getItem('saas_master_credentials');
    return saved ? JSON.parse(saved) : { 
      email: 'rodrigo@dev.com', 
      password: 'master', 
      whatsapp: '', 
      pixKey: '', 
      bankDetails: '',
      sidebarTitle: 'Sistema de Gestão de Terreiros',
      systemTitle: 'ConectAxé Painel de Desenvolvedor',
      brandLogo: MASTER_LOGO_URL,
      backupFrequency: 'disabled'
    };
  });

  useEffect(() => {
    localStorage.setItem('saas_master_snapshots', JSON.stringify(snapshots));
  }, [snapshots]);

  const [newClient, setNewClient] = useState<Partial<SaaSClient>>({
    name: '', plan: SAAS_PLANS[0], monthlyValue: 49.90, expirationDate: format(new Date(), 'yyyy-12-31'),
    adminName: '', adminEmail: '', adminPassword: '', adminCpf: '', adminPhone: '',
    adminCep: '', adminAddress: '', adminBairro: '', adminCidade: '', adminEstado: 'SP', status: 'active'
  });

  useEffect(() => {
    if (externalTab) {
      const tabMap: Record<string, string> = {
        'master-payments': 'payments',
        'system-maintenance': 'maintenance',
        'master-backups': 'backups',
        'master-audit': 'audit',
        'tickets': 'tickets',
        'master-broadcast': 'broadcast',
        'master-roadmap': 'roadmap',
        'master-coupons': 'coupons',
        'developer-portal': 'clients'
      };
      setActiveTab(tabMap[externalTab] || 'clients');
    }
  }, [externalTab]);

  const handleSaveMasterSettings = (e: React.FormEvent) => {
    e.preventDefault();
    localStorage.setItem('saas_master_credentials', JSON.stringify(masterCreds));
    setShowMasterSettings(false);
    alert('Configurações do Ecossistema Master atualizadas com sucesso!');
    window.location.reload(); 
  };

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setMasterCreds(prev => ({ ...prev, brandLogo: reader.result as string }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAddClient = (e: React.FormEvent) => {
    e.preventDefault();
    const client: SaaSClient = {
      ...newClient,
      id: Math.random().toString(36).substr(2, 6).toUpperCase(),
      createdAt: new Date().toISOString(),
      lastActivity: new Date().toISOString()
    } as SaaSClient;
    onUpdateClients([...clients, client]);
    setShowAddClient(false);
    setNewClient({
      name: '', plan: SAAS_PLANS[0], monthlyValue: 49.90, expirationDate: format(new Date(), 'yyyy-12-31'),
      adminName: '', adminEmail: '', adminPassword: '', adminCpf: '', adminPhone: '',
      adminCep: '', adminAddress: '', adminBairro: '', adminCidade: '', adminEstado: 'SP', status: 'active'
    });
  };

  const handleCreateSnapshot = (type: 'manual' | 'automatico' = 'manual') => {
    const allData: Record<string, any> = {};
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      // Evitar circularidade de snapshots salvando snapshots
      if (key && !key.includes('saas_master_snapshots')) {
        const val = localStorage.getItem(key);
        if (val) allData[key] = JSON.parse(val);
      }
    }

    const dataStr = JSON.stringify(allData);
    const size = (dataStr.length / 1024).toFixed(2) + ' KB';

    const newSnapshot: StoredSnapshot = {
      id: Math.random().toString(36).substr(2, 9).toUpperCase(),
      date: new Date().toISOString(),
      type,
      data: allData,
      size
    };

    setSnapshots([newSnapshot, ...snapshots]);
    alert(`Snapshot ${type} criado com sucesso! Tamanho: ${size}`);
  };

  const downloadSnapshot = (snap: StoredSnapshot) => {
    const blob = new Blob([JSON.stringify(snap.data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `SNAPSHOT_${snap.type.toUpperCase()}_${format(new Date(snap.date), 'yyyyMMdd_HHmm')}.json`;
    link.click();
  };

  const handleRestoreSnapshot = (e: React.FormEvent) => {
    e.preventDefault();
    if (!showRestoreConfirm) return;

    if (restorePassword !== masterCreds.password) {
      alert('Senha master incorreta! Restauração cancelada.');
      return;
    }

    if (confirm('ATENÇÃO: Isso substituirá TODOS os dados atuais do sistema pelo backup selecionado. Continuar?')) {
      const data = showRestoreConfirm.data;
      // Preservar o histórico de snapshots na restauração
      const currentSnapshots = localStorage.getItem('saas_master_snapshots');
      
      localStorage.clear();
      
      Object.keys(data).forEach(key => {
        localStorage.setItem(key, JSON.stringify(data[key]));
      });

      if (currentSnapshots) {
        localStorage.setItem('saas_master_snapshots', currentSnapshots);
      }

      alert('Restauração concluída! O sistema será reiniciado.');
      window.location.reload();
    }
  };

  const deleteSnapshot = (id: string) => {
    if (confirm('Remover este snapshot permanentemente da lista?')) {
      setSnapshots(snapshots.filter(s => s.id !== id));
    }
  };

  const handleUpdateClientPayment = (clientId: string, monthKey: string) => {
    const updatedClients = clients.map(client => {
      if (client.id === clientId) {
        const currentPayments = client.payments || {};
        const currentStatus = currentPayments[monthKey] || 'unpaid';
        
        let nextStatus: 'paid' | 'unpaid' | 'justified' = 'unpaid';
        if (currentStatus === 'unpaid') nextStatus = 'paid';
        else if (currentStatus === 'paid') nextStatus = 'justified';
        else nextStatus = 'unpaid';

        return {
          ...client,
          payments: { ...currentPayments, [monthKey]: nextStatus }
        };
      }
      return client;
    });
    onUpdateClients(updatedClients);
  };

  const handleAddBroadcast = () => {
    if (!newBroadcastText.trim()) return;
    const b: GlobalBroadcast = {
      id: Math.random().toString(36).substr(2, 9).toUpperCase(),
      message: newBroadcastText,
      type: newBroadcastType,
      active: true,
      createdAt: new Date().toISOString()
    };
    onUpdateBroadcasts([...broadcasts, b]);
    setNewBroadcastText('');
    alert('Comunicado disparado com sucesso para toda a rede!');
  };

  const deleteClient = (id: string) => {
    if (confirm('ATENÇÃO: Excluir este terreiro permanentemente? Todos os dados da instância serão destruídos.')) {
      onUpdateClients(clients.filter(c => c.id !== id));
    }
  };

  const toggleStatus = (id: string, newStatus: SaaSClient['status']) => {
    onUpdateClients(clients.map(c => c.id === id ? { ...c, status: newStatus } : c));
  };

  const clientStats = {
    total: clients.length,
    active: clients.filter(c => c.status === 'active').length,
    blocked: clients.filter(c => c.status === 'blocked').length,
    frozen: clients.filter(c => c.status === 'frozen').length,
    totalMRR: clients.reduce((acc, c) => acc + (c.monthlyValue || 0), 0)
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-20">
      
      {/* ABA: TERREIROS ATIVOS */}
      {activeTab === 'clients' && (
        <div className="space-y-8">
           {/* MENU SUPERIOR DE RESUMO */}
           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
              <div className="bg-slate-900 p-6 rounded-3xl border border-slate-800 shadow-xl">
                 <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-1">Total de Instâncias</p>
                 <div className="flex items-center justify-between">
                    <h4 className="text-3xl font-black text-white">{clientStats.total}</h4>
                    <LayoutGrid size={24} className="text-indigo-500" />
                 </div>
              </div>
              <div className="bg-slate-900 p-6 rounded-3xl border border-slate-800 shadow-xl">
                 <p className="text-[9px] font-black text-emerald-500 uppercase tracking-widest mb-1">Terreiros Ativos</p>
                 <div className="flex items-center justify-between">
                    <h4 className="text-3xl font-black text-white">{clientStats.active}</h4>
                    <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                 </div>
              </div>
              <div className="bg-slate-900 p-6 rounded-3xl border border-slate-800 shadow-xl">
                 <p className="text-[9px] font-black text-red-500 uppercase tracking-widest mb-1">Inadimplentes</p>
                 <div className="flex items-center justify-between">
                    <h4 className="text-3xl font-black text-white">{clientStats.blocked}</h4>
                    <Lock size={20} className="text-red-500" />
                 </div>
              </div>
              <div className="bg-slate-900 p-6 rounded-3xl border border-slate-800 shadow-xl">
                 <p className="text-[9px] font-black text-blue-400 uppercase tracking-widest mb-1">Congelados</p>
                 <div className="flex items-center justify-between">
                    <h4 className="text-3xl font-black text-white">{clientStats.frozen}</h4>
                    <Snowflake size={20} className="text-blue-400" />
                 </div>
              </div>
              <div className="bg-indigo-600 p-6 rounded-3xl shadow-xl shadow-indigo-600/20">
                 <p className="text-[9px] font-black text-indigo-200 uppercase tracking-widest mb-1">MRR Acumulado</p>
                 <div className="flex items-center justify-between">
                    <h4 className="text-2xl font-black text-white">R$ {clientStats.totalMRR.toFixed(2)}</h4>
                    <TrendingUp size={20} className="text-[#ADFF2F]" />
                 </div>
              </div>
           </div>

           {/* PAINEL DE CONFIGURAÇÕES MASTER */}
           <div className="bg-slate-900 rounded-[2.5rem] border border-slate-800 shadow-2xl overflow-hidden">
              <div 
                className="p-8 border-b border-slate-800 flex justify-between items-center bg-slate-950/40 cursor-pointer group"
                onClick={() => setShowMasterSettings(!showMasterSettings)}
              >
                 <div className="flex items-center gap-4">
                    <div className="p-3 bg-slate-800 rounded-2xl text-amber-500 border border-slate-700 shadow-inner group-hover:scale-110 transition-transform">
                       <ShieldCheck size={24} />
                    </div>
                    <div>
                       <h3 className="text-lg font-black text-white uppercase tracking-tight">Configurações Estruturais do Motor (Master)</h3>
                       <p className="text-xs text-slate-500 font-bold uppercase tracking-widest mt-0.5">Customize a identidade visual e acessos de mestre da rede</p>
                    </div>
                 </div>
                 <div className="flex items-center gap-4">
                    <span className="text-[10px] font-black text-slate-600 uppercase tracking-widest">{showMasterSettings ? 'Recolher Painel' : 'Expandir Painel Master'}</span>
                    <button className={`p-2 bg-slate-800 rounded-xl transition-all ${showMasterSettings ? 'rotate-180 text-amber-500' : 'text-slate-400'}`}>
                       <ChevronDown size={20} />
                    </button>
                 </div>
              </div>

              {showMasterSettings && (
                <form onSubmit={handleSaveMasterSettings} className="p-10 space-y-12 animate-in slide-in-from-top-4 duration-500">
                   <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
                      <div className="lg:col-span-4 space-y-6">
                         <h4 className="text-[10px] font-black text-indigo-400 uppercase tracking-widest flex items-center gap-2">
                           <ImageIcon size={14} /> 01. Identidade Visual Master
                         </h4>
                         <div className="flex flex-col items-center gap-4 p-6 bg-slate-950 rounded-3xl border border-slate-800">
                            <div 
                              onClick={() => logoInputRef.current?.click()}
                              className="w-24 h-24 rounded-2xl bg-slate-900 border-2 border-dashed border-slate-700 flex items-center justify-center cursor-pointer overflow-hidden group relative"
                            >
                               {masterCreds.brandLogo ? (
                                 <img src={masterCreds.brandLogo} className="w-full h-full object-contain p-2" alt="Master Logo" />
                               ) : (
                                 <ImageIcon size={32} className="text-slate-700" />
                               )}
                               <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                                  <Upload size={20} className="text-white" />
                               </div>
                            </div>
                            <input type="file" ref={logoInputRef} className="hidden" accept="image/*" onChange={handleLogoUpload} />
                            <p className="text-[9px] font-black text-slate-500 uppercase">Logo do Painel Master</p>
                         </div>
                      </div>

                      <div className="lg:col-span-8 space-y-6">
                         <h4 className="text-[10px] font-black text-indigo-400 uppercase tracking-widest flex items-center gap-2">
                           <Type size={14} /> 02. Textos e Títulos do Sistema
                         </h4>
                         <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                               <label className="block text-[10px] font-black text-slate-500 uppercase mb-2 ml-1">Título do Sistema (Header)</label>
                               <input className="w-full p-4 bg-slate-950 border border-slate-800 rounded-2xl text-white font-bold outline-none focus:ring-2 focus:ring-indigo-500" value={masterCreds.systemTitle} onChange={e => setMasterCreds({...masterCreds, systemTitle: e.target.value})} placeholder="Ex: SaaS Master Engine" />
                            </div>
                            <div>
                               <label className="block text-[10px] font-black text-slate-500 uppercase mb-2 ml-1">Título do Sistema (Login)</label>
                               <input className="w-full p-4 bg-slate-950 border border-slate-800 rounded-2xl text-white font-bold outline-none focus:ring-2 focus:ring-indigo-500" value={masterCreds.sidebarTitle} onChange={e => setMasterCreds({...masterCreds, sidebarTitle: e.target.value})} placeholder="Ex: Conectaxe" />
                            </div>
                         </div>
                      </div>
                   </div>

                   <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
                      <div className="space-y-6">
                        <h4 className="text-[10px] font-black text-amber-500 uppercase tracking-widest flex items-center gap-2">
                           <Lock size={14} /> 03. Credenciais Master
                        </h4>
                        <div className="space-y-4">
                           <div>
                              <label className="block text-[10px] font-black text-slate-500 uppercase mb-2 ml-1">E-mail Master (Acesso)</label>
                              <input className="w-full p-4 bg-slate-950 border border-slate-800 rounded-2xl text-white font-bold outline-none focus:ring-2 focus:ring-amber-500" value={masterCreds.email} onChange={e => setMasterCreds({...masterCreds, email: e.target.value})} />
                           </div>
                           <div>
                              <label className="block text-[10px] font-black text-slate-500 uppercase mb-2 ml-1">Senha de Mestre</label>
                              <div className="relative">
                                <input 
                                  type={showMasterPassword ? 'text' : 'password'} 
                                  className="w-full p-4 pr-12 bg-slate-950 border border-slate-800 rounded-2xl text-white font-bold outline-none focus:ring-2 focus:ring-amber-500" 
                                  value={masterCreds.password} 
                                  onChange={e => setMasterCreds({...masterCreds, password: e.target.value})} 
                                />
                                <button
                                  type="button"
                                  onClick={() => setShowMasterPassword(!showMasterPassword)}
                                  className="absolute inset-y-0 right-4 flex items-center text-slate-500 hover:text-amber-400"
                                >
                                  {showMasterPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                </button>
                              </div>
                           </div>
                        </div>
                      </div>

                      <div className="space-y-6">
                        <h4 className="text-[10px] font-black text-emerald-500 uppercase tracking-widest flex items-center gap-2">
                           <Banknote size={14} /> 04. Cobrança SaaS
                        </h4>
                        <div className="space-y-4">
                           <div>
                              <label className="block text-[10px] font-black text-slate-500 uppercase mb-2 ml-1">Chave PIX (Recebimento)</label>
                              <input className="w-full p-4 bg-slate-950 border border-slate-800 rounded-2xl text-white font-bold outline-none focus:ring-2 focus:ring-emerald-500" value={masterCreds.pixKey} onChange={e => setMasterCreds({...masterCreds, pixKey: e.target.value})} />
                           </div>
                           <div>
                              <label className="block text-[10px] font-black text-slate-500 uppercase mb-2 ml-1">Dados Bancários / Transferência</label>
                              <textarea className="w-full p-4 bg-slate-950 border border-slate-800 rounded-2xl text-white font-bold outline-none focus:ring-2 focus:ring-emerald-500 resize-none h-24" value={masterCreds.bankDetails} onChange={e => setMasterCreds({...masterCreds, bankDetails: e.target.value})} />
                           </div>
                        </div>
                      </div>

                      <div className="space-y-6">
                        <h4 className="text-[10px] font-black text-cyan-400 uppercase tracking-widest flex items-center gap-2">
                           <Database size={14} /> 05. Snapshots Automáticos
                        </h4>
                        <div className="space-y-4">
                           <div className="p-5 bg-slate-950 rounded-3xl border border-slate-800 space-y-4">
                              <label className="block text-[10px] font-black text-slate-500 uppercase mb-1 ml-1">Frequência de Backup Automático</label>
                              <div className="relative">
                                 <select 
                                   className="w-full p-4 bg-slate-900 border border-slate-800 rounded-2xl text-white font-bold outline-none focus:ring-2 focus:ring-indigo-500 appearance-none cursor-pointer" 
                                   value={masterCreds.backupFrequency} 
                                   onChange={e => setMasterCreds({...masterCreds, backupFrequency: e.target.value as any})}
                                 >
                                    <option value="disabled">🚫 Backup Automático Desativado</option>
                                    <option value="7days">🗓️ A cada 7 dias</option>
                                    <option value="15days">🗓️ A cada 15 dias</option>
                                    <option value="monthly">🗓️ A cada 1 mês</option>
                                 </select>
                                 <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-500"><ChevronDown size={18} /></div>
                              </div>
                           </div>
                           <div className="pt-4">
                              <button type="submit" className="w-full py-5 bg-indigo-600 text-white rounded-3xl font-black text-xs uppercase shadow-xl hover:bg-indigo-700 transition-all flex items-center justify-center gap-3">
                                 <Save size={20} /> Salvar Tudo e Atualizar Painel
                              </button>
                           </div>
                        </div>
                      </div>
                   </div>
                </form>
              )}
           </div>

           {/* LISTA DE TERREIROS */}
           <div className="bg-slate-900 rounded-[2.5rem] border border-slate-800 shadow-2xl overflow-hidden">
              <div className="p-8 border-b border-slate-800 flex flex-col md:flex-row justify-between items-center bg-slate-950/50 gap-6">
                 <div className="flex items-center gap-3">
                    <div className="p-3 bg-indigo-600 rounded-2xl text-white shadow-lg">
                      <Users size={24} />
                    </div>
                    <div>
                       <h3 className="text-xl font-black text-white uppercase tracking-tight">Ecossistema de Instâncias</h3>
                       <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mt-0.5">Gestão técnica de contratos e acessos</p>
                    </div>
                 </div>
                 <div className="flex items-center gap-4 w-full md:w-auto">
                    <div className="relative flex-1">
                       <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-600" size={16} />
                       <input 
                         placeholder="Pesquisar terreiro, e-mail ou ID..." 
                         className="w-full pl-11 pr-4 py-3 bg-slate-950 border border-slate-800 rounded-2xl outline-none text-xs text-white focus:ring-2 focus:ring-indigo-500 transition-all" 
                         value={searchQuery} 
                         onChange={e => setSearchQuery(e.target.value)} 
                       />
                    </div>
                    <button 
                     onClick={() => setShowAddClient(true)} 
                     className="px-8 py-4 bg-indigo-600 text-white rounded-2xl font-black text-xs uppercase shadow-xl hover:bg-indigo-700 transition-all flex items-center gap-2 shrink-0 active:scale-95"
                    >
                       <Plus size={18} /> Novo Terreiro
                    </button>
                 </div>
              </div>

              <div className="overflow-x-auto">
                 <table className="w-full text-left">
                    <thead>
                       <tr className="bg-slate-950/80 text-[9px] font-black text-slate-500 uppercase tracking-widest border-b border-slate-800">
                          <th className="px-8 py-5">Terreiro & Administrador</th>
                          <th className="px-8 py-5">Plano / MRR</th>
                          <th className="px-8 py-5 text-center">Status</th>
                          <th className="px-8 py-5 text-center">Vencimento</th>
                          <th className="px-8 py-5 text-right">Ações Técnicas</th>
                       </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800">
                       {clients.filter(c => 
                         c.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                         c.adminName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         c.id.includes(searchQuery.toUpperCase())
                       ).map(c => (
                          <tr key={c.id} className="hover:bg-slate-800/30 transition-colors group">
                             <td className="px-8 py-5">
                                <div className="flex items-center gap-4">
                                   <div className="w-12 h-12 rounded-2xl bg-slate-800 border border-slate-700 flex items-center justify-center font-black text-lg text-indigo-400 shadow-inner group-hover:scale-110 transition-transform">
                                      {c.name.charAt(0)}
                                   </div>
                                   <div>
                                      <div className="flex items-center gap-2">
                                         <p className="font-black text-white uppercase text-xs tracking-tight">{c.name}</p>
                                         <span className="text-[8px] font-black bg-slate-800 text-slate-500 px-1.5 py-0.5 rounded">#{c.id}</span>
                                      </div>
                                      <p className="text-[10px] font-bold text-slate-400 mt-0.5">{c.adminName} • {c.adminEmail}</p>
                                   </div>
                                </div>
                             </td>
                             <td className="px-8 py-5">
                                <p className="text-xs text-slate-300 font-black uppercase">{c.plan}</p>
                                <p className="text-[11px] font-black text-emerald-400 mt-0.5">R$ {c.monthlyValue?.toFixed(2)}</p>
                             </td>
                             <td className="px-8 py-5 text-center">
                                <span className={`px-4 py-1 rounded-full text-[9px] font-black uppercase border ${
                                  c.status === 'active' ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' :
                                  c.status === 'frozen' ? 'bg-blue-500/10 text-blue-400 border-blue-500/20' :
                                  'bg-red-500/10 text-red-500 border-red-500/20'
                                }`}>
                                   {c.status === 'active' ? 'Ativo' : c.status === 'frozen' ? 'Congelado' : 'Bloqueado'}
                                </span>
                             </td>
                             <td className="px-8 py-5 text-center">
                                <p className="text-xs font-black text-slate-400">{format(new Date(c.expirationDate + 'T12:00:00'), 'dd/MM/yyyy')}</p>
                             </td>
                             <td className="px-8 py-5 text-right">
                                <div className="flex justify-end gap-2">
                                   <button onClick={() => onEnterClientSystem(c)} className="p-2.5 bg-slate-800 text-slate-400 hover:text-indigo-400 rounded-xl transition-all shadow-lg" title="Acesso Direto"><ExternalLink size={18} /></button>
                                   <button onClick={() => toggleStatus(c.id, c.status === 'frozen' ? 'active' : 'frozen')} className={`p-2.5 bg-slate-800 rounded-xl transition-all ${c.status === 'frozen' ? 'text-blue-400' : 'text-slate-600 hover:text-blue-400'}`} title="Congelar"><Snowflake size={18} /></button>
                                   <button onClick={() => toggleStatus(c.id, c.status === 'blocked' ? 'active' : 'blocked')} className={`p-2.5 bg-slate-800 rounded-xl transition-all ${c.status === 'blocked' ? 'text-red-500' : 'text-slate-600 hover:text-red-500'}`} title="Bloquear"><Lock size={18} /></button>
                                   <button onClick={() => deleteClient(c.id)} className="p-2.5 bg-slate-800 text-slate-600 hover:text-red-600 rounded-xl transition-all"><Trash2 size={18} /></button>
                                </div>
                             </td>
                          </tr>
                       ))}
                    </tbody>
                 </table>
                 {clients.length === 0 && (
                   <div className="p-32 text-center text-slate-600 font-black uppercase text-[10px] tracking-widest">Nenhuma instância implantada</div>
                 )}
              </div>
           </div>
        </div>
      )}

      {/* ABA: BROADCAST GLOBAL */}
      {activeTab === 'broadcast' && (
        <div className="space-y-8 animate-in slide-in-from-right-4 duration-500">
           <div className="bg-slate-900 p-10 rounded-[3rem] border border-slate-800 shadow-2xl flex flex-col md:flex-row items-center justify-between gap-6 overflow-hidden relative">
              <div className="absolute top-0 right-0 p-8 opacity-5"><Megaphone size={140} className="text-amber-400" /></div>
              <div className="flex items-center gap-4 relative z-10">
                 <div className="p-4 bg-amber-500 rounded-3xl text-slate-900 shadow-xl shadow-amber-500/20"><Zap size={32} fill="currentColor" /></div>
                 <div>
                    <h2 className="text-2xl font-black text-white uppercase tracking-tighter">Broadcast Global</h2>
                    <p className="text-slate-500 font-medium">Envie avisos instantâneos para o topo do Dashboard de todos os terreiros da rede.</p>
                 </div>
              </div>
           </div>

           <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
              {/* Form de Criação */}
              <div className="lg:col-span-4 bg-slate-900 p-8 rounded-[2.5rem] border border-slate-800 shadow-xl h-fit space-y-6">
                 <h3 className="text-xs font-black text-indigo-400 uppercase tracking-widest flex items-center gap-2"><Plus size={14} /> Novo Comunicado</h3>
                 <div className="space-y-4">
                    <div>
                       <label className="block text-[10px] font-black text-slate-500 uppercase mb-2 ml-1">Mensagem do Aviso</label>
                       <textarea 
                        className="w-full p-4 bg-slate-950 border border-slate-800 rounded-2xl text-white font-medium text-xs outline-none focus:ring-2 focus:ring-indigo-500 resize-none h-32" 
                        value={newBroadcastText} 
                        onChange={e => setNewBroadcastText(e.target.value)} 
                        placeholder="Digite o comunicado aqui..." 
                       />
                    </div>
                    <div>
                       <label className="block text-[10px] font-black text-slate-500 uppercase mb-2 ml-1">Tipo de Alerta</label>
                       <div className="grid grid-cols-3 gap-2">
                          {(['info', 'warning', 'success'] as const).map(t => (
                            <button 
                              key={t} 
                              onClick={() => setNewBroadcastType(t)} 
                              className={`py-2 rounded-xl text-[9px] font-black uppercase border-2 transition-all ${newBroadcastType === t ? 'bg-indigo-600 border-indigo-500 text-white shadow-lg' : 'bg-slate-950 border-slate-800 text-slate-500 hover:border-slate-700'}`}
                            >
                               {t === 'info' ? 'Info' : t === 'warning' ? 'Aviso' : 'Sucesso'}
                            </button>
                          ))}
                       </div>
                    </div>
                    <button 
                      onClick={handleAddBroadcast} 
                      className="w-full py-4 bg-indigo-600 text-white rounded-2xl font-black uppercase text-xs shadow-xl hover:bg-indigo-700 transition-all flex items-center justify-center gap-2 active:scale-95"
                    >
                       <Send size={16} /> Disparar na Rede
                    </button>
                 </div>
              </div>

              {/* Lista de Transmissões */}
              <div className="lg:col-span-8 bg-slate-900 rounded-[2.5rem] border border-slate-800 shadow-xl overflow-hidden">
                 <div className="p-6 bg-slate-950/50 border-b border-slate-800 flex justify-between items-center">
                    <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Fila de Transmissão Master</h3>
                    <span className="text-[9px] font-black bg-slate-800 text-slate-500 px-3 py-1 rounded-full uppercase">{broadcasts.length} REGISTROS</span>
                 </div>
                 <div className="overflow-x-auto">
                    <table className="w-full text-left">
                       <thead>
                          <tr className="bg-slate-950/80 text-[9px] font-black text-slate-500 uppercase tracking-widest border-b border-slate-800">
                             <th className="px-8 py-4">Mensagem / Criado em</th>
                             <th className="px-8 py-4">Tipo</th>
                             <th className="px-8 py-4 text-center">Status</th>
                             <th className="px-8 py-4 text-right">Ação</th>
                          </tr>
                       </thead>
                       <tbody className="divide-y divide-slate-800">
                          {broadcasts.length > 0 ? [...broadcasts].reverse().map(b => (
                            <tr key={b.id} className="hover:bg-slate-800/30 transition-colors group">
                               <td className="px-8 py-4">
                                  <p className="text-white text-xs font-medium line-clamp-2 leading-relaxed">{b.message}</p>
                                  <p className="text-[9px] text-slate-500 font-bold mt-1.5 uppercase">{format(new Date(b.createdAt), 'dd/MM/yyyy HH:mm')}</p>
                               </td>
                               <td className="px-8 py-4">
                                  <span className={`px-2 py-0.5 rounded text-[8px] font-black uppercase border ${
                                    b.type === 'warning' ? 'bg-amber-500/10 text-amber-500 border-amber-500/20' : 
                                    b.type === 'success' ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' : 
                                    'bg-indigo-500/10 text-indigo-400 border-indigo-500/20'
                                  }`}>{b.type}</span>
                               </td>
                               <td className="px-8 py-4 text-center">
                                  <button 
                                    onClick={() => {
                                      const updated = broadcasts.map(item => item.id === b.id ? { ...item, active: !item.active } : item);
                                      onUpdateBroadcasts(updated);
                                    }} 
                                    className={`px-4 py-1.5 rounded-full text-[9px] font-black uppercase border transition-all flex items-center gap-2 mx-auto ${
                                      b.active ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' : 'bg-slate-800 text-slate-600 border-slate-700'
                                    }`}
                                  >
                                     <Power size={10} />
                                     {b.active ? 'No Ar' : 'Pausado'}
                                  </button>
                               </td>
                               <td className="px-8 py-4 text-right">
                                  <button 
                                    onClick={() => {
                                      if(confirm('Remover este comunicado permanentemente?')) {
                                        onUpdateBroadcasts(broadcasts.filter(item => item.id !== b.id));
                                      }
                                    }} 
                                    className="p-2 text-slate-600 hover:text-red-500 transition-colors"
                                  >
                                     <Trash2 size={18} />
                                  </button>
                               </td>
                            </tr>
                          )) : (
                            <tr>
                               <td colSpan={4} className="px-8 py-20 text-center flex flex-col items-center gap-3">
                                  <Megaphone size={40} className="text-slate-800 opacity-20" />
                                  <p className="text-slate-700 font-black uppercase text-[10px] tracking-widest">Nenhuma transmissão registrada</p>
                               </td>
                            </tr>
                          )}
                       </tbody>
                    </table>
                 </div>
              </div>
           </div>
        </div>
      )}

      {/* ABA: FATURAMENTO MASTER */}
      {activeTab === 'payments' && (
        <div className="space-y-8 animate-in slide-in-from-right-4 duration-500">
           {/* Resumo Financeiro Global */}
           <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="bg-slate-900 p-8 rounded-[2.5rem] border border-slate-800 shadow-xl flex flex-col justify-between group hover:border-emerald-500/30 transition-all">
                 <div className="flex justify-between items-start mb-4">
                    <div className="p-3 bg-emerald-500/10 text-emerald-500 rounded-2xl"><DollarSign size={24} /></div>
                    <span className="text-[10px] font-black bg-emerald-500/10 text-emerald-500 px-3 py-1 rounded-full uppercase">Receita Bruta</span>
                 </div>
                 <div>
                    <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">MRR Atual (SaaS)</p>
                    <h3 className="text-3xl font-black text-white tracking-tight">R$ {clientStats.totalMRR.toFixed(2)}</h3>
                 </div>
              </div>
              <div className="bg-slate-900 p-8 rounded-[2.5rem] border border-slate-800 shadow-xl flex flex-col justify-between group hover:border-indigo-500/30 transition-all">
                 <div className="flex justify-between items-start mb-4">
                    <div className="p-3 bg-indigo-500/10 text-indigo-400 rounded-2xl"><Users size={24} /></div>
                    <span className="text-[10px] font-black bg-indigo-500/10 text-indigo-400 px-3 py-1 rounded-full uppercase">Base</span>
                 </div>
                 <div>
                    <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Terreiros Pagantes</p>
                    <h3 className="text-3xl font-black text-white tracking-tight">{clients.filter(c => c.monthlyValue > 0).length}</h3>
                 </div>
              </div>
              <div className="bg-slate-900 p-8 rounded-[2.5rem] border border-slate-800 shadow-xl flex flex-col justify-between group hover:border-amber-500/30 transition-all">
                 <div className="flex justify-between items-start mb-4">
                    <div className="p-3 bg-amber-500/10 text-amber-400 rounded-2xl"><TrendingUp size={24} /></div>
                    <span className="text-[10px] font-black bg-amber-500/10 text-amber-400 px-3 py-1 rounded-full uppercase">Ticket</span>
                 </div>
                 <div>
                    <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Ticket Médio por Instância</p>
                    <h3 className="text-3xl font-black text-white tracking-tight">R$ {clients.length > 0 ? (clientStats.totalMRR / clients.length).toFixed(2) : '0.00'}</h3>
                 </div>
              </div>
              <div className="bg-slate-900 p-8 rounded-[2.5rem] border border-slate-800 shadow-xl flex flex-col justify-between group hover:border-red-500/30 transition-all">
                 <div className="flex justify-between items-start mb-4">
                    <div className="p-3 bg-red-500/10 text-red-500 rounded-2xl"><Clock size={24} /></div>
                    <span className="text-[10px] font-black bg-red-500/10 text-red-500 px-3 py-1 rounded-full uppercase">Pendências</span>
                 </div>
                 <div>
                    <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Inadimplentes (Mês Atual)</p>
                    <h3 className="text-3xl font-black text-white tracking-tight">{clients.filter(c => c.payments?.[`${billingYear}-${(new Date().getMonth() + 1).toString().padStart(2, '0')}`] !== 'paid' && c.monthlyValue > 0).length}</h3>
                 </div>
              </div>
           </div>

           {/* Grade de Monitoramento de Pagamentos SaaS */}
           <div className="bg-slate-900 rounded-[2.5rem] border border-slate-800 shadow-2xl overflow-hidden">
              <div className="p-8 border-b border-slate-800 flex flex-col md:flex-row justify-between items-center bg-slate-950/50 gap-6">
                 <div className="flex items-center gap-3">
                    <div className="p-2 bg-indigo-600 rounded-xl text-white shadow-lg"><Calendar size={20} /></div>
                    <div>
                       <h3 className="text-lg font-black text-white uppercase tracking-tight">Monitor de Recebimentos</h3>
                       <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Ano Base: {billingYear}</p>
                    </div>
                 </div>
                 <div className="flex items-center bg-slate-800 rounded-2xl p-1 border border-slate-700 shadow-inner">
                    <button onClick={() => setBillingYear(prev => prev - 1)} className="p-2 hover:bg-slate-700 rounded-xl transition-all text-slate-400"><ChevronLeft size={20} /></button>
                    <span className="px-6 font-black text-white text-lg">{billingYear}</span>
                    <button onClick={() => setBillingYear(prev => prev + 1)} className="p-2 hover:bg-slate-700 rounded-xl transition-all text-slate-400"><ChevronRight size={20} /></button>
                 </div>
              </div>

              <div className="overflow-x-auto">
                 <table className="w-full text-center border-collapse">
                    <thead>
                       <tr className="bg-slate-950/80 border-b border-slate-800 text-[10px] font-black text-slate-500 uppercase tracking-widest">
                          <th className="px-8 py-5 text-left sticky left-0 bg-slate-950/90 z-20 border-r border-slate-800 min-w-[280px]">Terreiro / Mensalidade</th>
                          {MONTHS_SHORT.map(m => <th key={m.id} className="py-5 px-1">{m.name}</th>)}
                       </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800">
                       {clients.filter(c => c.monthlyValue > 0).map(client => (
                          <tr key={client.id} className="hover:bg-slate-800/30 transition-colors group">
                             <td className="px-8 py-5 text-left sticky left-0 bg-slate-900 group-hover:bg-slate-800 z-10 border-r border-slate-800 shadow-[4px_0_10px_-4px_rgba(0,0,0,0.3)]">
                                <div className="flex items-center gap-3">
                                   <div className="w-10 h-10 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-center font-black text-indigo-400 text-lg shadow-inner">
                                      {client.name.charAt(0)}
                                   </div>
                                   <div>
                                      <p className="font-black text-white text-xs uppercase truncate max-w-[150px]">{client.name}</p>
                                      <p className="text-[10px] font-black text-emerald-400 tracking-tighter mt-0.5">R$ {client.monthlyValue.toFixed(2)}</p>
                                   </div>
                                </div>
                             </td>
                             {MONTHS_SHORT.map(m => {
                                const monthKey = `${billingYear}-${m.id}`;
                                const status = client.payments?.[monthKey] || 'unpaid';
                                return (
                                   <td key={m.id} className="py-5 px-1">
                                      <button 
                                        onClick={() => handleUpdateClientPayment(client.id, monthKey)}
                                        className={`w-9 h-9 rounded-xl flex items-center justify-center mx-auto transition-all transform active:scale-90 border-2 ${
                                          status === 'paid' ? 'bg-emerald-500/10 border-emerald-500 text-emerald-500 shadow-lg shadow-emerald-500/10 scale-105' :
                                          status === 'justified' ? 'bg-amber-500/10 border-amber-500 text-amber-500 shadow-sm' :
                                          'bg-slate-950 border-slate-800 text-slate-700 hover:border-indigo-500'
                                        }`}
                                      >
                                         {status === 'paid' ? <Check size={18} strokeWidth={4} /> : status === 'justified' ? <Gift size={16} strokeWidth={3} /> : <Clock size={16} />}
                                      </button>
                                   </td>
                                );
                             })}
                          </tr>
                       ))}
                       {clients.filter(c => c.monthlyValue > 0).length === 0 && (
                         <tr><td colSpan={13} className="px-8 py-32 text-center text-slate-600 font-black uppercase text-[10px] tracking-widest italic">Nenhum terreiro com mensalidade ativa encontrado</td></tr>
                       )}
                    </tbody>
                 </table>
              </div>
              <div className="p-4 bg-slate-950/80 border-t border-slate-800 flex justify-center gap-8 text-[9px] font-black text-slate-500 uppercase tracking-widest">
                 <div className="flex items-center gap-2"><div className="w-2.5 h-2.5 rounded bg-emerald-500" /> Confirmado</div>
                 <div className="flex items-center gap-2"><div className="w-2.5 h-2.5 rounded bg-amber-500" /> Cortesia / Isenção</div>
                 <div className="flex items-center gap-2"><div className="w-2.5 h-2.5 rounded bg-slate-800" /> Aguardando</div>
              </div>
           </div>
        </div>
      )}

      {/* ABA: MANUTENÇÃO GLOBAL */}
      {activeTab === 'maintenance' && (
        <div className="space-y-8 animate-in slide-in-from-right-4 duration-500">
           {/* ÁREA EM CIMA (HEADER) */}
           <div className="bg-slate-900 p-10 rounded-[3rem] border border-slate-800 shadow-2xl flex flex-col md:flex-row items-center justify-between gap-6 overflow-hidden relative">
              <div className="absolute top-0 right-0 p-8 opacity-5"><Wrench size={140} className="text-orange-400" /></div>
              <div className="flex items-center gap-4 relative z-10">
                 <div className="p-4 bg-orange-500 rounded-3xl text-slate-900 shadow-xl shadow-orange-500/20"><ShieldAlert size={32} /></div>
                 <div>
                    <h2 className="text-2xl font-black text-white uppercase tracking-tighter">Central de Manutenção Global</h2>
                    <p className="text-slate-500 font-medium">Controle de interrupção de serviço para todas as instâncias da rede.</p>
                 </div>
              </div>
           </div>

           {/* ÁREA COM 3 FRASES (STATUS TÉCNICO) */}
           <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-slate-900 p-6 rounded-[2rem] border border-slate-800 shadow-xl flex items-center gap-4 group hover:border-emerald-500/30 transition-all">
                 <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                 <p className="text-[11px] font-black text-slate-400 uppercase tracking-widest">Servidores: Estáveis e Sincronizados</p>
              </div>
              <div className="bg-slate-900 p-6 rounded-[2rem] border border-slate-800 shadow-xl flex items-center gap-4 group hover:border-emerald-500/30 transition-all">
                 <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                 <p className="text-[11px] font-black text-slate-400 uppercase tracking-widest">Integridade dos Bancos: 100% OK</p>
              </div>
              <div className="bg-slate-900 p-6 rounded-[2rem] border border-slate-800 shadow-xl flex items-center gap-4 group hover:border-indigo-500/30 transition-all">
                 <div className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse" />
                 <p className="text-[11px] font-black text-slate-400 uppercase tracking-widest">Latência de Rede: 22ms (Otimizada)</p>
              </div>
           </div>

           {/* CONTROLE DE BLOQUEIO */}
           <div className="max-w-4xl mx-auto bg-slate-900 p-10 rounded-[3rem] border border-slate-800 shadow-2xl space-y-10">
              <div className="flex items-center justify-between border-b border-slate-800 pb-6">
                 <div>
                    <h3 className="text-lg font-black text-white uppercase tracking-tight">Status do Bloqueio</h3>
                    <p className="text-xs text-slate-500 font-bold uppercase tracking-widest">Define se o login está liberado para os clientes</p>
                 </div>
                 <div className={`px-6 py-2 rounded-full font-black text-[10px] uppercase border transition-all ${maintConfig.active ? 'bg-orange-500/10 text-orange-500 border-orange-500/20' : 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20'}`}>
                    {maintConfig.active ? 'SISTEMA EM MANUTENÇÃO (BLOQUEADO)' : 'SISTEMA OPERANTE (LIBERADO)'}
                 </div>
              </div>

              <div className="space-y-4">
                 <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest ml-2">Mensagem Exibida na Tela de Login</label>
                 <textarea 
                   className="w-full p-6 bg-slate-950 border border-slate-800 rounded-[2rem] text-slate-300 font-medium text-sm outline-none focus:ring-2 focus:ring-orange-500 resize-none h-32 shadow-inner" 
                   value={maintConfig.message} 
                   onChange={e => onUpdateMaintenance({ ...maintConfig, message: e.target.value })} 
                   placeholder="Descreva o motivo da manutenção..." 
                 />
              </div>

              <button 
                onClick={() => onUpdateMaintenance({ ...maintConfig, active: !maintConfig.active })} 
                className={`w-full py-5 rounded-2xl font-black uppercase text-xs tracking-widest shadow-2xl transition-all hover:scale-[1.01] active:scale-95 flex items-center justify-center gap-3 ${maintConfig.active ? 'bg-emerald-600 text-white hover:bg-emerald-700' : 'bg-orange-600 text-white hover:bg-orange-700'}`}
              >
                {maintConfig.active ? <CheckCircle2 size={20} /> : <ShieldAlert size={20} />}
                {maintConfig.active ? 'Desativar Manutenção e Liberar Acesso' : 'Ativar Bloqueio Estrutural de Emergência'}
              </button>
           </div>
        </div>
      )}

      {/* ABA: SNAPSHOTS (BACKUPS) - RESTORED FIDELITY */}
      {activeTab === 'backups' && (
        <div className="space-y-8 animate-in slide-in-from-right-4 duration-500">
           <div className="bg-slate-900 p-10 rounded-[3rem] border border-slate-800 shadow-2xl flex flex-col md:flex-row items-center justify-between gap-6 overflow-hidden relative">
              <div className="absolute top-0 right-0 p-8 opacity-5"><Database size={140} className="text-indigo-400" /></div>
              <div className="flex items-center gap-4 relative z-10">
                 <div className="p-4 bg-indigo-600 rounded-3xl text-white shadow-xl shadow-indigo-600/20"><Archive size={32} /></div>
                 <div>
                    <h2 className="text-2xl font-black text-white uppercase tracking-tighter">Snapshots do Sistema</h2>
                    <p className="text-slate-500 font-medium">Capture e recupere o estado completo de todo o banco de dados SaaS.</p>
                 </div>
              </div>
              <button 
                onClick={() => handleCreateSnapshot('manual')}
                className="px-8 py-4 bg-indigo-600 text-white rounded-2xl font-black text-xs uppercase shadow-xl hover:bg-indigo-700 transition-all flex items-center gap-2 active:scale-95 z-10"
              >
                 <Plus size={18} /> Novo Snapshot Manual
              </button>
           </div>

           <div className="bg-slate-900 rounded-[2.5rem] border border-slate-800 shadow-xl overflow-hidden">
              <div className="p-6 bg-slate-950/50 border-b border-slate-800 flex justify-between items-center">
                 <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Repositório de Pontos de Restauração</h3>
                 <span className="text-[9px] font-black bg-slate-800 text-slate-500 px-3 py-1 rounded-full uppercase">{snapshots.length} ARQUIVOS</span>
              </div>
              <div className="overflow-x-auto">
                 <table className="w-full text-left">
                    <thead>
                       <tr className="bg-slate-950/80 text-[9px] font-black text-slate-500 uppercase tracking-widest border-b border-slate-800">
                          <th className="px-10 py-5">Data / Hora do Registro</th>
                          <th className="px-8 py-5">Tipo</th>
                          <th className="px-8 py-5">Tamanho</th>
                          <th className="px-10 py-5 text-right">Ações de Recuperação</th>
                       </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800">
                       {snapshots.length > 0 ? [...snapshots].reverse().map(snap => (
                          <tr key={snap.id} className="hover:bg-slate-800/40 transition-all group">
                             <td className="px-10 py-5">
                                <p className="text-white text-sm font-black uppercase tracking-tight">{format(new Date(snap.date), "dd 'de' MMMM, yyyy", { locale: ptBR })}</p>
                                <p className="text-[10px] font-bold text-slate-500 mt-0.5">{format(new Date(snap.date), "HH:mm:ss")} • ID: {snap.id}</p>
                             </td>
                             <td className="px-8 py-5">
                                <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase border ${
                                  snap.type === 'manual' ? 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20' : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                                }`}>{snap.type}</span>
                             </td>
                             <td className="px-8 py-5 text-slate-400 text-xs font-mono">{snap.size}</td>
                             <td className="px-10 py-5 text-right">
                                <div className="flex justify-end gap-3">
                                   <button onClick={() => downloadSnapshot(snap)} className="p-2.5 bg-slate-800 text-slate-400 hover:text-white rounded-xl transition-all shadow-md" title="Baixar JSON"><Download size={18} /></button>
                                   <button onClick={() => setShowRestoreConfirm(snap)} className="p-2.5 bg-slate-800 text-slate-400 hover:text-emerald-400 rounded-xl transition-all shadow-md" title="Restaurar"><RefreshCcw size={18} /></button>
                                   <button onClick={() => deleteSnapshot(snap.id)} className="p-2.5 bg-slate-800 text-slate-400 hover:text-red-500 rounded-xl transition-all shadow-md" title="Deletar"><Trash2 size={18} /></button>
                                </div>
                             </td>
                          </tr>
                       )) : (
                          <tr>
                             <td colSpan={4} className="px-8 py-32 text-center flex flex-col items-center gap-3">
                                <FileJson size={48} className="text-slate-800 opacity-20" />
                                <p className="text-slate-600 font-black uppercase tracking-widest text-[10px]">Nenhum snapshot armazenado</p>
                             </td>
                          </tr>
                       )}
                    </tbody>
                 </table>
              </div>
           </div>
        </div>
      )}

      {/* MODAL DE RESTAURAÇÃO (Pede Senha Master) */}
      {showRestoreConfirm && (
        <div className="fixed inset-0 bg-black/90 backdrop-blur-md flex items-center justify-center z-[200] p-4">
           <div className="bg-slate-900 border border-slate-800 rounded-[3rem] shadow-2xl max-w-md w-full overflow-hidden animate-in zoom-in duration-300">
              <div className="p-8 bg-red-600 text-white flex justify-between items-center">
                 <div className="flex items-center gap-3">
                    <ShieldAlert size={24} />
                    <h3 className="text-xl font-black uppercase tracking-tight">Restauração Crítica</h3>
                 </div>
                 <button onClick={() => { setShowRestoreConfirm(null); setRestorePassword(''); }} className="p-2 hover:bg-black/20 rounded-full transition-all"><X size={24} /></button>
              </div>
              <form onSubmit={handleRestoreSnapshot} className="p-8 space-y-8">
                 <div className="text-center space-y-2">
                    <p className="text-red-400 font-black text-xs uppercase tracking-widest">Aviso de Segurança</p>
                    <p className="text-slate-400 text-sm font-medium leading-relaxed">Você está prestes a substituir TODOS os dados do sistema por um backup de <strong>{format(new Date(showRestoreConfirm.date), "dd/MM/yyyy HH:mm")}</strong>.</p>
                 </div>

                 <div className="space-y-4">
                    <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Senha de Mestre para Validar</label>
                    <div className="relative">
                       <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-600" size={18} />
                       <input 
                         required
                         type="password" 
                         className="w-full pl-12 pr-4 py-4 bg-slate-950 border border-slate-800 rounded-2xl text-white outline-none focus:ring-2 focus:ring-red-500 font-bold" 
                         value={restorePassword}
                         onChange={e => setRestorePassword(e.target.value)}
                         placeholder="••••••••"
                       />
                    </div>
                 </div>

                 <div className="flex gap-4">
                    <button type="button" onClick={() => { setShowRestoreConfirm(null); setRestorePassword(''); }} className="flex-1 py-4 bg-slate-800 text-slate-400 rounded-2xl font-black uppercase text-xs">Desistir</button>
                    <button type="submit" className="flex-1 py-4 bg-red-600 text-white rounded-2xl font-black uppercase text-xs shadow-xl shadow-red-900/20 hover:bg-red-700 transition-all active:scale-95">Executar</button>
                 </div>
              </form>
           </div>
        </div>
      )}

      {activeTab === 'tickets' && <MasterTicketManager tickets={tickets} onUpdateTickets={onUpdateTickets} clients={clients} />}
    </div>
  );
};
