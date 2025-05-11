import { FC, useState, useEffect } from 'react';
import {
    Card,
    Table,
    Tag,
    Space,
    Button,
    Modal,
    Form,
    Input,
    Select,
    DatePicker,
    TimePicker,
    Typography,
    Switch,
    Popconfirm,
    Tabs,
    Badge,
    message
} from 'antd';
import { DeleteOutlined, EditOutlined, ExclamationCircleOutlined, BellOutlined, UserOutlined, CheckOutlined, CheckCircleOutlined } from '@ant-design/icons';
import styles from './AlertsManagement.module.scss';
import dayjs from 'dayjs';
import { db } from '../../../../firebase';
import { collection, query, where, getDocs, addDoc, deleteDoc, doc, updateDoc, Timestamp } from 'firebase/firestore';
import PatientSelector from './PatientSelector';

const { Option } = Select;
const { TextArea } = Input;
const { Title, Text } = Typography;
const { TabPane } = Tabs;

// Definim tipurile pentru notificări
interface Notification {
    id: string;
    patientId: string;
    patientName: string;
    type: 'Alarmă' | 'Avertizare' | 'Informare';
    parameter: string;
    value: string;
    threshold: string;
    timestamp: Date | Timestamp;
    status: 'Necitit' | 'Citit';
    message: string;
    actionTaken?: string;
    assignedDoctor?: string;
}

// Definim tipurile pentru pragurile de alertă
interface AlertThreshold {
    id: string;
    patientId: string;
    parameter: string;
    minValue: string;
    maxValue: string;
    severity: 'Alarmă' | 'Avertizare' | 'Informare';
    enabled: boolean;
}

// Date mock pentru medici
const mockDoctors = [
    { id: '1', name: 'Dr. Maria Ionescu' },
    { id: '2', name: 'Dr. Vasile Popescu' },
    { id: '3', name: 'Dr. Andreea Popa' }
];

// Mock data pentru notificările inițiale
const initialNotifications: Notification[] = [
    {
        id: '1',
        patientId: '1',
        patientName: 'Popescu Ion',
        type: 'Alarmă',
        parameter: 'Ritm cardiac',
        value: '110 BPM',
        threshold: '100 BPM',
        timestamp: new Date('2023-03-10T23:15:00'),
        status: 'Necitit',
        message: 'Ritm cardiac ridicat detectat',
        actionTaken: '',
        assignedDoctor: 'Dr. Maria Ionescu'
    },
    {
        id: '2',
        patientId: '1',
        patientName: 'Popescu Ion',
        type: 'Avertizare',
        parameter: 'Tensiune arterială',
        value: '145/95 mmHg',
        threshold: '140/90 mmHg',
        timestamp: new Date('2023-03-14T08:45:00'),
        status: 'Necitit',
        message: 'Tensiune arterială ușor crescută',
        actionTaken: '',
        assignedDoctor: 'Dr. Maria Ionescu'
    },
    {
        id: '3',
        patientId: '2',
        patientName: 'Ionescu Maria',
        type: 'Informare',
        parameter: 'Fără măsurători',
        value: 'N/A',
        threshold: 'N/A',
        timestamp: new Date('2023-03-12T10:00:00'),
        status: 'Citit',
        message: 'Pacientul nu a efectuat măsurători în ultimele 48 de ore',
        actionTaken: 'SMS de reamintire trimis.',
        assignedDoctor: 'Dr. Vasile Popescu'
    }
];

// Date mock pentru pacienți
const mockPatients = [
    { id: 1, name: 'Popescu Ion' },
    { id: 2, name: 'Ionescu Maria' },
    { id: 3, name: 'Popa Andrei' },
    { id: 4, name: 'Dumitrescu Elena' }
];

// Date mock pentru praguri de alerte
const initialThresholds: AlertThreshold[] = [
    {
        id: '1',
        patientId: '1',
        parameter: 'Ritm cardiac',
        minValue: '50 BPM',
        maxValue: '100 BPM',
        severity: 'Alarmă',
        enabled: true
    },
    {
        id: '2',
        patientId: '1',
        parameter: 'Tensiune arterială sistolică',
        minValue: '90 mmHg',
        maxValue: '140 mmHg',
        severity: 'Avertizare',
        enabled: true
    },
    {
        id: '3',
        patientId: '1',
        parameter: 'Tensiune arterială diastolică',
        minValue: '60 mmHg',
        maxValue: '90 mmHg',
        severity: 'Avertizare',
        enabled: true
    },
    {
        id: '4',
        patientId: '1',
        parameter: 'Saturație oxigen',
        minValue: '95%',
        maxValue: '100%',
        severity: 'Alarmă',
        enabled: true
    },
    {
        id: '5',
        patientId: '2',
        parameter: 'Ritm cardiac',
        minValue: '55 BPM',
        maxValue: '95 BPM',
        severity: 'Alarmă',
        enabled: true
    }
];

const AlertsManagement: FC = () => {
    // State-uri pentru diferitele moduri de afișare
    const [activeMainTab, setActiveMainTab] = useState<string>('notifications');
    const [activeNotificationTab, setActiveNotificationTab] = useState<string>('unread');

    // State pentru notificări și praguri
    const [notifications, setNotifications] = useState<Notification[]>(initialNotifications);
    const [thresholds, setThresholds] = useState<AlertThreshold[]>([]);

    // State pentru modal și formulare
    const [notificationModalVisible, setNotificationModalVisible] = useState<boolean>(false);
    const [thresholdModalVisible, setThresholdModalVisible] = useState<boolean>(false);
    const [editingNotification, setEditingNotification] = useState<Notification | null>(null);
    const [editingThreshold, setEditingThreshold] = useState<AlertThreshold | null>(null);

    // Formulare
    const [notificationForm] = Form.useForm();
    const [thresholdForm] = Form.useForm();

    // State pentru pacientul selectat
    const [selectedPatient, setSelectedPatient] = useState<any>(null);
    const [loading, setLoading] = useState<boolean>(false);

    // Încărcăm notificările și pragurile din Firebase la inițializare
    useEffect(() => {
        if (selectedPatient) {
            fetchNotifications();
            fetchThresholds();
        }
    }, [selectedPatient]);

    // Funcție pentru a prelua notificările din Firebase
    const fetchNotifications = async () => {
        try {
            setLoading(true);
            const notificationsRef = collection(db, "notificari");

            // Filtrăm pentru pacientul curent
            const q = query(notificationsRef, where("pacientID", "==", selectedPatient.id));
            const querySnapshot = await getDocs(q);

            const notificationsData: Notification[] = [];

            querySnapshot.docs.forEach(doc => {
                const data = doc.data();
                notificationsData.push({
                    id: doc.id,
                    patientId: data.pacientID,
                    patientName: `${selectedPatient.nume} ${selectedPatient.prenume}`,
                    type: data.tip,
                    parameter: data.parametru,
                    value: data.valoare,
                    threshold: data.prag,
                    timestamp: data.timestamp,
                    status: data.status,
                    message: data.mesaj,
                    actionTaken: data.actiuneIntreprinsa || '',
                    assignedDoctor: data.medicAsignat || ''
                });
            });

            // Sortăm notificările după timestamp (cele mai recente primul)
            notificationsData.sort((a, b) => {
                const dateA = a.timestamp instanceof Date ? a.timestamp : a.timestamp.toDate();
                const dateB = b.timestamp instanceof Date ? b.timestamp : b.timestamp.toDate();
                return dateB.getTime() - dateA.getTime();
            });

            setNotifications(notificationsData);
        } catch (error) {
            console.error("Eroare la preluarea notificărilor:", error);
            message.error("Nu s-au putut încărca notificările.");
        } finally {
            setLoading(false);
        }
    };

    // Funcție pentru a prelua pragurile din Firebase
    const fetchThresholds = async () => {
        try {
            setLoading(true);
            const thresholdsRef = collection(db, "praguri_alerta");

            // Filtrăm pentru pacientul curent
            const q = query(thresholdsRef, where("pacientID", "==", selectedPatient.id));
            const querySnapshot = await getDocs(q);

            const thresholdsData: AlertThreshold[] = [];

            querySnapshot.docs.forEach(doc => {
                const data = doc.data();
                thresholdsData.push({
                    id: doc.id,
                    patientId: data.pacientID,
                    parameter: data.parametru,
                    minValue: data.valoareMinima,
                    maxValue: data.valoareMaxima,
                    severity: data.severitate,
                    enabled: data.activ
                });
            });

            setThresholds(thresholdsData);
        } catch (error) {
            console.error("Eroare la preluarea pragurilor:", error);
            message.error("Nu s-au putut încărca pragurile de alertă.");
        } finally {
            setLoading(false);
        }
    };

    // Funcție pentru a marca o notificare ca citită
    const handleMarkAsRead = async (id: string) => {
        try {
            setLoading(true);

            // Actualizăm statusul în Firebase
            await updateDoc(doc(db, "notificari", id), {
                status: 'Citit'
            });

            // Actualizăm starea locală
            setNotifications(notifications.map(notif =>
                notif.id === id ? { ...notif, status: 'Citit' } : notif
            ));

            message.success("Notificare marcată ca citită.");
        } catch (error) {
            console.error("Eroare la marcarea notificării:", error);
            message.error("Nu s-a putut marca notificarea ca citită.");
        } finally {
            setLoading(false);
        }
    };

    // Funcție pentru a marca toate notificările ca citite
    const handleMarkAllAsRead = async () => {
        try {
            setLoading(true);

            // Obținem toate notificările necitite
            const unreadNotifications = notifications.filter(notif => notif.status === 'Necitit');

            // Actualizăm fiecare notificare necitită
            for (const notif of unreadNotifications) {
                await updateDoc(doc(db, "notificari", notif.id), {
                    status: 'Citit'
                });
            }

            // Actualizăm starea locală
            setNotifications(notifications.map(notif =>
                notif.status === 'Necitit' ? { ...notif, status: 'Citit' } : notif
            ));

            message.success("Toate notificările au fost marcate ca citite.");
        } catch (error) {
            console.error("Eroare la marcarea tuturor notificărilor:", error);
            message.error("Nu s-au putut marca toate notificările ca citite.");
        } finally {
            setLoading(false);
        }
    };

    // Funcție pentru ștergerea unei notificări
    const handleDeleteNotification = async (id: string) => {
        try {
            setLoading(true);

            // Ștergem notificarea din Firebase
            await deleteDoc(doc(db, "notificari", id));

            // Actualizăm starea locală
            setNotifications(notifications.filter(notif => notif.id !== id));

            message.success("Notificare ștearsă cu succes.");
        } catch (error) {
            console.error("Eroare la ștergerea notificării:", error);
            message.error("Nu s-a putut șterge notificarea.");
        } finally {
            setLoading(false);
        }
    };

    // Funcție pentru a vedea/edita o notificare
    const handleViewNotification = (notification: Notification) => {
        setEditingNotification(notification);

        // Convertim timestamp-ul la formatul necesar pentru DatePicker
        const date = notification.timestamp instanceof Date
            ? notification.timestamp
            : notification.timestamp.toDate();

        notificationForm.setFieldsValue({
            patientId: notification.patientId,
            type: notification.type,
            parameter: notification.parameter,
            value: notification.value,
            threshold: notification.threshold,
            timestamp: dayjs(date),
            status: notification.status,
            message: notification.message,
            actionTaken: notification.actionTaken,
            assignedDoctor: notification.assignedDoctor
        });

        setNotificationModalVisible(true);
    };

    // Funcție pentru a adăuga/edita o notificare
    const handleSaveNotification = async () => {
        try {
            const values = await notificationForm.validateFields();
            setLoading(true);

            // Formatăm data pentru Firestore
            const timestamp = values.timestamp.toDate();

            const notificationData = {
                pacientID: values.patientId,
                tip: values.type,
                parametru: values.parameter,
                valoare: values.value,
                prag: values.threshold,
                timestamp: timestamp,
                status: values.status,
                mesaj: values.message,
                actiuneIntreprinsa: values.actionTaken,
                medicAsignat: values.assignedDoctor
            };

            if (editingNotification) {
                // Actualizăm notificarea existentă
                await updateDoc(doc(db, "notificari", editingNotification.id), notificationData);
                message.success("Notificare actualizată cu succes.");
            } else {
                // Adăugăm o notificare nouă
                await addDoc(collection(db, "notificari"), notificationData);
                message.success("Notificare adăugată cu succes.");
            }

            // Reîncărcăm lista de notificări
            fetchNotifications();

            // Resetăm formularul și închidem modalul
            notificationForm.resetFields();
            setNotificationModalVisible(false);
            setEditingNotification(null);
        } catch (error) {
            console.error("Eroare la salvarea notificării:", error);
            message.error("Nu s-a putut salva notificarea.");
        } finally {
            setLoading(false);
        }
    };

    // Funcție pentru a gestiona selectarea pacientului
    const handlePatientSelect = (patient: any) => {
        if (!patient || !patient.id) {
            console.error('Pacient invalid selectat');
            message.error('Eroare la selectarea pacientului');
            return;
        }
        setSelectedPatient(patient);
    };

    // Filtrăm notificările în funcție de tab-ul activ
    const getFilteredNotifications = () => {
        switch (activeNotificationTab) {
            case 'unread':
                return notifications.filter(notif => notif.status === 'Necitit');
            case 'read':
                return notifications.filter(notif => notif.status === 'Citit');
            case 'all':
            default:
                return notifications;
        }
    };

    // Definim coloanele pentru tabelul de notificări
    const notificationColumns = [
        {
            title: 'Status',
            key: 'status',
            width: 80,
            render: (record: Notification) => (
                <span className={`${styles.statusBadge} ${record.status === 'Necitit' ? styles.unread : styles.read}`}>
                    {record.status === 'Necitit' ? '●' : '✓'}
                </span>
            )
        },
        {
            title: 'Pacient',
            dataIndex: 'patientName',
            key: 'patientName',
            width: 150
        },
        {
            title: 'Tip',
            dataIndex: 'type',
            key: 'type',
            width: 100,
            render: (type: string) => {
                let color = 'blue';
                if (type === 'Alarmă') color = 'red';
                if (type === 'Avertizare') color = 'orange';

                return <Tag color={color} className={styles.alertTypeTag}>{type}</Tag>;
            }
        },
        {
            title: 'Parametru',
            dataIndex: 'parameter',
            key: 'parameter',
            width: 120
        },
        {
            title: 'Valoare',
            dataIndex: 'value',
            key: 'value',
            width: 100
        },
        {
            title: 'Prag',
            dataIndex: 'threshold',
            key: 'threshold',
            width: 100
        },
        {
            title: 'Mesaj',
            dataIndex: 'message',
            key: 'message',
            width: 200,
            ellipsis: true
        },
        {
            title: 'Data și ora',
            key: 'timestamp',
            width: 150,
            render: (record: Notification) => {
                const date = record.timestamp instanceof Date
                    ? record.timestamp
                    : record.timestamp.toDate();
                return dayjs(date).format('DD/MM/YYYY HH:mm');
            }
        },
        {
            title: 'Acțiuni',
            key: 'actions',
            width: 150,
            render: (record: Notification) => (
                <Space size="small">
                    {record.status === 'Necitit' && (
                        <Button
                            icon={<CheckOutlined />}
                            size="small"
                            type="primary"
                            onClick={() => handleMarkAsRead(record.id)}
                            title="Marchează ca citită"
                        />
                    )}
                    <Button
                        icon={<EditOutlined />}
                        size="small"
                        onClick={() => handleViewNotification(record)}
                        title="Vezi detalii"
                    />
                    <Popconfirm
                        title="Ești sigur că vrei să ștergi această notificare?"
                        onConfirm={() => handleDeleteNotification(record.id)}
                        okText="Da"
                        cancelText="Nu"
                        icon={<ExclamationCircleOutlined style={{ color: 'red' }} />}
                    >
                        <Button
                            icon={<DeleteOutlined />}
                            size="small"
                            danger
                            title="Șterge"
                        />
                    </Popconfirm>
                </Space>
            )
        }
    ];

    return (
        <div className={styles.container}>
            <Card title={
                <div className={styles.header}>
                    <Title level={4}>
                        <BellOutlined /> Notificări și Alerte
                    </Title>
                </div>
            } className={styles.card}>
                <PatientSelector onPatientSelect={handlePatientSelect} />

                {selectedPatient ? (
                    <>
                        <div className={styles.tabButtons}>
                            <Button
                                type={activeMainTab === 'notifications' ? 'primary' : 'default'}
                                onClick={() => setActiveMainTab('notifications')}
                                icon={<BellOutlined />}
                            >
                                Notificări
                            </Button>
                            <Button
                                type={activeMainTab === 'thresholds' ? 'primary' : 'default'}
                                onClick={() => setActiveMainTab('thresholds')}
                                icon={<ExclamationCircleOutlined />}
                            >
                                Praguri de alertă
                            </Button>
                        </div>

                        {activeMainTab === 'notifications' && (
                            <>
                                <Tabs
                                    activeKey={activeNotificationTab}
                                    onChange={setActiveNotificationTab}
                                    className={styles.notificationTabs}
                                    tabBarExtraContent={
                                        activeNotificationTab === 'unread' ? (
                                            <Button
                                                type="primary"
                                                icon={<CheckCircleOutlined />}
                                                onClick={handleMarkAllAsRead}
                                                className={styles.markAllButton}
                                                disabled={getFilteredNotifications().length === 0}
                                            >
                                                Marchează toate ca citite
                                            </Button>
                                        ) : null
                                    }
                                >
                                    <TabPane
                                        tab={
                                            <Badge
                                                count={notifications.filter(n => n.status === 'Necitit').length}
                                                style={{ backgroundColor: '#1890ff' }}
                                            >
                                                Necitite
                                            </Badge>
                                        }
                                        key="unread"
                                    />
                                    <TabPane tab="Citite" key="read" />
                                    <TabPane tab="Toate" key="all" />
                                </Tabs>

                                <Table
                                    dataSource={getFilteredNotifications()}
                                    columns={notificationColumns}
                                    rowKey="id"
                                    pagination={{ pageSize: 10 }}
                                    loading={loading}
                                    locale={{
                                        emptyText: 'Nu există notificări pentru acest pacient.'
                                    }}
                                />
                            </>
                        )}

                        {/* Modal pentru vizualizare/editare notificare */}
                        <Modal
                            title={editingNotification ? "Detalii Notificare" : "Adaugă Notificare"}
                            visible={notificationModalVisible}
                            onOk={handleSaveNotification}
                            onCancel={() => {
                                setNotificationModalVisible(false);
                                notificationForm.resetFields();
                                setEditingNotification(null);
                            }}
                            okText="Salvează"
                            cancelText="Anulează"
                            width={700}
                        >
                            <Form
                                form={notificationForm}
                                layout="vertical"
                            >
                                <Form.Item
                                    name="patientId"
                                    label="Pacient"
                                    initialValue={selectedPatient?.id}
                                    hidden={true}
                                >
                                    <Input disabled />
                                </Form.Item>

                                <Form.Item
                                    name="type"
                                    label="Tip alertă"
                                    rules={[{ required: true, message: 'Selectați tipul alertei!' }]}
                                >
                                    <Select placeholder="Selectați tipul alertei">
                                        <Option value="Alarmă">Alarmă</Option>
                                        <Option value="Avertizare">Avertizare</Option>
                                        <Option value="Informare">Informare</Option>
                                    </Select>
                                </Form.Item>

                                <Form.Item
                                    name="parameter"
                                    label="Parametru"
                                    rules={[{ required: true, message: 'Selectați parametrul!' }]}
                                >
                                    <Select placeholder="Selectați parametrul">
                                        <Option value="Ritm cardiac">Ritm cardiac</Option>
                                        <Option value="Tensiune arterială">Tensiune arterială</Option>
                                        <Option value="Saturație oxigen">Saturație oxigen</Option>
                                        <Option value="Fără măsurători">Fără măsurători</Option>
                                    </Select>
                                </Form.Item>

                                <Form.Item
                                    name="value"
                                    label="Valoare"
                                >
                                    <Input placeholder="ex: 110 BPM, 145/95 mmHg, 94%" />
                                </Form.Item>

                                <Form.Item
                                    name="threshold"
                                    label="Prag de alertă"
                                >
                                    <Input placeholder="ex: 100 BPM, 140/90 mmHg, 95%" />
                                </Form.Item>

                                <Form.Item
                                    name="timestamp"
                                    label="Data și ora"
                                    rules={[{ required: true, message: 'Introduceți data și ora!' }]}
                                >
                                    <DatePicker
                                        showTime
                                        format="YYYY-MM-DD HH:mm"
                                        style={{ width: '100%' }}
                                    />
                                </Form.Item>

                                <Form.Item
                                    name="status"
                                    label="Status"
                                    rules={[{ required: true, message: 'Selectați statusul!' }]}
                                >
                                    <Select placeholder="Selectați statusul">
                                        <Option value="Necitit">Necitit</Option>
                                        <Option value="Citit">Citit</Option>
                                    </Select>
                                </Form.Item>

                                <Form.Item
                                    name="message"
                                    label="Mesaj"
                                    rules={[{ required: true, message: 'Introduceți un mesaj!' }]}
                                >
                                    <Input placeholder="Descrierea alertei..." />
                                </Form.Item>

                                <Form.Item
                                    name="assignedDoctor"
                                    label="Medic asignat"
                                >
                                    <Select placeholder="Selectați medicul">
                                        {mockDoctors.map(doctor => (
                                            <Option key={doctor.id} value={doctor.name}>{doctor.name}</Option>
                                        ))}
                                    </Select>
                                </Form.Item>

                                <Form.Item
                                    name="actionTaken"
                                    label="Acțiune întreprinsă"
                                >
                                    <TextArea rows={4} placeholder="Descrieți acțiunea întreprinsă..." />
                                </Form.Item>
                            </Form>
                        </Modal>
                    </>
                ) : (
                    <div style={{ textAlign: 'center', padding: '20px' }}>
                        <Text type="secondary">Selectați un pacient pentru a vedea notificările și alertele.</Text>
                    </div>
                )}
            </Card>
        </div>
    );
};

export default AlertsManagement; 