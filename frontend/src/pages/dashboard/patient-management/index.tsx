import { FC, useState, useEffect } from 'react';
import { Card, Table, Button, Modal, Form, Input, Space, Tabs, Divider, Typography, Row, Col, message, Switch } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, UserOutlined, MailOutlined, PhoneOutlined, HomeOutlined, DashboardOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import styles from './index.module.scss';
import { db, auth } from '../../../firebase';
import { collection, getDocs, addDoc, doc, getDoc, deleteDoc, setDoc, query, where, orderBy } from 'firebase/firestore';
import { createUserWithEmailAndPassword } from 'firebase/auth';
// @ts-ignore
import * as bcrypt from 'bcryptjs';

const { TabPane } = Tabs;
const { TextArea } = Input;
const { Title, Text } = Typography;

// Type pentru un pacient
interface Patient {
    id: string;
    firstName: string;
    lastName: string;
    age: number;
    cnp: string;
    address: {
        street: string;
        number: string;
        building?: string;
        apartment?: string;
        city: string;
        county: string;
        postalCode?: string;
    };
    phone: string;
    email: string;
    profession?: string;
    workplace?: string;
    medicalInfo: {
        medicalHistory?: string;
        allergies?: string;
        consultations?: string;
    };
    normalValues: {
        minHeartRate: number;
        maxHeartRate: number;
        minBloodPressureSystolic: number;
        maxBloodPressureSystolic: number;
        minBloodPressureDiastolic: number;
        maxBloodPressureDiastolic: number;
        minOxygenSaturation: number;
    };
    valoriNormaleID?: string;
}

const PatientManagement: FC = () => {
    const navigate = useNavigate();
    const [patients, setPatients] = useState<Patient[]>([]);
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [isViewModalVisible, setIsViewModalVisible] = useState(false);
    const [editingPatient, setEditingPatient] = useState<Patient | null>(null);
    const [viewingPatient, setViewingPatient] = useState<Patient | null>(null);
    const [loading, setLoading] = useState(false);
    const [form] = Form.useForm();

    // Încărcăm lista de pacienți din Firebase la montarea componentei
    useEffect(() => {
        fetchPatients();
    }, []);

    // Funcție pentru a prelua pacienții din Firestore
    const fetchPatients = async () => {
        try {
            setLoading(true);
            const pacientRef = collection(db, "pacienti");
            const q = query(pacientRef, orderBy("nume"));
            const querySnapshot = await getDocs(q);

            const patientsData: Patient[] = [];

            for (const docSnapshot of querySnapshot.docs) {
                const patientData = docSnapshot.data();

                // Preluarea valorilor normale dacă există ID-ul
                let normalValues = {
                    minHeartRate: 60,
                    maxHeartRate: 100,
                    minBloodPressureSystolic: 110,
                    maxBloodPressureSystolic: 140,
                    minBloodPressureDiastolic: 70,
                    maxBloodPressureDiastolic: 90,
                    minOxygenSaturation: 95
                };

                if (patientData.valoriNormaleID) {
                    const valoriNormaleDoc = await getDoc(doc(db, "valori_normale", patientData.valoriNormaleID));
                    if (valoriNormaleDoc.exists()) {
                        const valoriData = valoriNormaleDoc.data();
                        normalValues = {
                            minHeartRate: valoriData.minPuls || 60,
                            maxHeartRate: valoriData.maxPuls || 100,
                            minBloodPressureSystolic: valoriData.minSistolic || 110,
                            maxBloodPressureSystolic: valoriData.maxSistolic || 140,
                            minBloodPressureDiastolic: valoriData.minDiastolic || 70,
                            maxBloodPressureDiastolic: valoriData.maxDiastolic || 90,
                            minOxygenSaturation: valoriData.minOxigen || 95
                        };
                    }
                }

                // Transformăm datele din Firestore în formatul necesar pentru interfață
                patientsData.push({
                    id: docSnapshot.id,
                    firstName: patientData.prenume || '',
                    lastName: patientData.nume || '',
                    age: patientData.varsta || 0,
                    cnp: patientData.cnp || '',
                    address: {
                        street: patientData.strada || '',
                        number: patientData.numar || '',
                        building: patientData.bloc || '',
                        apartment: patientData.apartament || '',
                        city: patientData.oras || '',
                        county: patientData.judet || '',
                        postalCode: patientData.codPostal || ''
                    },
                    phone: patientData.nrTelefon || '',
                    email: patientData.email || '',
                    profession: patientData.profesie || '',
                    workplace: patientData.locDeMunca || '',
                    medicalInfo: {
                        medicalHistory: patientData.istoricMedical || '',
                        allergies: Array.isArray(patientData.alergii) ? patientData.alergii.join(', ') : patientData.alergii || '',
                        consultations: patientData.consultatii || ''
                    },
                    normalValues: normalValues,
                    valoriNormaleID: patientData.valoriNormaleID || ''
                });
            }

            setPatients(patientsData);
        } catch (error) {
            console.error("Eroare la preluarea pacienților:", error);
            message.error("Nu s-a putut încărca lista de pacienți.");
        } finally {
            setLoading(false);
        }
    };

    const columns = [
        {
            title: 'Nume',
            dataIndex: 'lastName',
            key: 'lastName',
            sorter: (a: Patient, b: Patient) => a.lastName.localeCompare(b.lastName),
        },
        {
            title: 'Prenume',
            dataIndex: 'firstName',
            key: 'firstName',
            sorter: (a: Patient, b: Patient) => a.firstName.localeCompare(b.firstName),
        },
        {
            title: 'Vârstă',
            dataIndex: 'age',
            key: 'age',
            sorter: (a: Patient, b: Patient) => a.age - b.age,
        },
        {
            title: 'CNP',
            dataIndex: 'cnp',
            key: 'cnp',
        },
        {
            title: 'Telefon',
            dataIndex: 'phone',
            key: 'phone',
        },
        {
            title: 'Email',
            dataIndex: 'email',
            key: 'email',
        },
        {
            title: 'Acțiuni',
            key: 'actions',
            render: (_: unknown, record: Patient) => (
                <Space size="middle">
                    <Button
                        type="primary"
                        icon={<DashboardOutlined />}
                        onClick={() => navigateToDashboard(record)}
                        title="Vezi Dashboard-ul Pacientului"
                    />
                    <Button
                        type="default"
                        icon={<EditOutlined />}
                        onClick={() => handleEdit(record)}
                        title="Editează Pacient"
                    />
                    <Button
                        icon={<DeleteOutlined />}
                        danger
                        onClick={() => handleDelete(record.id)}
                        title="Șterge Pacient"
                    />
                </Space>
            ),
        },
    ];

    const navigateToDashboard = (patient: Patient) => {
        // Salvăm doar ID-ul pacientului în localStorage pentru a-l putea accesa în dashboard
        localStorage.setItem('selectedPatientId', patient.id);
        // Navigăm către dashboard
        navigate('/dashboard/health-charts');
    };

    const handleAddPatient = () => {
        setEditingPatient(null);
        form.resetFields();

        // Inițializăm formularul cu valori implicite pentru a asigura că toate câmpurile sunt considerate "vizitate"
        form.setFieldsValue({
            // Tab 1 - Informații personale
            firstName: '',
            lastName: '',
            age: '',
            cnp: '',
            email: '',
            phone: '',
            profession: '',
            workplace: '',

            // Tab 2 - Adresă
            street: '',
            number: '',
            building: '',
            apartment: '',
            city: '',
            county: '',
            postalCode: '',

            // Tab 3 - Informații medicale
            medicalHistory: '',
            allergies: '',
            consultations: '',

            // Tab 4 - Valori normale
            minHeartRate: 60,
            maxHeartRate: 100,
            minBloodPressureSystolic: 110,
            maxBloodPressureSystolic: 140,
            minBloodPressureDiastolic: 70,
            maxBloodPressureDiastolic: 90,
            minOxygenSaturation: 95,
        });

        setIsModalVisible(true);
    };

    const handleEdit = (patient: Patient) => {
        setEditingPatient(patient);

        // Precompletăm toate câmpurile formularului pentru a evita probleme cu tab-urile nevizitate
        const initialValues = {
            // Tab 1 - Informații personale
            firstName: patient.firstName,
            lastName: patient.lastName,
            age: patient.age,
            cnp: patient.cnp,
            email: patient.email,
            phone: patient.phone,
            profession: patient.profession || '',
            workplace: patient.workplace || '',

            // Tab 2 - Adresă
            street: patient.address.street,
            number: patient.address.number,
            building: patient.address.building || '',
            apartment: patient.address.apartment || '',
            city: patient.address.city,
            county: patient.address.county,
            postalCode: patient.address.postalCode || '',

            // Tab 3 - Informații medicale
            medicalHistory: patient.medicalInfo.medicalHistory || '',
            allergies: patient.medicalInfo.allergies || '',
            consultations: patient.medicalInfo.consultations || '',

            // Tab 4 - Valori normale
            minHeartRate: patient.normalValues.minHeartRate,
            maxHeartRate: patient.normalValues.maxHeartRate,
            minBloodPressureSystolic: patient.normalValues.minBloodPressureSystolic,
            maxBloodPressureSystolic: patient.normalValues.maxBloodPressureSystolic,
            minBloodPressureDiastolic: patient.normalValues.minBloodPressureDiastolic,
            maxBloodPressureDiastolic: patient.normalValues.maxBloodPressureDiastolic,
            minOxygenSaturation: patient.normalValues.minOxygenSaturation,
        };

        // Resetăm și setăm valorile inițiale pentru formular
        form.resetFields();
        form.setFieldsValue(initialValues);

        setIsModalVisible(true);
    };

    const handleDelete = (id: string) => {
        Modal.confirm({
            title: 'Ești sigur că vrei să ștergi acest pacient?',
            content: 'Această acțiune nu poate fi anulată.',
            okText: 'Da',
            okType: 'danger',
            cancelText: 'Nu',
            onOk: async () => {
                try {
                    // Obținem referința pacientului pentru a vedea dacă are un ID de valori normale
                    const pacientDoc = await getDoc(doc(db, "pacienti", id));

                    if (pacientDoc.exists()) {
                        const pacientData = pacientDoc.data();

                        // Ștergem valorile normale asociate dacă există
                        if (pacientData.valoriNormaleID) {
                            await deleteDoc(doc(db, "valori_normale", pacientData.valoriNormaleID));
                        }

                        // Ștergem pacientul
                        await deleteDoc(doc(db, "pacienti", id));

                        message.success("Pacient șters cu succes!");

                        // Reîmprospătăm lista de pacienți
                        fetchPatients();
                    }
                } catch (error) {
                    console.error("Eroare la ștergerea pacientului:", error);
                    message.error("Nu s-a putut șterge pacientul.");
                }
            }
        });
    };

    const handleFormSubmit = async (values: any) => {
        try {
            setLoading(true);

            // Asigurăm-ne că avem toate valorile necesare, indiferent de tab-urile vizitate
            const allValues = {
                // Tab 1 - Informații personale
                firstName: values.firstName || (editingPatient?.firstName || ''),
                lastName: values.lastName || (editingPatient?.lastName || ''),
                age: values.age || (editingPatient?.age || 0),
                cnp: values.cnp || (editingPatient?.cnp || ''),
                email: values.email || (editingPatient?.email || ''),
                phone: values.phone || (editingPatient?.phone || ''),
                profession: values.profession || (editingPatient?.profession || ''),
                workplace: values.workplace || (editingPatient?.workplace || ''),
                createAccount: values.createAccount !== undefined ? values.createAccount : true,
                password: values.password || generateRandomPassword(),

                // Tab 2 - Adresă
                street: values.street || (editingPatient?.address.street || ''),
                number: values.number || (editingPatient?.address.number || ''),
                building: values.building || (editingPatient?.address.building || ''),
                apartment: values.apartment || (editingPatient?.address.apartment || ''),
                city: values.city || (editingPatient?.address.city || ''),
                county: values.county || (editingPatient?.address.county || ''),
                postalCode: values.postalCode || (editingPatient?.address.postalCode || ''),

                // Tab 3 - Informații medicale
                medicalHistory: values.medicalHistory || (editingPatient?.medicalInfo.medicalHistory || ''),
                allergies: values.allergies || (editingPatient?.medicalInfo.allergies || ''),
                consultations: values.consultations || (editingPatient?.medicalInfo.consultations || ''),

                // Tab 4 - Valori normale
                minHeartRate: values.minHeartRate || (editingPatient?.normalValues.minHeartRate || 60),
                maxHeartRate: values.maxHeartRate || (editingPatient?.normalValues.maxHeartRate || 100),
                minBloodPressureSystolic: values.minBloodPressureSystolic || (editingPatient?.normalValues.minBloodPressureSystolic || 110),
                maxBloodPressureSystolic: values.maxBloodPressureSystolic || (editingPatient?.normalValues.maxBloodPressureSystolic || 140),
                minBloodPressureDiastolic: values.minBloodPressureDiastolic || (editingPatient?.normalValues.minBloodPressureDiastolic || 70),
                maxBloodPressureDiastolic: values.maxBloodPressureDiastolic || (editingPatient?.normalValues.maxBloodPressureDiastolic || 90),
                minOxygenSaturation: values.minOxygenSaturation || (editingPatient?.normalValues.minOxygenSaturation || 95),
            };

            // Verificare CNP - doar la adăugare, nu la editare
            if (!editingPatient) {
                const pacientRef = collection(db, "pacienti");
                const cnpQuery = query(pacientRef, where("cnp", "==", allValues.cnp));
                const querySnapshot = await getDocs(cnpQuery);

                if (!querySnapshot.empty) {
                    message.error("CNP-ul există deja în baza de date!");
                    setLoading(false);
                    return;
                }

                // Verificăm dacă email-ul există deja
                const emailQuery = query(pacientRef, where("email", "==", allValues.email));
                const emailSnapshot = await getDocs(emailQuery);

                if (!emailSnapshot.empty) {
                    message.error("Email-ul există deja în baza de date!");
                    setLoading(false);
                    return;
                }

                // Verificăm dacă email-ul există în colecția users
                const usersRef = collection(db, "users");
                const userEmailQuery = query(usersRef, where("email", "==", allValues.email));
                const userEmailSnapshot = await getDocs(userEmailQuery);

                if (!userEmailSnapshot.empty) {
                    message.error("Email-ul este deja asociat unui cont de utilizator!");
                    setLoading(false);
                    return;
                }
            }

            // Adăugăm sau actualizăm valorile normale
            let valoriNormaleID = editingPatient?.valoriNormaleID;
            const valoriNormaleData = {
                minPuls: allValues.minHeartRate,
                maxPuls: allValues.maxHeartRate,
                minSistolic: allValues.minBloodPressureSystolic,
                maxSistolic: allValues.maxBloodPressureSystolic,
                minDiastolic: allValues.minBloodPressureDiastolic,
                maxDiastolic: allValues.maxBloodPressureDiastolic,
                minOxigen: allValues.minOxygenSaturation,
            };

            if (valoriNormaleID) {
                // Actualizăm valorile normale existente
                await setDoc(doc(db, "valori_normale", valoriNormaleID), valoriNormaleData);
            } else {
                // Creăm noi valori normale
                const valoriNormaleRef = await addDoc(collection(db, "valori_normale"), valoriNormaleData);
                valoriNormaleID = valoriNormaleRef.id;
            }

            // Formatăm datele pentru Firestore
            const pacientData = {
                nume: allValues.lastName,
                prenume: allValues.firstName,
                varsta: allValues.age,
                cnp: allValues.cnp,
                strada: allValues.street,
                numar: allValues.number,
                bloc: allValues.building,
                apartament: allValues.apartment,
                oras: allValues.city,
                judet: allValues.county,
                codPostal: allValues.postalCode,
                nrTelefon: allValues.phone,
                email: allValues.email,
                profesie: allValues.profession,
                locDeMunca: allValues.workplace,
                istoricMedical: allValues.medicalHistory,
                alergii: allValues.allergies ? allValues.allergies.split(',').map((item: string) => item.trim()) : [],
                consultatii: allValues.consultations,
                valoriNormaleID: valoriNormaleID,
                updatedAt: new Date()
            };

            let pacientId = '';

            if (editingPatient) {
                // Actualizare pacient existent
                await setDoc(doc(db, "pacienti", editingPatient.id), pacientData, { merge: true });
                message.success("Pacient actualizat cu succes!");
                pacientId = editingPatient.id;
            } else {
                // Adăugare pacient nou
                const newPacientData = {
                    ...pacientData,
                    createdAt: new Date()
                };
                const pacientRef = await addDoc(collection(db, "pacienti"), newPacientData);
                pacientId = pacientRef.id;
                message.success("Pacient adăugat cu succes!");

                // Verificăm dacă trebuie să creăm un cont de utilizator pentru noul pacient
                if (allValues.createAccount) {
                    try {
                        // Hashăm parola pentru stocarea în Firestore
                        const salt = await bcrypt.genSalt(10);
                        const hashedPassword = await bcrypt.hash(allValues.password, salt);

                        // Creăm un nou document în colecția users
                        const userDoc = await addDoc(collection(db, "users"), {
                            firstName: allValues.firstName,
                            lastName: allValues.lastName,
                            email: allValues.email,
                            password: hashedPassword,
                            role: "USER",
                            pacientId: pacientId, // Referință către documentul pacientului
                            createdAt: new Date()
                        });

                        message.success("Cont de utilizator creat cu succes pentru pacient!");

                        // Afișăm credențialele într-o modalitate securizată (sau le trimitem prin email)
                        Modal.success({
                            title: 'Cont de utilizator creat',
                            content: (
                                <div>
                                    <p>S-a creat un cont pentru pacientul {allValues.firstName} {allValues.lastName}</p>
                                    <p><strong>Email:</strong> {allValues.email}</p>
                                    <p><strong>Parolă:</strong> {allValues.password}</p>
                                    <p>Vă recomandăm să notați aceste credențiale și să le comunicați pacientului.</p>
                                </div>
                            ),
                        });
                    } catch (error) {
                        console.error("Eroare la crearea contului de utilizator:", error);
                        message.warning("Pacientul a fost adăugat, dar nu s-a putut crea contul de utilizator. Încercați manual.");
                    }
                }
            }

            // Închide modalul și actualizează lista
            setIsModalVisible(false);
            form.resetFields();
            fetchPatients();
        } catch (error) {
            console.error("Eroare la salvarea pacientului:", error);
            message.error("Nu s-a putut salva pacientul. Verificați datele și încercați din nou.");
        } finally {
            setLoading(false);
        }
    };

    // Funcție pentru generarea unei parole aleatorii
    const generateRandomPassword = () => {
        const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
        let password = "";
        for (let i = 0; i < 10; i++) {
            password += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        return password;
    };

    return (
        <div className={styles.container}>
            <Card className={styles.card}>
                <div className={styles.header}>
                    <Title level={3}>Management Pacienți</Title>
                    <Button
                        type="primary"
                        icon={<PlusOutlined />}
                        onClick={handleAddPatient}
                    >
                        Adaugă Pacient
                    </Button>
                </div>

                <Table
                    dataSource={patients}
                    columns={columns}
                    rowKey="id"
                    pagination={{ pageSize: 10 }}
                    loading={loading}
                />
            </Card>

            {/* Modal pentru adăugare/editare pacient */}
            <Modal
                title={editingPatient ? "Editare pacient" : "Adăugare pacient nou"}
                visible={isModalVisible}
                onCancel={() => setIsModalVisible(false)}
                width={800}
                destroyOnClose={true}
                maskClosable={false}
                bodyStyle={{ padding: '24px', maxHeight: '70vh', overflowY: 'auto' }}
                footer={[
                    <Button key="cancel" onClick={() => setIsModalVisible(false)}>
                        Anulează
                    </Button>,
                    <Button
                        key="submit"
                        type="primary"
                        onClick={() => form.submit()}
                        loading={loading}
                    >
                        {editingPatient ? "Salvează modificările" : "Adaugă pacient"}
                    </Button>
                ]}
            >
                <Form
                    form={form}
                    layout="vertical"
                    onFinish={handleFormSubmit}
                    preserve={false}
                    name="patientForm"
                    scrollToFirstError
                >
                    <Tabs defaultActiveKey="1">
                        <TabPane tab="Informații personale" key="1">
                            <Row gutter={16}>
                                <Col span={12}>
                                    <Form.Item
                                        name="firstName"
                                        label="Prenume"
                                        rules={[{ required: true, message: 'Introduceți prenumele pacientului!' }]}
                                    >
                                        <Input prefix={<UserOutlined />} placeholder="Prenume" />
                                    </Form.Item>
                                </Col>
                                <Col span={12}>
                                    <Form.Item
                                        name="lastName"
                                        label="Nume"
                                        rules={[{ required: true, message: 'Introduceți numele pacientului!' }]}
                                    >
                                        <Input prefix={<UserOutlined />} placeholder="Nume" />
                                    </Form.Item>
                                </Col>
                            </Row>

                            <Row gutter={16}>
                                <Col span={8}>
                                    <Form.Item
                                        name="age"
                                        label="Vârstă"
                                        rules={[{ required: true, message: 'Introduceți vârsta pacientului!' }]}
                                    >
                                        <Input type="number" placeholder="Vârstă" />
                                    </Form.Item>
                                </Col>
                                <Col span={16}>
                                    <Form.Item
                                        name="cnp"
                                        label="CNP"
                                        rules={[{ required: true, message: 'Introduceți CNP-ul pacientului!' }]}
                                    >
                                        <Input placeholder="CNP" />
                                    </Form.Item>
                                </Col>
                            </Row>

                            <Row gutter={16}>
                                <Col span={12}>
                                    <Form.Item
                                        name="email"
                                        label="Email"
                                        rules={[{ required: true, message: 'Introduceți email-ul pacientului!' }]}
                                    >
                                        <Input prefix={<MailOutlined />} placeholder="Email" />
                                    </Form.Item>
                                </Col>
                                <Col span={12}>
                                    <Form.Item
                                        name="phone"
                                        label="Telefon"
                                        rules={[{ required: true, message: 'Introduceți telefonul pacientului!' }]}
                                    >
                                        <Input prefix={<PhoneOutlined />} placeholder="Telefon" />
                                    </Form.Item>
                                </Col>
                            </Row>

                            <Row gutter={16}>
                                <Col span={12}>
                                    <Form.Item
                                        name="profession"
                                        label="Profesie"
                                    >
                                        <Input placeholder="Profesie" />
                                    </Form.Item>
                                </Col>
                                <Col span={12}>
                                    <Form.Item
                                        name="workplace"
                                        label="Loc de muncă"
                                    >
                                        <Input placeholder="Loc de muncă" />
                                    </Form.Item>
                                </Col>
                            </Row>

                            <Form.Item label="Creare cont utilizator" name="createAccount" valuePropName="checked" initialValue={true} tooltip="Creează automat un cont pentru pacient">
                                <Switch defaultChecked />
                            </Form.Item>

                            <Form.Item
                                label="Parolă cont"
                                name="password"
                                tooltip="Lasă gol pentru generare automată sau specifică o parolă"
                                rules={[
                                    {
                                        required: false,
                                        message: 'Introduceți parola sau lăsați gol pentru generare automată',
                                    },
                                ]}
                            >
                                <Input.Password placeholder="Parolă cont (opțional)" />
                            </Form.Item>
                        </TabPane>

                        <TabPane tab="Adresă" key="2">
                            <Row gutter={16}>
                                <Col span={16}>
                                    <Form.Item
                                        name="street"
                                        label="Stradă"
                                        rules={[{ required: true, message: 'Introduceți strada!' }]}
                                    >
                                        <Input prefix={<HomeOutlined />} placeholder="Stradă" />
                                    </Form.Item>
                                </Col>
                                <Col span={8}>
                                    <Form.Item
                                        name="number"
                                        label="Număr"
                                        rules={[{ required: true, message: 'Introduceți numărul!' }]}
                                    >
                                        <Input placeholder="Număr" />
                                    </Form.Item>
                                </Col>
                            </Row>

                            <Row gutter={16}>
                                <Col span={8}>
                                    <Form.Item
                                        name="building"
                                        label="Bloc"
                                    >
                                        <Input placeholder="Bloc" />
                                    </Form.Item>
                                </Col>
                                <Col span={8}>
                                    <Form.Item
                                        name="apartment"
                                        label="Apartament"
                                    >
                                        <Input placeholder="Apartament" />
                                    </Form.Item>
                                </Col>
                                <Col span={8}>
                                    <Form.Item
                                        name="postalCode"
                                        label="Cod poștal"
                                    >
                                        <Input placeholder="Cod poștal" />
                                    </Form.Item>
                                </Col>
                            </Row>

                            <Row gutter={16}>
                                <Col span={12}>
                                    <Form.Item
                                        name="city"
                                        label="Oraș"
                                        rules={[{ required: true, message: 'Introduceți orașul!' }]}
                                    >
                                        <Input placeholder="Oraș" />
                                    </Form.Item>
                                </Col>
                                <Col span={12}>
                                    <Form.Item
                                        name="county"
                                        label="Județ/Sector"
                                        rules={[{ required: true, message: 'Introduceți județul/sectorul!' }]}
                                    >
                                        <Input placeholder="Județ/Sector" />
                                    </Form.Item>
                                </Col>
                            </Row>
                        </TabPane>

                        <TabPane tab="Informații medicale" key="3">
                            <Form.Item
                                name="medicalHistory"
                                label="Istoric medical"
                            >
                                <TextArea rows={4} placeholder="Istoric medical" />
                            </Form.Item>

                            <Form.Item
                                name="allergies"
                                label="Alergii"
                            >
                                <TextArea rows={2} placeholder="Alergii (separate prin virgulă)" />
                            </Form.Item>

                            <Form.Item
                                name="consultations"
                                label="Consultații și observații"
                            >
                                <TextArea rows={4} placeholder="Consultații și observații" />
                            </Form.Item>
                        </TabPane>

                        <TabPane tab="Valori normale" key="4">
                            <Divider orientation="left">Ritm cardiac (BPM)</Divider>
                            <Row gutter={16}>
                                <Col span={12}>
                                    <Form.Item
                                        name="minHeartRate"
                                        label="Minim"
                                        rules={[{ required: true, message: 'Introduceți valoarea minimă!' }]}
                                    >
                                        <Input type="number" placeholder="Minim" />
                                    </Form.Item>
                                </Col>
                                <Col span={12}>
                                    <Form.Item
                                        name="maxHeartRate"
                                        label="Maxim"
                                        rules={[{ required: true, message: 'Introduceți valoarea maximă!' }]}
                                    >
                                        <Input type="number" placeholder="Maxim" />
                                    </Form.Item>
                                </Col>
                            </Row>

                            <Divider orientation="left">Tensiune arterială sistolică (mmHg)</Divider>
                            <Row gutter={16}>
                                <Col span={12}>
                                    <Form.Item
                                        name="minBloodPressureSystolic"
                                        label="Minim"
                                        rules={[{ required: true, message: 'Introduceți valoarea minimă!' }]}
                                    >
                                        <Input type="number" placeholder="Minim" />
                                    </Form.Item>
                                </Col>
                                <Col span={12}>
                                    <Form.Item
                                        name="maxBloodPressureSystolic"
                                        label="Maxim"
                                        rules={[{ required: true, message: 'Introduceți valoarea maximă!' }]}
                                    >
                                        <Input type="number" placeholder="Maxim" />
                                    </Form.Item>
                                </Col>
                            </Row>

                            <Divider orientation="left">Tensiune arterială diastolică (mmHg)</Divider>
                            <Row gutter={16}>
                                <Col span={12}>
                                    <Form.Item
                                        name="minBloodPressureDiastolic"
                                        label="Minim"
                                        rules={[{ required: true, message: 'Introduceți valoarea minimă!' }]}
                                    >
                                        <Input type="number" placeholder="Minim" />
                                    </Form.Item>
                                </Col>
                                <Col span={12}>
                                    <Form.Item
                                        name="maxBloodPressureDiastolic"
                                        label="Maxim"
                                        rules={[{ required: true, message: 'Introduceți valoarea maximă!' }]}
                                    >
                                        <Input type="number" placeholder="Maxim" />
                                    </Form.Item>
                                </Col>
                            </Row>

                            <Divider orientation="left">Saturație oxigen (%)</Divider>
                            <Row gutter={16}>
                                <Col span={12}>
                                    <Form.Item
                                        name="minOxygenSaturation"
                                        label="Minim"
                                        rules={[{ required: true, message: 'Introduceți valoarea minimă!' }]}
                                    >
                                        <Input type="number" placeholder="Minim" />
                                    </Form.Item>
                                </Col>
                            </Row>
                        </TabPane>
                    </Tabs>
                </Form>
            </Modal>
        </div>
    );
};

export default PatientManagement; 