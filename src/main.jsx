// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyBHlFlN_oSP9p5RSUwJgnHPQkIdEWTJRIU",
  authDomain: "lumio-8ed03.firebaseapp.com",
  projectId: "lumio-8ed03",
  storageBucket: "lumio-8ed03.firebasestorage.app",
  messagingSenderId: "1076911403682",
  appId: "1:1076911403682:web:823a3ff4db2f1e09859dfb",
  measurementId: "G-BJZFS6H8C0"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
