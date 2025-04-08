import { ref, onValue, set, get, update } from 'firebase/database';
import { getDatabase } from 'firebase/database';
const database = getDatabase();

export interface QueueEntry {
  userId: string;
  serviceId: string;
  timestamp: number;
  estimatedWaitTime: number;
  status: 'waiting' | 'in-progress' | 'completed' | 'cancelled';
}

export interface ShopQueue {
  currentQueueSize: number;
  averageWaitTime: number;
  entries: Record<string, QueueEntry>;
  lastUpdated: number;
}

export const queueService = {
  // Subscribe to queue updates for a specific shop or all shops
  subscribeToQueueUpdates: (shopId: string, callback: (queue: ShopQueue | null) => void) => {
    const queueRef = ref(database, shopId === 'all' ? 'queues' : `queues/${shopId}`);
    return onValue(queueRef, (snapshot) => {
      const data = snapshot.val();
      if (shopId === 'all') {
        callback(data);
      } else {
        callback(data || {
          currentQueueSize: 0,
          averageWaitTime: 0,
          entries: {},
          lastUpdated: Date.now()
        });
      }
    });
  },

  // Add a customer to the queue
  addToQueue: async (shopId: string, entry: Omit<QueueEntry, 'timestamp' | 'status' | 'estimatedWaitTime'>) => {
    const queueRef = ref(database, `queues/${shopId}`);
    const queueSnapshot = await get(queueRef);
    const queue = queueSnapshot.val() as ShopQueue | null;
    
    const newEntry: QueueEntry = {
      ...entry,
      timestamp: Date.now(),
      status: 'waiting',
      estimatedWaitTime: calculateEstimatedWaitTime(queue)
    };

// Helper function to get service-specific data
function getServiceData(serviceId: string) {
  // In a real app, this would fetch from a service catalog
  const serviceData = {
    'haircut': { estimatedDuration: 30 },
    'coloring': { estimatedDuration: 90 },
    'styling': { estimatedDuration: 45 },
    'treatment': { estimatedDuration: 60 },
    'manicure': { estimatedDuration: 45 },
    'pedicure': { estimatedDuration: 45 },
    'facial': { estimatedDuration: 60 },
    'massage': { estimatedDuration: 60 }
  };
  return serviceData[serviceId] || null;
}

// Calculate time-based multiplier for wait time adjustments
function getTimeBasedMultiplier(hour: number, isWeekend: boolean): number {
  // Peak hours: 10-12 and 16-18
  const isPeakHour = (hour >= 10 && hour <= 12) || (hour >= 16 && hour <= 18);
  
  if (isWeekend && isPeakHour) return 1.5;
  if (isWeekend) return 1.3;
  if (isPeakHour) return 1.2;
  return 1.0;
}

// Analyze historical completion times to adjust estimates
function getHistoricalAdjustment(entries: Record<string, QueueEntry>): number {
  const completedEntries = Object.values(entries)
    .filter(entry => entry.status === 'completed')
    .slice(-10); // Look at last 10 completed entries

  if (completedEntries.length === 0) return 0;

  // Calculate average difference between estimated and actual times
  const totalDiff = completedEntries.reduce((sum, entry) => {
    const actualDuration = (entry.timestamp - entry.timestamp) / (1000 * 60); // Convert to minutes
    return sum + (actualDuration - entry.estimatedWaitTime);
  }, 0);

  return totalDiff / completedEntries.length;
};

    const entryKey = `${newEntry.userId}_${newEntry.timestamp}`;
    
    await update(queueRef, {
      [`entries/${entryKey}`]: newEntry,
      currentQueueSize: (queue?.currentQueueSize || 0) + 1,
      lastUpdated: Date.now()
    });

    return newEntry;
  },

  // Update a queue entry's status
  updateEntryStatus: async (shopId: string, entryKey: string, status: QueueEntry['status']) => {
    const entryRef = ref(database, `queues/${shopId}/entries/${entryKey}`);
    await update(entryRef, { status });

    if (status === 'completed' || status === 'cancelled') {
      const queueRef = ref(database, `queues/${shopId}`);
      const queueSnapshot = await get(queueRef);
      const queue = queueSnapshot.val() as ShopQueue;

      await update(queueRef, {
        currentQueueSize: Math.max(0, (queue?.currentQueueSize || 1) - 1),
        lastUpdated: Date.now()
      });
    }
  },

  // Get current queue status for a shop
  getQueueStatus: async (shopId: string) => {
    const queueRef = ref(database, `queues/${shopId}`);
    const snapshot = await get(queueRef);
    return snapshot.val() as ShopQueue | null;
  }
};

// Helper function to get service-specific data
function getServiceData(serviceId: string) {
  // In a real app, this would fetch from a service catalog
  const serviceData = {
    'haircut': { estimatedDuration: 30 },
    'coloring': { estimatedDuration: 90 },
    'styling': { estimatedDuration: 45 },
    'treatment': { estimatedDuration: 60 },
    'manicure': { estimatedDuration: 45 },
    'pedicure': { estimatedDuration: 45 },
    'facial': { estimatedDuration: 60 },
    'massage': { estimatedDuration: 60 }
  };
  return serviceData[serviceId] || null;
}

// Calculate time-based multiplier for wait time adjustments
function getTimeBasedMultiplier(hour: number, isWeekend: boolean): number {
  // Peak hours: 10-12 and 16-18
  const isPeakHour = (hour >= 10 && hour <= 12) || (hour >= 16 && hour <= 18);
  
  if (isWeekend && isPeakHour) return 1.5;
  if (isWeekend) return 1.3;
  if (isPeakHour) return 1.2;
  return 1.0;
}

// Analyze historical completion times to adjust estimates
function getHistoricalAdjustment(entries: Record<string, QueueEntry>): number {
  const completedEntries = Object.values(entries)
    .filter(entry => entry.status === 'completed')
    .slice(-10); // Look at last 10 completed entries

  if (completedEntries.length === 0) return 0;

  // Calculate average difference between estimated and actual times
  const totalDiff = completedEntries.reduce((sum, entry) => {
    const actualDuration = (entry.timestamp - entry.timestamp) / (1000 * 60); // Convert to minutes
    return sum + (actualDuration - entry.estimatedWaitTime);
  }, 0);

  return totalDiff / completedEntries.length;
};

// Helper function to calculate estimated wait time based on multiple factors
function calculateEstimatedWaitTime(queue: ShopQueue | null): number {
  if (!queue) return 15; // Default wait time in minutes
  
  const activeEntries = Object.values(queue.entries || {}).filter(
    entry => entry.status === 'waiting' || entry.status === 'in-progress'
  );

  if (activeEntries.length === 0) return 15;

  // Get current hour for time-based adjustments
  const currentHour = new Date().getHours();
  const isWeekend = [0, 6].includes(new Date().getDay());

  // Calculate base wait time using service-specific durations
  const baseWaitTime = activeEntries.reduce((total, entry) => {
    const serviceData = getServiceData(entry.serviceId); // Get service-specific data
    return total + (serviceData?.estimatedDuration || 15);
  }, 0);

  // Apply time-based adjustments
  const timeMultiplier = getTimeBasedMultiplier(currentHour, isWeekend);

  // Consider historical completion times
  const historicalAdjustment = getHistoricalAdjustment(queue.entries);

  // Calculate final estimate
  return Math.ceil((baseWaitTime * timeMultiplier + historicalAdjustment) / activeEntries.length);
}