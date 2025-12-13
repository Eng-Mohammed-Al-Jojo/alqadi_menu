
import { initializeApp } from "firebase/app";
import { getDatabase } from "firebase/database";

// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyBaFamggQNq9v0XQQz_xsXQep1GJvA8M0I",
  authDomain: "qadi-menu.firebaseapp.com",
  projectId: "qadi-menu",
  storageBucket: "qadi-menu.firebasestorage.app",
  messagingSenderId: "192718428960",
  appId: "1:192718428960:web:941eed1e47a6e55f3f5545",
  measurementId: "G-DJ484JD6J3"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// 👇 هذا هو المهم
export const db = getDatabase(app);
