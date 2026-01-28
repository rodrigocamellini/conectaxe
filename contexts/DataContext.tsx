import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import { isAfter } from 'date-fns';
import { storage, STORAGE_KEYS } from '../services/storage';
import { 
  Member, Consulente, User, SpiritualEntity, InventoryItem, InventoryCategory, 
  SystemConfig, CalendarEvent, Course, Enrollment, AttendanceRecord, SaaSClient, 
  Donation, Referral, SaaSPlan, SupportTicket, IDCardLog, StockLog, 
  MasterAuditLog, CanteenItem, CanteenOrder, TerreiroEvent, EventTicket, 
  Ponto, Reza, Erva, Banho, ReleaseNote, GlobalBroadcast, GlobalCoupon, StaffPermissions
} from '../types';
import { 
  INITIAL_USERS, DEFAULT_SYSTEM_CONFIG, INITIAL_ENTITIES, DEFAULT_ENTITY_IMAGES, 
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
  const [systemUsers, setSystemUsers] = useState<User[]>(() => storage.get<User[]>('terreiro_system_users') || INITIAL_USERS);
  
  const [members, setMembers] = useState<Member[]>(() => storage.get<Member[]>(STORAGE_KEYS.MEMBERS) || []);
  const [consulentes, setConsulentes] = useState<Consulente[]>(() => storage.get<Consulente[]>(STORAGE_KEYS.CONSULENTES) || []);
  
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
      if (entity.imageUrl) return entity;
      const defaultImage = DEFAULT_ENTITY_IMAGES[entity.id];
      if (defaultImage) return { ...entity, imageUrl: defaultImage };
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
      rezaCategories: Array.from(new Set([...((saved as any).rezaCategories || []), ...DEFAULT_SYSTEM_CONFIG.rezaCategories])),
      ervaCategories: Array.from(new Set([...((saved as any).ervaCategories || []), ...(DEFAULT_SYSTEM_CONFIG.ervaCategories || [])])),
      ervaTypes: Array.from(new Set([...((saved as any).ervaTypes || []), ...(DEFAULT_SYSTEM_CONFIG.ervaTypes || [])])),
      banhoCategories: Array.from(new Set([...((saved as any).banhoCategories || []), ...(DEFAULT_SYSTEM_CONFIG.banhoCategories || [])])),
      banhoTypes: Array.from(new Set([...((saved as any).banhoTypes || []), ...(DEFAULT_SYSTEM_CONFIG.banhoTypes || [])])),
      banhoDirections: Array.from(new Set([...((saved as any).banhoDirections || []), ...(DEFAULT_SYSTEM_CONFIG.banhoDirections || [])]))
    };
    return merged;
  });

  const [canteenItems, setCanteenItems] = useState<CanteenItem[]>(() => {
    const saved = storage.get<CanteenItem[]>('terreiro_canteen_items');
    return Array.isArray(saved) ? saved : [];
  });
  const [canteenOrders, setCanteenOrders] = useState<CanteenOrder[]>(() => {
    const saved = storage.get<CanteenOrder[]>('terreiro_canteen_orders');
    return Array.isArray(saved) ? saved : [];
  });
  
  const [terreiroEvents, setTerreiroEvents] = useState<TerreiroEvent[]>(() => {
    const saved = storage.get<TerreiroEvent[]>('terreiro_advanced_events');
    return Array.isArray(saved) ? saved : [];
  });
  const [eventTickets, setEventTickets] = useState<EventTicket[]>(() => {
    const saved = storage.get<EventTicket[]>('terreiro_event_tickets');
    return Array.isArray(saved) ? saved : [];
  });

  const [pontos, setPontos] = useState<Ponto[]>(() => {
    const saved = storage.get<Ponto[]>('terreiro_pontos');
    return Array.isArray(saved) ? saved : [];
  });
  const [rezas, setRezas] = useState<Reza[]>(() => {
    const saved = storage.get<Reza[]>('terreiro_rezas');
    return Array.isArray(saved) ? saved : [];
  });
  const [ervas, setErvas] = useState<Erva[]>(() => {
    const saved = storage.get<Erva[]>('terreiro_ervas');
    return Array.isArray(saved) ? saved : [];
  });
  const [banhos, setBanhos] = useState<Banho[]>(() => {
    const saved = storage.get<Banho[]>('terreiro_banhos');
    return Array.isArray(saved) ? saved : [];
  });

  const [auditLogs, setAuditLogs] = useState<MasterAuditLog[]>(() => {
    const saved = storage.get<MasterAuditLog[]>('saas_master_audit_logs');
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

  const [globalMaintenance, setGlobalMaintenance] = useState<GlobalMaintenanceConfig>(() => {
    const saved = storage.get<GlobalMaintenanceConfig>('saas_global_maintenance');
    return saved || { active: false, message: '' };
  });

  // --- Phase 2: Ledger & Config Implementation ---
  const [transactions, setTransactions] = useState<FinancialTransaction[]>(() => {
    return storage.get<FinancialTransaction[]>(STORAGE_KEYS.TRANSACTIONS) || [];
  });

  const [masterGlobalConfig, setMasterGlobalConfig] = useState<MasterGlobalConfig | null>(() => {
    return storage.get<MasterGlobalConfig>(STORAGE_KEYS.MASTER_CONFIG) || null;
  });

  const addTransaction = (transaction: FinancialTransaction) => {
    setTransactions(prev => {
      const updated = [...prev, transaction];
      storage.set(STORAGE_KEYS.TRANSACTIONS, updated);
      return updated;
    });
  };

  const updateTransaction = (id: string, data: Partial<FinancialTransaction>) => {
    setTransactions(prev => {
      const updated = prev.map(t => t.id === id ? { ...t, ...data } : t);
      storage.set(STORAGE_KEYS.TRANSACTIONS, updated);
      return updated;
    });
  };

  const deleteTransaction = (id: string) => {
    setTransactions(prev => {
      const updated = prev.filter(t => t.id !== id);
      storage.set(STORAGE_KEYS.TRANSACTIONS, updated);
      return updated;
    });
  };

  // Migration Effect: Convert Member Payments to Transactions
  useEffect(() => {
    const hasTransactions = transactions.length > 0;
    const hasMembers = members.length > 0;
    
    if (!hasTransactions && hasMembers) {
      console.log('Running one-time migration: Member Payments -> Ledger Transactions');
      const newTransactions: FinancialTransaction[] = [];
      
      members.forEach(member => {
        if (member.monthlyPayments) {
          Object.entries(member.monthlyPayments).forEach(([key, status]) => {
             if (status === 'paid') {
               // Determine value based on current config (best effort)
               const isMedium = member.isMedium;
               const isCambone = member.isCambone;
               let amount = 0;
               if (isMedium) amount = systemConfig.financialConfig?.mediumValue || 0;
               else if (isCambone) amount = systemConfig.financialConfig?.camboneValue || 0;
               
               newTransactions.push({
                 id: generateUUID(),
                 memberId: member.id,
                 memberName: member.name,
                 type: 'mensalidade',
                 amount: amount,
                 date: `${key}-05`, // Assume 5th of the month
                 monthReference: key, // YYYY-MM
                 status: 'paid',
                 paymentMethod: 'legacy_migration',
                 notes: 'Migrado automaticamente do sistema antigo'
               });
             }
          });
        }
      });
      
      if (newTransactions.length > 0) {
        setTransactions(newTransactions);
        storage.set(STORAGE_KEYS.TRANSACTIONS, newTransactions);
        console.log(`Migration complete. Created ${newTransactions.length} transactions.`);
      }
    }
  }, [members, transactions.length, systemConfig]); // Run once when members are loaded

  const [isSimulation, setIsSimulation] = useState(false);

  const activeClientId = systemConfig.license?.clientId;

  const currentClient = useMemo(() => {
    if (!isAuthenticated || isMasterMode) return null;
    return clients.find(c => c.adminEmail.toLowerCase() === user?.email.toLowerCase());
  }, [clients, user, isAuthenticated, isMasterMode]);

  const currentPlan = useMemo(() => {
    if (!currentClient) return null;
    return plans.find(p => p.name === currentClient.plan) || null;
  }, [currentClient, plans]);

  const licenseState = useMemo(() => {
    if (!isAuthenticated || isMasterMode) return { valid: true, status: 'active' as const };
    const client = clients.find(c => c.adminEmail.toLowerCase() === user?.email.toLowerCase());
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

  const addMember = useCallback((m: Partial<Member>, isConsulente = false) => {
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

    const newId = generateUUID();
    const photo = m.photo && m.photo.trim() !== '' ? m.photo : '/images/membro.png';
    const baseStatus = isConsulente ? (m.status && m.status.trim() !== '' ? m.status : 'consulente') : (m.status || 'ativo');
    
    const newMember = { 
      ...m, 
      id: newId, 
      photo, 
      status: baseStatus,
      isConsulente, 
      createdAt: new Date().toISOString() 
    } as Member;

    setMembers(prev => [newMember, ...prev]);
  }, [members, currentPlan, isMasterMode]);

  const updateMember = useCallback((id: string, data: Partial<Member>) => {
    setMembers(prev => prev.map(m => m.id === id ? { ...m, ...data } : m));
  }, []);

  const deleteMember = useCallback((id: string) => {
    setMembers(prev => prev.filter(m => m.id !== id));
  }, []);

  const updateProfile = useCallback((data: Partial<User>) => {
    if (!user) return;
    const updatedUser = { ...user, ...data };
    
    // Update auth state
    setAuth({ user: updatedUser, isAuthenticated, isMasterMode }); // setAuth updates storage too

    // Update systemUsers
    setSystemUsers(prev => {
      const updated = prev.map(u => u.id === updatedUser.id ? updatedUser : u);
      const suffix = activeClientId ? `_${activeClientId}` : '';
      storage.set(`terreiro_system_users${suffix}`, updated);
      return updated;
    });

    // If linked entity, update it too
    if (updatedUser.linkedEntityId) {
      if (updatedUser.profileType === 'membro') {
        setMembers(prev => {
          const updated = prev.map(m => m.id === updatedUser.linkedEntityId ? { ...m, name: updatedUser.name, email: updatedUser.email, photo: updatedUser.photo } : m);
          const suffix = activeClientId ? `_${activeClientId}` : '';
          storage.set(`${STORAGE_KEYS.MEMBERS}${suffix}`, updated);
          return updated;
        });
      } else if (updatedUser.profileType === 'consulente') {
        setConsulentes(prev => {
          const updated = prev.map(c => c.id === updatedUser.linkedEntityId ? { ...c, name: updatedUser.name, email: updatedUser.email, photo: updatedUser.photo } : c);
          const suffix = activeClientId ? `_${activeClientId}` : '';
          storage.set(`${STORAGE_KEYS.CONSULENTES}${suffix}`, updated);
          return updated;
        });
      }
    }
  }, [user, activeClientId, isAuthenticated, isMasterMode, setAuth]);

  const addInventoryItem = useCallback((item: InventoryItem) => {
    setInventoryItems(prev => [...prev, { ...item, id: generateUUID() }]);
  }, []);

  const updateInventoryItem = useCallback((id: string, data: Partial<InventoryItem>) => {
    setInventoryItems(prev => prev.map(i => i.id === id ? { ...i, ...data } : i));
  }, []);

  const deleteInventoryItem = useCallback((id: string) => {
    setInventoryItems(prev => prev.filter(i => i.id !== id));
  }, []);

  const processInventoryEntry = useCallback((updates: { id: string, currentStock: number }[]) => {
    const newLogs: StockLog[] = [];
    let logsAdded = 0;

    setInventoryItems(prev => {
      const updatedItems = prev.map(i => {
        const u = updates.find(x => x.id === i.id);
        if (u && u.currentStock !== i.currentStock) {
          newLogs.push({
            id: Math.random().toString(36).substr(2, 9),
            itemId: i.id,
            itemName: i.name,
            previousStock: i.currentStock,
            newStock: u.currentStock,
            change: u.currentStock - i.currentStock,
            date: new Date().toISOString(),
            responsible: user?.name || 'Sistema',
            type: u.currentStock > i.currentStock ? 'entrada' : 'saida'
          });
          return { ...i, currentStock: u.currentStock };
        }
        return i;
      });
      return updatedItems;
    });
    
    if (newLogs.length > 0) {
      setStockLogs(prev => [...newLogs, ...prev]);
      alert(`${newLogs.length} movimentações registradas!`);
    }
  }, [user]);

  const addCanteenOrder = useCallback((order: CanteenOrder) => {
    setCanteenOrders(prev => [order, ...prev]);
    
    // Update stock
    setCanteenItems(prev => {
      return prev.map(item => {
        const soldItem = order.items.find(si => si.itemId === item.id);
        if (soldItem) {
          return { ...item, stock: Math.max(0, item.stock - soldItem.quantity) };
        }
        return item;
      });
    });
  }, []);

  const addCanteenItem = useCallback((item: CanteenItem) => {
    setCanteenItems(prev => [{...item, id: Math.random().toString(36).substr(2,9)}, ...prev]);
  }, []);

  const updateCanteenItem = useCallback((id: string, data: Partial<CanteenItem>) => {
    setCanteenItems(prev => prev.map(i => i.id === id ? {...i, ...data} : i));
  }, []);

  const deleteCanteenItem = useCallback((id: string) => {
    setCanteenItems(prev => prev.filter(i => i.id !== id));
  }, []);

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
    
    setEventTickets(prev => [...prev, newTicket]);
    
    setTerreiroEvents(prev => prev.map(e => 
      e.id === event.id && newTicket.status === 'confirmado'
        ? { ...e, ticketsIssued: e.ticketsIssued + 1 } 
        : e
    ));
    
    return newTicket;
  }, [terreiroEvents]);


  const loadClientData = useCallback((clientId: string) => {
    const suffix = `_${clientId}`;

    setSystemUsers(storage.get<User[]>(`terreiro_system_users${suffix}`) || []);
    setMembers(storage.get<Member[]>(`${STORAGE_KEYS.MEMBERS}${suffix}`) || []);
    setConsulentes(storage.get<Consulente[]>(`${STORAGE_KEYS.CONSULENTES}${suffix}`) || []);

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
        if (entity.imageUrl) return entity;
        const defaultImage = DEFAULT_ENTITY_IMAGES[entity.id];
        if (defaultImage) return { ...entity, imageUrl: defaultImage };
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
    
    const savedEvents = storage.get<TerreiroEvent[]>(`terreiro_advanced_events${suffix}`);
    setTerreiroEvents(Array.isArray(savedEvents) ? savedEvents : []);

    const savedTickets = storage.get<EventTicket[]>(`terreiro_event_tickets${suffix}`);
    setEventTickets(Array.isArray(savedTickets) ? savedTickets : []);

    setPontos(storage.get<Ponto[]>(`terreiro_pontos${suffix}`) || []);
    setRezas(storage.get<Reza[]>(`terreiro_rezas${suffix}`) || []);
    setErvas(storage.get<Erva[]>(`terreiro_ervas${suffix}`) || []);
    setBanhos(storage.get<Banho[]>(`terreiro_banhos${suffix}`) || []);

    // Load Client-Specific System Config
    const savedConfig = storage.get<SystemConfig>(`${STORAGE_KEYS.SYSTEM_CONFIG}${suffix}`);
    if (savedConfig) {
      setSystemConfig(prev => ({
        ...prev,
        ...savedConfig,
        license: prev.license, // Preserve license info
        systemName: prev.systemName // Preserve system name
      }));
    } else {
      setSystemConfig(prev => ({
        ...DEFAULT_SYSTEM_CONFIG,
        license: prev.license,
        systemName: prev.systemName
      }));
    }
  }, []);

  // Update Config Patch
  useEffect(() => {
    setSystemConfig(prev => {
      const currentMenu = prev.menuConfig || DEFAULT_SYSTEM_CONFIG.menuConfig;
      let updatedMenu = currentMenu.map(item => {
        if (item.id === 'indicacoes') {
          const needsUpdate = item.label !== 'Afiliados' || item.icon !== 'Crown' || item.color !== '#ADFF2F';
          if (needsUpdate) {
            return { ...item, label: 'Afiliados', icon: 'Crown', color: '#ADFF2F' };
          }
        }
        return item;
      });

      updatedMenu = updatedMenu.map(item => {
        if (item.id !== 'cadastros') return item;
        const subItems = item.subItems || [];
        const hasConsulentes = subItems.some(s => s.id === 'consulentes');
        if (hasConsulentes) return item;
        const newSubItems = [...subItems];
        const mediumsIndex = newSubItems.findIndex(s => s.id === 'mediums');
        const consulenteItem = { id: 'consulentes', label: 'Consulentes', icon: 'UserRoundPlus' };
        if (mediumsIndex >= 0) {
          newSubItems.splice(mediumsIndex + 1, 0, consulenteItem);
        } else {
          newSubItems.push(consulenteItem);
        }
        return { ...item, subItems: newSubItems };
      });

      const eventsItemIndex = updatedMenu.findIndex(item => item.id === 'events-list');
      const eventsItem = { id: 'events-list', label: 'Giras e Eventos', icon: 'Sparkles', requiredModule: 'gestao_eventos' };
      
      if (eventsItemIndex === -1) {
        const agendaIndex = updatedMenu.findIndex(item => item.id === 'agenda');
        if (agendaIndex >= 0) {
           updatedMenu.splice(agendaIndex + 1, 0, eventsItem);
        } else {
           updatedMenu.splice(1, 0, eventsItem);
        }
      } else {
        const currentItem = updatedMenu[eventsItemIndex];
        if (currentItem.icon !== 'Sparkles' || currentItem.requiredModule !== 'gestao_eventos' || currentItem.label !== 'Giras e Eventos') {
          updatedMenu[eventsItemIndex] = { ...currentItem, ...eventsItem };
        }
      }

      const changed = updatedMenu.some((item, index) => item !== currentMenu[index]) || updatedMenu.length !== currentMenu.length;
      
      let newAccent = prev.accentColor;
      if (prev.accentColor === '#4f46e5') {
        newAccent = '#FFD700';
      }
      const colorChanged = newAccent !== prev.accentColor;

      if (!changed && !colorChanged) return prev;
      return { 
        ...prev, 
        menuConfig: updatedMenu, 
        accentColor: newAccent
      };
    });
  }, []);

  // Theme Effects
  useEffect(() => {
    const root = document.documentElement;
    root.style.setProperty('--primary-color', systemConfig.primaryColor);
    root.style.setProperty('--sidebar-color', systemConfig.sidebarColor);
    root.style.setProperty('--accent-color', systemConfig.accentColor);

    // Apply Dashboard Font Size
    if (systemConfig.dashboardFontSize) {
      if (systemConfig.dashboardFontSize === 'small') {
        root.style.fontSize = '14px';
      } else if (systemConfig.dashboardFontSize === 'medium') {
        root.style.fontSize = '16px';
      } else if (systemConfig.dashboardFontSize === 'large') {
        root.style.fontSize = '18px';
      }
    } else {
      root.style.fontSize = '16px'; // Default
    }
  }, [systemConfig]);

  // Persistence Effect
  useEffect(() => {
    if (activeClientId) {
      const suffix = `_${activeClientId}`;
      storage.set(`terreiro_system_users${suffix}`, systemUsers);
      storage.set(`${STORAGE_KEYS.MEMBERS}${suffix}`, members);
      storage.set(`${STORAGE_KEYS.CONSULENTES}${suffix}`, consulentes);
      storage.set(`${STORAGE_KEYS.ENTITIES}${suffix}`, entities);
      storage.set(`terreiro_events${suffix}`, events);
      storage.set(`terreiro_courses${suffix}`, courses);
      storage.set(`terreiro_enrollments${suffix}`, enrollments);
      storage.set(`terreiro_attendance${suffix}`, attendanceRecords);
      storage.set(`terreiro_inventory_items${suffix}`, inventoryItems);
      storage.set(`terreiro_inventory_cats${suffix}`, inventoryCategories);
      storage.set(`terreiro_stock_logs${suffix}`, stockLogs);
      storage.set(`terreiro_donations${suffix}`, donations);
      storage.set(`terreiro_idcard_logs${suffix}`, idCardLogs);
      storage.set(`terreiro_canteen_items${suffix}`, canteenItems);
      storage.set(`terreiro_canteen_orders${suffix}`, canteenOrders);
      storage.set(`terreiro_advanced_events${suffix}`, terreiroEvents);
      storage.set(`terreiro_event_tickets${suffix}`, eventTickets);
      storage.set(`terreiro_pontos${suffix}`, pontos);
      storage.set(`terreiro_rezas${suffix}`, rezas);
      storage.set(`terreiro_ervas${suffix}`, ervas);
      storage.set(`terreiro_banhos${suffix}`, banhos);
      storage.set(`${STORAGE_KEYS.SYSTEM_CONFIG}${suffix}`, systemConfig);
    } else {
      if (!isMasterMode) {
        storage.set('terreiro_system_users', systemUsers);
        storage.set(STORAGE_KEYS.MEMBERS, members);
        storage.set(STORAGE_KEYS.CONSULENTES, consulentes);
        storage.set(STORAGE_KEYS.ENTITIES, entities);
        storage.set('terreiro_events', events);
        storage.set('terreiro_courses', courses);
        storage.set('terreiro_enrollments', enrollments);
        storage.set('terreiro_attendance', attendanceRecords);
        storage.set('terreiro_inventory_items', inventoryItems);
        storage.set('terreiro_inventory_cats', inventoryCategories);
        storage.set('terreiro_stock_logs', stockLogs);
        storage.set('terreiro_donations', donations);
        storage.set('terreiro_idcard_logs', idCardLogs);
        storage.set('terreiro_canteen_items', canteenItems);
        storage.set('terreiro_canteen_orders', canteenOrders);
        storage.set('terreiro_advanced_events', terreiroEvents);
        storage.set('terreiro_event_tickets', eventTickets);
        storage.set('terreiro_pontos', pontos);
        storage.set('terreiro_rezas', rezas);
        storage.set('terreiro_ervas', ervas);
        storage.set('terreiro_banhos', banhos);
        storage.set(STORAGE_KEYS.SYSTEM_CONFIG, systemConfig);
      }
    }

    storage.set('terreiro_referrals', referrals);
    storage.set('terreiro_tickets', tickets);
    storage.set('saas_master_clients', clients);
    storage.set('saas_master_plans', plans);
    storage.set('saas_global_broadcasts', broadcasts);
    storage.set('saas_global_roadmap', roadmap);
    storage.set('saas_global_coupons', coupons);
    storage.set('saas_master_audit_logs', auditLogs);

  }, [
    systemUsers, members, consulentes, entities, events, courses, enrollments, 
    attendanceRecords, inventoryItems, inventoryCategories, stockLogs, donations, 
    activeClientId, isMasterMode, idCardLogs, canteenItems, canteenOrders, 
    terreiroEvents, eventTickets, pontos, rezas, ervas, banhos, referrals, 
    tickets, clients, plans, broadcasts, roadmap, coupons, auditLogs, systemConfig
  ]);

  const userPermissions = useMemo<StaffPermissions | undefined>(() => {
    if (!user || isMasterMode) return undefined;
    const role = systemConfig.userRoles.find(r => r.id === user.role);
    return role ? systemConfig.rolePermissions?.[role.id] : undefined;
  }, [user, isMasterMode, systemConfig.userRoles, systemConfig.rolePermissions]);

  return (
    <DataContext.Provider value={{
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
      loadClientData,
      activeClientId,
      currentClient,
      currentPlan,
      addMember,
      updateMember,
      deleteMember,
      updateProfile,
      addInventoryItem,
      updateInventoryItem,
      deleteInventoryItem,
      processInventoryEntry,
      addCanteenOrder,
      addCanteenItem,
      updateCanteenItem,
    deleteCanteenItem,
    registerPublicEvent,
    globalMaintenance,
    setGlobalMaintenance,
    isSimulation,
    setIsSimulation,
    licenseState,
    userPermissions,
    
    // Phase 2 Exports
    transactions,
    setTransactions,
    addTransaction,
    updateTransaction,
    deleteTransaction,
    masterGlobalConfig,
    setMasterGlobalConfig
  }}>
      {children}
    </DataContext.Provider>
  );
};

export const useData = () => {
  const context = useContext(DataContext);
  if (!context) {
    throw new Error('useData must be used within a DataProvider');
  }
  return context;
};
