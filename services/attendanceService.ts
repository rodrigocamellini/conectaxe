import { db } from './firebaseConfig';
import { 
  collection, doc, getDocs, setDoc, deleteDoc, query, where 
} from 'firebase/firestore';
import { AttendanceRecord } from '../types';

const CLIENTS_COLLECTION = 'saas_clients';
const SUBCOL_ATTENDANCE = 'attendance_records';

export const AttendanceService = {
  getAllRecords: async (clientId: string): Promise<AttendanceRecord[]> => {
    if (!clientId) throw new Error("Client ID required");
    try {
      const snap = await getDocs(collection(db, CLIENTS_COLLECTION, clientId, SUBCOL_ATTENDANCE));
      return snap.docs.map(d => d.data() as AttendanceRecord);
    } catch (error) {
      console.error("Error fetching attendance records:", error);
      return [];
    }
  },

  saveRecord: async (clientId: string, record: AttendanceRecord): Promise<void> => {
    if (!clientId) throw new Error("Client ID required");
    try {
      await setDoc(doc(db, CLIENTS_COLLECTION, clientId, SUBCOL_ATTENDANCE, record.id), record);
    } catch (error) {
      console.error("Error saving attendance record:", error);
      throw error;
    }
  },

  deleteRecord: async (clientId: string, recordId: string): Promise<void> => {
    if (!clientId) throw new Error("Client ID required");
    try {
      await deleteDoc(doc(db, CLIENTS_COLLECTION, clientId, SUBCOL_ATTENDANCE, recordId));
    } catch (error) {
      console.error("Error deleting attendance record:", error);
      throw error;
    }
  }
};
