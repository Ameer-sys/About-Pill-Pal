import { initializeApp } from "firebase/app";
import { getAnalytics, isSupported } from "firebase/analytics";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyC4owIraSaiULGb1UqEfzYcUcWOAzDQnuY",
  authDomain: "smart-pillbox-5e9a5.firebaseapp.com",
  projectId: "smart-pillbox-5e9a5",
  storageBucket: "smart-pillbox-5e9a5.firebasestorage.app",
  messagingSenderId: "635934187557",
  appId: "1:635934187557:web:cdaffdc0d6f57799f35fcc",
  measurementId: "G-5SF0T9CVJZ",
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);

export async function enableAnalytics() {
  if (await isSupported()) {
    return getAnalytics(app);
  }

  return null;
}
