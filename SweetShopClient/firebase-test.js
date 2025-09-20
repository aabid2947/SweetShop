// Firebase Connection Test
// Run this in your browser console to test Firebase connection

// Test 1: Check environment variables
console.log('🔧 Testing Firebase Environment Variables:');
console.log('VITE_FIREBASE_PROJECT_ID:', import.meta.env.VITE_FIREBASE_PROJECT_ID);
console.log('VITE_FIREBASE_API_KEY:', import.meta.env.VITE_FIREBASE_API_KEY ? '✅ Present' : '❌ Missing');
console.log('VITE_FIREBASE_AUTH_DOMAIN:', import.meta.env.VITE_FIREBASE_AUTH_DOMAIN);

// Test 2: Check Firebase initialization
import { db } from './src/config/firebase.js';
console.log('🔧 Testing Firebase Initialization:');
console.log('Firebase DB:', db ? '✅ Initialized' : '❌ Failed');

// Test 3: Simple Firestore test
import { collection, getDocs } from 'firebase/firestore';

async function testFirestore() {
  try {
    console.log('🔧 Testing Firestore Connection...');
    
    // Try to access a collection (this will trigger auth/permission checks)
    const testCollection = collection(db, 'test');
    const snapshot = await getDocs(testCollection);
    
    console.log('✅ Firestore connection successful!');
    console.log('Docs found:', snapshot.size);
    
  } catch (error) {
    console.error('❌ Firestore connection failed:');
    console.error('Error code:', error.code);
    console.error('Error message:', error.message);
    
    // Common error explanations
    if (error.code === 'permission-denied') {
      console.log('💡 Solution: Update Firestore security rules');
    } else if (error.code === 'failed-precondition') {
      console.log('💡 Solution: Enable Firestore in Firebase Console');
    } else if (error.code === 'unavailable') {
      console.log('💡 Solution: Check internet connection and Firebase project status');
    }
  }
}

// Run the test
testFirestore();
