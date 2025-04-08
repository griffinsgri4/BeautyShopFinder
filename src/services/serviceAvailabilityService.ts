import { ref, onValue, update, get } from 'firebase/database';
import { getDatabase } from 'firebase/database';
const database = getDatabase();

export interface ServiceStatus {
  id: string;
  name: string;
  isAvailable: boolean;
  currentCapacity: number;
  maxCapacity: number;
  estimatedDuration: number; // in minutes
  lastUpdated: number;
}

export interface ShopServiceAvailability {
  services: Record<string, ServiceStatus>;
  lastUpdated: number;
}

export const serviceAvailabilityService = {
  // Subscribe to service availability updates for a specific shop
  subscribeToServiceAvailability: (shopId: string, callback: (availability: ShopServiceAvailability) => void) => {
    const availabilityRef = ref(database, `serviceAvailability/${shopId}`);
    return onValue(availabilityRef, (snapshot) => {
      const data = snapshot.val() as ShopServiceAvailability | null;
      callback(data || {
        services: {},
        lastUpdated: Date.now()
      });
    });
  },

  // Update service availability
  updateServiceAvailability: async (shopId: string, serviceId: string, updates: Partial<ServiceStatus>) => {
    const serviceRef = ref(database, `serviceAvailability/${shopId}/services/${serviceId}`);
    await update(serviceRef, {
      ...updates,
      lastUpdated: Date.now()
    });

    await update(ref(database, `serviceAvailability/${shopId}`), {
      lastUpdated: Date.now()
    });
  },

  // Get current service availability for a shop
  getServiceAvailability: async (shopId: string) => {
    const availabilityRef = ref(database, `serviceAvailability/${shopId}`);
    const snapshot = await get(availabilityRef);
    return snapshot.val() as ShopServiceAvailability | null;
  },

  // Initialize or reset service availability
  initializeServiceAvailability: async (shopId: string, services: Omit<ServiceStatus, 'lastUpdated'>[]) => {
    const availabilityRef = ref(database, `serviceAvailability/${shopId}`);
    const servicesRecord: Record<string, ServiceStatus> = {};
    
    services.forEach(service => {
      servicesRecord[service.id] = {
        ...service,
        lastUpdated: Date.now()
      };
    });

    await update(availabilityRef, {
      services: servicesRecord,
      lastUpdated: Date.now()
    });
  }
};