// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyAwWOdkPS-tbjE1H4kPhSsBD9sNiMU2kJE",
  authDomain: "mbk-projects-02.firebaseapp.com",
  projectId: "mbk-projects-02",
  storageBucket: "mbk-projects-02.appspot.com",
  messagingSenderId: "119731967216",
  appId: "1:119731967216:web:213a1c53c4bfad71fe5e35",
  measurementId: "G-7WMX3H4LLQ"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);