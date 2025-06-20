import { FC, useState, useEffect } from 'react';
import { Card, Select, message, Spin } from 'antd';
import { db } from '../../../../firebase';
import { collection, getDocs, query, orderBy, doc, getDoc, where } from 'firebase/firestore';
import styles from './PatientSelector.module.scss';
import { useUserProvider } from '../../../../context/User';

const { Option } = Select;

interface PatientSelectorProps {
    onPatientSelect: (patient: any) => void;
    selectedPatientId?: string;
}

interface Patient {
    id: string;
    nume: string;
    prenume: string;
    cnp: string;
    email: string;
}

const PatientSelector: FC<PatientSelectorProps> = ({ onPatientSelect, selectedPatientId }) => {
    const [patients, setPatients] = useState<Patient[]>([]);
    const [loading, setLoading] = useState<boolean>(false);
    const [selectedPatient, setSelectedPatient] = useState<string | undefined>(selectedPatientId);
    const { user, roleGetter } = useUserProvider();

    const isUserPatient = roleGetter(({ USER }) => USER);
    const isAdmin = roleGetter(({ ADMIN, SUPERADMIN }) => ADMIN || SUPERADMIN);

    // Încărcăm pacienții din Firebase la inițializarea componentei
    useEffect(() => {
        fetchPatients();
    }, [user]);

    const fetchPatients = async () => {
        try {
            setLoading(true);
            const pacientRef = collection(db, "pacienti");
            let q;

            if (isUserPatient && user) {
                // Pentru utilizatorul normal (pacient), căutăm automat pacientul asociat contului său
                q = query(pacientRef, where("email", "==", user.email));

                const querySnapshot = await getDocs(q);

                if (querySnapshot.empty) {
                    setLoading(false);
                    return;
                }

                const patientDoc = querySnapshot.docs[0];
                const patientData = patientDoc.data();

                const patient = {
                    id: patientDoc.id,
                    nume: patientData.nume || '',
                    prenume: patientData.prenume || '',
                    cnp: patientData.cnp || '',
                    email: patientData.email || ''
                };

                setPatients([patient]);

                // Selectăm automat pacientul
                setSelectedPatient(patient.id);
                onPatientSelect(patient);
            } else {
                // Pentru admin/doctor, afișăm lista completă de pacienți
                q = query(pacientRef, orderBy("nume"));

                const querySnapshot = await getDocs(q);
                const patientsData: Patient[] = [];

                querySnapshot.docs.forEach(doc => {
                    const data = doc.data();
                    patientsData.push({
                        id: doc.id,
                        nume: data.nume || '',
                        prenume: data.prenume || '',
                        cnp: data.cnp || '',
                        email: data.email || ''
                    });
                });

                setPatients(patientsData);

                // Verificăm dacă există un pacient salvat în localStorage
                const storedPatientId = localStorage.getItem('selectedPatientId');

                if (storedPatientId) {
                    const foundPatient = patientsData.find(p => p.id === storedPatientId);
                    if (foundPatient) {
                        setSelectedPatient(foundPatient.id);
                        onPatientSelect(foundPatient);
                    } else if (patientsData.length > 0) {
                        // Dacă ID-ul nu mai există în listă, folosim primul pacient
                        setSelectedPatient(patientsData[0].id);
                        onPatientSelect(patientsData[0]);
                    }
                } else if (patientsData.length > 0 && !selectedPatient) {
                    // Dacă nu există un ID în localStorage, selectăm primul din listă
                    setSelectedPatient(patientsData[0].id);
                    onPatientSelect(patientsData[0]);
                }
            }
        } catch (error) {
            console.error("Eroare la preluarea pacienților:", error);
            message.error("Nu s-a putut încărca pacientul sau lista de pacienți.");
        } finally {
            setLoading(false);
        }
    };

    const handlePatientChange = (patientId: string) => {
        const selectedPatient = patients.find(patient => patient.id === patientId);
        if (selectedPatient) {
            setSelectedPatient(patientId);
            onPatientSelect(selectedPatient);
            // Salvăm selecția în localStorage pentru a o păstra între sesiuni
            localStorage.setItem('selectedPatientId', patientId);
        }
    };

    // Renderăm conținutul adecvat în funcție de rol și starea de încărcare
    const renderContent = () => {
        if (loading) {
            return (
                <div style={{ padding: '20px', textAlign: 'center' }}>
                    <Spin size="default" />
                    <div style={{ marginTop: '10px' }}>Se încarcă datele pacientului...</div>
                </div>
            );
        }

        if (isUserPatient) {
            // Pentru pacient, afișăm doar numele pacientului fără selector
            if (patients.length > 0) {
                return (
                    <div className={styles.patientInfo}>
                        <p><strong>Pacient:</strong> {patients[0]?.nume} {patients[0]?.prenume}</p>
                        <p><strong>CNP:</strong> {patients[0]?.cnp}</p>
                    </div>
                );
            } else {
                return (
                    <div className={styles.noData}>
                        Nu există date despre pacient. Contactați administratorul.
                    </div>
                );
            }
        } else {
            // Pentru admin/doctor, afișăm selectorul cu toți pacienții
            return (
                <div className={styles.selectContainer}>
                    <label>Selectează Pacient:</label>
                    <Select
                        style={{ width: '100%' }}
                        value={selectedPatient}
                        onChange={handlePatientChange}
                        placeholder="Selectează un pacient"
                    >
                        {patients.map(patient => (
                            <Option key={patient.id} value={patient.id}>
                                {patient.nume} {patient.prenume} ({patient.cnp})
                            </Option>
                        ))}
                    </Select>
                </div>
            );
        }
    };

    return (
        <Card
            title={isUserPatient ? "Datele tale medicale" : "Date Medicale Pacient"}
            className={styles.card}
        >
            {renderContent()}
        </Card>
    );
};

export default PatientSelector; 