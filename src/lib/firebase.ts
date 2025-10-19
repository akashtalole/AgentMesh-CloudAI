// src/lib/firebase.ts
import { initializeApp, getApps, getApp, type FirebaseApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';

const firebaseConfig = {
  projectId: "agentmesh-cloudai",
  appId: "1:741386732702:web:01ada6d78398c1d530278f",
  storageBucket: "agentmesh-cloudai.firebasestorage.app",
  apiKey: "AIzaSyDaJfdig3Z2RhyK4SuG9w4sM54iPaO8l9A",
  authDomain: "agentmesh-cloudai.firebaseapp.com",
  messagingSenderId: "741386732702",
};

// Initialize Firebase as a singleton
const app: FirebaseApp = !getApps().length ? initializeApp(firebaseConfig) : getApp();
const db = getFirestore(app);
const auth = getAuth(app);

export { db, auth };