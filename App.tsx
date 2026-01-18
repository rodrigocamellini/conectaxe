
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { AuthState, Member, User, SpiritualEntity, InventoryItem, InventoryCategory, SystemConfig, CalendarEvent, Course, Enrollment, AttendanceRecord, SaaSClient, PaymentStatus, Donation, Referral, ReferralStatus, SaaSPlan, GlobalMaintenanceConfig, SupportTicket, IDCardLog, StockLog, GlobalBroadcast, ReleaseNote, GlobalCoupon, MasterAuditLog, CanteenItem, CanteenOrder, Ponto, Reza } from './types';
import { INITIAL_USERS, DEFAULT_AVATAR, DEFAULT_SYSTEM_CONFIG, DEFAULT_LOGO_URL, INITIAL_ENTITIES, DEFAULT_ENTITY_IMAGES, MASTER_LOGO_URL } from './constants';
import { storage, STORAGE_KEYS } from './services/storage';
import { Layout } from './components/Layout';
import { Dashboard } from './components/Dashboard';
import { MemberManagement } from './components/MemberManagement';
import { EntityManagement } from './components/EntityManagement';
import { MediumManagement } from './components/MediumManagement';
import { AttendanceManagement } from './components/AttendanceManagement';
import { InventoryManagement } from './components/InventoryManagement';
import { InventoryEntry } from './components/InventoryEntry';
import { InventoryDashboard } from './components/InventoryDashboard';
import { SystemConfigManagement } from './components/SystemConfigManagement';
import { UserManagement } from './components/UserManagement';
import { FinancialManagement } from './components/FinancialManagement';
import { FinancialConfigComponent } from './components/FinancialConfig';
import { FinancialReports } from './components/FinancialReports';
import { PermissionManagement } from './components/PermissionManagement';
import { EntityImageManagement } from './components/EntityImageManagement';
import { AgendaManagement } from './components/AgendaManagement';
import { CourseManagement } from './components/CourseManagement';
import { EadPlatform } from './components/EadPlatform';
import { SaaSManager } from './components/SaaSManager'; 
import { DeveloperPortal } from './components/DeveloperPortal'; 
import { RestoreSystem } from './components/RestoreSystem';
import { BackupSystem } from './components/BackupSystem';
import { DonationManagement } from './components/DonationManagement';
import { AffiliateSystem } from './components/AffiliateSystem';
import { TicketSystem } from './components/TicketSystem';
import { EcosystemPreview } from './components/EcosystemPreview';
import { IDCardManagement } from './components/IDCardManagement';
import { RoadmapHistory } from './components/RoadmapHistory';
import { CanteenManagement } from './components/CanteenManagement';
import { MenuManager } from './components/MenuManager';
import { MediaPontos } from './components/MediaPontos';
import { MediaRezas } from './components/MediaRezas';
import { LogIn, ShieldAlert, Snowflake, Layers, Wrench, Clock, AlertCircle } from 'lucide-react';
import { isAfter, format, isValid } from 'date-fns';

class SafeMasterPortal extends React.Component<{ children: React.ReactNode, onReset: () => void }, { hasError: boolean, error: Error | null }> {
  constructor(props: any) {
    super(props);
    this.state = { hasError: false, error: null };
  }
  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }
  componentDidCatch(error: Error, info: React.ErrorInfo) {
    console.error('Master Portal Crash:', error, info);
  }
  handleReset = () => {
    this.setState({ hasError: false, error: null });
    this.props.onReset();
  }
  render() {
    if (this.state.hasError) {
      return (
        <div className="flex flex-col items-center justify-center h-full p-8 bg-slate-900 text-white rounded-3xl">
          <ShieldAlert size={48} className="text-red-500 mb-4" />
          <h2 className="text-xl font-black uppercase mb-2">Erro Crítico no Painel Master</h2>
          <p className="text-slate-400 mb-6 text-center text-sm">Detectamos uma falha estrutural. Geralmente causada por dados corrompidos.</p>
          <pre className="bg-slate-950 p-4 rounded-xl text-xs text-red-400 font-mono mb-6 max-w-full overflow-auto border border-red-900/30">
            {this.state.error?.message}
          </pre>
          <button onClick={this.handleReset} className="px-6 py-3 bg-red-600 hover:bg-red-700 rounded-xl font-bold uppercase text-xs transition-colors shadow-lg shadow-red-900/20">
            Limpar Cache e Reiniciar
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

const INITIAL_SAAS_PLANS: SaaSPlan[] = [
  { id: 'p_teste', name: 'Plano de Teste', price: 0, durationDays: 10 },
  { id: 'p_mensal', name: 'Plano Mensal', price: 49.90, durationDays: 30 },
  { id: 'p_trimestral', name: 'Plano Trimestral', price: 135.00, durationDays: 90 },
  { id: 'p_semestral', name: 'Plano Semestral', price: 250.00, durationDays: 180 },
  { id: 'p_anual', name: 'Plano Anual', price: 450.00, durationDays: 365 },
  { id: 'p_vitalicio', name: 'Plano Vitalício', price: 1500.00, durationDays: null },
  { id: 'p_cortesia', name: 'Plano Cortesia', price: 0, durationDays: 30 },
];

const App: React.FC = () => {
  const [systemUsers, setSystemUsers] = useState<User[]>(() => storage.get<User[]>('terreiro_system_users') || INITIAL_USERS);
  const [auth, setAuth] = useState<AuthState>(() => storage.get<AuthState>(STORAGE_KEYS.AUTH) || { user: null, isAuthenticated: false, isMasterMode: false });
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [rememberAccess, setRememberAccess] = useState(false);
  const [loginError, setLoginError] = useState('');
  const [activeTab, setActiveTab] = useState('dashboard');
  const [showEcosystemConcept, setShowEcosystemConcept] = useState(false);
  
  const [members, setMembers] = useState<Member[]>(() => storage.get<Member[]>(STORAGE_KEYS.MEMBERS) || []);
  const [entities, setEntities] = useState<SpiritualEntity[]>(() => {
    const saved = storage.get<SpiritualEntity[]>(STORAGE_KEYS.ENTITIES);
    const legacyCargoNames = ['Pai de Santo / Mão de Santo', 'Pai Pequeno / Mãe Pequena'];
    const hasLegacyCargos = (saved || []).some(
      e => e.type === 'cargo' && legacyCargoNames.includes(e.name)
    );

    const canonicalCargos = INITIAL_ENTITIES.filter(e => e.type === 'cargo');

    let base: SpiritualEntity[];

    if (saved && saved.length > 0) {
      if (hasLegacyCargos) {
        const nonCargo = saved.filter(e => e.type !== 'cargo');
        base = [...nonCargo, ...canonicalCargos];
      } else {
        base = saved;
      }
    } else {
      base = INITIAL_ENTITIES;
    }

    return base.map(entity => {
      if (entity.imageUrl) {
        return entity;
      }
      const defaultImage = DEFAULT_ENTITY_IMAGES[entity.id];
      if (defaultImage) {
        return { ...entity, imageUrl: defaultImage };
      }
      return entity;
    });
  });
  const [events, setEvents] = useState<CalendarEvent[]>(() => storage.get<CalendarEvent[]>('terreiro_events') || []);
  const [courses, setCourses] = useState<Course[]>(() => storage.get<Course[]>('terreiro_courses') || []);
  const [enrollments, setEnrollments] = useState<Enrollment[]>(() => storage.get<Enrollment[]>('terreiro_enrollments') || []);
  const [attendanceRecords, setAttendanceRecords] = useState<AttendanceRecord[]>(() => storage.get<AttendanceRecord[]>('terreiro_attendance') || []);
  const [inventoryItems, setInventoryItems] = useState<InventoryItem[]>(() => storage.get<InventoryItem[]>('terreiro_inventory_items') || []);
  const [inventoryCategories, setInventoryCategories] = useState<InventoryCategory[]>(() => storage.get<InventoryCategory[]>('terreiro_inventory_cats') || []);
  const [stockLogs, setStockLogs] = useState<StockLog[]>(() => storage.get<StockLog[]>('terreiro_stock_logs') || []);
  const [donations, setDonations] = useState<Donation[]>(() => {
    const saved = storage.get<Donation[]>('terreiro_donations');
    return Array.isArray(saved) ? saved : [];
  });
  const [referrals, setReferrals] = useState<Referral[]>(() => {
    const saved = storage.get<Referral[]>('terreiro_referrals');
    return Array.isArray(saved) ? saved : [];
  });
  const [tickets, setTickets] = useState<SupportTicket[]>(() => {
    const saved = storage.get<SupportTicket[]>('terreiro_tickets');
    return Array.isArray(saved) ? saved : [];
  });
  const [idCardLogs, setIdCardLogs] = useState<IDCardLog[]>(() => {
    const saved = storage.get<IDCardLog[]>('terreiro_idcard_logs');
    return Array.isArray(saved) ? saved : [];
  });
  const [plans, setPlans] = useState<SaaSPlan[]>(() => {
    const saved = storage.get<SaaSPlan[]>('saas_master_plans');
    return Array.isArray(saved) ? saved : INITIAL_SAAS_PLANS;
  });
  const [clients, setClients] = useState<SaaSClient[]>(() => {
    const saved = storage.get<SaaSClient[]>('saas_master_clients');
    return Array.isArray(saved) ? saved : [];
  });
  const [systemConfig, setSystemConfig] = useState<SystemConfig>(() => {
    const saved = storage.get<SystemConfig>(STORAGE_KEYS.SYSTEM_CONFIG);
    if (!saved || typeof saved !== 'object') {
      return DEFAULT_SYSTEM_CONFIG;
    }
    const merged: SystemConfig = {
      ...DEFAULT_SYSTEM_CONFIG,
      ...saved,
      menuConfig: Array.isArray((saved as any).menuConfig) ? (saved as any).menuConfig : DEFAULT_SYSTEM_CONFIG.menuConfig,
      userRoles: Array.isArray((saved as any).userRoles) ? (saved as any).userRoles : DEFAULT_SYSTEM_CONFIG.userRoles,
      rolePermissions: (saved as any).rolePermissions || DEFAULT_SYSTEM_CONFIG.rolePermissions,
      spiritualSectionColors: (saved as any).spiritualSectionColors || DEFAULT_SYSTEM_CONFIG.spiritualSectionColors,
      pontoTypes: Array.from(new Set([...((saved as any).pontoTypes || []), ...DEFAULT_SYSTEM_CONFIG.pontoTypes])),
      pontoCategories: Array.from(new Set([...((saved as any).pontoCategories || []), ...DEFAULT_SYSTEM_CONFIG.pontoCategories])),
      rezaTypes: Array.from(new Set([...((saved as any).rezaTypes || []), ...DEFAULT_SYSTEM_CONFIG.rezaTypes])),
      rezaCategories: Array.from(new Set([...((saved as any).rezaCategories || []), ...DEFAULT_SYSTEM_CONFIG.rezaCategories]))
    };
    return merged;
  });

  const activeClientId = systemConfig.license?.clientId;

  const loadClientData = useCallback((clientId: string) => {
    const suffix = `_${clientId}`;

    setSystemUsers(storage.get<User[]>(`terreiro_system_users${suffix}`) || []);

    setMembers(storage.get<Member[]>(`${STORAGE_KEYS.MEMBERS}${suffix}`) || []);

    setEntities(() => {
      const saved = storage.get<SpiritualEntity[]>(`${STORAGE_KEYS.ENTITIES}${suffix}`);
      const legacyCargoNames = ['Pai de Santo / Mão de Santo', 'Pai Pequeno / Mãe Pequena'];
      const hasLegacyCargos = (saved || []).some(
        e => e.type === 'cargo' && legacyCargoNames.includes(e.name)
      );

      const canonicalCargos = INITIAL_ENTITIES.filter(e => e.type === 'cargo');

      let base: SpiritualEntity[];

      if (saved && saved.length > 0) {
        if (hasLegacyCargos) {
          const nonCargo = saved.filter(e => e.type !== 'cargo');
          base = [...nonCargo, ...canonicalCargos];
        } else {
          base = saved;
        }
      } else {
        base = INITIAL_ENTITIES;
      }

      return base.map(entity => {
        if (entity.imageUrl) {
          return entity;
        }
        const defaultImage = DEFAULT_ENTITY_IMAGES[entity.id];
        if (defaultImage) {
          return { ...entity, imageUrl: defaultImage };
        }
        return entity;
      });
    });

    setEvents(storage.get<CalendarEvent[]>(`terreiro_events${suffix}`) || []);
    setCourses(storage.get<Course[]>(`terreiro_courses${suffix}`) || []);
    setEnrollments(storage.get<Enrollment[]>(`terreiro_enrollments${suffix}`) || []);
    setAttendanceRecords(storage.get<AttendanceRecord[]>(`terreiro_attendance${suffix}`) || []);
    setInventoryItems(storage.get<InventoryItem[]>(`terreiro_inventory_items${suffix}`) || []);
    setInventoryCategories(storage.get<InventoryCategory[]>(`terreiro_inventory_cats${suffix}`) || []);
    setStockLogs(storage.get<StockLog[]>(`terreiro_stock_logs${suffix}`) || []);

    const savedDonations = storage.get<Donation[]>(`terreiro_donations${suffix}`);
    setDonations(Array.isArray(savedDonations) ? savedDonations : []);

    const savedIdLogs = storage.get<IDCardLog[]>(`terreiro_idcard_logs${suffix}`);
    setIdCardLogs(Array.isArray(savedIdLogs) ? savedIdLogs : []);

    const savedCanteenItems = storage.get<CanteenItem[]>(`terreiro_canteen_items${suffix}`);
    setCanteenItems(Array.isArray(savedCanteenItems) ? savedCanteenItems : []);

    const savedCanteenOrders = storage.get<CanteenOrder[]>(`terreiro_canteen_orders${suffix}`);
    setCanteenOrders(Array.isArray(savedCanteenOrders) ? savedCanteenOrders : []);
  }, []);

  useEffect(() => {
    try {
      const raw = localStorage.getItem('saas_login_persist');
      if (!raw) return;
      const parsed = JSON.parse(raw);
      if (parsed && typeof parsed === 'object' && (parsed as any).remember) {
        setRememberAccess(true);
        setLoginEmail((parsed as any).email || '');
        setLoginPassword((parsed as any).password || '');
      }
    } catch {
      localStorage.removeItem('saas_login_persist');
    }
  }, []);

  useEffect(() => {
    setSystemConfig(prev => {
      const currentMenu = prev.menuConfig || DEFAULT_SYSTEM_CONFIG.menuConfig;
      const updatedMenu = currentMenu.map(item => {
        if (item.id === 'indicacoes') {
          const needsUpdate = item.label !== 'Afiliados' || item.icon !== 'Crown' || item.color !== '#ADFF2F';
          if (needsUpdate) {
            return { ...item, label: 'Afiliados', icon: 'Crown', color: '#ADFF2F' };
          }
        }
        return item;
      });
      const changed = updatedMenu.some((item, index) => item !== currentMenu[index]);
      if (!changed) return prev;
      return { ...prev, menuConfig: updatedMenu };
    });
  }, []);

  const [canteenItems, setCanteenItems] = useState<CanteenItem[]>(() => {
    const saved = storage.get<CanteenItem[]>('terreiro_canteen_items');
    return Array.isArray(saved) ? saved : [];
  });
  const [canteenOrders, setCanteenOrders] = useState<CanteenOrder[]>(() => {
    const saved = storage.get<CanteenOrder[]>('terreiro_canteen_orders');
    return Array.isArray(saved) ? saved : [];
  });

  const [pontos, setPontos] = useState<Ponto[]>(() => {
    const saved = storage.get<Ponto[]>(STORAGE_KEYS.PONTOS);
    return Array.isArray(saved) ? saved : [];
  });

  const [rezas, setRezas] = useState<Reza[]>(() => {
    const saved = storage.get<Reza[]>(STORAGE_KEYS.REZAS);
    return Array.isArray(saved) ? saved : [];
  });

  const [broadcasts, setBroadcasts] = useState<GlobalBroadcast[]>(() => {
    const saved = storage.get<GlobalBroadcast[]>('saas_global_broadcasts');
    return Array.isArray(saved) ? saved : [];
  });
  const [roadmap, setRoadmap] = useState<ReleaseNote[]>(() => {
    const saved = storage.get<ReleaseNote[]>('saas_global_roadmap');
    return Array.isArray(saved) ? saved : [];
  });
  const [coupons, setCoupons] = useState<GlobalCoupon[]>(() => {
    const saved = storage.get<GlobalCoupon[]>('saas_global_coupons');
    return Array.isArray(saved) ? saved : [];
  });
  const [auditLogs, setAuditLogs] = useState<MasterAuditLog[]>(() => {
    const saved = storage.get<MasterAuditLog[]>('saas_master_audit_logs');
    return Array.isArray(saved) ? saved : [];
  });

  const [globalMaintenance, setGlobalMaintenance] = useState<GlobalMaintenanceConfig>(() => {
    const fallback: GlobalMaintenanceConfig = {
      active: false,
      message: 'Estamos em manutenção para melhorias técnicas. Voltaremos em breve!'
    };
    try {
      const saved = localStorage.getItem('saas_global_maintenance');
      if (!saved) {
        return fallback;
      }
      const parsed = JSON.parse(saved);
      if (parsed && typeof parsed === 'object' && 'active' in parsed) {
        return parsed as GlobalMaintenanceConfig;
      }
      return fallback;
    } catch {
      localStorage.removeItem('saas_global_maintenance');
      return fallback;
    }
  });

  useEffect(() => {
    if (!rememberAccess) {
      localStorage.removeItem('saas_login_persist');
      return;
    }
    try {
      const payload = {
        remember: true,
        email: loginEmail,
        password: loginPassword
      };
      localStorage.setItem('saas_login_persist', JSON.stringify(payload));
    } catch {
      // ignore
    }
  }, [rememberAccess, loginEmail, loginPassword]);

  const licenseState = useMemo(() => {
    if (!auth.isAuthenticated || auth.isMasterMode) return { valid: true, status: 'active' as const };
    const client = clients.find(c => c.adminEmail.toLowerCase() === auth.user?.email.toLowerCase());
    if (client) {
      if (client.status === 'blocked') return { valid: false, status: 'blocked' as const };
      if (client.status === 'frozen') return { valid: false, status: 'frozen' as const };
      const expiry = new Date(client.expirationDate + 'T23:59:59');
      const isValidLicense = isAfter(expiry, new Date()); 
      return { valid: isValidLicense, status: isValidLicense ? 'active' : 'expired' } as const;
    }
    return { valid: true, status: 'active' } as const;
  }, [clients, auth]);

  const currentClient = useMemo(() => {
    if (!auth.isAuthenticated || auth.isMasterMode) return null;
    return clients.find(c => c.adminEmail.toLowerCase() === auth.user?.email.toLowerCase());
  }, [clients, auth]);

  const masterSettings = useMemo(() => {
    const fallback = { 
      sidebarTitle: 'Sistema de Gestão de Terreiros', 
      brandLogo: MASTER_LOGO_URL, 
      systemTitle: 'ConectAxé Painel de Desenvolvedor' 
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

  const safeRoadmap = useMemo<ReleaseNote[]>(() => {
    if (!Array.isArray(roadmap)) return [];
    return roadmap.filter((item): item is ReleaseNote => {
      if (!item || typeof item !== 'object') return false;
      const anyItem = item as any;
      return typeof anyItem.id === 'string' && typeof anyItem.title === 'string';
    });
  }, [roadmap]);

  const userPermissions = useMemo(() => {
    if (!auth.user) return null;
    if (auth.user.role === 'admin' || auth.isMasterMode) return { view: true, add: true, edit: true, delete: true };
    return systemConfig.rolePermissions?.[auth.user.role]?.[activeTab] || { view: false, add: false, edit: false, delete: false };
  }, [auth.user, activeTab, systemConfig.rolePermissions, auth.isMasterMode]);

  useEffect(() => {
    const suffix = activeClientId ? `_${activeClientId}` : '';

    storage.set(`${STORAGE_KEYS.MEMBERS}${suffix}`, members);
    storage.set(`${STORAGE_KEYS.ENTITIES}${suffix}`, entities);
    storage.set(`terreiro_events${suffix}`, events);
    storage.set(`terreiro_courses${suffix}`, courses);
    storage.set(`terreiro_enrollments${suffix}`, enrollments);
    storage.set(`terreiro_attendance${suffix}`, attendanceRecords);
    storage.set(`terreiro_inventory_items${suffix}`, inventoryItems);
    storage.set(`terreiro_inventory_cats${suffix}`, inventoryCategories);
    storage.set(`terreiro_stock_logs${suffix}`, stockLogs);
    storage.set(`terreiro_donations${suffix}`, donations);
    storage.set(`terreiro_system_users${suffix}`, systemUsers);

    storage.set('terreiro_referrals', referrals);
    storage.set('terreiro_tickets', tickets);
    storage.set('terreiro_idcard_logs', idCardLogs);
    storage.set('saas_master_clients', clients);
    storage.set('saas_master_plans', plans);
    storage.set('saas_global_broadcasts', broadcasts);
    storage.set('saas_global_roadmap', safeRoadmap);
    storage.set('saas_global_coupons', coupons);
    storage.set('saas_master_audit_logs', auditLogs);
    storage.set(STORAGE_KEYS.PONTOS, pontos);
    storage.set(STORAGE_KEYS.REZAS, rezas);
    storage.set(`terreiro_canteen_items${suffix}`, canteenItems);
    storage.set(`terreiro_canteen_orders${suffix}`, canteenOrders);
    storage.set(STORAGE_KEYS.AUTH, auth);
    storage.set(STORAGE_KEYS.SYSTEM_CONFIG, systemConfig);
  }, [members, entities, events, courses, enrollments, attendanceRecords, inventoryItems, inventoryCategories, stockLogs, donations, systemUsers, referrals, tickets, idCardLogs, clients, plans, auth, systemConfig, broadcasts, safeRoadmap, coupons, auditLogs, canteenItems, canteenOrders, pontos, rezas, activeClientId]);

  useEffect(() => {
    const root = document.documentElement;
    root.style.setProperty('--primary-color', systemConfig.primaryColor);
    root.style.setProperty('--sidebar-color', systemConfig.sidebarColor);
    root.style.setProperty('--accent-color', systemConfig.accentColor);
  }, [systemConfig]);

  const handleEnterClientSystem = (client: SaaSClient) => {
    if (auth.isMasterMode) {
      const newAudit: MasterAuditLog = {
        id: Math.random().toString(36).substr(2, 9).toUpperCase(),
        timestamp: new Date().toISOString(),
        masterEmail: auth.user?.email || 'rodrigo@dev.com',
        clientId: client.id,
        clientName: client.name,
        action: 'Acesso Técnico Master à Instância'
      };
      setAuditLogs(prev => [newAudit, ...prev]);
    }

    setSystemConfig(prev => ({
      ...prev, systemName: client.name,
      license: { 
        status: client.status, 
        expirationDate: client.expirationDate, 
        planName: client.plan, 
        supportContact: 'rodrigo@dev.com', 
        paymentLink: '#', 
        affiliateLink: client.affiliateLink, 
        affiliateBlocked: client.affiliateBlocked,
        clientId: client.id
      }
    }));
    loadClientData(client.id);
    setActiveTab('dashboard');
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    const savedMaster = localStorage.getItem('saas_master_credentials');
    let master = { email: 'rodrigo@dev.com', password: 'master' };
    if (savedMaster) {
      try {
        const parsed = JSON.parse(savedMaster);
        if (parsed && typeof parsed === 'object') {
          master = { ...master, ...parsed };
        }
      } catch {
        localStorage.removeItem('saas_master_credentials');
      }
    }

    if (loginEmail.toLowerCase() === master.email.toLowerCase() && loginPassword === master.password) {
      setAuth({ user: { id: 'master', name: 'Rodrigo Master', email: master.email, role: 'admin', password: master.password }, isAuthenticated: true, isMasterMode: true });
      setActiveTab('developer-portal');
      return;
    }

    if (globalMaintenance.active) {
      setLoginError('SISTEMA EM MANUTENÇÃO GERAL. ACESSO SUSPENSO TEMPORARIAMENTE.');
      return;
    }
    
    const clientAdmin = clients.find(c => c.adminEmail.toLowerCase() === loginEmail.toLowerCase() && c.adminPassword === loginPassword);
    if (clientAdmin) {
      const updatedClients = clients.map(c => 
        c.id === clientAdmin.id ? { ...c, lastActivity: new Date().toISOString() } : c
      );
      setClients(updatedClients);
      const user: User = { id: clientAdmin.id, email: clientAdmin.adminEmail, name: clientAdmin.adminName, role: 'admin', password: clientAdmin.adminPassword };
      setAuth({ user, isAuthenticated: true, isMasterMode: false });
      handleEnterClientSystem(clientAdmin);
      return;
    }

    const user = systemUsers.find(u => u.email.toLowerCase() === loginEmail.toLowerCase() && u.password === loginPassword);
    if (user) {
      setAuth({ user, isAuthenticated: true, isMasterMode: false });
      setActiveTab('dashboard');
    } else { 
      setLoginError('Acesso Negado. Verifique e-mail e senha.'); 
    }
  };

  if (showEcosystemConcept) {
    return <EcosystemPreview onBack={() => setShowEcosystemConcept(false)} />;
  }

  if (!licenseState.valid) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center p-6">
        <div className="bg-white rounded-[2rem] shadow-2xl max-w-md w-full p-12 text-center">
          {licenseState.status === 'frozen' ? (
            <><Snowflake size={64} className="text-blue-400 mx-auto mb-6 animate-pulse" /><h1 className="text-2xl font-black text-slate-800 uppercase mb-4">Acesso Congelado</h1><p className="text-slate-500 mb-8 font-medium">Seu acesso foi temporariamente suspenso a pedido da administração.</p></>
          ) : (
            <><ShieldAlert size={64} className="text-red-600 mx-auto mb-6" /><h1 className="text-2xl font-black text-slate-800 uppercase mb-4">Acesso Bloqueado</h1><p className="text-slate-500 mb-8 font-medium">Sua licença expirou ou foi suspensa.</p></>
          )}
          <button onClick={() => setAuth({ user: null, isAuthenticated: false })} className="text-indigo-600 font-bold uppercase text-xs hover:underline">Sair do Sistema</button>
        </div>
      </div>
    );
  }

  const currentSystemVersion = useMemo(() => {
    if (!safeRoadmap.length) return '0.0.0';
    const sorted = [...safeRoadmap].sort((a, b) => {
      const vA = a.version.split('.').map(Number);
      const vB = b.version.split('.').map(Number);
      for (let i = 0; i < Math.max(vA.length, vB.length); i++) {
         const numA = vA[i] || 0;
         const numB = vB[i] || 0;
         if (numA > numB) return -1;
         if (numA < numB) return 1;
      }
      return 0;
    });
    return sorted[0]?.version || '0.0.0';
  }, [safeRoadmap]);

  if (auth.isAuthenticated) {
    return (
      <Layout 
        user={auth.user!} 
        config={systemConfig} 
        onLogout={() => setAuth({ user: null, isAuthenticated: false })} 
        activeTab={activeTab} 
        setActiveTab={setActiveTab} 
        isMasterMode={auth.isMasterMode}
        systemVersion={currentSystemVersion}
      >
        {activeTab === 'dashboard' && <Dashboard members={members} config={systemConfig} events={events} roadmap={safeRoadmap} broadcasts={broadcasts} />}
        {activeTab === 'agenda' && <AgendaManagement events={events} members={members} config={systemConfig} user={auth.user!} onAddEvent={e => setEvents(prev => [e as CalendarEvent, ...prev])} onUpdateEvent={(id, data) => setEvents(prev => prev.map(e => e.id === id ? { ...e, ...data } : e))} onDeleteEvent={id => setEvents(prev => prev.filter(e => e.id !== id))} />}
        {activeTab === 'ead' && <EadPlatform user={auth.user!} members={members} courses={courses} enrollments={enrollments} config={systemConfig} onEnroll={(mid, cid) => setEnrollments([...enrollments, { id: Math.random().toString(), memberId: mid, courseId: cid, enrolledAt: new Date().toISOString(), progress: [] }])} onUpdateProgress={(eid, lid) => setEnrollments(enrollments.map(e => e.id === eid ? { ...e, progress: e.progress.includes(lid) ? e.progress.filter(id => id !== lid) : [...e.progress, lid] } : e))} onCompleteCourse={eid => setEnrollments(enrollments.map(e => e.id === eid ? { ...e, completedAt: new Date().toISOString() } : e))} />}
        {activeTab === 'course-mgmt' && <CourseManagement courses={courses} members={members} enrollments={enrollments} config={systemConfig} onAddCourse={c => { const newId = `CR-${Math.random().toString(36).substr(2, 6).toUpperCase()}`; setCourses([{ ...c, id: newId, createdAt: new Date().toISOString() } as Course, ...courses]); }} onUpdateCourse={(id, data) => setCourses(courses.map(c => c.id === id ? { ...c, ...data } : c))} onDeleteCourse={id => setCourses(courses.filter(c => c.id !== id))} onUpdateConfig={setSystemConfig} />}
        
        {(activeTab === 'canteen-pdv' || activeTab === 'canteen-mgmt' || activeTab === 'canteen-history') && (
           <CanteenManagement activeTab={activeTab} setActiveTab={setActiveTab} items={canteenItems} orders={canteenOrders} config={systemConfig} user={auth.user!} onAddItem={(item) => setCanteenItems([{...item, id: Math.random().toString(36).substr(2,9)} as CanteenItem, ...canteenItems])} onUpdateItem={(id, data) => setCanteenItems(canteenItems.map(i => i.id === id ? {...i, ...data} : i))} onDeleteItem={(id) => setCanteenItems(canteenItems.filter(i => i.id !== id))} onAddOrder={(order) => { setCanteenOrders([order, ...canteenOrders]); const updatedItems = canteenItems.map(item => { const soldItem = order.items.find(si => si.itemId === item.id); if(soldItem) return {...item, stock: Math.max(0, item.stock - soldItem.quantity)}; return item; }); setCanteenItems(updatedItems); }} />
        )}

        {activeTab === 'members' && <MemberManagement members={members} entities={entities} permissions={userPermissions!} config={systemConfig} currentUser={auth.user!} onAddMember={m => { const lastId = members.reduce((max, cur) => Math.max(max, parseInt(cur.id) || 0), 0); const newId = (lastId + 1).toString(); const photo = m.photo && m.photo.trim() !== '' ? m.photo : '/images/membro.png'; setMembers([{ ...m, id: newId, photo, createdAt: new Date().toISOString() } as Member, ...members]); }} onUpdateMember={(id, data) => setMembers(members.map(m => m.id === id ? { ...m, ...data } : m))} onDeleteMember={id => setMembers(members.filter(m => m.id !== id))} />}
        {activeTab === 'mediums' && <MediumManagement members={members} entities={entities} config={systemConfig} onUpdateMemberSpiritualInfo={(mid, eids, enms) => setMembers(members.map(m => m.id === mid ? { ...m, assignedEntities: eids, entityNames: enms } : m))} />}
        {activeTab === 'idcards' && <IDCardManagement members={members} entities={entities} logs={idCardLogs} config={systemConfig} onUpdateLogs={setIdCardLogs} onUpdateConfig={setSystemConfig} currentUser={auth.user!} />}
        {activeTab === 'attendance' && <AttendanceManagement members={members} attendanceRecords={attendanceRecords} config={systemConfig} onUpdateAttendance={setAttendanceRecords} />}
        {activeTab === 'inventory-dashboard' && <InventoryDashboard items={inventoryItems} categories={inventoryCategories} config={systemConfig} />}
        {activeTab === 'inventory' && <InventoryManagement items={inventoryItems} categories={inventoryCategories} logs={stockLogs} config={systemConfig} onAddCategory={(name) => setInventoryCategories([...inventoryCategories, { id: Math.random().toString(), name }])} onDeleteItem={(id) => setInventoryItems(inventoryItems.filter(i => i.id !== id))} onAddItem={(item) => setInventoryItems([...inventoryItems, { ...item, id: Math.random().toString() } as InventoryItem])} />}
        {activeTab === 'inventory-entry' && <InventoryEntry items={inventoryItems} categories={inventoryCategories} onSaveUpdates={(up) => { const newLogs: StockLog[] = []; const updatedItems = inventoryItems.map(i => { const u = up.find(x => x.id === i.id); if (u && u.currentStock !== i.currentStock) { newLogs.push({ id: Math.random().toString(36).substr(2, 9), itemId: i.id, itemName: i.name, previousStock: i.currentStock, newStock: u.currentStock, change: u.currentStock - i.currentStock, date: new Date().toISOString(), responsible: auth.user?.name || 'Sistema', type: u.currentStock > i.currentStock ? 'entrada' : 'saida' }); return { ...i, currentStock: u.currentStock }; } return i; }); setInventoryItems(updatedItems); setStockLogs([...newLogs, ...stockLogs]); if (newLogs.length > 0) alert(`${newLogs.length} movimentações registradas!`); }} />}
        {activeTab === 'mensalidades' && <FinancialManagement members={members} config={systemConfig} onUpdatePayment={(mid, mk, st) => setMembers(p => p.map(m => m.id === mid ? { ...m, monthlyPayments: { ...(m.monthlyPayments || {}), [mk]: st } } : m))} />}
        {activeTab === 'donations' && <DonationManagement donations={donations} inventoryItems={inventoryItems} config={systemConfig} onAddDonation={d => setDonations([...donations, d as Donation])} onDeleteDonation={id => setDonations(donations.filter(d => d.id !== id))} />}
        {activeTab === 'finance-reports' && <FinancialReports members={members} donations={donations} config={systemConfig} />}
        {activeTab === 'finance-config' && <FinancialConfigComponent config={systemConfig} onUpdateConfig={setSystemConfig} />}
        {activeTab === 'layout' && <SystemConfigManagement config={systemConfig} onUpdateConfig={setSystemConfig} />}
        {activeTab === 'users' && <UserManagement users={systemUsers} config={systemConfig} onAddUser={u => setSystemUsers([...systemUsers, u as User])} onUpdateUser={(id, data) => setSystemUsers(systemUsers.map(u => u.id === id ? { ...u, ...data } : u))} onDeleteUser={id => setSystemUsers(systemUsers.filter(u => u.id !== id))} onUpdateConfig={setSystemConfig} />}
        {activeTab === 'entities' && <EntityManagement entities={entities} permissions={userPermissions!} config={systemConfig} onUpdateConfig={setSystemConfig} onAddEntity={(n, t) => setEntities([...entities, { id: Math.random().toString(), name: n, type: t }])} onDeleteEntity={id => setEntities(entities.filter(e => e.id !== id))} />}
        {activeTab === 'entity-images' && <EntityImageManagement entities={entities} config={systemConfig} onUpdateEntity={(id, data) => setEntities(entities.map(e => e.id === id ? { ...e, ...data } : e))} />}
        {activeTab === 'permissions' && <PermissionManagement config={systemConfig} onUpdateConfig={setSystemConfig} />}
        {activeTab === 'backup' && <BackupSystem user={auth.user!} config={systemConfig} onRestoreFromBackup={d => { Object.keys(d).forEach(k => localStorage.setItem(k, JSON.stringify(d[k]))); window.location.reload(); }} />}
        {activeTab === 'restore-system' && <RestoreSystem user={auth.user!} config={systemConfig} onRestore={() => { localStorage.clear(); window.location.reload(); }} />}
        {activeTab === 'saas-manager' && <SaaSManager config={systemConfig} onUpdateConfig={setSystemConfig} isMasterMode={auth.isMasterMode} clientData={currentClient} />}
        {activeTab === 'indicacoes' && <AffiliateSystem config={systemConfig} referrals={referrals.filter(r => r.referrerId === (systemConfig.license?.affiliateLink?.split('ref=')[1] || ''))} />}
        {activeTab === 'support-client' && <TicketSystem user={auth.user!} config={systemConfig} tickets={tickets} onUpdateTickets={setTickets} />}
        {activeTab === 'news-announcements' && <RoadmapHistory roadmap={safeRoadmap} broadcasts={broadcasts} clientId={currentClient?.id || auth.user?.id || 'default'} />}
        {activeTab === 'master-menu' && <MenuManager config={systemConfig} onUpdateConfig={setSystemConfig} />}
        {activeTab === 'media-pontos' && (
          <MediaPontos 
            pontos={pontos} 
            config={systemConfig} 
            onAddPonto={p => setPontos([p, ...pontos])} 
            onUpdatePonto={(id, data) => setPontos(pontos.map(p => p.id === id ? { ...p, ...data } : p))} 
            onDeletePonto={id => setPontos(pontos.filter(p => p.id !== id))} 
          />
        )}
        {activeTab === 'media-rezas' && (
          <MediaRezas 
            rezas={rezas} 
            config={systemConfig} 
            onAddReza={r => setRezas([r, ...rezas])} 
            onUpdateReza={(id, data) => setRezas(rezas.map(r => r.id === id ? { ...r, ...data } : r))} 
            onDeleteReza={id => setRezas(rezas.filter(r => r.id !== id))} 
          />
        )}
        
        {auth.isMasterMode && ['developer-portal', 'master-payments', 'master-affiliates', 'system-maintenance', 'master-backups', 'tickets', 'master-broadcast', 'master-roadmap', 'master-system-config', 'master-coupons', 'master-audit'].includes(activeTab) && (
          <SafeMasterPortal
            onReset={() => {
              localStorage.removeItem('terreiro_referrals');
              localStorage.removeItem('saas_master_clients');
              localStorage.removeItem('saas_global_roadmap');
              localStorage.removeItem('saas_global_broadcasts');
              localStorage.removeItem('saas_master_audit_logs');
              window.location.reload();
            }}
          >
            <DeveloperPortal onLogout={() => setAuth({ user: null, isAuthenticated: false })} onEnterClientSystem={handleEnterClientSystem} referrals={referrals} onUpdateReferral={(id, st) => setReferrals(referrals.map(r => r.id === id ? { ...r, status: st } : r))} clients={clients} onUpdateClients={setClients} plans={plans} onUpdatePlans={setPlans} externalTab={activeTab} onTabChange={setActiveTab} maintConfig={globalMaintenance} onUpdateMaintenance={setGlobalMaintenance} tickets={tickets} onUpdateTickets={setTickets} broadcasts={broadcasts} onUpdateBroadcasts={setBroadcasts} roadmap={safeRoadmap} onUpdateRoadmap={setRoadmap} coupons={coupons} onUpdateCoupons={setCoupons} auditLogs={auditLogs} />
          </SafeMasterPortal>
        )}
      </Layout>
    );
  }

  if (globalMaintenance.active) {
    const savedMaster = localStorage.getItem('saas_master_credentials');
    let masterEmail = 'rodrigo@dev.com';
    if (savedMaster) {
      try {
        const parsed = JSON.parse(savedMaster);
        if (parsed && typeof parsed === 'object' && typeof (parsed as any).email === 'string') {
          masterEmail = (parsed as any).email;
        }
      } catch {
        localStorage.removeItem('saas_master_credentials');
      }
    }
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center p-6">
        <div className="bg-white rounded-[3rem] shadow-2xl max-w-2xl w-full overflow-hidden border border-white/20">
          <div className="p-12 bg-orange-600 text-white text-center"><Wrench size={48} className="mx-auto mb-6" /><h1 className="text-4xl font-black uppercase tracking-tighter mb-4">Manutenção</h1></div>
          <div className="p-12 text-center space-y-6"><p className="text-xl font-bold text-slate-700 leading-relaxed italic">"{globalMaintenance.message}"</p><div className="pt-4"><form onSubmit={handleLogin} className="flex gap-3 max-w-sm mx-auto"><input type="password" placeholder="Chave de Mestre" className="flex-1 p-4 bg-slate-100 border border-slate-200 rounded-2xl outline-none focus:ring-2 focus:ring-orange-500 transition-all font-bold text-sm" value={loginPassword} onChange={e => {setLoginPassword(e.target.value); setLoginEmail(masterEmail);}} /><button className="px-8 bg-slate-900 text-white rounded-2xl font-black uppercase text-xs">Entrar</button></form></div></div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-slate-900">
      <div className="bg-white rounded-[2.5rem] shadow-2xl w-full max-w-md overflow-hidden">
        <div className="p-10 text-white text-center bg-indigo-900 flex flex-col items-center" style={{ backgroundColor: systemConfig.primaryColor }}>
            <img src={masterSettings.brandLogo || MASTER_LOGO_URL} className="w-64 h-auto mx-auto mb-6 object-contain" />
            <h1 className="text-sm font-black tracking-widest whitespace-nowrap">{masterSettings.sidebarTitle}</h1>
        </div>
        <form onSubmit={handleLogin} className="p-10 space-y-4">
            {loginError && (
              <div className="bg-red-50 text-red-500 p-4 rounded-2xl flex items-center gap-3 text-xs font-bold animate-pulse">
                <AlertCircle size={16} />
                {loginError}
              </div>
            )}
            <input type="email" className="w-full p-4 bg-gray-50 border border-gray-200 rounded-2xl outline-none font-bold text-sm focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition-all" placeholder="E-mail" value={loginEmail} onChange={e => { setLoginEmail(e.target.value); setLoginError(''); }} />
            <input type="password" className="w-full p-4 bg-gray-50 border border-gray-200 rounded-2xl outline-none font-bold text-sm focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition-all" placeholder="Senha" value={loginPassword} onChange={e => { setLoginPassword(e.target.value); setLoginError(''); }} />
            <label className="flex items-center gap-2 mt-2 cursor-pointer select-none">
              <input
                type="checkbox"
                className="w-4 h-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                checked={rememberAccess}
                onChange={e => setRememberAccess(e.target.checked)}
              />
              <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">
                Salvar acesso neste dispositivo
              </span>
            </label>
            <button type="submit" className="w-full py-5 bg-indigo-900 text-white font-black rounded-2xl shadow-lg uppercase text-xs tracking-widest hover:shadow-xl hover:scale-[1.02] transition-all active:scale-95" style={{ backgroundColor: systemConfig.primaryColor }}>Entrar no Painel</button>
            <button type="button" onClick={() => setShowEcosystemConcept(true)} className="w-full py-3 mt-4 bg-slate-50 text-slate-400 border border-slate-100 rounded-2xl font-black text-[9px] uppercase hover:bg-slate-100 transition-all flex items-center justify-center gap-2"><Layers size={14} /> Ver Conceito SaaS</button>
        </form>
      </div>
    </div>
  );
};

export default App;
