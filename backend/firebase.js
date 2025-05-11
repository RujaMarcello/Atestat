const { initializeApp } = require('firebase/app');
const { getFirestore } = require('firebase/firestore');
const { getAuth } = require('firebase/auth');

// Configurația Firebase hardcodată
const firebaseConfig = {
    apiKey: "AIzaSyCCobgyzb3s4x7VTVI-Qt3yi4HGECbrDnU",
    authDomain: "medicarenow-1a3da.firebaseapp.com",
    projectId: "medicarenow-1a3da",
    storageBucket: "medicarenow-1a3da.firebasestorage.app",
    messagingSenderId: "850704351418",
    appId: "1:850704351418:web:f7432961b8174eaa558283",
    measurementId: "G-HZJ9K8Q0X2"
};

// Inițializare Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

module.exports = { app, db, auth }; 