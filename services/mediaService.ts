
import { Ponto, Reza, Erva, Banho } from '../types';
import { db } from './firebaseConfig';
import { collection, getDocs, doc, setDoc, deleteDoc } from 'firebase/firestore';

const CLIENTS_COLLECTION = 'saas_clients';
const SUBCOL_PONTOS = 'media_pontos';
const SUBCOL_REZAS = 'media_rezas';
const SUBCOL_ERVAS = 'media_ervas';
const SUBCOL_BANHOS = 'media_banhos';

export const MediaService = {
  // --- Pontos ---
  getAllPontos: async (clientId: string): Promise<Ponto[]> => {
    if (!clientId) return [];
    try {
      const querySnapshot = await getDocs(collection(db, CLIENTS_COLLECTION, clientId, SUBCOL_PONTOS));
      return querySnapshot.docs.map(doc => doc.data() as Ponto);
    } catch (error) {
      console.error("Erro ao buscar pontos:", error);
      return [];
    }
  },

  savePonto: async (clientId: string, ponto: Ponto): Promise<void> => {
    if (!clientId) throw new Error("Client ID required");
    try {
      const cleanPonto = JSON.parse(JSON.stringify(ponto));
      await setDoc(doc(db, CLIENTS_COLLECTION, clientId, SUBCOL_PONTOS, ponto.id), cleanPonto);
    } catch (error) {
      console.error("Erro ao salvar ponto:", error);
      throw error;
    }
  },

  deletePonto: async (clientId: string, pontoId: string): Promise<void> => {
    if (!clientId) throw new Error("Client ID required");
    try {
      await deleteDoc(doc(db, CLIENTS_COLLECTION, clientId, SUBCOL_PONTOS, pontoId));
    } catch (error) {
      console.error("Erro ao excluir ponto:", error);
      throw error;
    }
  },

  // --- Rezas ---
  getAllRezas: async (clientId: string): Promise<Reza[]> => {
    if (!clientId) return [];
    try {
      const querySnapshot = await getDocs(collection(db, CLIENTS_COLLECTION, clientId, SUBCOL_REZAS));
      return querySnapshot.docs.map(doc => doc.data() as Reza);
    } catch (error) {
      console.error("Erro ao buscar rezas:", error);
      return [];
    }
  },

  saveReza: async (clientId: string, reza: Reza): Promise<void> => {
    if (!clientId) throw new Error("Client ID required");
    try {
      const cleanReza = JSON.parse(JSON.stringify(reza));
      await setDoc(doc(db, CLIENTS_COLLECTION, clientId, SUBCOL_REZAS, reza.id), cleanReza);
    } catch (error) {
      console.error("Erro ao salvar reza:", error);
      throw error;
    }
  },

  deleteReza: async (clientId: string, rezaId: string): Promise<void> => {
    if (!clientId) throw new Error("Client ID required");
    try {
      await deleteDoc(doc(db, CLIENTS_COLLECTION, clientId, SUBCOL_REZAS, rezaId));
    } catch (error) {
      console.error("Erro ao excluir reza:", error);
      throw error;
    }
  },

  // --- Ervas ---
  getAllErvas: async (clientId: string): Promise<Erva[]> => {
    if (!clientId) return [];
    try {
      const querySnapshot = await getDocs(collection(db, CLIENTS_COLLECTION, clientId, SUBCOL_ERVAS));
      return querySnapshot.docs.map(doc => doc.data() as Erva);
    } catch (error) {
      console.error("Erro ao buscar ervas:", error);
      return [];
    }
  },

  saveErva: async (clientId: string, erva: Erva): Promise<void> => {
    if (!clientId) throw new Error("Client ID required");
    try {
      const cleanErva = JSON.parse(JSON.stringify(erva));
      await setDoc(doc(db, CLIENTS_COLLECTION, clientId, SUBCOL_ERVAS, erva.id), cleanErva);
    } catch (error) {
      console.error("Erro ao salvar erva:", error);
      throw error;
    }
  },

  deleteErva: async (clientId: string, ervaId: string): Promise<void> => {
    if (!clientId) throw new Error("Client ID required");
    try {
      await deleteDoc(doc(db, CLIENTS_COLLECTION, clientId, SUBCOL_ERVAS, ervaId));
    } catch (error) {
      console.error("Erro ao excluir erva:", error);
      throw error;
    }
  },

  // --- Banhos ---
  getAllBanhos: async (clientId: string): Promise<Banho[]> => {
    if (!clientId) return [];
    try {
      const querySnapshot = await getDocs(collection(db, CLIENTS_COLLECTION, clientId, SUBCOL_BANHOS));
      return querySnapshot.docs.map(doc => doc.data() as Banho);
    } catch (error) {
      console.error("Erro ao buscar banhos:", error);
      return [];
    }
  },

  saveBanho: async (clientId: string, banho: Banho): Promise<void> => {
    if (!clientId) throw new Error("Client ID required");
    try {
      const cleanBanho = JSON.parse(JSON.stringify(banho));
      await setDoc(doc(db, CLIENTS_COLLECTION, clientId, SUBCOL_BANHOS, banho.id), cleanBanho);
    } catch (error) {
      console.error("Erro ao salvar banho:", error);
      throw error;
    }
  },

  deleteBanho: async (clientId: string, banhoId: string): Promise<void> => {
    if (!clientId) throw new Error("Client ID required");
    try {
      await deleteDoc(doc(db, CLIENTS_COLLECTION, clientId, SUBCOL_BANHOS, banhoId));
    } catch (error) {
      console.error("Erro ao excluir banho:", error);
      throw error;
    }
  }
};
