// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";// Your web app's Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyCLnlmEk5Olvwn0DEdOlH4tVhCVXa_x9Oc",
    authDomain: "fintrust-691f7.firebaseapp.com",
    projectId: "fintrust-691f7",
    storageBucket: "fintrust-691f7.firebasestorage.app",
    messagingSenderId: "477098548902",
    appId: "1:477098548902:web:c574353abea999ca1ade67"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

// Export it so we can use it throughout our app
export { app, auth, db };
