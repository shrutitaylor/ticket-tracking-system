// firebaseConfig.js
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut } from "firebase/auth";


const firebaseConfig = {
    apiKey: "AIzaSyB-LecmDzXOmxriNlvTkEG_JSg43lIax0c",
    authDomain: "ticket-management-92e9d.firebaseapp.com",
    projectId: "ticket-management-92e9d",
    storageBucket: "ticket-management-92e9d.appspot.com",
    messagingSenderId: "642624109444",
    appId: "1:642624109444:web:7d09c4d9f92db340b53bd1",
    measurementId: "G-9MY2MW4M98"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);


// Export Firebase services
export const db = getFirestore(app);
export const auth = getAuth(app);

// Enable local persistence
// setPersistence(auth, browserLocalPersistence)
//   .then(() => console.log("Persistence enabled"))
//   .catch((error) => console.error("Persistence error:", error));
  
// 🔹 Authentication Methods
export const signUp = (email, password) => createUserWithEmailAndPassword(auth, email, password);
export const logIn = (email, password) => signInWithEmailAndPassword(auth, email, password);
export const logOut = () => signOut(auth);
