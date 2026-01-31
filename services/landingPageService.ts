
import { db } from '../services/firebaseConfig';
import { doc, getDoc, setDoc, onSnapshot } from 'firebase/firestore';

const COLLECTION_NAME = 'system_config';
const DOC_ID = 'landing_page';

export interface LandingPageConfig {
  landing_page_social?: any;
  landing_page_testimonials?: any[];
  landing_page_client_logos?: any[];
  landing_page_faq?: any[];
  landing_page_modules?: any[];
  landing_page_logo?: string;
  landing_page_whatsapp?: string;
  landing_page_whatsapp_message?: string;
  landing_page_whatsapp_message_test?: string;
  landing_page_whatsapp_message_iniciante?: string;
  landing_page_whatsapp_message_expandido?: string;
  landing_page_whatsapp_message_pro?: string;
  landing_page_whatsapp_message_floating?: string;
  landing_page_cnpj?: string;
  landing_page_hero?: {
    title?: string;
    subtitle?: string;
    backgroundImage?: string;
    dashboardImage?: string;
  };
}

export const LandingPageService = {
  getConfig: async (): Promise<LandingPageConfig> => {
    try {
      const docRef = doc(db, COLLECTION_NAME, DOC_ID);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        return docSnap.data() as LandingPageConfig;
      } else {
        return {};
      }
    } catch (error) {
      console.error("Erro ao buscar dados da Landing Page:", error);
      return {};
    }
  },

  saveConfig: async (config: LandingPageConfig): Promise<void> => {
    try {
      const docRef = doc(db, COLLECTION_NAME, DOC_ID);
      // Merge true para não sobrescrever outros campos se enviarmos parcial, 
      // mas aqui vamos salvar tudo junto geralmente.
      await setDoc(docRef, config, { merge: true });
    } catch (error) {
      console.error("Erro ao salvar dados da Landing Page:", error);
      throw error;
    }
  },

  subscribeToConfig: (callback: (config: LandingPageConfig) => void): () => void => {
    const docRef = doc(db, COLLECTION_NAME, DOC_ID);
    return onSnapshot(docRef, (doc) => {
      if (doc.exists()) {
        callback(doc.data() as LandingPageConfig);
      } else {
        callback({});
      }
    }, (error) => {
      console.error("Erro no listener da Landing Page:", error);
    });
  }
};
