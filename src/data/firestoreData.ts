import { Timestamp } from 'firebase/firestore';

export interface Shop {
  id: string;
  name: string;
  type: 'salon' | 'barbershop';
  distance: number;
  waitTime: number;
  rating: number;
  queueSize: number;
  isOpen: boolean;
  services: string[];
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

export interface User {
  id: string;
  email: string;
  displayName: string;
  phoneNumber: string;
  preferences: {
    favoriteShops: string[];
    notifications: boolean;
  };
  appointments: string[];
}

export interface Appointment {
  userId: string;
  shopId: string;
  service: string;
  datetime: Timestamp;
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled';
  queueNumber: number;
}

export interface Review {
  userId: string;
  shopId: string;
  rating: number;
  comment: string;
  timestamp: Timestamp;
}

// Sample data for initialization
export const sampleData = {
  shops: [
    {
      id: 'shop1',
      name: 'Elegant Cuts Salon',
      type: 'salon',
      distance: 2.5,
      waitTime: 15,
      rating: 4.5,
      queueSize: 3,
      isOpen: true,
      services: ['haircut', 'coloring', 'styling'],
      location: {
        latitude: 40.7128,
        longitude: -74.0060
      },
      address: '123 Beauty Street, NY 10001',
      operatingHours: {
        open: '09:00',
        close: '20:00'
      }
    }
  ] as Shop[],

  users: [
    {
      id: 'user1',
      email: 'user@example.com',
      displayName: 'John Doe',
      phoneNumber: '+1234567890',
      preferences: {
        favoriteShops: ['shop1'],
        notifications: true
      },
      appointments: ['apt1']
    }
  ] as User[],

  appointments: [
    {
      userId: 'user1',
      shopId: 'shop1',
      service: 'haircut',
      datetime: Timestamp.fromDate(new Date()),
      status: 'pending',
      queueNumber: 1
    }
  ] as Appointment[],

  reviews: [
    {
      userId: 'user1',
      shopId: 'shop1',
      rating: 5,
      comment: 'Great service!',
      timestamp: Timestamp.fromDate(new Date())
    }
  ] as Review[]
};