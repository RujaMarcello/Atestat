require('dotenv').config();
const { initializeApp } = require('firebase/app');
const { getFirestore, collection, doc, setDoc, addDoc } = require('firebase/firestore');
const bcrypt = require('bcrypt');

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

async function initializeFirebase() {
    try {
        // Creează utilizatori
        const saltRounds = 10;
        const adminPassword = await bcrypt.hash('admin123', saltRounds);
        const userPassword = await bcrypt.hash('user123', saltRounds);

        const adminUser = {
            firstName: 'Admin',
            lastName: 'System',
            email: 'admin@example.com',
            password: adminPassword,
            role: 'ADMIN',
            createdAt: new Date()
        };

        const regularUser = {
            firstName: 'Pacient',
            lastName: 'Test',
            email: 'pacient@example.com',
            password: userPassword,
            role: 'USER',
            createdAt: new Date()
        };

        // Adaugă utilizatori în Firestore
        await addDoc(collection(db, 'users'), adminUser);
        await addDoc(collection(db, 'users'), regularUser);
        console.log('Utilizatori adăugați cu succes!');

        // Adaugă medic
        const medicDoc = await addDoc(collection(db, 'medici'), {
            nume: 'Ion',
            prenume: 'Pop',
            email: 'ion.pop@exemplu.com',
            numarTelefon: '0712345678',
            specializare: 'Cardiolog'
        });
        console.log('Medic adăugat cu ID:', medicDoc.id);

        // Adaugă valori normale
        const valoriNormaleDoc = await addDoc(collection(db, 'valori_normale'), {
            minPuls: 60,
            maxPuls: 100,
            minTemp: 36.5,
            maxTemp: 37.5,
            minUmid: 30,
            maxUmid: 60
        });
        console.log('Valori normale adăugate cu ID:', valoriNormaleDoc.id);

        // Adaugă pacient
        const pacientDoc = await addDoc(collection(db, 'pacienti'), {
            nume: 'Mari',
            prenume: 'Ionescu',
            email: 'maria@email.com',
            cnp: '1234567890123',
            oras: 'Cluj',
            strada: 'Str. Avram Iancu',
            profesie: 'Inginer',
            istoricMedical: 'diabet',
            alergii: ['penicilina'],
            valoriNormaleID: valoriNormaleDoc.id
        });
        console.log('Pacient adăugat cu ID:', pacientDoc.id);

        // Adaugă o alarmă
        await addDoc(collection(db, 'alarme'), {
            pacientID: pacientDoc.id,
            titlu: 'Puls ridicat',
            descriere: 'Puls peste limita normala',
            dataStart: new Date('2025-05-22T13:20:37'),
            dataSfarsit: new Date('2025-05-27T13:16:00'),
            cauza: 1
        });
        console.log('Alarmă adăugată cu succes!');

        // Adaugă o recomandare
        await addDoc(collection(db, 'recomandari'), {
            medicID: medicDoc.id,
            pacientID: pacientDoc.id,
            tipRecomandare: 'Odihnă',
            timpRecomandare: 'dimineața',
            alteRecomandari: 'evită stresul'
        });
        console.log('Recomandare adăugată cu succes!');

        // Adaugă o activitate
        await addDoc(collection(db, 'activitati'), {
            medicID: medicDoc.id,
            pacientID: pacientDoc.id,
            durata: '30 minute',
            descriere: 'Mers pe jos'
        });
        console.log('Activitate adăugată cu succes!');

        // Adaugă câteva măsurători de puls
        const pulsCollection = collection(db, 'puls');
        await addDoc(pulsCollection, {
            pacientID: pacientDoc.id,
            valoare: 92,
            dataInregistrarii: new Date('2025-05-27T13:25:01')
        });
        await addDoc(pulsCollection, {
            pacientID: pacientDoc.id,
            valoare: 45,
            dataInregistrarii: new Date('2025-05-27T13:25:05')
        });

        // Adaugă o măsurătoare EKG
        await addDoc(collection(db, 'ekg'), {
            pacientID: pacientDoc.id,
            ekg: 'valori_codificate_EKG',
            dataInregistrarii: new Date('2025-05-27T13:27:04')
        });

        console.log('Inițializare finalizată cu succes!');
    } catch (error) {
        console.error('Eroare la inițializare:', error);
    }
}

initializeFirebase(); 