import { ref, onValue, set, get } from 'firebase/database';
import { getDatabase } from 'firebase/database';
const database = getDatabase();

export interface BeautyShop {
  id: string;
  name: string;
  distance: number;
  waitTime: number;
  rating: number;
  queueSize: number;
  isOpen: boolean;
  services: string[];
  isRecommended?: boolean;
  location: {
    latitude: number;
    longitude: number;
  };
  address: string;
  operatingHours: {
    open: string;
    close: string;
  };
}

export const shopService = {
  // Subscribe to shop updates
  subscribeToShops: (callback: (shops: BeautyShop[]) => void) => {
    const shopsRef = ref(database, 'shops');
    return onValue(shopsRef, (snapshot) => {
      const data = snapshot.val();
      const shops = data ? Object.values(data) as BeautyShop[] : [];
      callback(shops);
    });
  },

  // Get all shops
  getAllShops: async (): Promise<BeautyShop[]> => {
    const shopsRef = ref(database, 'shops');
    const snapshot = await get(shopsRef);
    const data = snapshot.val();
    return data ? Object.values(data) as BeautyShop[] : [];
  },

  // Get a specific shop by ID
  getShopById: async (shopId: string): Promise<BeautyShop | null> => {
    const shopRef = ref(database, `shops/${shopId}`);
    const snapshot = await get(shopRef);
    return snapshot.val();
  },

  // Initialize or update shop data
  initializeShops: async (shops: BeautyShop[]) => {
    const shopsRef = ref(database, 'shops');
    const shopsData = shops.reduce((acc, shop) => {
      acc[shop.id] = shop;
      return acc;
    }, {} as Record<string, BeautyShop>);
    await set(shopsRef, shopsData);
  }
};