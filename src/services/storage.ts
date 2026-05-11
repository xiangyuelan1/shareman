import type { Memory, Person, Insight, GrowthRecord, Tag, StorageStats } from '@/types';

class StorageService {
  private dbName = 'tongzhou-db';
  private version = 1;
  private db: IDBDatabase | null = null;

  async init(): Promise<void> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.dbName, this.version);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        this.db = request.result;
        resolve();
      };

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;

        if (!db.objectStoreNames.contains('memories')) {
          db.createObjectStore('memories', { keyPath: 'id' });
        }

        if (!db.objectStoreNames.contains('persons')) {
          db.createObjectStore('persons', { keyPath: 'id' });
        }

        if (!db.objectStoreNames.contains('insights')) {
          db.createObjectStore('insights', { keyPath: 'id' });
        }

        if (!db.objectStoreNames.contains('growthRecords')) {
          db.createObjectStore('growthRecords', { keyPath: 'id' });
        }

        if (!db.objectStoreNames.contains('tags')) {
          db.createObjectStore('tags', { keyPath: 'id' });
        }
      };
    });
  }

  private async getStore(
    storeName: string,
    mode: IDBTransactionMode = 'readonly'
  ): Promise<IDBObjectStore> {
    if (!this.db) {
      await this.init();
    }
    const transaction = this.db!.transaction(storeName, mode);
    return transaction.objectStore(storeName);
  }

  async saveMemory(memory: Memory): Promise<void> {
    const store = await this.getStore('memories', 'readwrite');
    return new Promise((resolve, reject) => {
      const request = store.put(memory);
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  async getMemories(): Promise<Memory[]> {
    const store = await this.getStore('memories');
    return new Promise((resolve, reject) => {
      const request = store.getAll();
      request.onsuccess = () => resolve(request.result || []);
      request.onerror = () => reject(request.error);
    });
  }

  async getMemoryById(id: string): Promise<Memory | null> {
    const store = await this.getStore('memories');
    return new Promise((resolve, reject) => {
      const request = store.get(id);
      request.onsuccess = () => resolve(request.result || null);
      request.onerror = () => reject(request.error);
    });
  }

  async deleteMemory(id: string): Promise<void> {
    const store = await this.getStore('memories', 'readwrite');
    return new Promise((resolve, reject) => {
      const request = store.delete(id);
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  async savePerson(person: Person): Promise<void> {
    const store = await this.getStore('persons', 'readwrite');
    return new Promise((resolve, reject) => {
      const request = store.put(person);
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  async getPersons(): Promise<Person[]> {
    const store = await this.getStore('persons');
    return new Promise((resolve, reject) => {
      const request = store.getAll();
      request.onsuccess = () => resolve(request.result || []);
      request.onerror = () => reject(request.error);
    });
  }

  async saveInsight(insight: Insight): Promise<void> {
    const store = await this.getStore('insights', 'readwrite');
    return new Promise((resolve, reject) => {
      const request = store.put(insight);
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  async getInsights(): Promise<Insight[]> {
    const store = await this.getStore('insights');
    return new Promise((resolve, reject) => {
      const request = store.getAll();
      request.onsuccess = () => resolve(request.result || []);
      request.onerror = () => reject(request.error);
    });
  }

  async saveGrowthRecord(record: GrowthRecord): Promise<void> {
    const store = await this.getStore('growthRecords', 'readwrite');
    return new Promise((resolve, reject) => {
      const request = store.put(record);
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  async getGrowthRecords(): Promise<GrowthRecord[]> {
    const store = await this.getStore('growthRecords');
    return new Promise((resolve, reject) => {
      const request = store.getAll();
      request.onsuccess = () => resolve(request.result || []);
      request.onerror = () => reject(request.error);
    });
  }

  async saveTag(tag: Tag): Promise<void> {
    const store = await this.getStore('tags', 'readwrite');
    return new Promise((resolve, reject) => {
      const request = store.put(tag);
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  async getTags(): Promise<Tag[]> {
    const store = await this.getStore('tags');
    return new Promise((resolve, reject) => {
      const request = store.getAll();
      request.onsuccess = () => resolve(request.result || []);
      request.onerror = () => reject(request.error);
    });
  }

  async clearAll(): Promise<void> {
    const storeNames = ['memories', 'persons', 'insights', 'growthRecords', 'tags'];
    
    for (const storeName of storeNames) {
      const store = await this.getStore(storeName, 'readwrite');
      await new Promise<void>((resolve, reject) => {
        const request = store.clear();
        request.onsuccess = () => resolve();
        request.onerror = () => reject(request.error);
      });
    }
  }
}

export const storageService = new StorageService();
