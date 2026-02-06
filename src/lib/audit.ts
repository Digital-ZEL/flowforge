import { openDB, type IDBPDatabase } from 'idb';

const AUDIT_DB_NAME = 'flowforge_audit';
const AUDIT_DB_VERSION = 1;
const AUDIT_STORE = 'audit_log';

export type AuditAction = 'created' | 'edited' | 'reviewed' | 'approved' | 'rejected' | 'submitted_for_review' | 'requested_changes' | 'status_changed';

export interface AuditEntry {
  id: string;
  processId: string;
  action: AuditAction;
  description: string;
  user: string;
  timestamp: string;
}

let dbPromise: Promise<IDBPDatabase> | null = null;

function getAuditDB(): Promise<IDBPDatabase> {
  if (!dbPromise) {
    dbPromise = openDB(AUDIT_DB_NAME, AUDIT_DB_VERSION, {
      upgrade(db) {
        if (!db.objectStoreNames.contains(AUDIT_STORE)) {
          const store = db.createObjectStore(AUDIT_STORE, { keyPath: 'id' });
          store.createIndex('processId', 'processId');
          store.createIndex('timestamp', 'timestamp');
        }
      },
      blocked() {
        console.warn('Audit DB blocked');
      },
      blocking() {
        console.warn('Audit DB blocking');
      },
    });
  }
  return dbPromise;
}

export async function addAuditEntry(
  processId: string,
  action: AuditAction,
  description: string,
  user: string = 'You'
): Promise<AuditEntry> {
  const db = await getAuditDB();
  const entry: AuditEntry = {
    id: `${processId}_audit_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
    processId,
    action,
    description,
    user,
    timestamp: new Date().toISOString(),
  };
  await db.put(AUDIT_STORE, entry);
  return entry;
}

export async function getAuditLog(processId: string): Promise<AuditEntry[]> {
  const db = await getAuditDB();
  const all = await db.getAllFromIndex(AUDIT_STORE, 'processId', processId);
  return (all as AuditEntry[]).sort(
    (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
  );
}

export async function exportAuditLog(processId: string): Promise<string> {
  const entries = await getAuditLog(processId);
  if (entries.length === 0) return 'No audit entries found.';

  const lines = entries.map((e) => {
    const date = new Date(e.timestamp);
    const dateStr = date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
    return `[${dateStr}] ${e.user} — ${e.action.replace(/_/g, ' ').toUpperCase()}: ${e.description}`;
  });

  return `FlowForge Audit Log\nProcess: ${processId}\nExported: ${new Date().toLocaleString()}\n${'─'.repeat(50)}\n${lines.join('\n')}`;
}
