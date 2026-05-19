// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
    apiKey: "AIzaSyDxSFxMec28XjUEZVUJbkLuAV_iInlKZuk",
    authDomain: "streamfinder-bfcd5.firebaseapp.com",
    projectId: "streamfinder-bfcd5",
    storageBucket: "streamfinder-bfcd5.firebasestorage.app",
    messagingSenderId: "96318845203",
    appId: "1:96318845203:web:b20587a9859744f1182ae6",
    measurementId: "G-8S7E7769WG"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);

export const auth = getAuth(app);
export const db = getFirestore(app);