// firebase.js
// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyDxTlwq3wT_Gr0Dq_ZBrAaxJaAU-o0k0vA",
  authDomain: "ohana-b97d9.firebaseapp.com",
  databaseURL: "https://ohana-b97d9-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "ohana-b97d9",
  storageBucket: "ohana-b97d9.appspot.com",
  messagingSenderId: "1056225914664",
  appId: "1:1056225914664:web:8f1b80c04dedc2973a2a1d",
  measurementId: "G-L0ENTNF4SG"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

export { auth, db };