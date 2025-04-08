import { initializeApp } from 'firebase/app';
import { getFirestore, collection, doc, setDoc, Timestamp } from 'firebase/firestore';
import { getDatabase, ref, set } from 'firebase/database';
import { sampleData } from '../src/data/firestoreData';

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
const firestore = getFirestore(app);
const database = getDatabase(app);

async function initializeFirestore() {
  try {
    // Initialize shops
    for (const shop of sampleData.shops) {
      await setDoc(doc(firestore, 'shops', shop.id), shop);
    }

    // Initialize users
    for (const user of sampleData.users) {
      await setDoc(doc(firestore, 'users', user.id), user);
    }

    // Initialize appointments
    for (const appointment of sampleData.appointments) {
      const appointmentId = `${appointment.userId}_${appointment.shopId}_${appointment.datetime.toMillis()}`;
      await setDoc(doc(firestore, 'appointments', appointmentId), appointment);
    }

    // Initialize reviews
    for (const review of sampleData.reviews) {
      const reviewId = `${review.userId}_${review.shopId}_${review.timestamp.toMillis()}`;
      await setDoc(doc(firestore, 'reviews', reviewId), review);
    }

    console.log('Firestore data initialized successfully');
  } catch (error) {
    console.error('Error initializing Firestore data:', error);
    throw error;
  }
}

async function initializeRealtimeDB() {
  try {
    // Convert Timestamp to ISO string for Realtime Database
    const rtdbData = {
      ...sampleData,
      appointments: sampleData.appointments.map(apt => ({
        ...apt,
        datetime: apt.datetime.toDate().toISOString()
      })),
      reviews: sampleData.reviews.map(review => ({
        ...review,
        timestamp: review.timestamp.toDate().toISOString()
      }))
    };

    // Initialize all collections
    await set(ref(database, '/'), {
      shops: rtdbData.shops.reduce((acc, shop) => {
        acc[shop.id] = shop;
        return acc;
      }, {}),
      users: rtdbData.users.reduce((acc, user) => {
        acc[user.id] = user;
        return acc;
      }, {}),
      appointments: rtdbData.appointments.reduce((acc, apt) => {
        const appointmentId = `${apt.userId}_${apt.shopId}_${new Date(apt.datetime).getTime()}`;
        acc[appointmentId] = apt;
        return acc;
      }, {}),
      reviews: rtdbData.reviews.reduce((acc, review) => {
        const reviewId = `${review.userId}_${review.shopId}_${new Date(review.timestamp).getTime()}`;
        acc[reviewId] = review;
        return acc;
      }, {})
    });

    console.log('Realtime Database data initialized successfully');
  } catch (error) {
    console.error('Error initializing Realtime Database data:', error);
    throw error;
  }
}

async function initializeAllData() {
  try {
    await Promise.all([
      initializeFirestore(),
      initializeRealtimeDB()
    ]);
    console.log('All data initialized successfully');
  } catch (error) {
    console.error('Error during data initialization:', error);
    process.exit(1);
  }
}

initializeAllData();