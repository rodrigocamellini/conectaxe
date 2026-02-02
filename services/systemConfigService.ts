
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

      let config: SystemConfig;

      if (docSnap.exists()) {
        // Merge with default config to ensure all fields exist
        config = {
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
                config = { ...DEFAULT_SYSTEM_CONFIG, ...legacySnap.data() } as SystemConfig;
            } else {
                config = DEFAULT_SYSTEM_CONFIG;
            }
        } else {
            config = DEFAULT_SYSTEM_CONFIG;
        }
      }

      // Ensure license data is populated (On-the-fly migration for existing clients)
      if (clientId && (!config.license || !config.license.planName)) {
        try {
            const clientDocRef = doc(db, CLIENTS_COLLECTION, clientId);
            const clientSnap = await getDoc(clientDocRef);
            
            if (clientSnap.exists()) {
                const clientData = clientSnap.data();
                // Merge existing license data with client data
                config.license = {
                    ...(config.license || {}),
                    clientId: clientId,
                    planName: clientData.plan || config.license?.planName || '',
                    status: clientData.status || config.license?.status || 'active',
                    expirationDate: clientData.expirationDate || config.license?.expirationDate || '',
                    // Preserve affiliate link if it exists in config, otherwise generate default
                    affiliateLink: config.license?.affiliateLink || `https://conectaxe.com/cadastro?ref=${clientId}`
                };
            }
        } catch (err) {
            console.error("Error syncing client license data:", err);
        }
      }

      return config;
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
