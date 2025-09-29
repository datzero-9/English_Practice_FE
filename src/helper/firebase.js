// src/firebase.js
import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
    apiKey: "AIzaSyBpu3a49Jk2brRgPZGJj5v06UdHZ7iZHE4",
    authDomain: "englishpractice20044.firebaseapp.com",
    projectId: "englishpractice20044",
    storageBucket: "englishpractice20044.firebasestorage.app",
    messagingSenderId: "643555190367",
    appId: "1:643555190367:web:ff53b6c4bed45c2d479dea",
    measurementId: "G-PHQ36KPDEK"
};

// Khởi tạo Firebase
const app = initializeApp(firebaseConfig);

// Khởi tạo Auth và Google Provider
const auth = getAuth(app);
const provider = new GoogleAuthProvider();
const db = getFirestore(app);

export { auth, provider, db };
