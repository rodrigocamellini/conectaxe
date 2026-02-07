
import { db } from './firebaseConfig';
import { 
  collection, doc, getDocs, getDoc, getDocFromServer, setDoc, deleteDoc, query, where 
} from 'firebase/firestore';
import { 
  SaaSPlan, SaaSClient, GlobalBroadcast, ReleaseNote, GlobalCoupon, MasterAuditLog, MasterCredentials, MasterGlobalConfig 
} from '../types';
import { MASTER_LOGO_URL } from '../constants';

// Collections
const PLANS_COLLECTION = 'saas_plans';
const CLIENTS_COLLECTION = 'saas_clients';
const BROADCASTS_COLLECTION = 'saas_broadcasts';
const ROADMAP_COLLECTION = 'saas_roadmap';
const COUPONS_COLLECTION = 'saas_coupons';
const AUDIT_LOGS_COLLECTION = 'saas_audit_logs';
const CONFIG_COLLECTION = 'saas_config';
const CLIENT_USERS_SUBCOLLECTION = 'users';
const CLIENT_CONFIG_SUBCOLLECTION = 'config';

export const MasterService = {
  // --- Plans ---
  getAllPlans: async (): Promise<SaaSPlan[]> => {
    try {
      const snap = await getDocs(collection(db, PLANS_COLLECTION));
      return snap.docs.map(d => d.data() as SaaSPlan);
    } catch (error) {
      console.error("Error fetching plans:", error);
      return [];
    }
  },
  savePlan: async (plan: SaaSPlan): Promise<void> => {
    try {
      await setDoc(doc(db, PLANS_COLLECTION, plan.id), plan);
    } catch (error) {
      console.error("Error saving plan:", error);
      throw error;
    }
  },
  deletePlan: async (planId: string): Promise<void> => {
    try {
      await deleteDoc(doc(db, PLANS_COLLECTION, planId));
    } catch (error) {
      console.error("Error deleting plan:", error);
      throw error;
    }
  },

  // --- Clients ---
  getAllClients: async (): Promise<SaaSClient[]> => {
    try {
      const snap = await getDocs(collection(db, CLIENTS_COLLECTION));
      return snap.docs.map(d => d.data() as SaaSClient);
    } catch (error) {
      console.error("Error fetching clients:", error);
      return [];
    }
  },
  getClient: async (clientId: string): Promise<SaaSClient | null> => {
    try {
      const docRef = doc(db, CLIENTS_COLLECTION, clientId);
      const snap = await getDoc(docRef);
      if (snap.exists()) {
        return snap.data() as SaaSClient;
      }
      return null;
    } catch (error) {
      console.error("Error fetching client:", error);
      return null;
    }
  },
  saveClient: async (client: SaaSClient): Promise<void> => {
    try {
      await setDoc(doc(db, CLIENTS_COLLECTION, client.id), client);
    } catch (error) {
      console.error("Error saving client:", error);
      throw error;
    }
  },
  deleteClient: async (clientId: string): Promise<void> => {
    try {
      await deleteDoc(doc(db, CLIENTS_COLLECTION, clientId));
    } catch (error) {
      console.error("Error deleting client:", error);
      throw error;
    }
  },

  initializeClientData: async (clientId: string, users: User[], config: SystemConfig): Promise<void> => {
    try {
      // 1. Save Users (Admin + Initial Users)
      // Path: saas_clients/{clientId}/users/{userId}
      for (const user of users) {
        const userRef = doc(db, CLIENTS_COLLECTION, clientId, CLIENT_USERS_SUBCOLLECTION, user.id);
        await setDoc(userRef, user);
      }

      // 2. Save System Config
      // Path: saas_clients/{clientId}/config/system_settings
      const configRef = doc(db, CLIENTS_COLLECTION, clientId, CLIENT_CONFIG_SUBCOLLECTION, 'system_settings');
      await setDoc(configRef, config);
    } catch (error) {
      console.error("Error initializing client data:", error);
      throw error;
    }
  },

  updateClientLicense: async (clientId: string, license: any): Promise<void> => {
    try {
      const configRef = doc(db, CLIENTS_COLLECTION, clientId, CLIENT_CONFIG_SUBCOLLECTION, 'system_settings');
      await setDoc(configRef, { license }, { merge: true });
    } catch (error) {
      console.error("Error updating client license:", error);
      throw error;
    }
  },

  // --- Broadcasts ---
  getAllBroadcasts: async (): Promise<GlobalBroadcast[]> => {
    try {
      const snap = await getDocs(collection(db, BROADCASTS_COLLECTION));
      return snap.docs.map(d => d.data() as GlobalBroadcast);
    } catch (error) {
      console.error("Error fetching broadcasts:", error);
      return [];
    }
  },
  saveBroadcast: async (broadcast: GlobalBroadcast): Promise<void> => {
    try {
      await setDoc(doc(db, BROADCASTS_COLLECTION, broadcast.id), broadcast);
    } catch (error) {
      console.error("Error saving broadcast:", error);
      throw error;
    }
  },

  // --- Roadmap ---
  getAllRoadmap: async (): Promise<ReleaseNote[]> => {
    try {
      const snap = await getDocs(collection(db, ROADMAP_COLLECTION));
      return snap.docs.map(d => d.data() as ReleaseNote);
    } catch (error) {
      console.error("Error fetching roadmap:", error);
      return [];
    }
  },
  saveRoadmapItem: async (item: ReleaseNote): Promise<void> => {
    try {
      await setDoc(doc(db, ROADMAP_COLLECTION, item.id), item);
    } catch (error) {
      console.error("Error saving roadmap item:", error);
      throw error;
    }
  },

  // --- Coupons ---
  getAllCoupons: async (): Promise<GlobalCoupon[]> => {
    try {
      const snap = await getDocs(collection(db, COUPONS_COLLECTION));
      return snap.docs.map(d => d.data() as GlobalCoupon);
    } catch (error) {
      console.error("Error fetching coupons:", error);
      return [];
    }
  },
  saveCoupon: async (coupon: GlobalCoupon): Promise<void> => {
    try {
      await setDoc(doc(db, COUPONS_COLLECTION, coupon.id), coupon);
    } catch (error) {
      console.error("Error saving coupon:", error);
      throw error;
    }
  },

  // --- Audit Logs ---
  getAllAuditLogs: async (): Promise<MasterAuditLog[]> => {
    try {
      const snap = await getDocs(collection(db, AUDIT_LOGS_COLLECTION));
      return snap.docs.map(d => d.data() as MasterAuditLog);
    } catch (error) {
      console.error("Error fetching audit logs:", error);
      return [];
    }
  },
  saveAuditLog: async (log: MasterAuditLog): Promise<void> => {
    try {
      await setDoc(doc(db, AUDIT_LOGS_COLLECTION, log.id), log);
    } catch (error) {
      console.error("Error saving audit log:", error);
      throw error;
    }
  },

  // --- Auto Block Config ---
  getAutoBlockConfig: async (): Promise<{enabled: boolean, days: number}> => {
    try {
      const docRef = doc(db, CONFIG_COLLECTION, 'auto_block');
      const snap = await getDoc(docRef);
      if (snap.exists()) {
        return snap.data() as {enabled: boolean, days: number};
      }
      return { enabled: false, days: 5 };
    } catch (error) {
      console.error("Error fetching auto block config:", error);
      return { enabled: false, days: 5 };
    }
  },
  saveAutoBlockConfig: async (config: {enabled: boolean, days: number}): Promise<void> => {
    try {
      await setDoc(doc(db, CONFIG_COLLECTION, 'auto_block'), config);
    } catch (error) {
      console.error("Error saving auto block config:", error);
      throw error;
    }
  },

  // --- Global Maintenance ---
  getGlobalMaintenance: async (): Promise<{active: boolean, message: string}> => {
    try {
      const docRef = doc(db, CONFIG_COLLECTION, 'maintenance');
      const snap = await getDoc(docRef);
      if (snap.exists()) {
        return snap.data() as {active: boolean, message: string};
      }
      return { active: false, message: '' };
    } catch (error) {
      console.error("Error fetching global maintenance:", error);
      return { active: false, message: '' };
    }
  },
  saveGlobalMaintenance: async (config: {active: boolean, message: string}): Promise<void> => {
    try {
      await setDoc(doc(db, CONFIG_COLLECTION, 'maintenance'), config);
    } catch (error) {
      console.error("Error saving global maintenance:", error);
      throw error;
    }
  },

  // --- Data Export ---
  getClientFullData: async (clientId: string): Promise<Record<string, any>> => {
    try {
      const data: Record<string, any> = {};
      const subcollections = [
        'users', 'config', 'members', 'financial_transactions', 'financial_donations',
        'inventory_items', 'inventory_categories', 'inventory_logs',
        'canteen_items', 'canteen_orders',
        'calendar_events', 'terreiro_events', 'event_tickets',
        'pontos', 'rezas', 'ervas', 'banhos',
        'entities', 'courses', 'enrollments',
        'attendance_records', 'id_card_logs'
      ];

      for (const sub of subcollections) {
        const snap = await getDocs(collection(db, CLIENTS_COLLECTION, clientId, sub));
        data[sub] = snap.docs.map(d => d.data());
      }
      
      return data;
    } catch (error) {
      console.error("Error fetching full client data:", error);
      throw error;
    }
  },
  


  // --- Snapshots ---
  getAllSnapshots: async (): Promise<any[]> => {
    try {
      const snap = await getDocs(collection(db, 'saas_snapshots'));
      return snap.docs.map(d => d.data());
    } catch (error) {
      console.error("Error fetching snapshots:", error);
      return [];
    }
  },
  saveSnapshot: async (snapshot: any): Promise<void> => {
    try {
      await setDoc(doc(db, 'saas_snapshots', snapshot.id), snapshot);
    } catch (error) {
      console.error("Error saving snapshot:", error);
      throw error;
    }
  },
  deleteSnapshot: async (snapshotId: string): Promise<void> => {
    try {
      await deleteDoc(doc(db, 'saas_snapshots', snapshotId));
    } catch (error) {
      console.error("Error deleting snapshot:", error);
      throw error;
    }
  },

  // --- Support Templates ---
  getSupportTemplates: async (): Promise<any[]> => {
    try {
      const docRef = doc(db, CONFIG_COLLECTION, 'support_templates');
      const snap = await getDoc(docRef);
      if (snap.exists()) {
        return snap.data().templates || [];
      }
      return [];
    } catch (error) {
      console.error("Error fetching support templates:", error);
      return [];
    }
  },
  saveSupportTemplates: async (templates: any[]): Promise<void> => {
    try {
      await setDoc(doc(db, CONFIG_COLLECTION, 'support_templates'), { templates });
    } catch (error) {
      console.error("Error saving support templates:", error);
      throw error;
    }
  },

  // --- Master Credentials ---
  getMasterCredentials: async (): Promise<MasterCredentials> => {
    const fallback: MasterCredentials = {
      email: 'rodrigo@dev.com', 
      password: 'master', 
      whatsapp: '', 
      pixKey: '', 
      bankDetails: '',
      sidebarTitle: 'Sistema de Gestão de Terreiros',
      systemTitle: 'ConectAxé Painel de Desenvolvedor',
      brandLogo: MASTER_LOGO_URL,
      backupFrequency: 'disabled',
      masterName: 'Rodrigo Master'
    };
    try {
      const docRef = doc(db, CONFIG_COLLECTION, 'master_credentials');
      
      // Attempt to fetch from server first to ensure we have the latest password
      // This solves the issue where changing password and reloading still shows old password due to cache
      let snap;
      try {
        snap = await getDocFromServer(docRef);
      } catch (err) {
        console.warn("Could not fetch master credentials from server (offline?), falling back to cache:", err);
        snap = await getDoc(docRef);
      }

      if (snap.exists()) {
        console.log("Master credentials fetched:", snap.data());
        return { ...fallback, ...snap.data() } as MasterCredentials;
      }
      console.log("Master credentials not found, using fallback");
      return fallback;
    } catch (error) {
      console.error("Error fetching master credentials:", error);
      return fallback;
    }
  },
  saveMasterCredentials: async (credentials: MasterCredentials): Promise<void> => {
    try {
      console.log('Saving Master Credentials:', credentials);
      // Remove undefined fields to avoid Firestore errors
      const cleanCredentials = JSON.parse(JSON.stringify(credentials));
      await setDoc(doc(db, CONFIG_COLLECTION, 'master_credentials'), cleanCredentials, { merge: true });
      console.log('Master Credentials Saved Successfully');
    } catch (error) {
      console.error("Error saving master credentials:", error);
      throw error;
    }
  },

  // --- Ecosystem Backup ---
  getEcosystemSnapshot: async (): Promise<any> => {
    try {
      const [
        plans,
        clients,
        broadcasts,
        roadmap,
        coupons,
        auditLogs,
        masterCreds,
        autoBlockConfig,
        maintenanceConfig,
        supportTemplates
      ] = await Promise.all([
        MasterService.getAllPlans(),
        MasterService.getAllClients(),
        MasterService.getAllBroadcasts(),
        MasterService.getAllRoadmap(),
        MasterService.getAllCoupons(),
        MasterService.getAllAuditLogs(),
        MasterService.getMasterCredentials(),
        MasterService.getAutoBlockConfig(),
        MasterService.getGlobalMaintenance(),
        MasterService.getSupportTemplates()
      ]);

      // Fetch Client Configs
      const clientConfigs: Record<string, any> = {};
      await Promise.all(clients.map(async (client) => {
        try {
           const configRef = doc(db, CLIENTS_COLLECTION, client.id, CLIENT_CONFIG_SUBCOLLECTION, 'system_settings');
           const snap = await getDoc(configRef);
           if (snap.exists()) {
             clientConfigs[client.id] = snap.data();
           }
        } catch (e) {
          console.warn(`Could not fetch config for client ${client.id}`, e);
        }
      }));

      return {
        timestamp: new Date().toISOString(),
        version: '1.0',
        type: 'ecosystem_full_config',
        master: {
          credentials: masterCreds,
          autoBlock: autoBlockConfig,
          maintenance: maintenanceConfig,
          supportTemplates
        },
        data: {
          plans,
          clients, // The list
          clientConfigs, // The actual settings per client
          broadcasts,
          roadmap,
          coupons,
          auditLogs
        }
      };
    } catch (error) {
      console.error("Error generating ecosystem snapshot:", error);
      throw error;
    }
  }
};
