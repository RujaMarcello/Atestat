import { FC, useState } from 'react';
import { Card, Table, Button, Modal, Form, Input, Space, Tabs, Divider, Typography, Row, Col } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, UserOutlined, MailOutlined, PhoneOutlined, HomeOutlined, DashboardOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import styles from './index.module.scss';

const { TabPane } = Tabs;
const { TextArea } = Input;
const { Title, Text } = Typography;

// Date mock pentru pacienți
const mockPatients = [
    {
        id: 1,
        firstName: 'Ion',
        lastName: 'Popescu',
        age: 45,
        cnp: '1780101345678',
        address: {
            street: 'Strada Primăverii',
            number: '10',
            building: 'A',
            apartment: '5',
            city: 'București',
            county: 'Sector 2',
            postalCode: '022134'
        },
        phone: '0722123456',
        email: 'ion.popescu@email.com',
        profession: 'Profesor',
        workplace: 'Școala Gimnazială Nr. 5',
        medicalInfo: {
            medicalHistory: 'Hipertensiune arterială (din 2018). Colesterol crescut. Intervenție chirurgicală pentru apendicită (2010).',
            allergies: 'Penicilină, polen',
            consultations: 'Consultație cardiologică (15.01.2023): Ritm sinusal regulat, frecvență 78/min. Tensiune arterială: 145/85 mmHg.'
        },
        normalValues: {
            minHeartRate: 60,
            maxHeartRate: 100,
            minBloodPressureSystolic: 110,
            maxBloodPressureSystolic: 140,
            minBloodPressureDiastolic: 70,
            maxBloodPressureDiastolic: 90,
            minOxygenSaturation: 95
        }
    },
    {
        id: 2,
        firstName: 'Maria',
        lastName: 'Ionescu',
        age: 38,
        cnp: '2850215456789',
        address: {
            street: 'Bulevardul Libertății',
            number: '25',
            building: 'C',
            apartment: '12',
            city: 'București',
            county: 'Sector 5',
            postalCode: '050706'
        },
        phone: '0733234567',
        email: 'maria.ionescu@email.com',
        profession: 'Contabil',
        workplace: 'SC Finance Expert SRL',
        medicalInfo: {
            medicalHistory: 'Astm bronșic ușor (din copilărie). Migrene ocazionale.',
            allergies: 'Praf, acarieni',
            consultations: 'Consultație cardiologică (03.02.2023): Fără modificări patologice. Tensiune arterială: 120/75 mmHg.'
        },
        normalValues: {
            minHeartRate: 55,
            maxHeartRate: 95,
            minBloodPressureSystolic: 100,
            maxBloodPressureSystolic: 130,
            minBloodPressureDiastolic: 65,
            maxBloodPressureDiastolic: 85,
            minOxygenSaturation: 96
        }
    }
];

const PatientManagement: FC = () => {
    const navigate = useNavigate();
    const [patients, setPatients] = useState(mockPatients);
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [isViewModalVisible, setIsViewModalVisible] = useState(false);
    const [editingPatient, setEditingPatient] = useState<any>(null);
    const [viewingPatient, setViewingPatient] = useState<any>(null);
    const [form] = Form.useForm();

    const columns = [
        {
            title: 'Nume',
            dataIndex: 'lastName',
            key: 'lastName',
            sorter: (a: any, b: any) => a.lastName.localeCompare(b.lastName),
        },
        {
            title: 'Prenume',
            dataIndex: 'firstName',
            key: 'firstName',
            sorter: (a: any, b: any) => a.firstName.localeCompare(b.firstName),
        },
        {
            title: 'Vârstă',
            dataIndex: 'age',
            key: 'age',
            sorter: (a: any, b: any) => a.age - b.age,
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
            render: (_: unknown, record: any) => (
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

    const navigateToDashboard = (patient: any) => {
        // Salvăm pacientul selectat în localStorage pentru a-l putea accesa în dashboard
        localStorage.setItem('selectedPatient', JSON.stringify(patient));
        // Navigăm către dashboard
        navigate('/dashboard/health-charts');
    };

    const handleAddPatient = () => {
        setEditingPatient(null);
        form.resetFields();
        setIsModalVisible(true);
    };

    const handleEdit = (patient: any) => {
        setEditingPatient(patient);

        // Formatarea valorilor pentru form
        form.setFieldsValue({
            ...patient,
            street: patient.address.street,
            number: patient.address.number,
            building: patient.address.building,
            apartment: patient.address.apartment,
            city: patient.address.city,
            county: patient.address.county,
            postalCode: patient.address.postalCode,
            medicalHistory: patient.medicalInfo.medicalHistory,
            allergies: patient.medicalInfo.allergies,
            consultations: patient.medicalInfo.consultations,
            ...patient.normalValues
        });

        setIsModalVisible(true);
    };

    const handleDelete = (id: number) => {
        Modal.confirm({
            title: 'Ești sigur că vrei să ștergi acest pacient?',
            content: 'Această acțiune nu poate fi anulată.',
            okText: 'Da',
            okType: 'danger',
            cancelText: 'Nu',
            onOk() {
                setPatients(patients.filter(patient => patient.id !== id));
            }
        });
    };

    const handleFormSubmit = (values: any) => {
        const newPatient = {
            id: editingPatient ? editingPatient.id : patients.length + 1,
            firstName: values.firstName,
            lastName: values.lastName,
            age: values.age,
            cnp: values.cnp,
            address: {
                street: values.street,
                number: values.number,
                building: values.building,
                apartment: values.apartment,
                city: values.city,
                county: values.county,
                postalCode: values.postalCode
            },
            phone: values.phone,
            email: values.email,
            profession: values.profession,
            workplace: values.workplace,
            medicalInfo: {
                medicalHistory: values.medicalHistory,
                allergies: values.allergies,
                consultations: values.consultations
            },
            normalValues: {
                minHeartRate: values.minHeartRate,
                maxHeartRate: values.maxHeartRate,
                minBloodPressureSystolic: values.minBloodPressureSystolic,
                maxBloodPressureSystolic: values.maxBloodPressureSystolic,
                minBloodPressureDiastolic: values.minBloodPressureDiastolic,
                maxBloodPressureDiastolic: values.maxBloodPressureDiastolic,
                minOxygenSaturation: values.minOxygenSaturation
            }
        };

        if (editingPatient) {
            setPatients(patients.map(patient => patient.id === editingPatient.id ? newPatient : patient));
        } else {
            setPatients([...patients, newPatient]);
        }

        setIsModalVisible(false);
        form.resetFields();
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
                />
            </Card>

            {/* Modal pentru adăugare/editare pacient */}
            <Modal
                title={editingPatient ? "Editare pacient" : "Adăugare pacient nou"}
                visible={isModalVisible}
                onCancel={() => setIsModalVisible(false)}
                footer={null}
                width={800}
            >
                <Form
                    form={form}
                    layout="vertical"
                    onFinish={handleFormSubmit}
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
                                <TextArea rows={2} placeholder="Alergii" />
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

                    <div className={styles.formActions}>
                        <Button onClick={() => setIsModalVisible(false)} style={{ marginRight: 8 }}>
                            Anulează
                        </Button>
                        <Button type="primary" htmlType="submit">
                            {editingPatient ? "Salvează modificările" : "Adaugă pacient"}
                        </Button>
                    </div>
                </Form>
            </Modal>
        </div>
    );
};

export default PatientManagement; 