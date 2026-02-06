import { openDB, type IDBPDatabase } from 'idb';

const DB_NAME = 'flowforge_analytics';
const DB_VERSION = 1;
const STORE_NAME = 'events';

export type AnalyticsEventType = 
  | 'page_view'
  | 'process_created'
  | 'template_used'
  | 'export_performed'
  | 'chat_message_sent'
  | 'swimlane_toggle';

export interface AnalyticsEvent {
  id: string;
  type: AnalyticsEventType;
  data: Record<string, string | number>;
  timestamp: string;
}

async function getDB(): Promise<IDBPDatabase> {
  return openDB(DB_NAME, DB_VERSION, {
    upgrade(db) {
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        const store = db.createObjectStore(STORE_NAME, { keyPath: 'id' });
        store.createIndex('type', 'type');
        store.createIndex('timestamp', 'timestamp');
      }
    },
  });
}

function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * Track an analytics event.
 */
export async function trackEvent(
  type: AnalyticsEventType,
  data: Record<string, string | number> = {}
): Promise<void> {
  try {
    const db = await getDB();
    const event: AnalyticsEvent = {
      id: generateId(),
      type,
      data,
      timestamp: new Date().toISOString(),
    };
    await db.put(STORE_NAME, event);
  } catch (err) {
    // Silently fail — analytics should never break the app
    console.warn('[Analytics] Failed to track event:', err);
  }
}

/**
 * Get all events, optionally filtered by type.
 */
export async function getEvents(type?: AnalyticsEventType): Promise<AnalyticsEvent[]> {
  const db = await getDB();
  if (type) {
    return db.getAllFromIndex(STORE_NAME, 'type', type) as Promise<AnalyticsEvent[]>;
  }
  return db.getAll(STORE_NAME) as Promise<AnalyticsEvent[]>;
}

/**
 * Get aggregated analytics stats.
 */
export async function getAnalyticsStats(): Promise<{
  totalProcesses: number;
  totalPageViews: number;
  totalChatMessages: number;
  totalExports: number;
  templateUsage: Record<string, number>;
  industryUsage: Record<string, number>;
  exportTypes: Record<string, number>;
  dailyActivity: Record<string, number>;
}> {
  const events = await getEvents();
  
  const stats = {
    totalProcesses: 0,
    totalPageViews: 0,
    totalChatMessages: 0,
    totalExports: 0,
    templateUsage: {} as Record<string, number>,
    industryUsage: {} as Record<string, number>,
    exportTypes: {} as Record<string, number>,
    dailyActivity: {} as Record<string, number>,
  };
  
  for (const event of events) {
    // Daily activity
    const day = event.timestamp.split('T')[0];
    stats.dailyActivity[day] = (stats.dailyActivity[day] || 0) + 1;
    
    switch (event.type) {
      case 'page_view':
        stats.totalPageViews++;
        break;
      case 'process_created':
        stats.totalProcesses++;
        if (event.data.industry) {
          const industry = String(event.data.industry);
          stats.industryUsage[industry] = (stats.industryUsage[industry] || 0) + 1;
        }
        break;
      case 'template_used':
        if (event.data.template) {
          const template = String(event.data.template);
          stats.templateUsage[template] = (stats.templateUsage[template] || 0) + 1;
        }
        break;
      case 'export_performed':
        stats.totalExports++;
        if (event.data.format) {
          const format = String(event.data.format);
          stats.exportTypes[format] = (stats.exportTypes[format] || 0) + 1;
        }
        break;
      case 'chat_message_sent':
        stats.totalChatMessages++;
        break;
    }
  }
  
  return stats;
}
