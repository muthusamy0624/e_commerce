import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getAnalytics } from "firebase/analytics";
import { getFirestore } from "firebase/firestore";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyCS6-Odm56hHySXDYy8avvQ4T1giNcNojU",
  authDomain: "first-new-fd74b.firebaseapp.com",
  projectId: "first-new-fd74b",
  storageBucket: "first-new-fd74b.firebasestorage.app",
  messagingSenderId: "989724391514",
  appId: "1:989724391514:web:540ddc5da0a7b64fda8063",
  measurementId: "G-QKYYD6KH4E"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Auth
export const auth = getAuth(app);

// Initialize Google Auth Provider
export const googleProvider = new GoogleAuthProvider();

// Initialize Firestore
export const db = getFirestore(app);

// Initialize Analytics (only in browser environment)
let analytics = null;
if (typeof window !== 'undefined') {
  try {
    analytics = getAnalytics(app);
  } catch (error) {
    console.warn('Analytics initialization failed:', error);
  }
}
export { analytics }; 