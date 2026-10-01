import { initializeApp } from "https://www.gstatic.com/firebasejs/10.14.1/firebase-app.js";
import { getFirestore, doc, getDoc, setDoc, onSnapshot, collection, addDoc, getDocs, deleteDoc, query, orderBy, serverTimestamp }
  from "https://www.gstatic.com/firebasejs/10.14.1/firebase-firestore.js";
import { getAuth, signInWithEmailAndPassword, signOut, onAuthStateChanged }
  from "https://www.gstatic.com/firebasejs/10.14.1/firebase-auth.js";

const firebaseConfig = {
  apiKey: "AIzaSyCm8p1Sp6TNQcNOLVbSen_WAU_NVUf1vC8",
  authDomain: "delta-event-7f546.firebaseapp.com",
  projectId: "delta-event-7f546",
  storageBucket: "delta-event-7f546.firebasestorage.app",
  messagingSenderId: "882185599126",
  appId: "1:882185599126:web:562c03b991bfb9a7686ab7"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const auth = getAuth(app);
export { doc, getDoc, setDoc, onSnapshot, collection, addDoc, getDocs, deleteDoc, query, orderBy, serverTimestamp,
  signInWithEmailAndPassword, signOut, onAuthStateChanged };
