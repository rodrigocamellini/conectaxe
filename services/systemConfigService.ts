
import { SystemConfig } from '../types';
import { db } from './firebaseConfig';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { DEFAULT_SYSTEM_CONFIG } from '../constants';

const CLIENTS_COLLECTION = 'saas_clients';
const SUBCOL_CONFIG = 'config';
const CONFIG_DOC_ID = 'system_settings';

// Fallback for legacy global config (if any)
const LEGACY_COLLECTION_NAME = 'system_config';
const DEFAULT_DOC_ID = 'main';

export const SystemConfigService = {
  getConfig: async (clientId?: string): Promise<SystemConfig> => {
    try {
      let docRef;
      
      if (clientId) {
        // Use subcollection for specific client
        docRef = doc(db, CLIENTS_COLLECTION, clientId, SUBCOL_CONFIG, CONFIG_DOC_ID);
      } else {
        // Fallback or default global config
        docRef = doc(db, LEGACY_COLLECTION_NAME, DEFAULT_DOC_ID);
      }

      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        // Merge with default config to ensure all fields exist
        return {
          ...DEFAULT_SYSTEM_CONFIG,
          ...docSnap.data()
        } as SystemConfig;
      } else {
        // If client config doesn't exist, maybe try legacy way or return default
        if (clientId) {
            // Try legacy path just in case migration isn't complete
            const legacyDocRef = doc(db, LEGACY_COLLECTION_NAME, `client_${clientId}`);
            const legacySnap = await getDoc(legacyDocRef);
            if (legacySnap.exists()) {
                return { ...DEFAULT_SYSTEM_CONFIG, ...legacySnap.data() } as SystemConfig;
            }
        }
        return DEFAULT_SYSTEM_CONFIG;
      }
    } catch (error) {
      console.error("Erro ao buscar configurações:", error);
      return DEFAULT_SYSTEM_CONFIG;
    }
  },

  saveConfig: async (config: SystemConfig, clientId?: string): Promise<void> => {
    try {
      let docRef;
      if (clientId) {
         docRef = doc(db, CLIENTS_COLLECTION, clientId, SUBCOL_CONFIG, CONFIG_DOC_ID);
      } else {
         docRef = doc(db, LEGACY_COLLECTION_NAME, DEFAULT_DOC_ID);
      }
      
      await setDoc(docRef, config);
    } catch (error) {
      console.error("Erro ao salvar configurações:", error);
      throw error;
    }
  }
};
