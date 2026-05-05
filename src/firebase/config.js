import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';

const firebaseConfig = {
  apiKey: "AIzaSyAImjuhgFv2Bx_KUndyDNnduDkwHu_QFnY",
  authDomain: "hulk-gym-688df.firebaseapp.com",
  projectId: "hulk-gym-688df",
  storageBucket: "hulk-gym-688df.firebasestorage.app",
  messagingSenderId: "312702399411",
  appId: "1:312702399411:web:603d3838f384ab1b5bd1c6",
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

export { auth };
