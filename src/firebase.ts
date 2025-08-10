import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyAzW28e5IobigRRyihn4yBjZ7A-YTmMOEM",
  authDomain: "logon-6d399.firebaseapp.com",
  projectId: "logon-6d399",
  storageBucket: "logon-6d399.firebasestorage.app",
  messagingSenderId: "233278156780",
  appId: "1:233278156780:web:b3b43bf5ec08bc4f2d5ac9",
  measurementId: "G-4VT9LLYPQ7"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase Authentication and get a reference to the service
export const auth = getAuth(app);

// Initialize Cloud Firestore and get a reference to the service
export const db = getFirestore(app);

export default app;