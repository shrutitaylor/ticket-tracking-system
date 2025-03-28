import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
    apiKey: "AIzaSyB-LecmDzXOmxriNlvTkEG_JSg43lIax0c",
    authDomain: "ticket-management-92e9d.firebaseapp.com",
    projectId: "ticket-management-92e9d",
    storageBucket: "ticket-management-92e9d.firebasestorage.app",
    messagingSenderId: "642624109444",
    appId: "1:642624109444:web:7d09c4d9f92db340b53bd1",
    measurementId: "G-9MY2MW4M98"
  };

// 🔹 Initialize Firebase
const app = initializeApp(firebaseConfig);

// 🔹 Export Firestore database instance
export const db = getFirestore(app);