import { FC, useState, useEffect, useRef } from 'react';
import { Card, Table, Tag, Space, Button, Badge, Typography, Tabs, message, notification } from 'antd';
import { BellOutlined, CheckOutlined, SyncOutlined } from '@ant-design/icons';
import styles from './index.module.scss';
import { db } from '../../../firebase';
import { collection, query, doc, updateDoc, Timestamp, onSnapshot, orderBy, limit } from 'firebase/firestore';
import axios from 'axios';

const { Title } = Typography;
const { TabPane } = Tabs;

// Change the name of the notification interface
interface AlertNotification {
    id: string;
    patientId: string;
    patientName: string;
    type: string;
    parameter: string;
    value: string;
    threshold: string;
    timestamp: Timestamp | Date;
    status: string;
    message: string;
}

const Alerts: FC = () => {
    const [alerts, setAlerts] = useState<AlertNotification[]>([]);
    const [loading, setLoading] = useState<boolean>(false);
    const [activeTab, setActiveTab] = useState('unread');
    // Track shown notifications to prevent duplicates
    const shownNotificationsRef = useRef<Set<string>>(new Set());
    // Last check timestamp to only show new notifications
    const lastCheckTimestampRef = useRef<Date>(new Date());

    useEffect(() => {
        console.log('Setting up notification listener');
        setLoading(true);

        // Set up realtime listener for notifications
        const notificationsRef = collection(db, "notificari");
        const q = query(
            notificationsRef,
            orderBy("timestamp", "desc"),
            limit(50) // Limit to most recent 50 notifications
        );

        const unsubscribe = onSnapshot(
            q,
            (snapshot) => {
                // Track if we have new notifications to show
                let hasNewNotifications = false;

                // Build new alerts array
                const newAlerts: AlertNotification[] = [];

                snapshot.forEach((doc) => {
                    const data = doc.data();
                    const notifTimestamp = data.timestamp instanceof Date
                        ? data.timestamp
                        : data.timestamp.toDate();

                    // Format the notification for our state
                    const alertNotif: AlertNotification = {
                        id: doc.id,
                        patientId: data.pacientID || '',
                        patientName: data.patientName || 'Pacient',
                        type: data.tip || 'Informare',
                        parameter: data.parametru || '',
                        value: data.valoare || '',
                        threshold: data.prag || '',
                        timestamp: notifTimestamp,
                        status: data.status || 'Necitit',
                        message: data.mesaj || ''
                    };

                    newAlerts.push(alertNotif);

                    // Check if this is a new notification we haven't shown yet
                    const isNewNotification = (
                        !shownNotificationsRef.current.has(doc.id) &&
                        data.status === 'Necitit' &&
                        notifTimestamp > lastCheckTimestampRef.current
                    );

                    if (isNewNotification) {
                        hasNewNotifications = true;
                        console.log('New notification:', alertNotif);

                        // Show a pop-up notification using the Ant Design notification API
                        notification.open({
                            message: `${data.tip}: ${data.parametru}`,
                            description: `Pacient: ${data.patientName || ''} - ${data.mesaj}`,
                            icon: <BellOutlined style={{ color: data.tip === 'Alarmă' ? '#ff4d4f' : '#faad14' }} />,
                        });

                        // Remember we've shown this notification
                        shownNotificationsRef.current.add(doc.id);
                    }
                });

                // Update state with the new alerts
                setAlerts(newAlerts);
                setLoading(false);

                // If we have new notifications, update the last check timestamp
                if (hasNewNotifications) {
                    lastCheckTimestampRef.current = new Date();
                }
            },
            (error) => {
                console.error("Error listening to notifications:", error);
                message.error("Nu s-au putut încărca notificările în timp real");
                setLoading(false);
            }
        );

        // Clean up listener on unmount
        return () => {
            console.log('Cleaning up notification listener');
            unsubscribe();
        };
    }, []);

    const handleMarkAsRead = async (id: string) => {
        try {
            setLoading(true);

            // Update status in Firestore
            await updateDoc(doc(db, "notificari", id), {
                status: 'Citit'
            });

            message.success("Notificare marcată ca citită.");
        } catch (error) {
            console.error("Error marking notification as read:", error);
            message.error("Nu s-a putut marca notificarea ca citită.");
        } finally {
            setLoading(false);
        }
    };

    const handleMarkAllAsRead = async () => {
        try {
            setLoading(true);

            // Get unread notifications
            const unreadAlerts = alerts.filter(alert => alert.status === 'Necitit');

            // Update each unread notification
            for (const alert of unreadAlerts) {
                await updateDoc(doc(db, "notificari", alert.id), {
                    status: 'Citit'
                });
            }

            message.success("Toate notificările au fost marcate ca citite.");
        } catch (error) {
            console.error("Error marking all notifications as read:", error);
            message.error("Nu s-au putut marca toate notificările ca citite.");
        } finally {
            setLoading(false);
        }
    };

    // Add function to trigger heart rate monitoring check
    const triggerHeartRateMonitoring = async () => {
        try {
            setLoading(true);
            const response = await axios.get('http://localhost:3001/api/monitor-heart-rates');
            message.success('Verificare parametri vitali inițiată cu succes');

            // Update the last check timestamp to now, to only show notifications created after this check
            lastCheckTimestampRef.current = new Date();
        } catch (error) {
            console.error('Error triggering heart rate monitoring:', error);
            message.error('Nu s-a putut iniția verificarea parametrilor vitali');
        } finally {
            setLoading(false);
        }
    };

    const filteredAlerts = activeTab === 'unread'
        ? alerts.filter(alert => alert.status === 'Necitit')
        : activeTab === 'read'
            ? alerts.filter(alert => alert.status === 'Citit')
            : alerts;

    const columns = [
        {
            title: 'Status',
            dataIndex: 'status',
            key: 'status',
            width: 80,
            render: (status: string) => {
                return status === 'Necitit'
                    ? <Badge status="processing" text="Necitit" />
                    : <Badge status="default" text="Citit" />;
            }
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
                let color = 'green';
                if (type === 'Alarmă') color = 'red';
                if (type === 'Avertizare') color = 'orange';
                if (type === 'Informare') color = 'blue';

                return <Tag color={color}>{type}</Tag>;
            }
        },
        {
            title: 'Parametru',
            dataIndex: 'parameter',
            key: 'parameter',
            width: 150
        },
        {
            title: 'Valoare',
            dataIndex: 'value',
            key: 'value',
            width: 120
        },
        {
            title: 'Prag',
            dataIndex: 'threshold',
            key: 'threshold',
            width: 120
        },
        {
            title: 'Mesaj',
            dataIndex: 'message',
            key: 'message',
            width: 300
        },
        {
            title: 'Data și ora',
            dataIndex: 'timestamp',
            key: 'timestamp',
            width: 150,
            render: (timestamp: Timestamp | Date) => {
                const date = timestamp instanceof Date
                    ? timestamp
                    : timestamp?.toDate();
                return date ? date.toLocaleString('ro-RO') : '';
            }
        },
        {
            title: 'Acțiuni',
            key: 'actions',
            width: 100,
            render: (_: unknown, record: AlertNotification) => (
                <Space size="middle">
                    {record.status === 'Necitit' && (
                        <Button
                            type="text"
                            icon={<CheckOutlined />}
                            onClick={() => handleMarkAsRead(record.id)}
                            title="Marchează ca citit"
                        />
                    )}
                </Space>
            )
        }
    ];

    return (
        <div className={styles.container}>
            <Card className={styles.card}>
                <div className={styles.header}>
                    <Title level={3}>
                        <BellOutlined /> Notificări și Alerte
                    </Title>
                    <Space>
                        <Button
                            type="primary"
                            onClick={triggerHeartRateMonitoring}
                            icon={<SyncOutlined />}
                        >
                            Verifică parametri vitali
                        </Button>
                        {filteredAlerts.some(a => a.status === 'Necitit') && (
                            <Button
                                type="primary"
                                onClick={handleMarkAllAsRead}
                                icon={<CheckOutlined />}
                            >
                                Marchează toate ca citite
                            </Button>
                        )}
                    </Space>
                </div>

                <Tabs
                    activeKey={activeTab}
                    onChange={setActiveTab}
                    className={styles.tabs}
                >
                    <TabPane
                        tab={
                            <span>
                                Necitite
                                <Badge
                                    count={alerts.filter(a => a.status === 'Necitit').length}
                                    style={{ marginLeft: 8 }}
                                />
                            </span>
                        }
                        key="unread"
                    />
                    <TabPane tab="Citite" key="read" />
                    <TabPane tab="Toate" key="all" />
                </Tabs>

                <Table
                    dataSource={filteredAlerts}
                    columns={columns}
                    rowKey="id"
                    pagination={{ pageSize: 10 }}
                    className={styles.table}
                    loading={loading}
                />
            </Card>
        </div>
    );
};

export default Alerts; 