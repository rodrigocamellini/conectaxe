import { db } from '../services/firebaseConfig';
import { doc, getDoc, setDoc } from 'firebase/firestore';

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
  landing_page_cnpj?: string;
  landing_page_hero?: {
    title?: string;
    subtitle?: string;
    backgroundImage?: string;
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
  }
};
