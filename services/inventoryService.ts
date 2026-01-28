
import { InventoryItem, StockUpdate, StockLog } from '../types';
import { generateUUID, generateShortID } from '../utils/ids';

export const InventoryService = {
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
