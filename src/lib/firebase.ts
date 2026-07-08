import { initializeApp, getApps, getApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

const firebaseConfig = {
  apiKey: "AIzaSyD-2plmD0nYr-U-vVwSS1FcCEpFXdpJK34",
  authDomain: "smart-invitation-47.firebaseapp.com",
  projectId: "smart-invitation-47",
  storageBucket: "smart-invitation-47.firebasestorage.app",
  messagingSenderId: "103851393343",
  appId: "1:103851393343:web:4dc0511b560f23cb47138a",
  measurementId: "G-FJM7JSZV99"
};

// Initialize Firebase
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();

const db = getFirestore(app);
const storage = getStorage(app);

export { app, db, storage };
