const { db } = require('./firebase');
const { collection, query, where, getDocs, addDoc, Timestamp, orderBy, limit } = require('firebase/firestore');

// Helper function to check if heart rate is outside the normal range (+10%)
const isHeartRateAbnormal = (heartRate, minRate, maxRate) => {
    // Calculate 10% margin for the upper threshold
    const upperThreshold = maxRate * 1.1;

    // Check if heart rate is outside the normal range with the +10% margin
    return heartRate < minRate || heartRate > upperThreshold;
};

// Function to get the latest heart rate for a patient
const getLatestHeartRate = async (patientId) => {
    try {
        if (!patientId) {
            console.error("Patient ID is undefined or null");
            return null;
        }
        console.log(`Fetching latest heart rate for patient ID: ${patientId}`);

        const pulseRef = collection(db, "puls");

        // Folosim doar where fără orderBy pentru a evita necesitatea unui index compus
        const q = query(
            pulseRef,
            where("pacientID", "==", patientId)
        );

        const querySnapshot = await getDocs(q);

        if (querySnapshot.empty) {
            console.log(`No heart rate records found for patient ${patientId}`);
            return null;
        }

        // Sortăm datele manual după ce le obținem
        let allReadings = [];
        querySnapshot.forEach(doc => {
            const data = doc.data();
            allReadings.push({
                id: doc.id,
                value: data.valoare,
                timestamp: data.dataInregistrarii
            });
        });

        // Sortăm după timestamp în ordine descrescătoare
        allReadings.sort((a, b) => {
            const timeA = a.timestamp instanceof Date ? a.timestamp : a.timestamp.toDate();
            const timeB = b.timestamp instanceof Date ? b.timestamp : b.timestamp.toDate();
            return timeB.getTime() - timeA.getTime();
        });

        // Verificăm dacă avem rezultate după sortare
        if (allReadings.length === 0) {
            console.log(`No valid heart rate readings found for patient ${patientId}`);
            return null;
        }

        // Folosim prima înregistrare (cea mai recentă)
        const latestReading = allReadings[0];
        console.log(`Found latest heart rate for patient ${patientId}:`, latestReading);

        return {
            value: latestReading.value,
            timestamp: latestReading.timestamp
        };
    } catch (error) {
        console.error(`Error fetching latest heart rate for patient ${patientId}:`, error);
        return null;
    }
};

// Function to get the normal values for a patient
const getPatientNormalValues = async (patientId) => {
    try {
        if (!patientId) {
            console.error("Patient ID is undefined or null");
            return { minHeartRate: 60, maxHeartRate: 100 }; // Default values
        }
        console.log(`Fetching normal values for patient ID: ${patientId}`);

        // First, get the patient to find their valoriNormaleID
        const patientsRef = collection(db, "pacienti");
        const patientQuery = query(patientsRef, where("id", "==", patientId));
        const patientSnapshot = await getDocs(patientQuery);

        if (patientSnapshot.empty) {
            console.log(`No patient found with ID ${patientId}`);
            return { minHeartRate: 60, maxHeartRate: 100 }; // Default values
        }

        const patientData = patientSnapshot.docs[0].data();
        console.log(`Patient data for ID ${patientId}:`, patientData);

        // If the patient has a valoriNormaleID reference, get those values
        if (patientData.valoriNormaleID) {
            const valoriNormaleRef = collection(db, "valori_normale");
            const valoriQuery = query(valoriNormaleRef, where("id", "==", patientData.valoriNormaleID));
            const valoriSnapshot = await getDocs(valoriQuery);

            if (!valoriSnapshot.empty) {
                const valoriData = valoriSnapshot.docs[0].data();
                console.log(`Normal values found for patient ${patientId}:`, valoriData);
                return {
                    minHeartRate: valoriData.minPuls || 60,
                    maxHeartRate: valoriData.maxPuls || 100
                };
            }
        }

        // Dacă nu găsim valori specifice, folosim valorile din obiectul pacient direct
        if (patientData.normalValues) {
            console.log(`Using normalValues directly from patient ${patientId}:`, patientData.normalValues);
            return {
                minHeartRate: patientData.normalValues.minHeartRate || 60,
                maxHeartRate: patientData.normalValues.maxHeartRate || 100
            };
        }

        // Return default values if no specific values found
        console.log(`Using default values for patient ${patientId}`);
        return {
            minHeartRate: 60,
            maxHeartRate: 100
        };
    } catch (error) {
        console.error(`Error fetching normal values for patient ${patientId}:`, error);
        return { minHeartRate: 60, maxHeartRate: 100 }; // Default values
    }
};

// Function to create a notification
const createHeartRateNotification = async (patientId, patientName, heartRate, threshold) => {
    try {
        if (!patientId) {
            console.error("Cannot create notification: Patient ID is undefined or null");
            return false;
        }

        console.log(`Creating notification for patient ${patientId} (${patientName}) - Heart Rate: ${heartRate} BPM, Threshold: ${threshold} BPM`);

        const notificationData = {
            pacientID: patientId,
            patientName: patientName, // Adăugăm și numele pacientului
            tip: heartRate > threshold ? 'Alarmă' : 'Avertizare',
            parametru: 'Ritm cardiac',
            valoare: `${heartRate} BPM`,
            prag: `${threshold} BPM`,
            timestamp: Timestamp.now(),
            status: 'Necitit',
            mesaj: `Ritm cardiac ${heartRate > threshold ? 'ridicat' : 'scăzut'} detectat`
        };

        await addDoc(collection(db, "notificari"), notificationData);
        console.log(`Notification created for patient ${patientId} (${patientName}) - Heart Rate: ${heartRate} BPM`);

        return true;
    } catch (error) {
        console.error(`Error creating notification for patient ${patientId}:`, error);
        return false;
    }
};

// Main function to check all patients' heart rates
const monitorHeartRates = async () => {
    try {
        console.log("Starting heart rate monitoring check...");

        // Get all patients
        const patientsRef = collection(db, "pacienti");
        const patientsSnapshot = await getDocs(patientsRef);

        if (patientsSnapshot.empty) {
            console.log("No patients found in the database.");
            return;
        }

        console.log(`Found ${patientsSnapshot.size} patients to check.`);

        // Process each patient
        for (const patientDoc of patientsSnapshot.docs) {
            const patientData = patientDoc.data();

            // Folosim ID-ul documentului dacă patientData.id este undefined
            const patientId = patientData.id || patientDoc.id;
            const patientName = patientData.nume && patientData.prenume
                ? `${patientData.nume} ${patientData.prenume}`
                : `Pacient ${patientId}`;

            console.log(`Processing patient: ${patientName} (ID: ${patientId})`);

            // Get latest heart rate
            const latestHeartRate = await getLatestHeartRate(patientId);

            if (!latestHeartRate) {
                console.log(`No heart rate data found for patient ${patientId} (${patientName})`);
                continue;
            }

            console.log(`Latest heart rate for ${patientName}: ${latestHeartRate.value} BPM`);

            // Get normal values for the patient
            const normalValues = await getPatientNormalValues(patientId);
            console.log(`Normal heart rate range for ${patientName}: ${normalValues.minHeartRate}-${normalValues.maxHeartRate} BPM`);

            // Check if heart rate is abnormal
            if (isHeartRateAbnormal(latestHeartRate.value, normalValues.minHeartRate, normalValues.maxHeartRate)) {
                console.log(`Abnormal heart rate detected for ${patientName}: ${latestHeartRate.value} BPM (Normal: ${normalValues.minHeartRate}-${normalValues.maxHeartRate} BPM)`);

                // Calculate which threshold was exceeded
                const threshold = latestHeartRate.value > normalValues.maxHeartRate ?
                    normalValues.maxHeartRate : normalValues.minHeartRate;

                // Create notification
                await createHeartRateNotification(patientId, patientName, latestHeartRate.value, threshold);
            } else {
                console.log(`Heart rate for ${patientName} is normal: ${latestHeartRate.value} BPM (Normal: ${normalValues.minHeartRate}-${normalValues.maxHeartRate} BPM)`);
            }
        }

        console.log("Heart rate monitoring check completed.");
    } catch (error) {
        console.error("Error during heart rate monitoring:", error);
    }
};

// Export functions for use in other files
module.exports = {
    monitorHeartRates,
    isHeartRateAbnormal
}; 