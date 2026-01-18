
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
  Code,
  Crown,
  AlertCircle
} from 'lucide-react';
import * as LucideIcons from 'lucide-react';
import { User, SystemConfig, SupportTicket, GlobalBroadcast, ReleaseNote, MenuItemConfig, MasterCredentials } from '../types';
import { DEFAULT_LOGO_URL, MASTER_LOGO_URL, INITIAL_MASTER_MENU_CONFIG } from '../constants';
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

const WhatsAppIcon = ({ size = 18 }: { size?: number }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 32 32"
    aria-hidden="true"
  >
    <defs>
      <linearGradient id="waGradient" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#25D366" />
        <stop offset="100%" stopColor="#128C7E" />
      </linearGradient>
    </defs>
    <circle cx="16" cy="16" r="16" fill="url(#waGradient)" />
    <path
      d="M16 7.5c-4.69 0-8.5 3.72-8.5 8.31 0 1.46.39 2.88 1.14 4.14l-1.2 4.37 4.49-1.18c1.22.67 2.6 1.03 4.07 1.03 4.69 0 8.5-3.72 8.5-8.31S20.69 7.5 16 7.5zm0 14.44c-1.29 0-2.55-.33-3.66-.95l-.26-.15-2.66.7.71-2.58-.17-.27a6.34 6.34 0 0 1-1-3.43c0-3.5 2.89-6.36 6.44-6.36s6.44 2.85 6.44 6.36c0 3.5-2.89 6.36-6.44 6.36zm3.53-4.75c-.19-.09-1.11-.53-1.28-.59-.17-.06-.29-.09-.41.09-.12.18-.48.59-.59.71-.11.12-.22.13-.41.04-.19-.09-.8-.31-1.52-.99-.56-.53-.94-1.18-1.05-1.38-.11-.19-.01-.3.08-.39.08-.08.19-.22.29-.33.1-.11.13-.18.19-.3.06-.12.03-.22-.02-.31-.05-.09-.41-.98-.56-1.34-.15-.36-.3-.31-.41-.31h-.35c-.12 0-.31.04-.47.22-.16.18-.61.59-.61 1.44 0 .85.63 1.67.72 1.79.09.12 1.24 2.01 3.01 2.75.42.18.74.29.99.37.42.13.8.11 1.1.07.34-.05 1.11-.45 1.27-.88.16-.43.16-.8.11-.88-.05-.08-.17-.12-.36-.21z"
      fill="#FFFFFF"
    />
  </svg>
);

interface ErrorBoundaryProps {
  children: React.ReactNode;
  activeTab: string;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    console.error('Error rendering tab', this.props.activeTab, error, info);
  }

  componentDidUpdate(prevProps: ErrorBoundaryProps) {
    if (prevProps.activeTab !== this.props.activeTab && this.state.hasError) {
      this.setState({ hasError: false, error: null });
    }
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="w-full max-w-5xl mx-auto">
          <div className="bg-white rounded-3xl border border-red-200 shadow-xl p-8 flex flex-col items-center text-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-red-100 flex items-center justify-center text-red-500 mb-2">
              <AlertCircle size={28} />
            </div>
            <h2 className="text-sm md:text-base font-black text-red-600 uppercase tracking-widest">
              Erro ao carregar esta aba
            </h2>
            <p className="text-xs md:text-sm text-slate-600 font-medium">
              Ocorreu um erro ao renderizar a aba selecionada. Você pode tentar novamente ou recarregar o sistema.
            </p>
            {this.state.error?.message && (
              <div className="w-full text-left mt-4">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">
                  Detalhes técnicos
                </p>
                <pre className="text-xs text-slate-700 bg-slate-50 border border-slate-100 rounded-2xl p-4 overflow-x-auto max-h-40 whitespace-pre-wrap break-words">
                  {this.state.error.message}
                </pre>
              </div>
            )}
            <button
              onClick={this.handleRetry}
              className="mt-4 px-6 py-3 bg-red-600 text-white rounded-xl font-black uppercase text-xs shadow-lg shadow-red-200 hover:bg-red-700 transition-all active:scale-95"
            >
              Tentar Novamente
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

const compareVersions = (a: string, b: string) => {
  const pa = a.split('.').map(n => parseInt(n || '0', 10));
  const pb = b.split('.').map(n => parseInt(n || '0', 10));
  const len = Math.max(pa.length, pb.length);
  for (let i = 0; i < len; i++) {
    const va = pa[i] ?? 0;
    const vb = pb[i] ?? 0;
    if (va > vb) return 1;
    if (va < vb) return -1;
  }
  return 0;
};

export const Layout: React.FC<LayoutProps> = ({ 
  user, 
  config,
  onLogout, 
  activeTab, 
  setActiveTab, 
  isMasterMode = false,
  systemVersion = '1.0.0',
  children 
}) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [showAboutModal, setShowAboutModal] = useState(false);
  const [expandedGroupId, setExpandedGroupId] = useState<string | null>(null);
  const [showSystemInfo, setShowSystemInfo] = useState(false);

  const isAtDeveloperPortal = ['developer-portal', 'tickets', 'master-payments', 'master-affiliates', 'system-maintenance', 'master-backups', 'master-broadcast', 'master-roadmap', 'master-coupons', 'master-audit', 'master-menu'].includes(activeTab);
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

  const masterSettings = useMemo<MasterCredentials>(() => {
    const fallback: MasterCredentials = {
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
    try {
      const saved = localStorage.getItem('saas_master_credentials');
      if (!saved) {
        return fallback;
      }
      const parsed = JSON.parse(saved);
      if (parsed && typeof parsed === 'object') {
        return { ...fallback, ...parsed };
      }
      return fallback;
    } catch {
      localStorage.removeItem('saas_master_credentials');
      return fallback;
    }
  }, []);

  const masterMenuItems: MenuItemConfig[] = useMemo(() => {
    return (config.masterMenuConfig && config.masterMenuConfig.length > 0)
      ? config.masterMenuConfig
      : INITIAL_MASTER_MENU_CONFIG;
  }, [config.masterMenuConfig]);

  const userRoleConfig = (config.userRoles || []).find(r => r.id === user?.role);

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
              {masterMenuItems.map(item => {
                const isActive = activeTab === item.id;
                const baseColor = item.color || '#4f46e5';
                const backgroundColor = isActive ? baseColor : '#020617';
                const textColor = isActive ? '#0f172a' : baseColor;
                const borderColor = isActive ? baseColor : '#1f2937';

                return (
                  <button
                    key={item.id}
                    onClick={() => setActiveTab(item.id)}
                    className="w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all font-black text-[10px] uppercase tracking-widest border"
                    style={{ backgroundColor, color: textColor, borderColor, boxShadow: isActive ? '0 10px 25px rgba(15,23,42,0.6)' : undefined }}
                  >
                    <DynamicIcon name={item.icon} size={18} />
                    <span>{item.label}</span>
                  </button>
                );
              })}
              
              <button onClick={() => setActiveTab('dashboard')} className="w-full flex items-center gap-3 px-4 py-3 mt-8 rounded-xl transition-all bg-white/5 text-slate-400 hover:bg-white/10 font-black text-[10px] uppercase tracking-widest">
                <ArrowLeftCircle size={18} />
                <span>Sair da Master</span>
              </button>
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
          {!isAtDeveloperPortal && activeTab === 'dashboard' && (
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setActiveTab('support-client')}
                className="flex items-center gap-2 px-3 py-2 rounded-xl bg-indigo-600 text-white text-[10px] font-black uppercase tracking-widest shadow-sm hover:bg-indigo-700 transition-colors"
              >
                <Ticket size={16} />
                <span>Ticket</span>
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('news-announcements')}
                className="flex items-center gap-2 px-3 py-2 rounded-xl border border-indigo-100 bg-indigo-50 text-[10px] font-black uppercase tracking-widest text-indigo-700 hover:bg-indigo-100 hover:border-indigo-200 transition-colors"
              >
                <Info size={14} />
                <span>Info</span>
              </button>
              <button
                type="button"
                onClick={() => setShowSystemInfo(true)}
                className="p-2 rounded-full border border-gray-200 bg-white text-gray-500 hover:text-indigo-600 hover:border-indigo-200 shadow-sm transition-colors"
                title="Informações do Sistema"
              >
                <Info size={18} />
              </button>
            </div>
          )}
        </header>
        {showSystemInfo && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-40 p-4">
            <div className="bg-slate-950 rounded-3xl shadow-2xl w-full max-w-sm overflow-hidden text-white">
              <div className="p-6 bg-indigo-600 text-white flex items-center justify-between" style={{ backgroundColor: config.primaryColor }}>
                <div className="flex items-center gap-3 mx-auto">
                  <div className="p-2 bg-white/20 rounded-xl">
                    <Info size={18} />
                  </div>
                  <p className="text-sm font-black uppercase tracking-widest">Informações do Sistema</p>
                </div>
                <button
                  type="button"
                  onClick={() => setShowSystemInfo(false)}
                  className="p-2 rounded-full hover:bg-black/10 transition-colors"
                  aria-label="Fechar"
                >
                  <X size={18} />
                </button>
              </div>
              <div className="p-6 space-y-4 text-sm bg-slate-950">
                <div className="flex justify-center mb-4">
                  <img src={masterSettings.brandLogo || MASTER_LOGO_URL} className="max-w-[11rem] h-auto object-contain" />
                </div>
                <div className="space-y-1">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Nome do Sistema</p>
                  <p className="font-bold text-white">ConectaAxé - Sistema de Gestão de Terreiros</p>
                </div>
                <div className="space-y-1">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Nome do Desenvolvedor</p>
                  <p className="font-bold text-white">Rodrigo Ricciardi Camellini</p>
                </div>
                <div className="space-y-1">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Versão do Sistema</p>
                  <p className="font-bold text-white">{systemVersion}</p>
                </div>
                <div className="pt-4 border-t border-slate-800">
                  {(() => {
                    const raw = masterSettings.whatsapp || '';
                    const cleaned = raw.replace(/\D/g, '');
                    if (!cleaned || cleaned.length < 10) {
                      return (
                        <button
                          type="button"
                          className="w-full inline-flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-slate-800 text-slate-500 text-[10px] font-black uppercase tracking-widest cursor-not-allowed"
                          disabled
                        >
                          <WhatsAppIcon size={16} />
                          <span>WhatsApp de suporte não configurado</span>
                        </button>
                      );
                    }
                    return (
                      <a
                        href={`https://wa.me/${cleaned}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="w-full inline-flex items-center justify-center gap-2 px-4 py-3 rounded-xl text-white text-[10px] font-black uppercase tracking-widest shadow-sm transition-colors"
                        style={{ backgroundColor: '#25D366' }}
                      >
                        <WhatsAppIcon size={18} />
                        <span>Falar com suporte via WhatsApp</span>
                      </a>
                    );
                  })()}
                </div>
              </div>
            </div>
          </div>
        )}
        <div className={`flex-1 overflow-y-auto p-4 md:p-8 ${isAtDeveloperPortal ? 'bg-slate-950' : 'bg-gray-50/50'}`}>
          <ErrorBoundary activeTab={activeTab}>
            <div className="w-full max-w-7xl mx-auto">{children}</div>
          </ErrorBoundary>
        </div>
      </main>
    </div>
  );
};
