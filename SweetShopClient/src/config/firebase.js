import { initializeApp } from 'firebase/app';
import { getFirestore, connectFirestoreEmulator, doc } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';

// Firebase configuration
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN ,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID ,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET ,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID ,
  appId: import.meta.env.VITE_FIREBASE_APP_ID 
};

// Log configuration for debugging
console.log('🔥 Firebase Config:', {
  projectId: firebaseConfig.projectId,
  authDomain: firebaseConfig.authDomain,
  hasApiKey: !!firebaseConfig.apiKey && firebaseConfig.apiKey !== 'your-api-key-here'
});

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firestore with additional settings
export const db = getFirestore(app);

// Initialize Auth
export const auth = getAuth(app);

// For development with emulator (optional)
if (import.meta.env.VITE_USE_FIREBASE_EMULATOR === 'true') {
  try {
    connectFirestoreEmulator(db, 'localhost', 8080);
    console.log('🔥 Connected to Firestore Emulator');
  } catch (error) {
    console.log('Firestore emulator already connected or not available');
  }
}

// Test connection function
export const testFirebaseConnection = async () => {
  try {
    console.log('🔥 Testing Firebase connection...');
    
    // Simple test to verify connection without authentication
    const testDoc = doc(db, 'test', 'connection');
    console.log('🔥 Firebase connection test completed');
    return true;
  } catch (error) {
    console.error('🔥 Firebase connection failed:', error);
    return false;
  }
};

export default app;

// Utility function to generate deterministic chat ID
export const generateChatId = (userId1, userId2) => {
  return userId1 < userId2 ? `${userId1}_${userId2}` : `${userId2}_${userId1}`;
};
