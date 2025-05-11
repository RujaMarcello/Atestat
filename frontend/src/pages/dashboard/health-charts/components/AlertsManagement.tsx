import { FC, useState } from 'react';
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
    Popconfirm
} from 'antd';
import { DeleteOutlined, EditOutlined, ExclamationCircleOutlined, BellOutlined, UserOutlined } from '@ant-design/icons';
import styles from './AlertsManagement.module.scss';
import dayjs from 'dayjs';

const { Option } = Select;
const { TextArea } = Input;
const { Title, Text } = Typography;

// Date mock pentru alerte
const initialAlerts = [
    {
        id: 1,
        patientId: 1,
        patientName: 'Popescu Ion',
        type: 'Alarmă',
        parameter: 'Ritm cardiac',
        value: '110 BPM',
        threshold: '100 BPM',
        timestamp: '2023-03-10 23:15',
        status: 'Rezolvat',
        actionTaken: 'Contact telefonic cu pacientul. Pacientul era stresat. Recomandat exerciții de respirație.',
        assignedDoctor: 'Dr. Maria Ionescu'
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
        status: 'Rezolvat',
        actionTaken: 'Verificat aderența la tratament. Pacientul a sărit administrarea dozei de seară.',
        assignedDoctor: 'Dr. Maria Ionescu'
    },
    {
        id: 3,
        patientId: 1,
        patientName: 'Popescu Ion',
        type: 'Avertizare',
        parameter: 'Saturație oxigen',
        value: '94%',
        threshold: '95%',
        timestamp: '2023-03-05 16:30',
        status: 'Rezolvat',
        actionTaken: 'Valoare temporară. Controlul ulterior a arătat valori normale.',
        assignedDoctor: 'Dr. Vasile Popescu'
    },
    {
        id: 4,
        patientId: 2,
        patientName: 'Ionescu Maria',
        type: 'Informare',
        parameter: 'Fără măsurători',
        value: 'N/A',
        threshold: 'N/A',
        timestamp: '2023-03-12 10:00',
        status: 'Activ',
        actionTaken: 'Pacientul nu a efectuat măsurători în ultimele 48 de ore. SMS de reamintire trimis.',
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

// Date mock pentru doctori
const mockDoctors = [
    { id: 1, name: 'Dr. Maria Ionescu' },
    { id: 2, name: 'Dr. Vasile Popescu' },
    { id: 3, name: 'Dr. Andreea Popa' }
];

interface AlertThreshold {
    patientId: number;
    parameter: string;
    minValue: string;
    maxValue: string;
    severity: string;
    enabled: boolean;
}

// Date mock pentru praguri de alerte
const initialThresholds: AlertThreshold[] = [
    {
        patientId: 1,
        parameter: 'Ritm cardiac',
        minValue: '50 BPM',
        maxValue: '100 BPM',
        severity: 'Alarmă',
        enabled: true
    },
    {
        patientId: 1,
        parameter: 'Tensiune arterială sistolică',
        minValue: '90 mmHg',
        maxValue: '140 mmHg',
        severity: 'Avertizare',
        enabled: true
    },
    {
        patientId: 1,
        parameter: 'Tensiune arterială diastolică',
        minValue: '60 mmHg',
        maxValue: '90 mmHg',
        severity: 'Avertizare',
        enabled: true
    },
    {
        patientId: 1,
        parameter: 'Saturație oxigen',
        minValue: '95%',
        maxValue: '100%',
        severity: 'Alarmă',
        enabled: true
    },
    {
        patientId: 2,
        parameter: 'Ritm cardiac',
        minValue: '55 BPM',
        maxValue: '95 BPM',
        severity: 'Alarmă',
        enabled: true
    }
];

const AlertsManagement: FC = () => {
    const [alerts, setAlerts] = useState(initialAlerts);
    const [thresholds, setThresholds] = useState(initialThresholds);
    const [modalVisible, setModalVisible] = useState(false);
    const [thresholdModalVisible, setThresholdModalVisible] = useState(false);
    const [editingAlert, setEditingAlert] = useState<any>(null);
    const [editingThreshold, setEditingThreshold] = useState<any>(null);
    const [form] = Form.useForm();
    const [thresholdForm] = Form.useForm();
    const [activeTab, setActiveTab] = useState('alerts');

    // Gestionare alerte
    const handleViewAlert = (record: any) => {
        setEditingAlert(record);
        form.setFieldsValue({
            patientId: record.patientId,
            type: record.type,
            parameter: record.parameter,
            value: record.value,
            threshold: record.threshold,
            timestamp: dayjs(record.timestamp, 'YYYY-MM-DD HH:mm'),
            status: record.status,
            actionTaken: record.actionTaken,
            assignedDoctor: record.assignedDoctor
        });
        setModalVisible(true);
    };

    const handleSaveAlert = () => {
        form.validateFields().then(values => {
            const timestamp = values.timestamp.format('YYYY-MM-DD HH:mm');
            const updatedValues = { ...values, timestamp };

            if (editingAlert) {
                // Actualizare alertă existentă
                const updatedAlerts = alerts.map(alert =>
                    alert.id === editingAlert.id ? { ...alert, ...updatedValues } : alert
                );
                setAlerts(updatedAlerts);
            } else {
                // Adăugare alertă nouă
                const newAlert = {
                    id: Math.max(...alerts.map(a => a.id)) + 1,
                    patientName: mockPatients.find(p => p.id === values.patientId)?.name || '',
                    ...updatedValues
                };
                setAlerts([...alerts, newAlert]);
            }

            setModalVisible(false);
            form.resetFields();
            setEditingAlert(null);
        });
    };

    const handleDeleteAlert = (id: number) => {
        setAlerts(alerts.filter(alert => alert.id !== id));
    };

    const alertColumns = [
        {
            title: 'ID',
            dataIndex: 'id',
            key: 'id',
            width: 50
        },
        {
            title: 'Pacient',
            dataIndex: 'patientName',
            key: 'patientName',
            width: 120
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
            title: 'Timestamp',
            dataIndex: 'timestamp',
            key: 'timestamp',
            width: 150
        },
        {
            title: 'Status',
            dataIndex: 'status',
            key: 'status',
            width: 100,
            render: (status: string) => {
                const color = status === 'Activ' ? 'volcano' : 'green';
                return <Tag color={color}>{status}</Tag>;
            }
        },
        {
            title: 'Medic asignat',
            dataIndex: 'assignedDoctor',
            key: 'assignedDoctor',
            width: 150
        },
        {
            title: 'Acțiuni',
            key: 'actions',
            width: 100,
            render: (_: any, record: any) => (
                <Space size="small">
                    <Button
                        icon={<EditOutlined />}
                        size="small"
                        onClick={() => handleViewAlert(record)}
                    />
                    <Popconfirm
                        title="Ești sigur că vrei să ștergi această alertă?"
                        onConfirm={() => handleDeleteAlert(record.id)}
                        okText="Da"
                        cancelText="Nu"
                        icon={<ExclamationCircleOutlined style={{ color: 'red' }} />}
                    >
                        <Button icon={<DeleteOutlined />} size="small" danger />
                    </Popconfirm>
                </Space>
            )
        }
    ];

    // Gestionare praguri de alerte
    const handleAddThreshold = () => {
        setEditingThreshold(null);
        thresholdForm.resetFields();
        setThresholdModalVisible(true);
    };

    const handleEditThreshold = (record: AlertThreshold) => {
        setEditingThreshold(record);
        thresholdForm.setFieldsValue(record);
        setThresholdModalVisible(true);
    };

    const handleSaveThreshold = () => {
        thresholdForm.validateFields().then(values => {
            if (editingThreshold) {
                // Actualizare prag existent
                const updatedThresholds = thresholds.map(threshold =>
                    (threshold.patientId === editingThreshold.patientId &&
                        threshold.parameter === editingThreshold.parameter)
                        ? values
                        : threshold
                );
                setThresholds(updatedThresholds);
            } else {
                // Adăugare prag nou
                setThresholds([...thresholds, values]);
            }

            setThresholdModalVisible(false);
            thresholdForm.resetFields();
            setEditingThreshold(null);
        });
    };

    const handleDeleteThreshold = (patientId: number, parameter: string) => {
        setThresholds(thresholds.filter(t =>
            !(t.patientId === patientId && t.parameter === parameter)
        ));
    };

    const handleToggleThreshold = (patientId: number, parameter: string, enabled: boolean) => {
        setThresholds(thresholds.map(t =>
            (t.patientId === patientId && t.parameter === parameter)
                ? { ...t, enabled }
                : t
        ));
    };

    const thresholdColumns = [
        {
            title: 'Pacient',
            dataIndex: 'patientId',
            key: 'patientId',
            render: (patientId: number) =>
                mockPatients.find(p => p.id === patientId)?.name || patientId
        },
        {
            title: 'Parametru',
            dataIndex: 'parameter',
            key: 'parameter'
        },
        {
            title: 'Valoare minimă',
            dataIndex: 'minValue',
            key: 'minValue'
        },
        {
            title: 'Valoare maximă',
            dataIndex: 'maxValue',
            key: 'maxValue'
        },
        {
            title: 'Severitate',
            dataIndex: 'severity',
            key: 'severity',
            render: (severity: string) => {
                let color = 'blue';
                if (severity === 'Alarmă') color = 'red';
                if (severity === 'Avertizare') color = 'orange';

                return <Tag color={color}>{severity}</Tag>;
            }
        },
        {
            title: 'Status',
            dataIndex: 'enabled',
            key: 'enabled',
            render: (enabled: boolean, record: AlertThreshold) => (
                <Switch
                    checked={enabled}
                    onChange={(checked) => handleToggleThreshold(record.patientId, record.parameter, checked)}
                />
            )
        },
        {
            title: 'Acțiuni',
            key: 'actions',
            render: (_: any, record: AlertThreshold) => (
                <Space size="small">
                    <Button
                        icon={<EditOutlined />}
                        size="small"
                        onClick={() => handleEditThreshold(record)}
                    />
                    <Popconfirm
                        title="Ești sigur că vrei să ștergi acest prag?"
                        onConfirm={() => handleDeleteThreshold(record.patientId, record.parameter)}
                        okText="Da"
                        cancelText="Nu"
                        icon={<ExclamationCircleOutlined style={{ color: 'red' }} />}
                    >
                        <Button icon={<DeleteOutlined />} size="small" danger />
                    </Popconfirm>
                </Space>
            )
        }
    ];

    return (
        <div className={styles.container}>
            <Card title="Gestionare Alerte" className={styles.card}>
                <div className={styles.tabButtons}>
                    <Button
                        type={activeTab === 'alerts' ? 'primary' : 'default'}
                        onClick={() => setActiveTab('alerts')}
                        icon={<BellOutlined />}
                    >
                        Alerte
                    </Button>
                    <Button
                        type={activeTab === 'thresholds' ? 'primary' : 'default'}
                        onClick={() => setActiveTab('thresholds')}
                        icon={<ExclamationCircleOutlined />}
                    >
                        Praguri de alertă
                    </Button>
                </div>

                {activeTab === 'alerts' && (
                    <>
                        <div className={styles.tableActions}>
                            <Button
                                type="primary"
                                onClick={() => {
                                    setEditingAlert(null);
                                    form.resetFields();
                                    setModalVisible(true);
                                }}
                            >
                                Adaugă alertă manuală
                            </Button>
                        </div>
                        <Table
                            dataSource={alerts}
                            columns={alertColumns}
                            rowKey="id"
                            scroll={{ x: 1300 }}
                            pagination={{ pageSize: 7 }}
                        />
                    </>
                )}

                {activeTab === 'thresholds' && (
                    <>
                        <div className={styles.tableActions}>
                            <Button
                                type="primary"
                                onClick={handleAddThreshold}
                            >
                                Adaugă prag de alertă
                            </Button>
                        </div>
                        <Table
                            dataSource={thresholds}
                            columns={thresholdColumns}
                            rowKey={(record) => `${record.patientId}-${record.parameter}`}
                            pagination={{ pageSize: 7 }}
                        />
                    </>
                )}
            </Card>

            {/* Modal pentru adăugare/editare alertă */}
            <Modal
                title={editingAlert ? "Editare alertă" : "Adăugare alertă manuală"}
                visible={modalVisible}
                onOk={handleSaveAlert}
                onCancel={() => {
                    setModalVisible(false);
                    form.resetFields();
                    setEditingAlert(null);
                }}
                width={700}
                okText="Salvează"
                cancelText="Anulează"
            >
                <Form
                    form={form}
                    layout="vertical"
                >
                    <Form.Item
                        name="patientId"
                        label="Pacient"
                        rules={[{ required: true, message: 'Selectați pacientul!' }]}
                    >
                        <Select placeholder="Selectați pacientul">
                            {mockPatients.map(patient => (
                                <Option key={patient.id} value={patient.id}>{patient.name}</Option>
                            ))}
                        </Select>
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
                        rules={[{ required: true, message: 'Introduceți parametrul!' }]}
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
                            <Option value="Activ">Activ</Option>
                            <Option value="Rezolvat">Rezolvat</Option>
                        </Select>
                    </Form.Item>

                    <Form.Item
                        name="assignedDoctor"
                        label="Medic asignat"
                        rules={[{ required: true, message: 'Selectați medicul!' }]}
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

            {/* Modal pentru adăugare/editare prag de alertă */}
            <Modal
                title={editingThreshold ? "Editare prag de alertă" : "Adăugare prag de alertă"}
                visible={thresholdModalVisible}
                onOk={handleSaveThreshold}
                onCancel={() => {
                    setThresholdModalVisible(false);
                    thresholdForm.resetFields();
                    setEditingThreshold(null);
                }}
                width={600}
                okText="Salvează"
                cancelText="Anulează"
            >
                <Form
                    form={thresholdForm}
                    layout="vertical"
                >
                    <Form.Item
                        name="patientId"
                        label="Pacient"
                        rules={[{ required: true, message: 'Selectați pacientul!' }]}
                    >
                        <Select placeholder="Selectați pacientul">
                            {mockPatients.map(patient => (
                                <Option key={patient.id} value={patient.id}>{patient.name}</Option>
                            ))}
                        </Select>
                    </Form.Item>

                    <Form.Item
                        name="parameter"
                        label="Parametru"
                        rules={[{ required: true, message: 'Selectați parametrul!' }]}
                    >
                        <Select placeholder="Selectați parametrul">
                            <Option value="Ritm cardiac">Ritm cardiac</Option>
                            <Option value="Tensiune arterială sistolică">Tensiune arterială sistolică</Option>
                            <Option value="Tensiune arterială diastolică">Tensiune arterială diastolică</Option>
                            <Option value="Saturație oxigen">Saturație oxigen</Option>
                        </Select>
                    </Form.Item>

                    <Form.Item
                        name="minValue"
                        label="Valoare minimă"
                        rules={[{ required: true, message: 'Introduceți valoarea minimă!' }]}
                    >
                        <Input placeholder="ex: 50 BPM, 90 mmHg, 95%" />
                    </Form.Item>

                    <Form.Item
                        name="maxValue"
                        label="Valoare maximă"
                        rules={[{ required: true, message: 'Introduceți valoarea maximă!' }]}
                    >
                        <Input placeholder="ex: 100 BPM, 140 mmHg, 100%" />
                    </Form.Item>

                    <Form.Item
                        name="severity"
                        label="Severitate"
                        rules={[{ required: true, message: 'Selectați severitatea!' }]}
                    >
                        <Select placeholder="Selectați severitatea">
                            <Option value="Alarmă">Alarmă</Option>
                            <Option value="Avertizare">Avertizare</Option>
                            <Option value="Informare">Informare</Option>
                        </Select>
                    </Form.Item>

                    <Form.Item
                        name="enabled"
                        label="Activat"
                        valuePropName="checked"
                        initialValue={true}
                    >
                        <Switch />
                    </Form.Item>
                </Form>
            </Modal>
        </div>
    );
};

export default AlertsManagement; 