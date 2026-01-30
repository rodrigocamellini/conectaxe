import { db } from './firebaseConfig';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { ReleaseNote, GlobalBroadcast } from '../types';

const COLLECTION = 'platform_data';

export const PlatformService = {
  getRoadmap: async (): Promise<ReleaseNote[]> => {
    try {
      const docRef = doc(db, COLLECTION, 'roadmap');
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        return docSnap.data().items as ReleaseNote[];
      }
      return [];
    } catch (error) {
      console.error("Error getting roadmap:", error);
      return [];
    }
  },

  saveRoadmap: async (items: ReleaseNote[]): Promise<void> => {
    try {
      const docRef = doc(db, COLLECTION, 'roadmap');
      await setDoc(docRef, { items });
    } catch (error) {
      console.error("Error saving roadmap:", error);
      throw error;
    }
  },

  getBroadcasts: async (): Promise<GlobalBroadcast[]> => {
    try {
      const docRef = doc(db, COLLECTION, 'broadcasts');
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        return docSnap.data().items as GlobalBroadcast[];
      }
      return [];
    } catch (error) {
      console.error("Error getting broadcasts:", error);
      return [];
    }
  },

  saveBroadcasts: async (items: GlobalBroadcast[]): Promise<void> => {
    try {
      const docRef = doc(db, COLLECTION, 'broadcasts');
      await setDoc(docRef, { items });
    } catch (error) {
      console.error("Error saving broadcasts:", error);
      throw error;
    }
  }
};
