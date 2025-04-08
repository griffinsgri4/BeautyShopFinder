export type RootStackParamList = {
  Home: undefined;
  HomeRoot: undefined;
  Profile: undefined;
  Services: undefined;
  Appointments: undefined;
  ShopDiscovery: undefined;
  Salon: { shopId: string };
  Barbershop: undefined;
  Settings: undefined;
  Auth: undefined;
  Main: undefined;
  ShopDetail: {
    shop: {
      id: string;
      name: string;
      distance: string;
      waitTime: string;
      rating: number;
      queueSize: number;
      isOpen: boolean;
      services: string[];
      specialties: string[];
    };
  };
};

export type Salon = {
  id: string;
  name: string;
  latitude: number;
  longitude: number;
  distance: string;
  rating: number;
  services: string[];
  isOpen: boolean;
  waitTime?: string;
  queueSize?: number;
  specialties?: string[];
};