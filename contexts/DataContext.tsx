import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import { isAfter } from 'date-fns';
import { MemberService } from '../services/memberService';
import { FinancialService } from '../services/financialService';
import { SystemConfigService } from '../services/systemConfigService';
import { MasterService } from '../services/masterService';
import { InventoryService } from '../services/inventoryService';
import { CanteenService } from '../services/canteenService';
import { EventService } from '../services/eventService';
import { MediaService } from '../services/mediaService';
import { AuthService } from '../services/authService';
import { UserPreferenceService, UserPreferences } from '../services/userPreferenceService';
import { PlatformService } from '../services/platformService';
import { UserService } from '../services/userService';
import { EntityService } from '../services/entityService';
import { CourseService } from '../services/courseService';
import { AttendanceService } from '../services/attendanceService';
import { IdCardService } from '../services/idCardService';
import { 
  Member, Consulente, User, SpiritualEntity, InventoryItem, InventoryCategory, 
  SystemConfig, CalendarEvent, Course, Enrollment, AttendanceRecord, SaaSClient, 
  Donation, Referral, SaaSPlan, SupportTicket, IDCardLog, StockLog, 
  MasterAuditLog, CanteenItem, CanteenOrder, TerreiroEvent, EventTicket, 
  Ponto, Reza, Erva, Banho, ReleaseNote, GlobalBroadcast, GlobalCoupon, StaffPermissions,
  FinancialTransaction, MasterGlobalConfig, GlobalMaintenanceConfig, CertificateConfig
} from '../types';
import { 
  DEFAULT_SYSTEM_CONFIG, INITIAL_ENTITIES, DEFAULT_ENTITY_IMAGES, 
  INITIAL_SAAS_PLANS 
} from '../constants';
import { generateUUID } from '../utils/ids';
import { useAuth } from './AuthContext';

interface DataContextType {
  // States
  systemUsers: User[];
  setSystemUsers: React.Dispatch<React.SetStateAction<User[]>>;
  members: Member[];
  setMembers: React.Dispatch<React.SetStateAction<Member[]>>;
  consulentes: Consulente[];
  setConsulentes: React.Dispatch<React.SetStateAction<Consulente[]>>;
  entities: SpiritualEntity[];
  setEntities: React.Dispatch<React.SetStateAction<SpiritualEntity[]>>;
  events: CalendarEvent[];
  setEvents: React.Dispatch<React.SetStateAction<CalendarEvent[]>>;
  courses: Course[];
  setCourses: React.Dispatch<React.SetStateAction<Course[]>>;
  enrollments: Enrollment[];
  setEnrollments: React.Dispatch<React.SetStateAction<Enrollment[]>>;
  attendanceRecords: AttendanceRecord[];
  setAttendanceRecords: React.Dispatch<React.SetStateAction<AttendanceRecord[]>>;
  inventoryItems: InventoryItem[];
  setInventoryItems: React.Dispatch<React.SetStateAction<InventoryItem[]>>;
  inventoryCategories: InventoryCategory[];
  setInventoryCategories: React.Dispatch<React.SetStateAction<InventoryCategory[]>>;
  stockLogs: StockLog[];
  setStockLogs: React.Dispatch<React.SetStateAction<StockLog[]>>;
  donations: Donation[];
  setDonations: React.Dispatch<React.SetStateAction<Donation[]>>;
  referrals: Referral[];
  setReferrals: React.Dispatch<React.SetStateAction<Referral[]>>;
  tickets: SupportTicket[];
  setTickets: React.Dispatch<React.SetStateAction<SupportTicket[]>>;
  idCardLogs: IDCardLog[];
  setIdCardLogs: React.Dispatch<React.SetStateAction<IDCardLog[]>>;
  plans: SaaSPlan[];
  setPlans: React.Dispatch<React.SetStateAction<SaaSPlan[]>>;
  clients: SaaSClient[];
  setClients: React.Dispatch<React.SetStateAction<SaaSClient[]>>;
  systemConfig: SystemConfig;
  setSystemConfig: React.Dispatch<React.SetStateAction<SystemConfig>>;
  canteenItems: CanteenItem[];
  setCanteenItems: React.Dispatch<React.SetStateAction<CanteenItem[]>>;
  canteenOrders: CanteenOrder[];
  setCanteenOrders: React.Dispatch<React.SetStateAction<CanteenOrder[]>>;
  terreiroEvents: TerreiroEvent[];
  setTerreiroEvents: React.Dispatch<React.SetStateAction<TerreiroEvent[]>>;
  eventTickets: EventTicket[];
  setEventTickets: React.Dispatch<React.SetStateAction<EventTicket[]>>;
  pontos: Ponto[];
  setPontos: React.Dispatch<React.SetStateAction<Ponto[]>>;
  rezas: Reza[];
  setRezas: React.Dispatch<React.SetStateAction<Reza[]>>;
  ervas: Erva[];
  setErvas: React.Dispatch<React.SetStateAction<Erva[]>>;
  banhos: Banho[];
  setBanhos: React.Dispatch<React.SetStateAction<Banho[]>>;
  auditLogs: MasterAuditLog[];
  setAuditLogs: React.Dispatch<React.SetStateAction<MasterAuditLog[]>>;
  broadcasts: GlobalBroadcast[];
  setBroadcasts: React.Dispatch<React.SetStateAction<GlobalBroadcast[]>>;
  roadmap: ReleaseNote[];
  setRoadmap: React.Dispatch<React.SetStateAction<ReleaseNote[]>>;
  coupons: GlobalCoupon[];
  setCoupons: React.Dispatch<React.SetStateAction<GlobalCoupon[]>>;
  globalMaintenance: GlobalMaintenanceConfig;
  setGlobalMaintenance: React.Dispatch<React.SetStateAction<GlobalMaintenanceConfig>>;
  
  // User Preferences
  userPreferences: UserPreferences;
  updateUserPreferences: (prefs: Partial<UserPreferences>) => Promise<void>;

  // Simulation Mode
  isSimulation: boolean;
  setIsSimulation: React.Dispatch<React.SetStateAction<boolean>>;
  
  // Helpers & Derived
  loadClientData: (clientId: string) => void;
  activeClientId: string | undefined;
  currentClient: SaaSClient | null;
  currentPlan: SaaSPlan | null;
  licenseState: { valid: boolean; status: 'active' | 'expired' | 'blocked' | 'frozen' };
  userPermissions: StaffPermissions | undefined;

  // Phase 2 Exports
  transactions: FinancialTransaction[];
  setTransactions: React.Dispatch<React.SetStateAction<FinancialTransaction[]>>;
  addTransaction: (transaction: FinancialTransaction) => void;
  updateTransaction: (id: string, data: Partial<FinancialTransaction>) => void;
  deleteTransaction: (id: string) => void;
  masterGlobalConfig: MasterGlobalConfig | null;
  setMasterGlobalConfig: React.Dispatch<React.SetStateAction<MasterGlobalConfig | null>>;

  // Actions
  addMember: (data: Partial<Member>, isConsulente?: boolean) => void;
  updateMember: (id: string, data: Partial<Member>) => void;
  deleteMember: (id: string) => void;
  updateProfile: (data: Partial<User>) => void;
  addInventoryItem: (item: InventoryItem) => void;
  updateInventoryItem: (id: string, data: Partial<InventoryItem>) => void;
  deleteInventoryItem: (id: string) => void;
  addInventoryCategory: (name: string) => void;
  deleteInventoryCategory: (id: string) => void;
  processInventoryEntry: (updates: { id: string, currentStock: number }[]) => void;
  addCanteenOrder: (order: CanteenOrder) => void;
  addCanteenItem: (item: CanteenItem) => void;
  updateCanteenItem: (id: string, data: Partial<CanteenItem>) => void;
  deleteCanteenItem: (id: string) => void;
  registerPublicEvent: (ticketData: any, eventId: string) => Promise<EventTicket>;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

export const DataProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, isAuthenticated, isMasterMode, setAuth } = useAuth();
  
  // Initialize States
  const [systemUsers, setSystemUsers] = useState<User[]>([]);
  
  // FIREBASE MIGRATION: Initialize with empty/default, load via useEffect
  const [members, setMembers] = useState<Member[]>([]);
  const [consulentes, setConsulentes] = useState<Consulente[]>([]);
  
  const [entities, setEntities] = useState<SpiritualEntity[]>([]);

  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [enrollments, setEnrollments] = useState<Enrollment[]>([]);
  const [attendanceRecords, setAttendanceRecords] = useState<AttendanceRecord[]>([]);
  const [inventoryItems, setInventoryItems] = useState<InventoryItem[]>([]);
  const [inventoryCategories, setInventoryCategories] = useState<InventoryCategory[]>([]);
  const [stockLogs, setStockLogs] = useState<StockLog[]>([]);
  
  const [donations, setDonations] = useState<Donation[]>([]);
  
  const [referrals, setReferrals] = useState<Referral[]>([]);
  
  const [tickets, setTickets] = useState<SupportTicket[]>([]);
  
  const [idCardLogs, setIdCardLogs] = useState<IDCardLog[]>([]);
  
  const [plans, setPlans] = useState<SaaSPlan[]>(INITIAL_SAAS_PLANS);
  
  const [clients, setClients] = useState<SaaSClient[]>([]);

  const [systemConfig, setSystemConfig] = useState<SystemConfig>(DEFAULT_SYSTEM_CONFIG);

  const [canteenItems, setCanteenItems] = useState<CanteenItem[]>([]);
  const [canteenOrders, setCanteenOrders] = useState<CanteenOrder[]>([]);
  
  const [terreiroEvents, setTerreiroEvents] = useState<TerreiroEvent[]>([]);
  const [eventTickets, setEventTickets] = useState<EventTicket[]>([]);

  const [pontos, setPontos] = useState<Ponto[]>([]);
  const [rezas, setRezas] = useState<Reza[]>([]);
  const [ervas, setErvas] = useState<Erva[]>([]);
  const [banhos, setBanhos] = useState<Banho[]>([]);

  const [auditLogs, setAuditLogs] = useState<MasterAuditLog[]>([]);
  const [broadcasts, setBroadcasts] = useState<GlobalBroadcast[]>([]);
  const [roadmap, setRoadmap] = useState<ReleaseNote[]>([]);
  const [coupons, setCoupons] = useState<GlobalCoupon[]>([]);
  const [globalMaintenance, setGlobalMaintenance] = useState<GlobalMaintenanceConfig>({ active: false, message: '' });
  const [userPreferences, setUserPreferences] = useState<UserPreferences>({ dismissedRoadmapIds: [], dismissedBroadcastIds: [] });

  // Load User Preferences
  useEffect(() => {
    const loadPrefs = async () => {
      if (user?.id) {
        const prefs = await UserPreferenceService.getPreferences(user.id);
        setUserPreferences(prefs);
      } else {
        setUserPreferences({ dismissedRoadmapIds: [], dismissedBroadcastIds: [] });
      }
    };
    loadPrefs();
  }, [user?.id]);

  const updateUserPreferences = useCallback(async (prefs: Partial<UserPreferences>) => {
    if (!user?.id) return;
    
    setUserPreferences(prev => {
      const updated = { ...prev, ...prefs };
      UserPreferenceService.savePreferences(user.id, updated).catch(err => console.error("Error saving user preferences:", err));
      return updated;
    });
  }, [user?.id]);

  // --- Phase 2: Ledger & Config Implementation ---
  const [transactions, setTransactions] = useState<FinancialTransaction[]>([]);

  const [masterGlobalConfig, setMasterGlobalConfig] = useState<MasterGlobalConfig | null>(null);

  const [isSimulation, setIsSimulation] = useState(false);

  // --- DERIVED STATE ---
  // ORDER IS CRITICAL: currentClient -> activeClientId -> others
  
  // 1. Determine Current Client (from Email or ID)
  const currentClient = useMemo(() => {
    if (!isAuthenticated || isMasterMode) return null;
    
    // 1. Try to match by Admin Email (Owner)
    const userEmail = user?.email || '';
    if (userEmail) {
      const byEmail = clients.find(c => c && (c.adminEmail || '').toLowerCase() === userEmail.toLowerCase());
      if (byEmail) return byEmail;
    }

    // 2. Try to match by user.clientId (Staff/Secondary User)
    if (user?.clientId) {
      return clients.find(c => c.id === user.clientId) || null;
    }

    return null;
  }, [clients, user, isAuthenticated, isMasterMode]);

  // 2. Determine Active Client ID (Depends on currentClient)
  const activeClientId = useMemo(() => {
    // Priority: User's explicitly assigned clientId > System Config License > Current Client (Admin)
    if (user?.clientId) return user.clientId;
    if (systemConfig.license?.clientId) return systemConfig.license.clientId;
    
    // SAFE ACCESS: Check if currentClient is defined and has an ID
    if (currentClient && currentClient.id) {
      return currentClient.id;
    }
    
    return undefined;
  }, [user, systemConfig, currentClient]);

  // 3. Other Derived States
  const currentPlan = useMemo(() => {
    if (!currentClient) return null;
    return plans.find(p => p.name === currentClient.plan) || null;
  }, [currentClient, plans]);

  const licenseState = useMemo(() => {
    if (!isAuthenticated || isMasterMode) return { valid: true, status: 'active' as const };
    const userEmail = user?.email || '';
    if (!userEmail) return { valid: true, status: 'active' as const };
    
    const client = clients.find(c => c && (c.adminEmail || '').toLowerCase() === userEmail.toLowerCase());
    if (client) {
      if (client.status === 'blocked') return { valid: false, status: 'blocked' as const };
      if (client.status === 'frozen') return { valid: false, status: 'frozen' as const };
      const expiry = new Date(client.expirationDate + 'T23:59:59');
      const isValidLicense = isAfter(expiry, new Date()); 
      return { valid: isValidLicense, status: isValidLicense ? 'active' : 'expired' } as const;
    }
    return { valid: true, status: 'active' as const };
  }, [clients, user, isAuthenticated, isMasterMode]);

  // --- ACTIONS ---

  const loadClientData = useCallback(async (clientId: string) => {
    try {
      // Load Client Info (Plan, Status, etc) - Critical for secondary users to resolve currentClient
      const clientDoc = await MasterService.getClient(clientId);
      if (clientDoc) {
          setClients(prev => {
              if (prev.some(c => c.id === clientDoc.id)) return prev.map(c => c.id === clientDoc.id ? clientDoc : c);
              return [...prev, clientDoc];
          });
      }

      const config = await SystemConfigService.getConfig(clientId);
      const configWithId = { 
        ...config, 
        license: { 
          ...config.license, 
          clientId: clientId 
        } 
      };
      setSystemConfig(configWithId);
      
      // Load System Users
      const users = await UserService.getAllUsers(clientId);
      setSystemUsers(users);
    } catch (e) {
      console.error("Error loading client data:", e);
    }
  }, []);

  // Handle Initial Data Loading
  useEffect(() => {
    if (isAuthenticated) {
      if (isMasterMode) {
        // Master doesn't load client-specific data by default
      } else if (user?.clientId) {
        // Client Admin / System User
        loadClientData(user.clientId);
      }
    }
  }, [isAuthenticated, user, isMasterMode, loadClientData]);

  const addTransaction = async (transaction: FinancialTransaction) => {
    try {
      if (!activeClientId) throw new Error("No active client");
      await FinancialService.saveTransaction(activeClientId, transaction);
      setTransactions(prev => [...prev, transaction]);
    } catch (error) {
       console.error("Erro ao salvar transação:", error);
    }
  };

  const updateTransaction = async (id: string, data: Partial<FinancialTransaction>) => {
    setTransactions(prev => {
      const current = prev.find(t => t.id === id);
      if (!current) return prev;
      const updated = { ...current, ...data };
      
      if (activeClientId) {
        FinancialService.saveTransaction(activeClientId, updated).catch(err => {
          console.error("Erro ao atualizar transação:", err);
        });
      }
      
      return prev.map(t => t.id === id ? updated : t);
    });
  };

  const deleteTransaction = async (id: string) => {
    try {
      if (!activeClientId) throw new Error("No active client");
      await FinancialService.deleteTransaction(activeClientId, id);
      setTransactions(prev => prev.filter(t => t.id !== id));
    } catch (error) {
       console.error("Erro ao excluir transação:", error);
    }
  };

  // Derived user permissions
  const userPermissions = useMemo(() => {
    if (!user || !systemConfig) return undefined;

    // If role permissions exist for the user's role, return them
    // Note: 'admin' role usually doesn't have entries in rolePermissions (implicit full access),
    // so it falls through to undefined, triggering the default full access in components.
    if (systemConfig.rolePermissions && systemConfig.rolePermissions[user.role]) {
      return systemConfig.rolePermissions[user.role];
    }

    return undefined; 
  }, [user, systemConfig]);

  // --- MASTER DATA LOADING ---
  useEffect(() => {
    const loadMasterData = async () => {
      if (!isMasterMode && !isAuthenticated) return;

      try {
        // Plans
        let fetchedPlans = await MasterService.getAllPlans();
        if (fetchedPlans.length === 0) {
             await Promise.all(INITIAL_SAAS_PLANS.map(p => MasterService.savePlan(p)));
             fetchedPlans = INITIAL_SAAS_PLANS;
        }
        setPlans(fetchedPlans);

        // Clients
        let fetchedClients = await MasterService.getAllClients();
        // Filter out any invalid clients to prevent rendering errors
        setClients(fetchedClients.filter(c => c && c.id));

        // Broadcasts
        let fetchedBroadcasts = await PlatformService.getBroadcasts();
        setBroadcasts(fetchedBroadcasts);

        // Roadmap
        let fetchedRoadmap = await MasterService.getAllRoadmap();
        setRoadmap(fetchedRoadmap);

        // Coupons
        let fetchedCoupons = await MasterService.getAllCoupons();
        setCoupons(fetchedCoupons);

        // Audit Logs
        let fetchedAuditLogs = await MasterService.getAllAuditLogs();
        setAuditLogs(fetchedAuditLogs);
        
        // Maintenance
        const fetchedMaintenance = await MasterService.getGlobalMaintenance();
        setGlobalMaintenance(fetchedMaintenance);
        
        // Master Config
        const masterConfig = await MasterService.getMasterGlobalConfig();
        if (masterConfig) {
           setMasterGlobalConfig(masterConfig);
        }

      } catch (error) {
        console.error("Error loading master data:", error);
      }
    };

    loadMasterData();
  }, [isMasterMode, isAuthenticated]);

  // --- CLIENT DATA LOADING ---
  useEffect(() => {
    const loadClientDataFromFirebase = async () => {
      if (!activeClientId) {
        // Reset client data if no active client
        setMembers([]);
        setTransactions([]);
        setInventoryItems([]);
        setInventoryCategories([]);
        setStockLogs([]);
        setCanteenItems([]);
        setCanteenOrders([]);
        setTerreiroEvents([]);
        setEventTickets([]);
        setDonations([]);
        setEvents([]);
        setPontos([]);
        setRezas([]);
        setErvas([]);
        setBanhos([]);
        setAttendanceRecords([]);
        setIdCardLogs([]);
        setSystemUsers([]);
        setEntities([]);
        setCourses([]);
        setEnrollments([]);
        return;
      }

      try {
        console.log('Loading client data from Firebase for:', activeClientId);
        
        // Load System Config for Client
        const config = await SystemConfigService.getConfig(activeClientId);
        setSystemConfig(config);

        // Load Client Data
        const [
            fetchedMembers, 
            fetchedTransactions, 
            fetchedInventoryItems, 
            fetchedInventoryCategories, 
            fetchedStockLogs,
            fetchedCanteenItems,
            fetchedCanteenOrders,
            fetchedEvents,
            fetchedTickets,
            fetchedDonations,
            fetchedCalendarEvents,
            fetchedPontos,
            fetchedRezas,
            fetchedErvas,
            fetchedBanhos,
            fetchedSystemUsers,
            fetchedEntities,
            fetchedCourses,
            fetchedEnrollments,
            fetchedAttendanceRecords,
            fetchedIdCardLogs
          ] = await Promise.all([
            MemberService.getAllMembers(activeClientId),
            FinancialService.getAllTransactions(activeClientId),
            InventoryService.getAllItems(activeClientId),
            InventoryService.getAllCategories(activeClientId),
            InventoryService.getAllLogs(activeClientId),
            CanteenService.getAllItems(activeClientId),
            CanteenService.getAllOrders(activeClientId),
            EventService.getAllEvents(activeClientId),
            EventService.getAllTickets(activeClientId),
            FinancialService.getAllDonations(activeClientId),
            EventService.getAllCalendarEvents(activeClientId),
            MediaService.getAllPontos(activeClientId),
            MediaService.getAllRezas(activeClientId),
            MediaService.getAllErvas(activeClientId),
            MediaService.getAllBanhos(activeClientId),
            UserService.getAllUsers(activeClientId),
            EntityService.getAllEntities(activeClientId),
            CourseService.getCourses(activeClientId),
            CourseService.getEnrollments(activeClientId),
            AttendanceService.getAllRecords(activeClientId),
            IdCardService.getAllLogs(activeClientId)
          ]);
          
          setMembers(fetchedMembers);
          setConsulentes(fetchedMembers.filter(m => m.isConsulente || m.status === 'consulente'));
          setTransactions(fetchedTransactions);
          setInventoryItems(fetchedInventoryItems);
          setInventoryCategories(fetchedInventoryCategories);
          setStockLogs(fetchedStockLogs);
          setCanteenItems(fetchedCanteenItems);
          setCanteenOrders(fetchedCanteenOrders);
          setTerreiroEvents(fetchedEvents);
          setEventTickets(fetchedTickets);
          setDonations(fetchedDonations);
          setEvents(fetchedCalendarEvents);
          setPontos(fetchedPontos);
          setRezas(fetchedRezas);
          setErvas(fetchedErvas);
          setBanhos(fetchedBanhos);
          setSystemUsers(fetchedSystemUsers);
          setEntities(fetchedEntities);
          setCourses(fetchedCourses);
          setEnrollments(fetchedEnrollments);
          setAttendanceRecords(fetchedAttendanceRecords);
          setIdCardLogs(fetchedIdCardLogs);
          
          console.log(`Loaded client data for ${activeClientId}`);
      } catch (error) {
        console.error("Failed to load Firebase client data:", error);
      }
    };

    loadClientDataFromFirebase();
  }, [activeClientId]);

  // --- ACTIONS ---

  const addMember = useCallback(async (m: Partial<Member>, isConsulente = false) => {
    const limits = currentPlan?.limits;
    
    // Check Limits
    if (!isMasterMode && limits) {
      if (!isConsulente && limits.maxMembers != null) {
        const currentCount = members.filter(mem => mem.status !== 'consulente' && !mem.isConsulente).length;
        if (currentCount >= limits.maxMembers) {
          alert('Limite de cadastros de membros alcançado para o plano atual.');
          return;
        }
      }
      if (isConsulente && limits.maxConsulentes != null) {
        const currentCons = members.filter(mem => mem.status === 'consulente' || mem.isConsulente).length;
        if (currentCons >= limits.maxConsulentes) {
          alert('Limite de cadastros de consulentes alcançado para o plano atual.');
          return;
        }
      }
    }

    // Use Service to create and save
    try {
      if (!activeClientId) throw new Error("No active client");
      const newMember = await MemberService.createMember(m, members, isConsulente);
      await MemberService.saveMember(activeClientId, newMember);
      setMembers(prev => [newMember, ...prev]);
    } catch (error) {
      console.error("Erro ao adicionar membro:", error);
      alert("Erro ao salvar no banco de dados.");
    }
  }, [members, currentPlan, isMasterMode, activeClientId]);

  const updateMember = useCallback(async (id: string, data: Partial<Member>) => {
    setMembers(prev => {
      const current = prev.find(m => m.id === id);
      if (!current) return prev;
      
      const updated = { ...current, ...data };
      if (activeClientId) {
        MemberService.saveMember(activeClientId, updated).catch(err => {
          console.error("Erro ao atualizar membro no Firebase:", err);
        });
      }
      
      return prev.map(m => m.id === id ? updated : m);
    });
  }, [activeClientId]);

  const deleteMember = useCallback(async (id: string) => {
    try {
      if (!activeClientId) throw new Error("No active client");
      await MemberService.deleteMember(activeClientId, id);
      setMembers(prev => prev.filter(m => m.id !== id));
      setConsulentes(prev => prev.filter(c => c.id !== id));
    } catch (error) {
      console.error("Erro ao excluir membro:", error);
      alert("Erro ao excluir do banco de dados.");
    }
  }, [activeClientId]);

  const updateProfile = useCallback((data: Partial<User>) => {
    if (!user) return;
    const updatedUser = { ...user, ...data };
    
    // Update auth state
    setAuth({ user: updatedUser, isAuthenticated, isMasterMode });

    // Update Firebase User
    if (activeClientId && user.id) {
       AuthService.updateUser(activeClientId, user.id, data).catch(err => {
          console.error("Failed to update user in Firebase", err);
       });
    }

    // Update systemUsers state
    setSystemUsers(prev => {
      const updated = prev.map(u => u.id === updatedUser.id ? updatedUser : u);
      return updated;
    });

    // If linked entity, update it too
    if (updatedUser.linkedEntityId) {
      if (updatedUser.profileType === 'membro') {
        setMembers(prev => {
          const updated = prev.map(m => m.id === updatedUser.linkedEntityId ? { ...m, name: updatedUser.name, email: updatedUser.email, photo: updatedUser.photo } : m);
          if (activeClientId) {
             const member = updated.find(m => m.id === updatedUser.linkedEntityId);
             if (member) MemberService.saveMember(activeClientId, member);
          }
          return updated;
        });
      } else if (updatedUser.profileType === 'consulente') {
        setConsulentes(prev => {
          const updated = prev.map(c => c.id === updatedUser.linkedEntityId ? { ...c, name: updatedUser.name, email: updatedUser.email, photo: updatedUser.photo } : c);
          if (activeClientId) {
             const consulente = updated.find(c => c.id === updatedUser.linkedEntityId);
             // Consulentes are members in the new system
             if (consulente) MemberService.saveMember(activeClientId, consulente);
          }
          return updated;
        });
      }
    }
  }, [user, activeClientId, isAuthenticated, isMasterMode, setAuth]);

  const addInventoryItem = useCallback(async (item: InventoryItem) => {
    try {
      if (!activeClientId) throw new Error("No active client");
      await InventoryService.saveItem(activeClientId, item);
      setInventoryItems(prev => [...prev, item]);
    } catch (error) {
      console.error("Erro ao adicionar item de estoque:", error);
    }
  }, [activeClientId]);

  const updateInventoryItem = useCallback(async (id: string, data: Partial<InventoryItem>) => {
    setInventoryItems(prev => {
      const current = prev.find(i => i.id === id);
      if (!current) return prev;
      const updated = { ...current, ...data };
      if (activeClientId) {
        InventoryService.saveItem(activeClientId, updated).catch(err => console.error("Erro ao atualizar item:", err));
      }
      return prev.map(i => i.id === id ? updated : i);
    });
  }, [activeClientId]);

  const deleteInventoryItem = useCallback(async (id: string) => {
    try {
      if (!activeClientId) throw new Error("No active client");
      await InventoryService.deleteItem(activeClientId, id);
      setInventoryItems(prev => prev.filter(i => i.id !== id));
    } catch (error) {
      console.error("Erro ao excluir item:", error);
    }
  }, [activeClientId]);

  const addInventoryCategory = useCallback(async (name: string) => {
    try {
      if (!activeClientId) throw new Error("No active client");
      const newCategory = InventoryService.createCategory(name);
      await InventoryService.saveCategory(activeClientId, newCategory);
      setInventoryCategories(prev => [...prev, newCategory]);
    } catch (error) {
      console.error("Erro ao adicionar categoria:", error);
    }
  }, [activeClientId]);

  const deleteInventoryCategory = useCallback(async (id: string) => {
    try {
      if (!activeClientId) throw new Error("No active client");
      await InventoryService.deleteCategory(activeClientId, id);
      setInventoryCategories(prev => prev.filter(c => c.id !== id));
    } catch (error) {
      console.error("Erro ao excluir categoria:", error);
    }
  }, [activeClientId]);

  const processInventoryEntry = useCallback(async (updates: { id: string, currentStock: number }[]) => {
    try {
      const { updatedItems, newLogs } = InventoryService.processStockUpdates(
        updates, 
        inventoryItems, 
        user?.name || 'Sistema'
      );
      
      // Save updated items (only changed ones)
      const changedItems = updatedItems.filter(item => {
        const original = inventoryItems.find(i => i.id === item.id);
        return original && original.currentStock !== item.currentStock;
      });
      
      if (activeClientId) {
        await Promise.all([
          ...changedItems.map(item => InventoryService.saveItem(activeClientId, item)),
          ...newLogs.map(log => InventoryService.saveLog(activeClientId, log))
        ]);
      }

      setInventoryItems(updatedItems);
      if (newLogs.length > 0) {
        setStockLogs(prev => [...newLogs, ...prev]);
        alert(`${newLogs.length} movimentações registradas!`);
      }
    } catch (error) {
      console.error("Erro ao processar estoque:", error);
      alert("Erro ao salvar movimentações.");
    }
  }, [inventoryItems, user, activeClientId]);

  const addCanteenOrder = useCallback(async (order: CanteenOrder) => {
    try {
      if (!activeClientId) throw new Error("No active client");
      await CanteenService.saveOrder(activeClientId, order);
      setCanteenOrders(prev => [order, ...prev]);
      
      // Update stock
      const updatedItems: CanteenItem[] = [];
      setCanteenItems(prev => {
        const next = prev.map(item => {
          const soldItem = order.items.find(si => si.itemId === item.id);
          if (soldItem) {
            const newItem = { ...item, stock: Math.max(0, item.stock - soldItem.quantity) };
            updatedItems.push(newItem);
            return newItem;
          }
          return item;
        });
        return next;
      });

      // Save updated stock to Firebase
      await Promise.all(updatedItems.map(item => CanteenService.saveItem(activeClientId, item)));

    } catch (error) {
      console.error("Erro ao salvar pedido da cantina:", error);
    }
  }, [activeClientId]);

  const addCanteenItem = useCallback(async (item: CanteenItem) => {
    try {
      if (!activeClientId) throw new Error("No active client");
      const newItem = { ...item, id: Math.random().toString(36).substr(2,9) };
      await CanteenService.saveItem(activeClientId, newItem);
      setCanteenItems(prev => [newItem, ...prev]);
    } catch (error) {
      console.error("Erro ao salvar item da cantina:", error);
    }
  }, [activeClientId]);

  const updateCanteenItem = useCallback(async (id: string, data: Partial<CanteenItem>) => {
    setCanteenItems(prev => {
      const current = prev.find(i => i.id === id);
      if (!current) return prev;
      const updated = { ...current, ...data };
      
      if (activeClientId) {
        CanteenService.saveItem(activeClientId, updated).catch(err => console.error("Erro ao atualizar item da cantina:", err));
      }
      
      return prev.map(i => i.id === id ? updated : i);
    });
  }, [activeClientId]);

  const deleteCanteenItem = useCallback(async (id: string) => {
    try {
      if (!activeClientId) throw new Error("No active client");
      await CanteenService.deleteItem(activeClientId, id);
      setCanteenItems(prev => prev.filter(i => i.id !== id));
    } catch (error) {
      console.error("Erro ao excluir item da cantina:", error);
    }
  }, [activeClientId]);

  const registerPublicEvent = useCallback(async (ticketData: any, eventId: string): Promise<EventTicket> => {
    const event = terreiroEvents.find(e => e.id === eventId);
    if (!event) throw new Error('Evento não encontrado');

    const newTicket: EventTicket = {
      ...ticketData,
      id: generateUUID(),
      createdAt: new Date().toISOString(),
      status: 'confirmado',
      attendance: 'nao_marcado'
    };
    
    // Optimistic update
    setEventTickets(prev => [...prev, newTicket]);
    
    const updatedEvent = { ...event, ticketsIssued: event.ticketsIssued + 1 };
    setTerreiroEvents(prev => prev.map(e => e.id === event.id ? updatedEvent : e));
    
    if (activeClientId) {
      try {
        await Promise.all([
          EventService.saveTicket(activeClientId, newTicket),
          EventService.saveEvent(activeClientId, updatedEvent)
        ]);
      } catch (error) {
        console.error("Erro ao salvar ingresso/evento no Firebase:", error);
        // Rollback logic could be added here
      }
    }
    
    return newTicket;
  }, [terreiroEvents, activeClientId]);

  const value = {
    systemUsers, setSystemUsers,
    members, setMembers,
    consulentes, setConsulentes,
    entities, setEntities,
    events, setEvents,
    courses, setCourses,
    enrollments, setEnrollments,
    attendanceRecords, setAttendanceRecords,
    inventoryItems, setInventoryItems,
    inventoryCategories, setInventoryCategories,
    stockLogs, setStockLogs,
    donations, setDonations,
    referrals, setReferrals,
    tickets, setTickets,
    idCardLogs, setIdCardLogs,
    plans, setPlans,
    clients, setClients,
    systemConfig, setSystemConfig,
    canteenItems, setCanteenItems,
    canteenOrders, setCanteenOrders,
    terreiroEvents, setTerreiroEvents,
    eventTickets, setEventTickets,
    pontos, setPontos,
    rezas, setRezas,
    ervas, setErvas,
    banhos, setBanhos,
    auditLogs, setAuditLogs,
    broadcasts, setBroadcasts,
    roadmap, setRoadmap,
    coupons, setCoupons,
    globalMaintenance, setGlobalMaintenance,
    userPreferences, updateUserPreferences,
    isSimulation, setIsSimulation,
    loadClientData,
    activeClientId,
    currentClient,
    currentPlan,
    licenseState,
    userPermissions,
    transactions, setTransactions,
    addTransaction, updateTransaction, deleteTransaction,
    masterGlobalConfig, setMasterGlobalConfig,
    addMember, updateMember, deleteMember,
    updateProfile,
    addInventoryItem, updateInventoryItem, deleteInventoryItem,
    addInventoryCategory, deleteInventoryCategory,
    processInventoryEntry,
    addCanteenOrder, addCanteenItem, updateCanteenItem, deleteCanteenItem,
    registerPublicEvent
  };

  return <DataContext.Provider value={value}>{children}</DataContext.Provider>;
};

export const useData = () => {
  const context = useContext(DataContext);
  if (!context) {
    throw new Error('useData must be used within a DataProvider');
  }
  return context;
};
