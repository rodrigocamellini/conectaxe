
import { InventoryItem, StockUpdate, StockLog, InventoryCategory } from '../types';
import { generateUUID, generateShortID } from '../utils/ids';
import { db } from './firebaseConfig';
import { collection, getDocs, doc, setDoc, deleteDoc } from 'firebase/firestore';

const CLIENTS_COLLECTION = 'saas_clients';
const SUBCOL_ITEMS = 'inventory_items';
const SUBCOL_LOGS = 'inventory_logs';
const SUBCOL_CATEGORIES = 'inventory_categories';

export const InventoryService = {
  // --- CRUD Firebase ---

  getAllItems: async (clientId: string): Promise<InventoryItem[]> => {
    if (!clientId) return [];
    try {
      const querySnapshot = await getDocs(collection(db, CLIENTS_COLLECTION, clientId, SUBCOL_ITEMS));
      return querySnapshot.docs.map(doc => doc.data() as InventoryItem);
    } catch (error) {
      console.error("Erro ao buscar itens de estoque:", error);
      return [];
    }
  },

  saveItem: async (clientId: string, item: InventoryItem): Promise<void> => {
    if (!clientId) throw new Error("Client ID required");
    try {
      const cleanItem = JSON.parse(JSON.stringify(item));
      await setDoc(doc(db, CLIENTS_COLLECTION, clientId, SUBCOL_ITEMS, item.id), cleanItem);
    } catch (error) {
      console.error("Erro ao salvar item de estoque:", error);
      throw error;
    }
  },

  deleteItem: async (clientId: string, itemId: string): Promise<void> => {
    if (!clientId) throw new Error("Client ID required");
    try {
      await deleteDoc(doc(db, CLIENTS_COLLECTION, clientId, SUBCOL_ITEMS, itemId));
    } catch (error) {
      console.error("Erro ao excluir item de estoque:", error);
      throw error;
    }
  },

  getAllLogs: async (clientId: string): Promise<StockLog[]> => {
    if (!clientId) return [];
    try {
      const querySnapshot = await getDocs(collection(db, CLIENTS_COLLECTION, clientId, SUBCOL_LOGS));
      return querySnapshot.docs.map(doc => doc.data() as StockLog);
    } catch (error) {
      console.error("Erro ao buscar logs de estoque:", error);
      return [];
    }
  },

  saveLog: async (clientId: string, log: StockLog): Promise<void> => {
    if (!clientId) throw new Error("Client ID required");
    try {
      const cleanLog = JSON.parse(JSON.stringify(log));
      await setDoc(doc(db, CLIENTS_COLLECTION, clientId, SUBCOL_LOGS, log.id), cleanLog);
    } catch (error) {
      console.error("Erro ao salvar log de estoque:", error);
      throw error;
    }
  },

  getAllCategories: async (clientId: string): Promise<InventoryCategory[]> => {
    if (!clientId) return [];
    try {
      const querySnapshot = await getDocs(collection(db, CLIENTS_COLLECTION, clientId, SUBCOL_CATEGORIES));
      return querySnapshot.docs.map(doc => doc.data() as InventoryCategory);
    } catch (error) {
      console.error("Erro ao buscar categorias de estoque:", error);
      return [];
    }
  },

  saveCategory: async (clientId: string, category: InventoryCategory): Promise<void> => {
    if (!clientId) throw new Error("Client ID required");
    try {
      const cleanCategory = JSON.parse(JSON.stringify(category));
      await setDoc(doc(db, CLIENTS_COLLECTION, clientId, SUBCOL_CATEGORIES, category.id), cleanCategory);
    } catch (error) {
      console.error("Erro ao salvar categoria de estoque:", error);
      throw error;
    }
  },

  deleteCategory: async (clientId: string, categoryId: string): Promise<void> => {
    if (!clientId) throw new Error("Client ID required");
    try {
      await deleteDoc(doc(db, CLIENTS_COLLECTION, clientId, SUBCOL_CATEGORIES, categoryId));
    } catch (error) {
      console.error("Erro ao excluir categoria de estoque:", error);
      throw error;
    }
  },

  // --- Helpers ---

  createCategory: (name: string): InventoryCategory => {
    return {
      id: generateUUID(),
      name: name,
      category: 'Geral' // Default value as per type definition
    } as InventoryCategory;
  },

  createItem: (data: Partial<InventoryItem>): InventoryItem => {
    return {
      ...data,
      id: generateUUID(),
      currentStock: data.currentStock || 0,
      minStock: data.minStock || 0,
      name: data.name || 'Novo Item',
      category: data.category || 'Geral'
    } as InventoryItem;
  },

  processStockUpdates: (
    updates: StockUpdate[], 
    currentItems: InventoryItem[], 
    user: string
  ): { updatedItems: InventoryItem[], newLogs: StockLog[] } => {
    const newLogs: StockLog[] = [];
    
    const updatedItems = currentItems.map(i => {
      const u = updates.find(x => x.id === i.id);
      if (u && u.currentStock !== i.currentStock) {
        newLogs.push({
          id: generateShortID('LOG-'),
          itemId: i.id,
          itemName: i.name,
          previousStock: i.currentStock,
          newStock: u.currentStock,
          change: u.currentStock - i.currentStock,
          date: new Date().toISOString(),
          responsible: user,
          type: u.currentStock > i.currentStock ? 'entrada' : 'saida'
        });
        return { ...i, currentStock: u.currentStock };
      }
      return i;
    });

    return { updatedItems, newLogs };
  }
};
