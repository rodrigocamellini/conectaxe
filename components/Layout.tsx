
import React, { useState, useEffect, useMemo } from 'react';
import { 
  Menu,
  X,
  ChevronDown,
  LogOut,
  ShieldCheck,
  ArrowLeftCircle,
  Ticket,
  Sparkles,
  Info,
  Terminal,
  Zap,
  Map as MapIcon,
  Tag,
  DollarSign,
  ShieldHalf,
  Wrench,
  Database,
  History,
  ClipboardList,
  LayoutGrid,
  CreditCard,
  Code
} from 'lucide-react';
import * as LucideIcons from 'lucide-react';
import { User, SystemConfig, SupportTicket, GlobalBroadcast, ReleaseNote, MenuItemConfig } from '../types';
import { DEFAULT_LOGO_URL, MASTER_LOGO_URL } from '../constants';
import { RoleIconComponent } from './UserManagement';

interface LayoutProps {
  user: User;
  config: SystemConfig;
  onLogout: () => void;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  isMasterMode?: boolean; 
  children: React.ReactNode;
}

const DynamicIcon = ({ name, size = 16, className = "", color }: { name: string, size?: number, className?: string, color?: string }) => {
  const IconComp = (LucideIcons as any)[name] || LucideIcons.HelpCircle;
  return <IconComp size={size} className={className} style={color ? { color } : {}} />;
};

export const Layout: React.FC<LayoutProps> = ({ 
  user, 
  config,
  onLogout, 
  activeTab, 
  setActiveTab, 
  isMasterMode = false,
  children 
}) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [showAboutModal, setShowAboutModal] = useState(false);
  const [expandedGroupId, setExpandedGroupId] = useState<string | null>(null);

  const isAtDeveloperPortal = ['developer-portal', 'tickets', 'master-payments', 'system-maintenance', 'master-backups', 'master-broadcast', 'master-roadmap', 'master-coupons', 'master-audit', 'master-menu'].includes(activeTab);
  const isRodrigo = user?.email?.toLowerCase().includes('rodrigo');

  useEffect(() => {
    const parentGroup = config.menuConfig?.find(item => 
      item.subItems?.some(sub => sub.id === activeTab)
    );
    if (parentGroup) {
      setExpandedGroupId(parentGroup.id);
    } else if (!config.menuConfig?.find(i => i.id === activeTab)?.subItems) {
      setExpandedGroupId(null);
    }
  }, [activeTab, config.menuConfig]);

  const toggleGroup = (id: string) => {
    setExpandedGroupId(prev => prev === id ? null : id);
  };

  const notificationsCount = useMemo(() => {
    try {
      const broadcasts: GlobalBroadcast[] = JSON.parse(localStorage.getItem('saas_global_broadcasts') || '[]');
      const roadmap: ReleaseNote[] = JSON.parse(localStorage.getItem('saas_global_roadmap') || '[]');
      const dismissed: string[] = JSON.parse(localStorage.getItem(`dismissed_roadmap_${config.license?.clientId || 'default'}`) || '[]');
      return broadcasts.filter(b => b.active).length + roadmap.filter(r => !dismissed.includes(r.id)).length;
    } catch (error) {
      console.error('Error calculating notifications count:', error);
      return 0;
    }
  }, [activeTab, config.license]);

  const masterSettings = useMemo(() => {
    const saved = localStorage.getItem('saas_master_credentials');
    return saved ? JSON.parse(saved) : { 
      sidebarTitle: 'Sistema de Gestão de Terreiros', 
      brandLogo: MASTER_LOGO_URL, 
      systemTitle: 'ConectAxé Painel de Desenvolvedor' 
    };
  }, []);

  const userRoleConfig = config.userRoles.find(r => r.id === user?.role);

  const isAllowed = (tabId: string) => {
    if (user?.role === 'admin' || isRodrigo) return true;
    return config.rolePermissions?.[user?.role || '']?.[tabId]?.view === true;
  };

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden w-full">
      {isMobileMenuOpen && <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 md:hidden" onClick={() => setIsMobileMenuOpen(false)} />}

      <aside className={`fixed inset-y-0 left-0 w-64 text-white flex flex-col z-50 transition-transform duration-300 md:relative md:translate-x-0 ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'} shrink-0 shadow-2xl`} style={{ backgroundColor: isAtDeveloperPortal ? '#020617' : config.sidebarColor }}>
        <div className="p-6 flex items-center justify-between shrink-0">
          <div className={`flex items-center gap-3 ${isAtDeveloperPortal ? 'justify-center w-full' : ''}`}>
            {isAtDeveloperPortal ? (
              <img src={masterSettings.brandLogo || MASTER_LOGO_URL} className="w-48 h-auto object-contain" />
            ) : (
              <>
                <div className="w-10 h-10 rounded-xl flex items-center justify-center overflow-hidden shrink-0 border border-white/20 shadow-xl bg-white/10 backdrop-blur-md">
                  <img src={config.logoUrl || DEFAULT_LOGO_URL} className="w-full h-full object-contain p-1" />
                </div>
                <span className="truncate text-[11px] font-black uppercase tracking-widest" style={{ color: config.sidebarTextColor }}>{config.systemName}</span>
              </>
            )}
          </div>
          <button className="md:hidden" onClick={() => setIsMobileMenuOpen(false)}><X size={20} /></button>
        </div>
        
        <nav className="flex-1 px-4 py-2 space-y-1 overflow-y-auto" style={{ scrollbarWidth: 'thin' }}>
          {isRodrigo && !isAtDeveloperPortal && (
            <button onClick={() => setActiveTab('developer-portal')} className="w-full flex items-center gap-3 px-4 py-3 mb-6 rounded-xl transition-all bg-indigo-600 text-white font-black text-[10px] uppercase tracking-widest shadow-lg shadow-indigo-500/20 hover:scale-[1.02] active:scale-95">
              <ShieldCheck size={18} className="shrink-0" /><span>Painel Master</span>
            </button>
          )}

          {isAtDeveloperPortal ? (
            <div className="space-y-2">
              <button onClick={() => setActiveTab('developer-portal')} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all font-black text-[10px] uppercase tracking-widest ${activeTab === 'developer-portal' ? 'bg-indigo-600 text-white shadow-lg' : 'bg-slate-900 border border-slate-800 text-indigo-400'}`}><LayoutGrid size={18} /><span>Terreiros Ativos</span></button>
              <button onClick={() => setActiveTab('tickets')} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all font-black text-[10px] uppercase tracking-widest ${activeTab === 'tickets' ? 'bg-indigo-600 text-white shadow-lg' : 'bg-slate-900 border border-slate-800 text-indigo-400'}`}><Ticket size={18} /><span>Tickets Suporte</span></button>
              <button onClick={() => setActiveTab('master-menu')} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all font-black text-[10px] uppercase tracking-widest ${activeTab === 'master-menu' ? 'bg-indigo-600 text-white shadow-lg' : 'bg-slate-900 border border-slate-800 text-indigo-400'}`}><Menu size={18} /><span>Config. Menu</span></button>
              <button onClick={() => setActiveTab('master-broadcast')} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all font-black text-[10px] uppercase tracking-widest ${activeTab === 'master-broadcast' ? 'bg-amber-600 text-white shadow-lg' : 'bg-slate-900 border border-slate-800 text-amber-400'}`}><Zap size={18} /><span>Broadcast</span></button>
              <button onClick={() => setActiveTab('master-payments')} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all font-black text-[10px] uppercase tracking-widest ${activeTab === 'master-payments' ? 'bg-emerald-600 text-white shadow-lg' : 'bg-slate-900 border border-slate-800 text-emerald-400'}`}><DollarSign size={18} /><span>Faturamento</span></button>
              <button onClick={() => setActiveTab('system-maintenance')} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all font-black text-[10px] uppercase tracking-widest ${activeTab === 'system-maintenance' ? 'bg-orange-600 text-white shadow-lg' : 'bg-slate-900 border border-slate-800 text-orange-400'}`}><Wrench size={18} /><span>Manutenção</span></button>
              <button onClick={() => setActiveTab('master-backups')} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all font-black text-[10px] uppercase tracking-widest ${activeTab === 'master-backups' ? 'bg-indigo-600 text-white shadow-lg' : 'bg-slate-900 border border-slate-800 text-indigo-400'}`}><Database size={18} /><span>Snapshots</span></button>
              <button onClick={() => setActiveTab('master-audit')} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all font-black text-[10px] uppercase tracking-widest ${activeTab === 'master-audit' ? 'bg-slate-800 text-white shadow-lg' : 'bg-slate-900 border border-slate-800 text-slate-500'}`}><History size={18} /><span>Auditoria</span></button>
              <button onClick={() => setActiveTab('master-coupons')} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all font-black text-[10px] uppercase tracking-widest ${activeTab === 'master-coupons' ? 'bg-slate-800 text-white shadow-lg' : 'bg-slate-900 border border-slate-800 text-slate-500'}`}><Tag size={18} /><span>Cupons</span></button>
              <button onClick={() => setActiveTab('master-roadmap')} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all font-black text-[10px] uppercase tracking-widest ${activeTab === 'master-roadmap' ? 'bg-slate-800 text-white shadow-lg' : 'bg-slate-900 border border-slate-800 text-slate-500'}`}><ClipboardList size={18} /><span>Roadmap</span></button>
              
              <button onClick={() => setActiveTab('dashboard')} className="w-full flex items-center gap-3 px-4 py-3 mt-8 rounded-xl transition-all bg-white/5 text-slate-400 hover:bg-white/10 font-black text-[10px] uppercase tracking-widest"><ArrowLeftCircle size={18} /><span>Sair da Master</span></button>
            </div>
          ) : (
            (config.menuConfig || []).map((item) => {
              if (!isAllowed(item.id)) return null;
              const hasSub = item.subItems && item.subItems.length > 0;
              const isExpanded = expandedGroupId === item.id;
              const isActive = hasSub ? isExpanded : activeTab === item.id;
              const itemColor = item.color || (isActive ? config.accentColor : config.sidebarTextColor);

              return (
                <div key={item.id} className="space-y-1">
                  <button onClick={() => hasSub ? toggleGroup(item.id) : setActiveTab(item.id)} className={`w-full flex items-center justify-between px-4 py-2.5 rounded-xl transition-all relative group ${isActive ? 'bg-white/10' : 'hover:bg-white/5 opacity-60'}`} style={{ color: itemColor }}>
                    <div className="flex items-center gap-3"><DynamicIcon name={item.icon} size={16} /><span className="font-bold text-[11px] truncate uppercase tracking-tighter">{item.label}</span></div>
                    {hasSub && <ChevronDown size={14} className={`transition-transform duration-300 ${isExpanded ? 'rotate-180' : ''}`} />}
                  </button>
                  {hasSub && isExpanded && (
                    <div className="space-y-0.5 ml-6 border-l border-white/10 pl-2">
                       {item.subItems!.map(sub => {
                          if (!isAllowed(sub.id)) return null;
                          const isSubActive = activeTab === sub.id;
                          return (
                            <button key={sub.id} onClick={() => { setActiveTab(sub.id); setIsMobileMenuOpen(false); }} className={`w-full flex items-center gap-3 px-4 py-2 rounded-lg transition-all ${isSubActive ? 'bg-white/10' : 'hover:bg-white/5 opacity-60'}`} style={{ color: sub.color || (isSubActive ? config.accentColor : config.sidebarTextColor) }}>
                               <DynamicIcon name={sub.icon} size={14} /><span className="font-bold text-[10px] truncate uppercase tracking-tighter">{sub.label}</span>
                            </button>
                          );
                       })}
                    </div>
                  )}
                </div>
              );
            })
          )}
        </nav>

        <div className={`p-4 border-t shrink-0 ${isAtDeveloperPortal ? 'bg-slate-950 border-slate-800' : 'border-white/10'}`}>
          <div className="flex items-center gap-3 mb-4 px-2">
            <div className={`w-10 h-10 rounded-xl border flex items-center justify-center font-black text-sm overflow-hidden shrink-0 ${isAtDeveloperPortal ? 'bg-indigo-600 border-indigo-500' : 'bg-white/10 border-white/20'}`}>
              {user?.photo ? <img src={user.photo} className="w-full h-full object-cover" /> : user?.name?.charAt(0) || '?'}
            </div>
            <div className="flex flex-col min-w-0 flex-1">
              <p className="text-xs font-black truncate uppercase leading-tight" style={{ color: config.sidebarTextColor }}>{user?.name || 'Visitante'}</p>
              <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-lg text-[8px] font-black uppercase text-white mt-1 w-fit shadow-sm" style={{ backgroundColor: isAtDeveloperPortal ? '#4f46e5' : (userRoleConfig?.color || '#64748b') }}>
                {!isAtDeveloperPortal && <RoleIconComponent name={userRoleConfig?.iconName} size={10} />}
                {isAtDeveloperPortal ? 'MASTER DEV' : (userRoleConfig?.label || user?.role)}
              </div>
            </div>
          </div>
          <button onClick={onLogout} className="w-full flex items-center justify-center gap-3 px-4 py-3 rounded-xl text-red-400 bg-red-400/5 hover:bg-red-400/10 border border-red-400/10 transition-colors font-black text-[10px] uppercase">
            <LogOut size={16} /><span>Sair do Sistema</span>
          </button>
        </div>
      </aside>

      <main className="flex-1 flex flex-col min-w-0 overflow-hidden relative">
        <header className={`h-16 border-b flex items-center justify-between px-6 shrink-0 transition-colors z-30 ${isAtDeveloperPortal ? 'bg-slate-950 border-slate-800 text-white shadow-lg' : 'bg-white border-gray-100'}`}>
          <div className="flex items-center gap-4">
            <button className="md:hidden p-2 bg-gray-100 rounded-lg" onClick={() => setIsMobileMenuOpen(true)}><Menu size={20} /></button>
            <h2 className={`text-sm font-black tracking-tight ${isAtDeveloperPortal ? 'text-indigo-400 font-black' : 'text-gray-800 font-black'}`}>
                {isAtDeveloperPortal ? (masterSettings.systemTitle || 'Operações Globais') : (config.menuConfig?.find(i => i.id === activeTab || i.subItems?.some(s => s.id === activeTab))?.label || 'Sistema')}
            </h2>
          </div>
        </header>
        <div className={`flex-1 overflow-y-auto p-4 md:p-8 ${isAtDeveloperPortal ? 'bg-slate-950' : 'bg-gray-50/50'}`}>
          <div className="w-full max-w-7xl mx-auto">{children}</div>
        </div>
      </main>
    </div>
  );
};
