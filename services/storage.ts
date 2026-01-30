
// This service is DEPRECATED and should not be used.
// All data persistence should be handled via Firebase services (Firestore/Storage).
// Keeping this file temporarily to prevent import errors during transition, 
// but all methods are now no-ops or log warnings.

export const STORAGE_KEYS = {
  AUTH: 'terreiro_auth',
  MASTER_CONFIG: 'terreiro_master_config'
};

export const storage = {
  get: <T,>(key: string): T | null => {
    console.warn(`[DEPRECATED] storage.get called for key "${key}". LocalStorage is being removed.`);
    return null;
  },
  set: <T,>(key: string, value: T): void => {
    console.warn(`[DEPRECATED] storage.set called for key "${key}". LocalStorage is being removed.`);
  },
  remove: (key: string): void => {
    console.warn(`[DEPRECATED] storage.remove called for key "${key}". LocalStorage is being removed.`);
  },
  clear: (): void => {
    console.warn(`[DEPRECATED] storage.clear called. LocalStorage is being removed.`);
  }
};
