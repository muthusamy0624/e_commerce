// firebase-config.js
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";

// Your Firebase configuration (you got this from Firebase Console)
const firebaseConfig = {
  apiKey: "AIzaSyCIPqbz9xqXjfWNWBzMfA3EM0C815ilWAw",
  authDomain: "luxury-auth-app-eed71.firebaseapp.com",
  projectId: "luxury-auth-app-eed71",
  storageBucket: "luxury-auth-app-eed71.firebasestorage.app",
  messagingSenderId: "1016808055224",
  appId: "1:1016808055224:web:3d4db712233411004c6f4d",
  measurementId: "G-YSPRHP7885"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Export the Firebase Authentication object
export const auth = getAuth(app);
