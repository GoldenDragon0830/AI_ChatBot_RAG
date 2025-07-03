import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
// import { getAuth } from 'firebase/auth';

const firebaseConfig = {
  apiKey: "AIzaSyCAyIpUeMceliKvlJ1ohVb9kPEtw3sZ7Go",
  authDomain: "soundglide-41873.firebaseapp.com",
  databaseURL: "https://soundglide-41873-default-rtdb.firebaseio.com",
  projectId: "soundglide-41873",
  storageBucket: "soundglide-41873.appspot.com",
  messagingSenderId: "1073449544316",
  appId: "1:1073449544316:web:42e7d4802247827c0ab7f9",
  measurementId: "G-7G6JDZW9VV",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
// Initialize Cloud Firestore and get a reference to the service
export const firestore = getFirestore(app);
// export const auth = getAuth(app);
