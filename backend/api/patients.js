const router = require("express").Router();
const { verifyToken, authRole } = require("../middleware/auth");
const { db } = require('../firebase');
const {
    collection, doc, getDoc, getDocs, addDoc, updateDoc, deleteDoc, query,
    where, orderBy
} = require('firebase/firestore');

const ROLE = {
    SUPERADMIN: 'SUPERADMIN',
    ADMIN: 'ADMIN',
    USER: 'USER'
};

// Adaugă un pacient nou
router.post(
    "/patients",
    verifyToken,
    authRole([ROLE.SUPERADMIN, ROLE.ADMIN]),
    async (req, res) => {
        try {
            const data = req.body;

            // Verifică dacă CNP-ul există deja
            const pacientRef = collection(db, "pacienti");
            const q = query(pacientRef, where("cnp", "==", data.cnp));
            const querySnapshot = await getDocs(q);

            if (!querySnapshot.empty) {
                return res.status(409).json("CNP deja existent în baza de date");
            }

            // Adaugă valorile normale pentru pacient
            const valoriNormaleRef = await addDoc(collection(db, "valori_normale"), {
                minPuls: data.minPuls || 60,
                maxPuls: data.maxPuls || 100,
                minTemp: data.minTemp || 36.5,
                maxTemp: data.maxTemp || 37.5,
                minUmid: data.minUmid || 30,
                maxUmid: data.maxUmid || 60
            });

            // Creează pacientul cu referință la valorile normale
            const newPacient = await addDoc(collection(db, "pacienti"), {
                nume: data.nume,
                prenume: data.prenume,
                varsta: data.varsta,
                cnp: data.cnp,
                oras: data.oras,
                strada: data.strada,
                nrTelefon: data.telefon,
                email: data.email,
                profesie: data.profesie,
                istoricMedical: data.istoricMedical || "",
                alergii: data.alergii || [],
                valoriNormaleID: valoriNormaleRef.id,
                createdAt: new Date()
            });

            return res.status(201).json({
                message: "Pacient adăugat cu succes",
                id: newPacient.id
            });
        } catch (error) {
            console.error(error);
            return res.status(500).json("Eroare la adăugarea pacientului");
        }
    }
);

// Obține lista tuturor pacienților
router.get(
    "/patients",
    verifyToken,
    authRole([ROLE.SUPERADMIN, ROLE.ADMIN]),
    async (req, res) => {
        try {
            const pacientRef = collection(db, "pacienti");
            const q = query(pacientRef, orderBy("nume"));
            const querySnapshot = await getDocs(q);

            if (querySnapshot.empty) {
                return res.status(200).json([]);
            }

            const pacienti = querySnapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data(),
                createdAt: doc.data().createdAt ? doc.data().createdAt.toDate() : new Date()
            }));

            return res.status(200).json(pacienti);
        } catch (error) {
            console.error(error);
            return res.status(500).json("Eroare la obținerea listei de pacienți");
        }
    }
);

// Obține un pacient după ID
router.get(
    "/patients/:id",
    verifyToken,
    authRole([ROLE.SUPERADMIN, ROLE.ADMIN, ROLE.USER]),
    async (req, res) => {
        try {
            const { id } = req.params;
            const pacientDoc = await getDoc(doc(db, "pacienti", id));

            if (!pacientDoc.exists()) {
                return res.status(404).json("Pacientul nu a fost găsit");
            }

            const pacientData = {
                id: pacientDoc.id,
                ...pacientDoc.data()
            };

            // Obține valorile normale ale pacientului
            if (pacientData.valoriNormaleID) {
                const valoriNormaleDoc = await getDoc(doc(db, "valori_normale", pacientData.valoriNormaleID));
                if (valoriNormaleDoc.exists()) {
                    pacientData.valoriNormale = valoriNormaleDoc.data();
                }
            }

            return res.status(200).json(pacientData);
        } catch (error) {
            console.error(error);
            return res.status(500).json("Eroare la obținerea pacientului");
        }
    }
);

// Actualizează un pacient
router.put(
    "/patients/:id",
    verifyToken,
    authRole([ROLE.SUPERADMIN, ROLE.ADMIN]),
    async (req, res) => {
        try {
            const { id } = req.params;
            const data = req.body;

            // Verifică dacă pacientul există
            const pacientDoc = await getDoc(doc(db, "pacienti", id));
            if (!pacientDoc.exists()) {
                return res.status(404).json("Pacientul nu a fost găsit");
            }

            // Actualizează pacientul
            await updateDoc(doc(db, "pacienti", id), {
                nume: data.nume,
                prenume: data.prenume,
                varsta: data.varsta,
                cnp: data.cnp,
                oras: data.oras,
                strada: data.strada,
                nrTelefon: data.telefon,
                email: data.email,
                profesie: data.profesie,
                istoricMedical: data.istoricMedical,
                alergii: data.alergii
            });

            // Actualizează valorile normale
            if (data.valoriNormale && pacientDoc.data().valoriNormaleID) {
                await updateDoc(doc(db, "valori_normale", pacientDoc.data().valoriNormaleID), {
                    minPuls: data.valoriNormale.minPuls,
                    maxPuls: data.valoriNormale.maxPuls,
                    minTemp: data.valoriNormale.minTemp,
                    maxTemp: data.valoriNormale.maxTemp,
                    minUmid: data.valoriNormale.minUmid,
                    maxUmid: data.valoriNormale.maxUmid
                });
            }

            return res.status(200).json("Pacient actualizat cu succes");
        } catch (error) {
            console.error(error);
            return res.status(500).json("Eroare la actualizarea pacientului");
        }
    }
);

// Șterge un pacient
router.delete(
    "/patients/:id",
    verifyToken,
    authRole([ROLE.SUPERADMIN, ROLE.ADMIN]),
    async (req, res) => {
        try {
            const { id } = req.params;

            // Verifică dacă pacientul există
            const pacientDoc = await getDoc(doc(db, "pacienti", id));
            if (!pacientDoc.exists()) {
                return res.status(404).json("Pacientul nu a fost găsit");
            }

            // Șterge valorile normale asociate
            if (pacientDoc.data().valoriNormaleID) {
                await deleteDoc(doc(db, "valori_normale", pacientDoc.data().valoriNormaleID));
            }

            // Șterge pacientul
            await deleteDoc(doc(db, "pacienti", id));

            return res.status(200).json("Pacient șters cu succes");
        } catch (error) {
            console.error(error);
            return res.status(500).json("Eroare la ștergerea pacientului");
        }
    }
);

module.exports = router; 