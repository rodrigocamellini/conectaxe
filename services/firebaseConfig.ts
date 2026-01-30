import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

// Cole sua configuração aqui
const firebaseConfig = {
  apiKey: "AIzaSyA2OhTjwF_EHcW8TiJsANKb_4V0COifSQw",
  authDomain: "conectaxe-4acc7.firebaseapp.com",
  projectId: "conectaxe-4acc7",
  storageBucket: "conectaxe-4acc7.firebasestorage.app",
  messagingSenderId: "960117201215",
  appId: "1:960117201215:web:ee1804ca7eef44b8015b8a"
};

// Inicializa o Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

export { db };