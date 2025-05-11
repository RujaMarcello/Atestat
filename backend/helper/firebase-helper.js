const { db, auth } = require('../firebase');
const {
    collection, doc, getDoc, getDocs, addDoc, setDoc, query, where,
    orderBy, limit
} = require('firebase/firestore');
const {
    createUserWithEmailAndPassword, signInWithEmailAndPassword,
    updateProfile
} = require('firebase/auth');
const bcrypt = require('bcrypt');

// Verifică dacă email-ul există și returnează datele utilizatorului
async function isEmailValid(email) {
    try {
        const usersRef = collection(db, 'users');
        const q = query(usersRef, where('email', '==', email));
        const querySnapshot = await getDocs(q);

        if (querySnapshot.empty) {
            return undefined;
        }

        // Returnează primul utilizator care are acest email
        const userData = querySnapshot.docs[0].data();
        // Preluăm rolul utilizatorului
        const userRole = userData.role || 'USER';

        return {
            rows: [{
                id: querySnapshot.docs[0].id,
                email: userData.email,
                role: userRole
            }]
        };
    } catch (error) {
        console.error('Error checking email:', error);
        throw error;
    }
}

// Verifică dacă parola este validă
async function isPasswordValid(password, email) {
    try {
        const usersRef = collection(db, 'users');
        const q = query(usersRef, where('email', '==', email));
        const querySnapshot = await getDocs(q);

        if (querySnapshot.empty) {
            return false;
        }

        const userData = querySnapshot.docs[0].data();
        return bcrypt.compareSync(password, userData.password);
    } catch (error) {
        console.error('Error validating password:', error);
        throw error;
    }
}

// Obține toate conversațiile unui utilizator după ID
async function getAllConversationsByUserId(userId) {
    try {
        const chatRelationsRef = collection(db, 'chat_relations');
        const q = query(chatRelationsRef, where('user_id', '==', userId));
        const querySnapshot = await getDocs(q);

        if (querySnapshot.empty) {
            return undefined;
        }

        return querySnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        }));
    } catch (error) {
        console.error('Error getting conversations:', error);
        throw error;
    }
}

module.exports = {
    isEmailValid,
    isPasswordValid,
    getAllConversationsByUserId
}; 