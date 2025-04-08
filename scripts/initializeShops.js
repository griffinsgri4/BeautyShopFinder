const { initializeApp } = require('firebase/app');
const { getDatabase, ref, set } = require('firebase/database');

const firebaseConfig = {
  apiKey: "AIzaSyBtSjqF3D8Sr05YWAXBU9f94a-3RCRF1m8",
  authDomain: "beautyshopfinder-e0f84.firebaseapp.com",
  projectId: "beautyshopfinder-e0f84",
  storageBucket: "beautyshopfinder-e0f84.firebasestorage.app",
  messagingSenderId: "205104856117",
  appId: "1:205104856117:web:16627d179e434ec8eac57c",
  databaseURL: "https://beautyshopfinder-e0f84-default-rtdb.firebaseio.com"
};

const app = initializeApp(firebaseConfig);
const database = getDatabase(app);

const initialShops = [
  {
    id: '1',
    name: 'Glamour Beauty Salon',
    distance: 0.5,
    waitTime: 15,
    rating: 4.5,
    queueSize: 3,
    isOpen: true,
    services: ['Haircut', 'Facial', 'Manicure'],
    location: { latitude: 40.7128, longitude: -74.0060 },
    address: '123 Beauty Lane, New York, NY',
    operatingHours: { open: '09:00', close: '18:00' }
  },
  {
    id: '2',
    name: 'Style Studio',
    distance: 1.2,
    waitTime: 30,
    rating: 4.8,
    queueSize: 5,
    isOpen: true,
    services: ['Hair Styling', 'Makeup', 'Pedicure'],
    location: { latitude: 40.7142, longitude: -74.0064 },
    address: '456 Fashion Ave, New York, NY',
    operatingHours: { open: '10:00', close: '19:00' }
  },
  {
    id: '3',
    name: 'Elite Cuts',
    distance: 2.0,
    waitTime: 10,
    rating: 4.2,
    queueSize: 2,
    isOpen: true,
    services: ['Haircut', 'Beard Trim', 'Hair Color'],
    location: { latitude: 40.7135, longitude: -74.0062 },
    address: '789 Style Street, New York, NY',
    operatingHours: { open: '08:00', close: '20:00' }
  }
];

const shopsRef = ref(database, 'shops');
set(shopsRef, initialShops.reduce((acc, shop) => {
  acc[shop.id] = shop;
  return acc;
}, {})).then(() => {
  console.log('Sample shop data initialized successfully');
  process.exit(0);
}).catch((error) => {
  console.error('Error initializing shop data:', error);
  process.exit(1);
});