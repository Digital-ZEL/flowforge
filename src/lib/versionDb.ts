import { openDB, type IDBPDatabase } from 'idb';
import type { AnalysisResult, FeedbackComment } from './types';

const DB_NAME = 'flowforge';
const DB_VERSION = 5;
const PROCESS_STORE = 'processes';
const VERSION_STORE = 'versions';
const CHAT_STORE = 'chats';
const META_STORE = 'meta';
const FEEDBACK_STORE = 'feedback';

export interface ProcessVersion {
  id: string;
  processId: string;
  version: number;
  snapshot: AnalysisResult;
  label: string;
  createdAt: string;
}

export interface ChatMessage {
  id: string;
  processId: string;
  userMessage: string;
  aiResponse: {
    reply: string;
    hasProcessUpdate: boolean;
    updatedOption?: {
      name: string;
      description: string;
      improvement: string;
      steps: Array<{
        id: string;
        label: string;
        type: string;
        connections: string[];
        description?: string;
        role?: string;
      }>;
    };
  };
  createdAt: string;
}

/* ═══════════════════════════════════════════
   In-memory fallback when IndexedDB is dead
   ═══════════════════════════════════════════ */
let memoryFallback = false;
const memStore: Record<string, Map<string, unknown>> = {
  [PROCESS_STORE]: new Map(),
  [VERSION_STORE]: new Map(),
  [CHAT_STORE]: new Map(),
  [META_STORE]: new Map(),
  [FEEDBACK_STORE]: new Map(),
};

function createUpgrade(db: IDBPDatabase, oldVersion: number, transaction: import('idb').IDBPTransaction<unknown, string[], 'versionchange'>) {
  if (!db.objectStoreNames.contains(PROCESS_STORE)) {
    const store = db.createObjectStore(PROCESS_STORE, { keyPath: 'id' });
    store.createIndex('createdAt', 'createdAt');
    store.createIndex('industry', 'industry');
  }
  if (!db.objectStoreNames.contains(VERSION_STORE)) {
    const vStore = db.createObjectStore(VERSION_STORE, { keyPath: 'id' });
    vStore.createIndex('processId', 'processId');
    vStore.createIndex('createdAt', 'createdAt');
  }
  if (!db.objectStoreNames.contains(CHAT_STORE)) {
    const cStore = db.createObjectStore(CHAT_STORE, { keyPath: 'id' });
    cStore.createIndex('processId', 'processId');
    cStore.createIndex('createdAt', 'createdAt');
  }
  if (!db.objectStoreNames.contains(META_STORE)) {
    db.createObjectStore(META_STORE, { keyPath: 'key' });
  }
  if (!db.objectStoreNames.contains(FEEDBACK_STORE)) {
    const fStore = db.createObjectStore(FEEDBACK_STORE, { keyPath: 'id' });
    fStore.createIndex('processId', 'processId');
    fStore.createIndex('createdAt', 'createdAt');
  }
  if (oldVersion < 5 && db.objectStoreNames.contains(PROCESS_STORE)) {
    const store = transaction.objectStore(PROCESS_STORE);
    if (!store.indexNames.contains('department')) {
      store.createIndex('department', 'department');
    }
    if (!store.indexNames.contains('updatedAt')) {
      store.createIndex('updatedAt', 'updatedAt');
    }
  }
}

let dbPromise: Promise<IDBPDatabase> | null = null;

async function getDB(): Promise<IDBPDatabase> {
  if (memoryFallback) throw new Error('memory-mode');
  if (dbPromise) return dbPromise;

  dbPromise = (async () => {
    try {
      return await openDB(DB_NAME, DB_VERSION, {
        upgrade(db, oldVersion, _newVersion, transaction) {
          createUpgrade(db, oldVersion, transaction);
        },
        blocked() {
          console.warn('FlowForge DB blocked');
        },
        blocking() {
          console.warn('FlowForge DB blocking');
        },
      });
    } catch (e1) {
      console.error('DB open failed, deleting and retrying:', e1);
      // Attempt 2: delete and recreate
      try {
        await new Promise<void>((resolve) => {
          const req = indexedDB.deleteDatabase(DB_NAME);
          req.onsuccess = () => resolve();
          req.onerror = () => resolve();
          req.onblocked = () => resolve();
          // Timeout after 3 seconds
          setTimeout(resolve, 3000);
        });
        return await openDB(DB_NAME, DB_VERSION, {
          upgrade(db) {
            createUpgrade(db, 0, null as unknown as import('idb').IDBPTransaction<unknown, string[], 'versionchange'>);
          },
        });
      } catch (e2) {
        console.error('DB retry failed, switching to memory mode:', e2);
        memoryFallback = true;
        throw new Error('memory-mode');
      }
    }
  })();

  try {
    return await dbPromise;
  } catch {
    dbPromise = null;
    throw new Error('memory-mode');
  }
}

/* ═══════════════════════════
   Safe wrappers (IDB or mem)
   ═══════════════════════════ */

// ---- Process CRUD ----
export async function saveProcess(process: AnalysisResult): Promise<void> {
  try {
    const db = await getDB();
    await db.put(PROCESS_STORE, process);
  } catch {
    memStore[PROCESS_STORE].set(process.id, process);
  }
}

export async function getProcess(id: string): Promise<AnalysisResult | undefined> {
  try {
    const db = await getDB();
    return db.get(PROCESS_STORE, id);
  } catch {
    return memStore[PROCESS_STORE].get(id) as AnalysisResult | undefined;
  }
}

export async function getAllProcesses(): Promise<AnalysisResult[]> {
  try {
    const db = await getDB();
    const all = await db.getAll(PROCESS_STORE);
    return all.sort((a: AnalysisResult, b: AnalysisResult) =>
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  } catch {
    const all = Array.from(memStore[PROCESS_STORE].values()) as AnalysisResult[];
    return all.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }
}

export async function deleteProcess(id: string): Promise<void> {
  try {
    const db = await getDB();
    await db.delete(PROCESS_STORE, id);
  } catch {
    memStore[PROCESS_STORE].delete(id);
  }
}

export async function searchProcesses(query: string): Promise<AnalysisResult[]> {
  const all = await getAllProcesses();
  const q = query.toLowerCase();
  return all.filter(
    (p: AnalysisResult) =>
      p.title.toLowerCase().includes(q) ||
      p.currentProcess.toLowerCase().includes(q) ||
      p.industry.toLowerCase().includes(q)
  );
}

// ---- Version History ----
export async function saveVersion(
  processId: string,
  snapshot: AnalysisResult,
  label: string
): Promise<ProcessVersion> {
  const existing = await getVersions(processId);
  const version = existing.length + 1;
  const entry: ProcessVersion = {
    id: `${processId}_v${version}`,
    processId,
    version,
    snapshot: JSON.parse(JSON.stringify(snapshot)),
    label,
    createdAt: new Date().toISOString(),
  };
  try {
    const db = await getDB();
    await db.put(VERSION_STORE, entry);
  } catch {
    memStore[VERSION_STORE].set(entry.id, entry);
  }
  return entry;
}

export async function getVersions(processId: string): Promise<ProcessVersion[]> {
  try {
    const db = await getDB();
    const all = await db.getAllFromIndex(VERSION_STORE, 'processId', processId);
    return (all as ProcessVersion[]).sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  } catch {
    const all = Array.from(memStore[VERSION_STORE].values()) as ProcessVersion[];
    return all
      .filter((v) => v.processId === processId)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }
}

export async function getVersion(versionId: string): Promise<ProcessVersion | undefined> {
  try {
    const db = await getDB();
    return db.get(VERSION_STORE, versionId);
  } catch {
    return memStore[VERSION_STORE].get(versionId) as ProcessVersion | undefined;
  }
}

// ---- Chat History ----
export async function saveChatMessage(msg: ChatMessage): Promise<void> {
  try {
    const db = await getDB();
    await db.put(CHAT_STORE, msg);
  } catch {
    memStore[CHAT_STORE].set(msg.id, msg);
  }
}

export async function getChatHistory(processId: string): Promise<ChatMessage[]> {
  try {
    const db = await getDB();
    const all = await db.getAllFromIndex(CHAT_STORE, 'processId', processId);
    return (all as ChatMessage[]).sort(
      (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
    );
  } catch {
    const all = Array.from(memStore[CHAT_STORE].values()) as ChatMessage[];
    return all
      .filter((m) => m.processId === processId)
      .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
  }
}

// ---- Meta (flags) ----
export async function getMeta(key: string): Promise<unknown> {
  try {
    const db = await getDB();
    const entry = await db.get(META_STORE, key);
    return entry?.value;
  } catch {
    const entry = memStore[META_STORE].get(key) as { value?: unknown } | undefined;
    return entry?.value;
  }
}

export async function setMeta(key: string, value: unknown): Promise<void> {
  try {
    const db = await getDB();
    await db.put(META_STORE, { key, value });
  } catch {
    memStore[META_STORE].set(key, { key, value });
  }
}

// ---- Feedback ----
export async function saveFeedback(feedback: FeedbackComment): Promise<void> {
  try {
    const db = await getDB();
    await db.put(FEEDBACK_STORE, feedback);
  } catch {
    memStore[FEEDBACK_STORE].set(feedback.id, feedback);
  }
}

export async function getFeedback(processId: string): Promise<FeedbackComment[]> {
  try {
    const db = await getDB();
    const all = await db.getAllFromIndex(FEEDBACK_STORE, 'processId', processId);
    return (all as FeedbackComment[]).sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  } catch {
    const all = Array.from(memStore[FEEDBACK_STORE].values()) as FeedbackComment[];
    return all
      .filter((f) => f.processId === processId)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }
}

export async function getFeedbackCount(processId: string): Promise<number> {
  const fb = await getFeedback(processId);
  return fb.length;
}

export async function updateLastViewed(processId: string): Promise<void> {
  try {
    const db = await getDB();
    const process = await db.get(PROCESS_STORE, processId);
    if (process) {
      process.lastViewedAt = new Date().toISOString();
      await db.put(PROCESS_STORE, process);
    }
  } catch {
    const process = memStore[PROCESS_STORE].get(processId) as AnalysisResult | undefined;
    if (process) {
      process.lastViewedAt = new Date().toISOString();
      memStore[PROCESS_STORE].set(processId, process);
    }
  }
}
