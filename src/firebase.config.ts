import { initializeApp, FirebaseApp } from 'firebase/app';

// Using the Firebase configuration provided by the user.
// This resolves startup errors. If the connection fails (e.g., due to security rules),
// the app will gracefully fall back to using local mock data.
const firebaseConfig = {
  // FIX: Restored the full, valid API key. A previous change incorrectly removed the final characters,
  // causing an "auth/api-key-not-valid" error.
  apiKey: "AIzaSyAIMOBdZK4NfcyfHShkM1h0UcfJ0pjom8-Q",
  authDomain: "crazybasketmall.firebaseapp.com",
  projectId: "crazybasketmall",
  storageBucket: "crazybasketmall.appspot.com",
  messagingSenderId: "442095144764",
  appId: "1:442095144764:web:c5c9f6b6b5bc29f2169839",
  measurementId: "G-M4VPP5Q3KM"
};

// Initialize Firebase and export the app instance
export const app: FirebaseApp = initializeApp(firebaseConfig);