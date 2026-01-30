import { db } from './firebaseConfig';
import { 
  collection, doc, getDocs, setDoc, deleteDoc, query, where 
} from 'firebase/firestore';
import { IDCardLog } from '../types';

const CLIENTS_COLLECTION = 'saas_clients';
const SUBCOL_IDCARD_LOGS = 'id_card_logs';

export const IdCardService = {
  getAllLogs: async (clientId: string): Promise<IDCardLog[]> => {
    if (!clientId) throw new Error("Client ID required");
    try {
      const snap = await getDocs(collection(db, CLIENTS_COLLECTION, clientId, SUBCOL_IDCARD_LOGS));
      return snap.docs.map(d => d.data() as IDCardLog);
    } catch (error) {
      console.error("Error fetching ID card logs:", error);
      return [];
    }
  },

  saveLog: async (clientId: string, log: IDCardLog): Promise<void> => {
    if (!clientId) throw new Error("Client ID required");
    try {
      await setDoc(doc(db, CLIENTS_COLLECTION, clientId, SUBCOL_IDCARD_LOGS, log.id), log);
    } catch (error) {
      console.error("Error saving ID card log:", error);
      throw error;
    }
  },

  deleteLog: async (clientId: string, logId: string): Promise<void> => {
    if (!clientId) throw new Error("Client ID required");
    try {
      await deleteDoc(doc(db, CLIENTS_COLLECTION, clientId, SUBCOL_IDCARD_LOGS, logId));
    } catch (error) {
      console.error("Error deleting ID card log:", error);
      throw error;
    }
  }
};
