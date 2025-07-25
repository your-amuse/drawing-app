// src/firebase.js
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getAnalytics } from "firebase/analytics";

const firebaseConfig = {
  apiKey: "AIzaSyDX39Yhgs15QqA28KqmglqdGXbddcUcVNI",
  authDomain: "drawing-app-92fa4.firebaseapp.com",
  projectId: "drawing-app-92fa4",
  storageBucket: "drawing-app-92fa4.firebasestorage.app",
  messagingSenderId: "899994764882",
  appId: "1:899994764882:web:b51d85ebcbcb0216ec418b",
  measurementId: "G-6LBL6ENM41"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
