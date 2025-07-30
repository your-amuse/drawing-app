// src/firebase.js
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';  // 追加
import { getAnalytics } from 'firebase/analytics';

const firebaseConfig = {
  apiKey: "AIzaSyDX39Yhgs15QqA28KqmglqdGXbddcUcVNI",
  authDomain: "drawing-app-92fa4.firebaseapp.com",
  projectId: "drawing-app-92fa4",
  storageBucket: "drawing-app-92fa4.appspot.com",
  messagingSenderId: "899994764882",
  appId: "1:899994764882:web:b51d85ebcbcb0216ec418b",
  measurementId: "G-6LBL6ENM41"
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);    // Firestoreを追加

// Analyticsは使うならここで初期化（なくてもOK）
export const analytics = getAnalytics(app);
