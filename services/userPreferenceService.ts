import { db } from './firebaseConfig';
import { doc, getDoc, setDoc } from 'firebase/firestore';

export interface UserPreferences {
  dismissedRoadmapIds: string[];
  dismissedBroadcastIds: string[];
}

const COLLECTION = 'user_preferences';

export const UserPreferenceService = {
  getPreferences: async (userId: string): Promise<UserPreferences> => {
    try {
      const docRef = doc(db, COLLECTION, userId);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        return docSnap.data() as UserPreferences;
      }
      return { dismissedRoadmapIds: [], dismissedBroadcastIds: [] };
    } catch (error) {
      console.error("Error getting user preferences:", error);
      return { dismissedRoadmapIds: [], dismissedBroadcastIds: [] };
    }
  },

  savePreferences: async (userId: string, preferences: UserPreferences): Promise<void> => {
    try {
      const docRef = doc(db, COLLECTION, userId);
      await setDoc(docRef, preferences, { merge: true });
    } catch (error) {
      console.error("Error saving user preferences:", error);
    }
  }
};
