import { initializeApp } from 'firebase/app';
import { getDatabase } from 'firebase/database';

const firebaseConfig = {
  apiKey: "AIzaSyB_LB27KPFAUpT4tkmj2rbAMdlFgLphlqk",
  authDomain: "prom-joy.firebaseapp.com",
  databaseURL: "https://prom-joy-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "prom-joy",
  storageBucket: "prom-joy.firebasestorage.app",
  messagingSenderId: "958771441744",
  appId: "1:958771441744:web:ffa94008a11b2df925a155",
  measurementId: "G-G5G2JHWQ90"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Get Realtime Database reference
export const database = getDatabase(app);

export default app;
