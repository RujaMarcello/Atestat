import { FC, useState, useEffect } from 'react';
import { Card, Table, Tag, Space, Button, Badge, Typography, Tabs } from 'antd';
import { BellOutlined, CheckOutlined, ExclamationCircleOutlined } from '@ant-design/icons';
import styles from './index.module.scss';

const { Title, Text } = Typography;
const { TabPane } = Tabs;

// Date mock pentru alerte
const mockAlerts = [
    {
        id: 1,
        patientId: 1,
        patientName: 'Popescu Ion',
        type: 'Alarmă',
        parameter: 'Ritm cardiac',
        value: '110 BPM',
        threshold: '100 BPM',
        timestamp: '2023-03-10 23:15',
        status: 'Necitit',
        importance: 'Ridicată',
        message: 'Ritm cardiac ridicat detectat'
    },
    {
        id: 2,
        patientId: 1,
        patientName: 'Popescu Ion',
        type: 'Avertizare',
        parameter: 'Tensiune arterială',
        value: '145/95 mmHg',
        threshold: '140/90 mmHg',
        timestamp: '2023-03-14 08:45',
        status: 'Necitit',
        importance: 'Medie',
        message: 'Tensiune arterială ușor crescută'
    },
    {
        id: 3,
        patientId: 2,
        patientName: 'Ionescu Maria',
        type: 'Avertizare',
        parameter: 'Saturație oxigen',
        value: '94%',
        threshold: '95%',
        timestamp: '2023-03-05 16:30',
        status: 'Citit',
        importance: 'Medie',
        message: 'Saturație de oxigen sub pragul normal'
    },
    {
        id: 4,
        patientId: 3,
        patientName: 'Popa Andrei',
        type: 'Informare',
        parameter: 'Fără măsurători',
        value: 'N/A',
        threshold: 'N/A',
        timestamp: '2023-03-12 10:00',
        status: 'Citit',
        importance: 'Scăzută',
        message: 'Pacientul nu a efectuat măsurători în ultimele 48 de ore'
    }
];

const Alerts: FC = () => {
    const [alerts, setAlerts] = useState(mockAlerts);
    const [activeTab, setActiveTab] = useState('unread');

    const handleMarkAsRead = (id: number) => {
        const updatedAlerts = alerts.map(alert =>
            alert.id === id ? { ...alert, status: 'Citit' } : alert
        );
        setAlerts(updatedAlerts);
    };

    const handleMarkAllAsRead = () => {
        const updatedAlerts = alerts.map(alert => ({ ...alert, status: 'Citit' }));
        setAlerts(updatedAlerts);
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
            width: 150
        },
        {
            title: 'Acțiuni',
            key: 'actions',
            width: 100,
            render: (_: unknown, record: any) => (
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
                    {filteredAlerts.some(a => a.status === 'Necitit') && (
                        <Button
                            type="primary"
                            onClick={handleMarkAllAsRead}
                            icon={<CheckOutlined />}
                        >
                            Marchează toate ca citite
                        </Button>
                    )}
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
                />
            </Card>
        </div>
    );
};

export default Alerts; 