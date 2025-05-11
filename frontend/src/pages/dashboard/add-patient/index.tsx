import { FC, useState } from 'react';
import { Form, Input, Button, Card, InputNumber, message, Select, Divider } from 'antd';
import { UserOutlined, IdcardOutlined, PhoneOutlined, MailOutlined, HomeOutlined, BankOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import styles from './index.module.scss';

const { TextArea } = Input;
const { Option } = Select;

const AddPatient: FC = () => {
    const [form] = Form.useForm();
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const onFinish = async (values: any) => {
        setLoading(true);
        try {
            // Obține token-ul din localStorage
            const token = localStorage.getItem('token') || '';

            // Formatează datele pentru a corespunde cu API-ul
            const patientData = {
                nume: values.lastName,
                prenume: values.firstName,
                varsta: values.age,
                cnp: values.cnp,
                oras: values.city,
                strada: values.address,
                telefon: values.phone,
                email: values.email,
                profesie: values.profession,
                istoricMedical: values.medicalHistory,
                alergii: values.allergies ? values.allergies.split(',').map((item: string) => item.trim()) : [],
                minPuls: values.minHeartRate,
                maxPuls: values.maxHeartRate,
                minTemp: values.minTemperature,
                maxTemp: values.maxTemperature,
                minUmid: values.minHumidity,
                maxUmid: values.maxHumidity
            };

            // Adaugă pacientul folosind API-ul
            const response = await axios.post(
                'http://localhost:3001/api/patients',
                patientData,
                {
                    headers: {
                        'Content-Type': 'application/json',
                        'token': token
                    }
                }
            );

            message.success('Pacient adăugat cu succes!');
            navigate('/dashboard/patient-management');
        } catch (error: any) {
            console.error('Eroare la adăugarea pacientului:', error);
            message.error(error.response?.data || 'Eroare la adăugarea pacientului');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className={styles.container}>
            <Card title="Adaugă Pacient Nou" className={styles.card}>
                <Form
                    form={form}
                    layout="vertical"
                    onFinish={onFinish}
                    initialValues={{
                        minHeartRate: 60,
                        maxHeartRate: 100,
                        minTemperature: 36.5,
                        maxTemperature: 37.5,
                        minHumidity: 30,
                        maxHumidity: 60
                    }}
                >
                    <div className={styles.formSection}>
                        <h3>Informații Personale</h3>

                        <Form.Item
                            name="lastName"
                            label="Nume"
                            rules={[{ required: true, message: 'Introduceți numele pacientului' }]}
                        >
                            <Input prefix={<UserOutlined />} placeholder="Numele pacientului" />
                        </Form.Item>

                        <Form.Item
                            name="firstName"
                            label="Prenume"
                            rules={[{ required: true, message: 'Introduceți prenumele pacientului' }]}
                        >
                            <Input prefix={<UserOutlined />} placeholder="Prenumele pacientului" />
                        </Form.Item>

                        <Form.Item
                            name="age"
                            label="Vârstă"
                            rules={[{ required: true, message: 'Introduceți vârsta pacientului' }]}
                        >
                            <InputNumber min={0} max={120} placeholder="Vârsta" style={{ width: '100%' }} />
                        </Form.Item>

                        <Form.Item
                            name="cnp"
                            label="CNP"
                            rules={[
                                { required: true, message: 'Introduceți CNP-ul pacientului' },
                                { len: 13, message: 'CNP-ul trebuie să aibă 13 cifre' },
                                { pattern: /^[0-9]+$/, message: 'CNP-ul trebuie să conțină doar cifre' }
                            ]}
                        >
                            <Input prefix={<IdcardOutlined />} placeholder="CNP" maxLength={13} />
                        </Form.Item>
                    </div>

                    <Divider />

                    <div className={styles.formSection}>
                        <h3>Informații de Contact</h3>

                        <Form.Item
                            name="city"
                            label="Oraș"
                            rules={[{ required: true, message: 'Introduceți orașul' }]}
                        >
                            <Input prefix={<HomeOutlined />} placeholder="Oraș" />
                        </Form.Item>

                        <Form.Item
                            name="address"
                            label="Adresă"
                            rules={[{ required: true, message: 'Introduceți adresa' }]}
                        >
                            <Input prefix={<HomeOutlined />} placeholder="Strada, număr, etc." />
                        </Form.Item>

                        <Form.Item
                            name="phone"
                            label="Telefon"
                            rules={[
                                { required: true, message: 'Introduceți numărul de telefon' },
                                { pattern: /^[0-9]+$/, message: 'Numărul de telefon trebuie să conțină doar cifre' }
                            ]}
                        >
                            <Input prefix={<PhoneOutlined />} placeholder="Număr de telefon" />
                        </Form.Item>

                        <Form.Item
                            name="email"
                            label="Email"
                            rules={[
                                { type: 'email', message: 'Formatul email-ului nu este valid' },
                                { required: true, message: 'Introduceți adresa de email' }
                            ]}
                        >
                            <Input prefix={<MailOutlined />} placeholder="Adresa de email" />
                        </Form.Item>

                        <Form.Item
                            name="profession"
                            label="Profesie"
                        >
                            <Input prefix={<BankOutlined />} placeholder="Profesie" />
                        </Form.Item>
                    </div>

                    <Divider />

                    <div className={styles.formSection}>
                        <h3>Informații Medicale</h3>

                        <Form.Item
                            name="medicalHistory"
                            label="Istoric Medical"
                        >
                            <TextArea rows={4} placeholder="Istoric medical, afecțiuni cronice, intervenții chirurgicale, etc." />
                        </Form.Item>

                        <Form.Item
                            name="allergies"
                            label="Alergii"
                        >
                            <TextArea rows={2} placeholder="Lista de alergii, separate prin virgulă" />
                        </Form.Item>
                    </div>

                    <Divider />

                    <div className={styles.formSection}>
                        <h3>Valori Normale</h3>

                        <div className={styles.twoColumns}>
                            <Form.Item
                                name="minHeartRate"
                                label="Puls Minim (BPM)"
                            >
                                <InputNumber min={40} max={100} style={{ width: '100%' }} />
                            </Form.Item>

                            <Form.Item
                                name="maxHeartRate"
                                label="Puls Maxim (BPM)"
                            >
                                <InputNumber min={60} max={200} style={{ width: '100%' }} />
                            </Form.Item>
                        </div>

                        <div className={styles.twoColumns}>
                            <Form.Item
                                name="minTemperature"
                                label="Temperatură Minimă (°C)"
                            >
                                <InputNumber min={35} max={37} step={0.1} style={{ width: '100%' }} />
                            </Form.Item>

                            <Form.Item
                                name="maxTemperature"
                                label="Temperatură Maximă (°C)"
                            >
                                <InputNumber min={36} max={38} step={0.1} style={{ width: '100%' }} />
                            </Form.Item>
                        </div>

                        <div className={styles.twoColumns}>
                            <Form.Item
                                name="minHumidity"
                                label="Umiditate Minimă (%)"
                            >
                                <InputNumber min={0} max={100} style={{ width: '100%' }} />
                            </Form.Item>

                            <Form.Item
                                name="maxHumidity"
                                label="Umiditate Maximă (%)"
                            >
                                <InputNumber min={0} max={100} style={{ width: '100%' }} />
                            </Form.Item>
                        </div>
                    </div>

                    <Form.Item>
                        <Button type="primary" htmlType="submit" loading={loading} className={styles.submitButton}>
                            Adaugă Pacient
                        </Button>
                    </Form.Item>
                </Form>
            </Card>
        </div>
    );
};

export default AddPatient; 