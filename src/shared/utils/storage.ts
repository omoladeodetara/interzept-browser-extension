import { Rule } from "../types/rules";

// Storage keys
const STORAGE_KEYS = {
  RULES: "interzept-rules",
  SETTINGS: "interzept-settings",
} as const;

// Storage interface for both localStorage and chrome.storage
interface StorageInterface {
  get(key: string): Promise<any>;
  set(key: string, value: any): Promise<void>;
  clear(): Promise<void>;
}

// Chrome extension storage implementation
class ChromeStorage implements StorageInterface {
  async get(key: string): Promise<any> {
    if (typeof chrome !== "undefined" && chrome.storage) {
      const result = await chrome.storage.local.get(key);
      return result[key];
    }
    return null;
  }

  async set(key: string, value: any): Promise<void> {
    if (typeof chrome !== "undefined" && chrome.storage) {
      await chrome.storage.local.set({ [key]: value });
    }
  }

  async clear(): Promise<void> {
    if (typeof chrome !== "undefined" && chrome.storage) {
      await chrome.storage.local.clear();
    }
  }
}

// Browser localStorage implementation
class LocalStorage implements StorageInterface {
  async get(key: string): Promise<any> {
    try {
      const item = localStorage.getItem(key);
      return item ? JSON.parse(item) : null;
    } catch {
      return null;
    }
  }

  async set(key: string, value: any): Promise<void> {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch (error) {
      console.error("Failed to save to localStorage:", error);
    }
  }

  async clear(): Promise<void> {
    try {
      localStorage.clear();
    } catch (error) {
      console.error("Failed to clear localStorage:", error);
    }
  }
}

// Auto-detect storage implementation
const createStorage = (): StorageInterface => {
  if (typeof chrome !== "undefined" && chrome.storage) {
    return new ChromeStorage();
  }
  return new LocalStorage();
};

const storage = createStorage();

// Rules storage utilities
export const rulesStorage = {
  async load(): Promise<Rule[]> {
    try {
      const rules = await storage.get(STORAGE_KEYS.RULES);
      return Array.isArray(rules) ? rules : [];
    } catch (error) {
      console.error("Failed to load rules:", error);
      return [];
    }
  },

  async save(rules: Rule[]): Promise<void> {
    try {
      await storage.set(STORAGE_KEYS.RULES, rules);
    } catch (error) {
      console.error("Failed to save rules:", error);
    }
  },

  async export(): Promise<string> {
    const rules = await this.load();
    return JSON.stringify(rules, null, 2);
  },

  async import(jsonData: string): Promise<Rule[]> {
    try {
      const importedRules = JSON.parse(jsonData);
      if (!Array.isArray(importedRules)) {
        throw new Error("Invalid format: expected array of rules");
      }
      
      // Validate rules structure
      const validRules = importedRules.filter((rule: any) => 
        rule && 
        typeof rule.id === "string" && 
        typeof rule.name === "string" && 
        typeof rule.type === "string"
      );

      return validRules;
    } catch (error) {
      console.error("Failed to import rules:", error);
      throw new Error("Invalid JSON format or corrupted data");
    }
  },

  async clear(): Promise<void> {
    await storage.set(STORAGE_KEYS.RULES, []);
  }
};

// General storage utilities
export const appStorage = {
  async get(key: string): Promise<any> {
    return storage.get(key);
  },

  async set(key: string, value: any): Promise<void> {
    return storage.set(key, value);
  },

  async clear(): Promise<void> {
    return storage.clear();
  }
};
