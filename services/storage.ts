
const STORAGE_KEYS = {
  MEMBERS: 'terreiro_members',
  ENTITIES: 'terreiro_entities',
  AUTH: 'terreiro_auth',
  SYSTEM_CONFIG: 'terreiro_system_config'
};

export const storage = {
  get: <T,>(key: string): T | null => {
    try {
      const data = localStorage.getItem(key);
      return data ? JSON.parse(data) : null;
    } catch (error) {
      console.error(`Error parsing storage key "${key}":`, error);
      return null;
    }
  },
  set: <T,>(key: string, value: T): void => {
    localStorage.setItem(key, JSON.stringify(value));
  },
  clear: (key: string): void => {
    localStorage.removeItem(key);
  }
};

export { STORAGE_KEYS };
