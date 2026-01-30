
import { db } from './firebaseConfig';
import { collection, doc, getDocs, setDoc, deleteDoc } from 'firebase/firestore';
import { SpiritualEntity } from '../types';

const CLIENTS_COLLECTION = 'saas_clients';
const SUBCOL_ENTITIES = 'entities';

export const EntityService = {
  getAllEntities: async (clientId: string): Promise<SpiritualEntity[]> => {
    if (!clientId) return [];
    try {
      const q = collection(db, CLIENTS_COLLECTION, clientId, SUBCOL_ENTITIES);
      const snapshot = await getDocs(q);
      return snapshot.docs.map(doc => doc.data() as SpiritualEntity);
    } catch (error) {
      console.error("Erro ao buscar entidades:", error);
      return [];
    }
  },

  saveEntity: async (clientId: string, entity: SpiritualEntity): Promise<void> => {
    if (!clientId) throw new Error("Client ID required");
    try {
      const cleanEntity = JSON.parse(JSON.stringify(entity));
      await setDoc(doc(db, CLIENTS_COLLECTION, clientId, SUBCOL_ENTITIES, entity.id), cleanEntity);
    } catch (error) {
      console.error("Erro ao salvar entidade:", error);
      throw error;
    }
  },

  deleteEntity: async (clientId: string, entityId: string): Promise<void> => {
    if (!clientId) throw new Error("Client ID required");
    try {
      await deleteDoc(doc(db, CLIENTS_COLLECTION, clientId, SUBCOL_ENTITIES, entityId));
    } catch (error) {
      console.error("Erro ao excluir entidade:", error);
      throw error;
    }
  }
};
