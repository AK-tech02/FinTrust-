import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyCjTi86OfhXv2n6qyllpNG7HThb9EwUWRE",
  authDomain: "fintrust-df1f0.firebaseapp.com",
  projectId: "fintrust-df1f0",
  storageBucket: "fintrust-df1f0.firebasestorage.app",
  messagingSenderId: "1034069152447",
  appId: "1:1034069152447:web:eca755c409e6b55444ec0a"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
