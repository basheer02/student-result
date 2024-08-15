// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyAI43_wctAQzZCCbx1wrLgbojGWD5cBbY0",
  authDomain: "subululhuda-madrasa.firebaseapp.com",
  projectId: "subululhuda-madrasa",
  storageBucket: "subululhuda-madrasa.appspot.com",
  messagingSenderId: "741407906042",
  appId: "1:741407906042:web:a9bba456cc8c314c9b5143",
  measurementId: "G-FL9LCW5NEQ"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);