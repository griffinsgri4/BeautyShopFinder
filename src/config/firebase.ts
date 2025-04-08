import { initializeApp, getApp } from 'firebase/app';
import { initializeAuth, getReactNativePersistence, getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getDatabase } from 'firebase/database';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';

const firebaseConfig = {
  apiKey: "AIzaSyBtSjqF3D8Sr05YWAXBU9f94a-3RCRF1m8",
  authDomain: "beautyshopfinder-e0f84.firebaseapp.com",
  projectId: "beautyshopfinder-e0f84",
  storageBucket: "beautyshopfinder-e0f84.firebasestorage.app",
  messagingSenderId: "205104856117",
  appId: "1:205104856117:web:16627d179e434ec8eac57c",
  databaseURL: "https://beautyshopfinder-e0f84-default-rtdb.firebaseio.com"
};

// Initialize Firebase app
let app;
try {
  app = initializeApp(firebaseConfig);
} catch (error: any) {
  if (error.code === 'app/duplicate-app') {
    // Catch the "already exists" error and get the existing app
    app = getApp();
  } else {
    console.error('Firebase initialization error:', error);
    throw error;
  }
}

// Initialize Auth with appropriate configuration based on platform
let auth: import('firebase/auth').Auth;
try {
  console.log('Initializing Firebase Auth...', { platform: Platform.OS, appName: app?.name });

  if (Platform.OS === 'web') {
    auth = getAuth(app);
    console.log('Web auth initialization completed');
  } else {
    // For React Native, ensure proper initialization with persistence
    try {
      // Always initialize with persistence for React Native
      auth = initializeAuth(app, {
        persistence: getReactNativePersistence(AsyncStorage)
      });
      console.log('React Native auth initialized with persistence');
    } catch (error: any) {
      if (error.code === 'auth/already-initialized') {
        console.log('Auth already initialized, getting existing instance');
        auth = getAuth(app);
      } else {
        console.error('Error initializing auth:', error);
        throw error;
      }
    }
  }

  // Verify auth initialization
  if (!auth) {
    console.error('Firebase Auth initialization failed - auth instance is null');
    throw new Error('Firebase Auth initialization failed');
  }

  // Configure auth settings
  auth.useDeviceLanguage();
  console.log('Firebase Auth initialized successfully', {
    platform: Platform.OS,
    appInitialized: !!app,
    authInitialized: !!auth,
    authConfig: auth.config
  });





} catch (error) {
  console.error('Firebase Auth initialization error:', error);
  throw error;
}

// Initialize Firestore and Realtime Database
const db = getFirestore(app);
const realtimeDb = getDatabase(app);

// Export initialized services
export { app, auth, db, realtimeDb };

// Note: Database rules are configured in Firebase Console:
// {
//   "rules": {
//     ".read": true,
//     ".write": true
//   }
// }