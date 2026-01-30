import { db } from './firebaseConfig';
import { collection, getDocs, doc, setDoc, deleteDoc, getDoc } from 'firebase/firestore';
import { StoredSnapshot } from '../types';

const BACKUPS_COLLECTION = 'backups';

export const backupService = {
  // Cloud-based backup methods
  
  createSnapshotFromData: (data: any, type: 'Manual' | 'Auto' = 'Manual'): StoredSnapshot => {
    const dataStr = JSON.stringify(data);
    const size = (dataStr.length / 1024).toFixed(2) + ' KB';
    
    return {
      id: Math.random().toString(36).substr(2, 9).toUpperCase(),
      date: new Date().toISOString(),
      type,
      data,
      size
    };
  },

  // Save backup to Firebase Cloud Storage (Firestore subcollection)
  saveBackup: async (clientId: string, snapshot: StoredSnapshot) => {
    try {
      const backupRef = doc(db, 'saas_clients', clientId, BACKUPS_COLLECTION, snapshot.id);
      await setDoc(backupRef, snapshot);
      return snapshot;
    } catch (error) {
      console.error("Error saving cloud backup:", error);
      throw error;
    }
  },

  // Get all backups for a client from Firestore
  getBackups: async (clientId: string): Promise<StoredSnapshot[]> => {
    try {
      const backupsRef = collection(db, 'saas_clients', clientId, BACKUPS_COLLECTION);
      const snapshot = await getDocs(backupsRef);
      return snapshot.docs.map(doc => doc.data() as StoredSnapshot)
        .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    } catch (error) {
      console.error("Error fetching cloud backups:", error);
      return [];
    }
  },

  // Delete a backup from Firestore
  deleteBackup: async (clientId: string, backupId: string) => {
    try {
      const backupRef = doc(db, 'saas_clients', clientId, BACKUPS_COLLECTION, backupId);
      await deleteDoc(backupRef);
    } catch (error) {
      console.error("Error deleting cloud backup:", error);
      throw error;
    }
  },

  // Restore backup (fetch data)
  restoreBackup: async (clientId: string, backupId: string) => {
    try {
        const backupRef = doc(db, 'saas_clients', clientId, BACKUPS_COLLECTION, backupId);
        const snapshot = await getDoc(backupRef);
        if (snapshot.exists()) {
            return snapshot.data() as StoredSnapshot;
        }
        throw new Error("Backup not found");
    } catch (error) {
        console.error("Error restoring cloud backup:", error);
        throw error;
    }
  },

  // Legacy/Local methods removed or deprecated
  collectData: () => {
    return {};
  }
};
