
import { CanteenItem, CanteenOrder } from '../types';
import { db } from './firebaseConfig';
import { collection, getDocs, doc, setDoc, deleteDoc } from 'firebase/firestore';

const CLIENTS_COLLECTION = 'saas_clients';
const SUBCOL_CANTEEN_ITEMS = 'canteen_items';
const SUBCOL_CANTEEN_ORDERS = 'canteen_orders';

export const CanteenService = {
  getAllItems: async (clientId: string): Promise<CanteenItem[]> => {
    if (!clientId) return [];
    try {
      const querySnapshot = await getDocs(collection(db, CLIENTS_COLLECTION, clientId, SUBCOL_CANTEEN_ITEMS));
      return querySnapshot.docs.map(doc => doc.data() as CanteenItem);
    } catch (error) {
      console.error("Erro ao buscar itens da cantina:", error);
      return [];
    }
  },

  saveItem: async (clientId: string, item: CanteenItem): Promise<void> => {
    if (!clientId) throw new Error("Client ID required");
    try {
      const cleanItem = JSON.parse(JSON.stringify(item));
      await setDoc(doc(db, CLIENTS_COLLECTION, clientId, SUBCOL_CANTEEN_ITEMS, item.id), cleanItem);
    } catch (error) {
      console.error("Erro ao salvar item da cantina:", error);
      throw error;
    }
  },

  deleteItem: async (clientId: string, itemId: string): Promise<void> => {
    if (!clientId) throw new Error("Client ID required");
    try {
      await deleteDoc(doc(db, CLIENTS_COLLECTION, clientId, SUBCOL_CANTEEN_ITEMS, itemId));
    } catch (error) {
      console.error("Erro ao excluir item da cantina:", error);
      throw error;
    }
  },

  getAllOrders: async (clientId: string): Promise<CanteenOrder[]> => {
    if (!clientId) return [];
    try {
      const querySnapshot = await getDocs(collection(db, CLIENTS_COLLECTION, clientId, SUBCOL_CANTEEN_ORDERS));
      return querySnapshot.docs.map(doc => doc.data() as CanteenOrder);
    } catch (error) {
      console.error("Erro ao buscar pedidos da cantina:", error);
      return [];
    }
  },

  saveOrder: async (clientId: string, order: CanteenOrder): Promise<void> => {
    if (!clientId) throw new Error("Client ID required");
    try {
      const cleanOrder = JSON.parse(JSON.stringify(order));
      await setDoc(doc(db, CLIENTS_COLLECTION, clientId, SUBCOL_CANTEEN_ORDERS, order.id), cleanOrder);
    } catch (error) {
      console.error("Erro ao salvar pedido da cantina:", error);
      throw error;
    }
  },

  deleteOrder: async (clientId: string, orderId: string): Promise<void> => {
    if (!clientId) throw new Error("Client ID required");
    try {
      await deleteDoc(doc(db, CLIENTS_COLLECTION, clientId, SUBCOL_CANTEEN_ORDERS, orderId));
    } catch (error) {
      console.error("Erro ao excluir pedido da cantina:", error);
      throw error;
    }
  }
};
