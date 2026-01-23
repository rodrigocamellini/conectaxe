import { STORAGE_KEYS } from './storage';
import { StoredSnapshot, SystemConfig } from '../types';

const SNAPSHOTS_KEY = 'terreiro_snapshots';

export const backupService = {
  collectData: () => {
    const data: any = {};
    const keysToBackup = [
      STORAGE_KEYS.MEMBERS,
      STORAGE_KEYS.ENTITIES,
      STORAGE_KEYS.SYSTEM_CONFIG,
      'terreiro_events',
      'terreiro_courses',
      'terreiro_enrollments',
      'terreiro_attendance',
      'terreiro_inventory_items',
      'terreiro_inventory_cats',
      'terreiro_system_users',
      'terreiro_tickets',
      'saas_master_credentials',
      'saas_clients',
      'saas_plans',
      'saas_global_roadmap',
      'saas_global_broadcasts',
      'saas_coupons',
      'saas_tickets',
      'saas_audit_logs',
      'saas_referrals',
      'saas_master_snapshots',
      'saas_global_maintenance',
      'user_preferences',
      'theme_config',
      'terreiro_donations',
      'terreiro_stock_logs',
      'terreiro_idcard_logs',
      'terreiro_canteen_items',
      'terreiro_canteen_orders',
      'terreiro_advanced_events',
      'terreiro_event_tickets',
      'terreiro_pontos',
      'terreiro_rezas',
      'terreiro_ervas',
      'terreiro_banhos'
    ];

    // Also look for dynamic keys
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && (
          key.startsWith('terreiro_') || 
          key.startsWith('saas_') || 
          key.startsWith('dismissed_')
      )) {
        if (!keysToBackup.includes(key)) {
          keysToBackup.push(key);
        }
      }
    }

    keysToBackup.forEach(key => {
      const stored = localStorage.getItem(key);
      if (stored) {
        try {
          data[key] = JSON.parse(stored);
        } catch (e) {
          data[key] = stored;
        }
      }
    });

    return data;
  },

  createSnapshot: (type: 'Manual' | 'Auto' = 'Manual'): StoredSnapshot => {
    const data = backupService.collectData();
    const dataStr = JSON.stringify(data);
    const size = (dataStr.length / 1024).toFixed(2) + ' KB';
    
    return {
      id: Math.random().toString(36).substr(2, 9).toUpperCase(),
      date: new Date().toISOString(),
      type,
      data,
      size
    };
  },

  getSnapshots: (): StoredSnapshot[] => {
    try {
      return JSON.parse(localStorage.getItem(SNAPSHOTS_KEY) || '[]');
    } catch {
      return [];
    }
  },

  saveSnapshot: (snapshot: StoredSnapshot) => {
    const current = backupService.getSnapshots();
    const updated = [snapshot, ...current];
    localStorage.setItem(SNAPSHOTS_KEY, JSON.stringify(updated));
    return updated;
  },

  deleteSnapshot: (id: string) => {
    const current = backupService.getSnapshots();
    const updated = current.filter(s => s.id !== id);
    localStorage.setItem(SNAPSHOTS_KEY, JSON.stringify(updated));
    return updated;
  },

  shouldRunAutoBackup: (frequency: 'disabled' | '7' | '15' | '30' | undefined): boolean => {
    if (!frequency || frequency === 'disabled') return false;

    const snapshots = backupService.getSnapshots();
    // Find last auto backup or fallback to any backup? 
    // Usually auto-backup frequency is about "time since last backup". 
    // But specific requirement is "Auto Backup". Let's check last backup of any kind or just auto?
    // Let's check the most recent backup regardless of type to avoid redundant backups if user just did a manual one.
    // However, usually auto-backups are separate. Let's stick to checking the last backup date generally.
    
    if (snapshots.length === 0) return true;

    const lastBackup = snapshots[0]; // Assuming sorted by date desc as we prepend
    const lastDate = new Date(lastBackup.date);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - lastDate.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)); 

    return diffDays >= parseInt(frequency);
  }
};
