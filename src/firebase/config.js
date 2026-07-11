import { initializeApp } from "firebase/app";
import { getDatabase } from "firebase/database";

const firebaseConfig = {
  apiKey: "AIzaSyA7AUcTIERMPfODrisGhJ3GWRn_fLuKkLI",
  authDomain: "lpg-gas-leakage-detectio-b4b07.firebaseapp.com",
  databaseURL: "https://lpg-gas-leakage-detectio-b4b07-default-rtdb.firebaseio.com",
  projectId: "lpg-gas-leakage-detectio-b4b07",
  storageBucket: "lpg-gas-leakage-detectio-b4b07.appspot.com",
  messagingSenderId: "147609253576",
  appId: "1:147609253576:android:4689c696c4c4e1ce5257fd"
};

const app = initializeApp(firebaseConfig);
export const database = getDatabase(app);