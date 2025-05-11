import { FC, useState } from 'react';
import { Card, Table, Button, Modal, Form, Input, Space, Tabs, Divider, Typography, Row, Col } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, UserOutlined, MailOutlined, PhoneOutlined, HomeOutlined } from '@ant-design/icons';
import styles from './PatientManagement.module.scss';

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
            render: (_: any, record: any) => (
                <Space size="middle">
                    <Button
                        type="primary"
                        icon={<EditOutlined />}
                        onClick={() => handleEdit(record)}
                    />
                    <Button
                        icon={<DeleteOutlined />}
                        danger
                        onClick={() => handleDelete(record.id)}
                    />
                    <Button
                        type="link"
                        onClick={() => handleView(record)}
                    >
                        Vizualizare
                    </Button>
                </Space>
            ),
        },
    ];

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

    const handleView = (patient: any) => {
        setViewingPatient(patient);
        setIsViewModalVisible(true);
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
            // Actualizare pacient existent
            setPatients(patients.map(p => p.id === editingPatient.id ? newPatient : p));
        } else {
            // Adăugare pacient nou
            setPatients([...patients, newPatient]);
        }

        setIsModalVisible(false);
        form.resetFields();
    };

    return (
        <div className={styles.container}>
            <Card
                title="Management Pacienți"
                extra={
                    <Button
                        type="primary"
                        icon={<PlusOutlined />}
                        onClick={handleAddPatient}
                    >
                        Adaugă Pacient
                    </Button>
                }
            >
                <Table
                    dataSource={patients}
                    columns={columns}
                    rowKey="id"
                    pagination={{ pageSize: 10 }}
                />
            </Card>

            {/* Modal pentru adăugare/editare pacient */}
            <Modal
                title={editingPatient ? "Editare Pacient" : "Adăugare Pacient Nou"}
                visible={isModalVisible}
                onCancel={() => setIsModalVisible(false)}
                footer={null}
                width={800}
            >
                <Form
                    form={form}
                    layout="vertical"
                    onFinish={handleFormSubmit}
                    initialValues={{
                        minHeartRate: 60,
                        maxHeartRate: 100,
                        minBloodPressureSystolic: 110,
                        maxBloodPressureSystolic: 140,
                        minBloodPressureDiastolic: 70,
                        maxBloodPressureDiastolic: 90,
                        minOxygenSaturation: 95
                    }}
                >
                    <Tabs defaultActiveKey="demographic">
                        <TabPane tab="Date Demografice" key="demographic">
                            <Row gutter={16}>
                                <Col span={12}>
                                    <Form.Item
                                        name="lastName"
                                        label="Nume"
                                        rules={[{ required: true, message: 'Introduceți numele' }]}
                                    >
                                        <Input prefix={<UserOutlined />} placeholder="Nume" />
                                    </Form.Item>
                                </Col>
                                <Col span={12}>
                                    <Form.Item
                                        name="firstName"
                                        label="Prenume"
                                        rules={[{ required: true, message: 'Introduceți prenumele' }]}
                                    >
                                        <Input prefix={<UserOutlined />} placeholder="Prenume" />
                                    </Form.Item>
                                </Col>
                            </Row>

                            <Row gutter={16}>
                                <Col span={8}>
                                    <Form.Item
                                        name="age"
                                        label="Vârstă"
                                        rules={[{ required: true, message: 'Introduceți vârsta' }]}
                                    >
                                        <Input type="number" placeholder="Vârstă" />
                                    </Form.Item>
                                </Col>
                                <Col span={16}>
                                    <Form.Item
                                        name="cnp"
                                        label="CNP"
                                        rules={[
                                            { required: true, message: 'Introduceți CNP-ul' },
                                            { len: 13, message: 'CNP-ul trebuie să aibă 13 cifre' }
                                        ]}
                                    >
                                        <Input placeholder="CNP" />
                                    </Form.Item>
                                </Col>
                            </Row>

                            <Divider orientation="left">Adresă</Divider>

                            <Row gutter={16}>
                                <Col span={16}>
                                    <Form.Item
                                        name="street"
                                        label="Stradă"
                                        rules={[{ required: true, message: 'Introduceți strada' }]}
                                    >
                                        <Input prefix={<HomeOutlined />} placeholder="Stradă" />
                                    </Form.Item>
                                </Col>
                                <Col span={8}>
                                    <Form.Item
                                        name="number"
                                        label="Număr"
                                        rules={[{ required: true, message: 'Introduceți numărul' }]}
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
                                        label="Cod Poștal"
                                    >
                                        <Input placeholder="Cod Poștal" />
                                    </Form.Item>
                                </Col>
                            </Row>

                            <Row gutter={16}>
                                <Col span={12}>
                                    <Form.Item
                                        name="city"
                                        label="Oraș"
                                        rules={[{ required: true, message: 'Introduceți orașul' }]}
                                    >
                                        <Input placeholder="Oraș" />
                                    </Form.Item>
                                </Col>
                                <Col span={12}>
                                    <Form.Item
                                        name="county"
                                        label="Județ/Sector"
                                        rules={[{ required: true, message: 'Introduceți județul/sectorul' }]}
                                    >
                                        <Input placeholder="Județ/Sector" />
                                    </Form.Item>
                                </Col>
                            </Row>

                            <Divider orientation="left">Informații Contact</Divider>

                            <Row gutter={16}>
                                <Col span={12}>
                                    <Form.Item
                                        name="phone"
                                        label="Telefon"
                                        rules={[{ required: true, message: 'Introduceți numărul de telefon' }]}
                                    >
                                        <Input prefix={<PhoneOutlined />} placeholder="Telefon" />
                                    </Form.Item>
                                </Col>
                                <Col span={12}>
                                    <Form.Item
                                        name="email"
                                        label="Email"
                                        rules={[
                                            { required: true, message: 'Introduceți adresa de email' },
                                            { type: 'email', message: 'Introduceți o adresă de email validă' }
                                        ]}
                                    >
                                        <Input prefix={<MailOutlined />} placeholder="Email" />
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
                                        label="Loc de Muncă"
                                    >
                                        <Input placeholder="Loc de Muncă" />
                                    </Form.Item>
                                </Col>
                            </Row>
                        </TabPane>

                        <TabPane tab="Date Medicale" key="medical">
                            <Form.Item
                                name="medicalHistory"
                                label="Istoric Medical"
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
                                label="Consultații Cardiologice"
                            >
                                <TextArea rows={4} placeholder="Consultații cardiologice" />
                            </Form.Item>
                        </TabPane>

                        <TabPane tab="Valori Normale" key="normalValues">
                            <Divider orientation="left">Ritm Cardiac (BPM)</Divider>
                            <Row gutter={16}>
                                <Col span={12}>
                                    <Form.Item
                                        name="minHeartRate"
                                        label="Minim"
                                        rules={[{ required: true, message: 'Introduceți valoarea minimă' }]}
                                    >
                                        <Input type="number" placeholder="Minim" />
                                    </Form.Item>
                                </Col>
                                <Col span={12}>
                                    <Form.Item
                                        name="maxHeartRate"
                                        label="Maxim"
                                        rules={[{ required: true, message: 'Introduceți valoarea maximă' }]}
                                    >
                                        <Input type="number" placeholder="Maxim" />
                                    </Form.Item>
                                </Col>
                            </Row>

                            <Divider orientation="left">Tensiune Arterială Sistolică (mmHg)</Divider>
                            <Row gutter={16}>
                                <Col span={12}>
                                    <Form.Item
                                        name="minBloodPressureSystolic"
                                        label="Minim"
                                        rules={[{ required: true, message: 'Introduceți valoarea minimă' }]}
                                    >
                                        <Input type="number" placeholder="Minim" />
                                    </Form.Item>
                                </Col>
                                <Col span={12}>
                                    <Form.Item
                                        name="maxBloodPressureSystolic"
                                        label="Maxim"
                                        rules={[{ required: true, message: 'Introduceți valoarea maximă' }]}
                                    >
                                        <Input type="number" placeholder="Maxim" />
                                    </Form.Item>
                                </Col>
                            </Row>

                            <Divider orientation="left">Tensiune Arterială Diastolică (mmHg)</Divider>
                            <Row gutter={16}>
                                <Col span={12}>
                                    <Form.Item
                                        name="minBloodPressureDiastolic"
                                        label="Minim"
                                        rules={[{ required: true, message: 'Introduceți valoarea minimă' }]}
                                    >
                                        <Input type="number" placeholder="Minim" />
                                    </Form.Item>
                                </Col>
                                <Col span={12}>
                                    <Form.Item
                                        name="maxBloodPressureDiastolic"
                                        label="Maxim"
                                        rules={[{ required: true, message: 'Introduceți valoarea maximă' }]}
                                    >
                                        <Input type="number" placeholder="Maxim" />
                                    </Form.Item>
                                </Col>
                            </Row>

                            <Divider orientation="left">Saturație Oxigen (%)</Divider>
                            <Row gutter={16}>
                                <Col span={12}>
                                    <Form.Item
                                        name="minOxygenSaturation"
                                        label="Minim"
                                        rules={[{ required: true, message: 'Introduceți valoarea minimă' }]}
                                    >
                                        <Input type="number" placeholder="Minim" />
                                    </Form.Item>
                                </Col>
                            </Row>
                        </TabPane>
                    </Tabs>

                    <div className={styles.formActions}>
                        <Button type="default" onClick={() => setIsModalVisible(false)}>
                            Anulează
                        </Button>
                        <Button type="primary" htmlType="submit">
                            {editingPatient ? 'Actualizează' : 'Adaugă'} Pacient
                        </Button>
                    </div>
                </Form>
            </Modal>

            {/* Modal pentru vizualizare pacient */}
            <Modal
                title="Detalii Pacient"
                visible={isViewModalVisible}
                onCancel={() => setIsViewModalVisible(false)}
                footer={[
                    <Button key="close" onClick={() => setIsViewModalVisible(false)}>
                        Închide
                    </Button>
                ]}
                width={800}
            >
                {viewingPatient && (
                    <Tabs defaultActiveKey="demographic">
                        <TabPane tab="Date Demografice" key="demographic">
                            <Row gutter={[16, 16]}>
                                <Col span={12}>
                                    <Card title="Informații Personale" className={styles.viewCard}>
                                        <p><strong>Nume:</strong> {viewingPatient.lastName}</p>
                                        <p><strong>Prenume:</strong> {viewingPatient.firstName}</p>
                                        <p><strong>Vârstă:</strong> {viewingPatient.age}</p>
                                        <p><strong>CNP:</strong> {viewingPatient.cnp}</p>
                                        <p><strong>Profesie:</strong> {viewingPatient.profession}</p>
                                        <p><strong>Loc de Muncă:</strong> {viewingPatient.workplace}</p>
                                    </Card>
                                </Col>
                                <Col span={12}>
                                    <Card title="Informații Contact" className={styles.viewCard}>
                                        <p><strong>Telefon:</strong> {viewingPatient.phone}</p>
                                        <p><strong>Email:</strong> {viewingPatient.email}</p>
                                        <Divider />
                                        <p><strong>Adresă:</strong></p>
                                        <p>
                                            {viewingPatient.address.street}, Nr. {viewingPatient.address.number}
                                            {viewingPatient.address.building && `, Bl. ${viewingPatient.address.building}`}
                                            {viewingPatient.address.apartment && `, Ap. ${viewingPatient.address.apartment}`}
                                        </p>
                                        <p>{viewingPatient.address.city}, {viewingPatient.address.county}</p>
                                        <p>Cod Poștal: {viewingPatient.address.postalCode}</p>
                                    </Card>
                                </Col>
                            </Row>
                        </TabPane>
                        <TabPane tab="Date Medicale" key="medical">
                            <Card title="Informații Medicale" className={styles.viewCard}>
                                <div className={styles.medicalSection}>
                                    <Title level={5}>Istoric Medical</Title>
                                    <Text>{viewingPatient.medicalInfo.medicalHistory}</Text>
                                </div>
                                <Divider />
                                <div className={styles.medicalSection}>
                                    <Title level={5}>Alergii</Title>
                                    <Text>{viewingPatient.medicalInfo.allergies}</Text>
                                </div>
                                <Divider />
                                <div className={styles.medicalSection}>
                                    <Title level={5}>Consultații Cardiologice</Title>
                                    <Text>{viewingPatient.medicalInfo.consultations}</Text>
                                </div>
                            </Card>
                        </TabPane>
                        <TabPane tab="Valori Normale" key="normalValues">
                            <Card title="Valori Normale Setate" className={styles.viewCard}>
                                <Row gutter={[16, 16]}>
                                    <Col span={8}>
                                        <Card title="Ritm Cardiac (BPM)">
                                            <p><strong>Minim:</strong> {viewingPatient.normalValues.minHeartRate}</p>
                                            <p><strong>Maxim:</strong> {viewingPatient.normalValues.maxHeartRate}</p>
                                        </Card>
                                    </Col>
                                    <Col span={8}>
                                        <Card title="Tensiune Sistolică (mmHg)">
                                            <p><strong>Minim:</strong> {viewingPatient.normalValues.minBloodPressureSystolic}</p>
                                            <p><strong>Maxim:</strong> {viewingPatient.normalValues.maxBloodPressureSystolic}</p>
                                        </Card>
                                    </Col>
                                    <Col span={8}>
                                        <Card title="Tensiune Diastolică (mmHg)">
                                            <p><strong>Minim:</strong> {viewingPatient.normalValues.minBloodPressureDiastolic}</p>
                                            <p><strong>Maxim:</strong> {viewingPatient.normalValues.maxBloodPressureDiastolic}</p>
                                        </Card>
                                    </Col>
                                </Row>
                                <Row style={{ marginTop: '16px' }}>
                                    <Col span={8}>
                                        <Card title="Saturație Oxigen (%)">
                                            <p><strong>Minim:</strong> {viewingPatient.normalValues.minOxygenSaturation}%</p>
                                        </Card>
                                    </Col>
                                </Row>
                            </Card>
                        </TabPane>
                    </Tabs>
                )}
            </Modal>
        </div>
    );
};

export default PatientManagement; 