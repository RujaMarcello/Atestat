import React from 'react';
import { Form, Input, Button, Space, Divider, Row, Col, Typography } from 'antd';
import { UserOutlined, HomeOutlined, PhoneOutlined, MailOutlined, MedicineBoxOutlined } from '@ant-design/icons';

const { Title } = Typography;
const { TextArea } = Input;

const PatientForm: React.FC = () => {
    const [form] = Form.useForm();

    const onFinish = (values: any) => {
        console.log('Form values:', values);
        // TODO: Add API call to save patient data
    };

    return (
        <Form
            form={form}
            layout="vertical"
            onFinish={onFinish}
            autoComplete="off"
            scrollToFirstError
        >
            {/* Demographic Data Section */}
            <Divider orientation="left">
                <Title level={4}>Date Demografice</Title>
            </Divider>
            <Row gutter={[16, 0]}>
                <Col xs={24} sm={12}>
                    <Form.Item
                        name="firstName"
                        label="Prenume"
                        rules={[{ required: true, message: 'Introduceți prenumele!' }]}
                    >
                        <Input prefix={<UserOutlined />} placeholder="Prenume" />
                    </Form.Item>
                </Col>
                <Col xs={24} sm={12}>
                    <Form.Item
                        name="lastName"
                        label="Nume"
                        rules={[{ required: true, message: 'Introduceți numele!' }]}
                    >
                        <Input prefix={<UserOutlined />} placeholder="Nume" />
                    </Form.Item>
                </Col>
            </Row>

            <Row gutter={[16, 0]}>
                <Col xs={24} sm={12}>
                    <Form.Item
                        name="age"
                        label="Vârstă"
                        rules={[{ required: true, message: 'Introduceți vârsta!' }]}
                    >
                        <Input type="number" placeholder="Vârstă" />
                    </Form.Item>
                </Col>
                <Col xs={24} sm={12}>
                    <Form.Item
                        name="cnp"
                        label="CNP"
                        rules={[
                            { required: true, message: 'Introduceți CNP-ul!' },
                            { len: 13, message: 'CNP-ul trebuie să conțină 13 cifre!' }
                        ]}
                    >
                        <Input placeholder="CNP" />
                    </Form.Item>
                </Col>
            </Row>

            <Row gutter={[16, 0]}>
                <Col xs={24} sm={12}>
                    <Form.Item
                        name="phone"
                        label="Număr de telefon"
                        rules={[{ required: true, message: 'Introduceți numărul de telefon!' }]}
                    >
                        <Input prefix={<PhoneOutlined />} placeholder="Număr de telefon" />
                    </Form.Item>
                </Col>
                <Col xs={24} sm={12}>
                    <Form.Item
                        name="email"
                        label="Adresă de email"
                        rules={[
                            { type: 'email', message: 'Adresă de email invalidă!' },
                            { required: true, message: 'Introduceți adresa de email!' }
                        ]}
                    >
                        <Input prefix={<MailOutlined />} placeholder="Adresă de email" />
                    </Form.Item>
                </Col>
            </Row>

            <Form.Item label="Adresă" required>
                <Row gutter={[16, 16]}>
                    <Col xs={24} sm={12}>
                        <Form.Item
                            name="street"
                            noStyle
                            rules={[{ required: true, message: 'Introduceți strada!' }]}
                        >
                            <Input prefix={<HomeOutlined />} placeholder="Strada" />
                        </Form.Item>
                    </Col>
                    <Col xs={24} sm={12}>
                        <Form.Item
                            name="number"
                            noStyle
                            rules={[{ required: true, message: 'Introduceți numărul!' }]}
                        >
                            <Input placeholder="Număr" />
                        </Form.Item>
                    </Col>
                </Row>
                <Row gutter={[16, 16]} style={{ marginTop: 16 }}>
                    <Col xs={24} sm={8}>
                        <Form.Item
                            name="city"
                            noStyle
                            rules={[{ required: true, message: 'Introduceți orașul!' }]}
                        >
                            <Input placeholder="Oraș" />
                        </Form.Item>
                    </Col>
                    <Col xs={24} sm={8}>
                        <Form.Item
                            name="county"
                            noStyle
                            rules={[{ required: true, message: 'Introduceți județul!' }]}
                        >
                            <Input placeholder="Județ" />
                        </Form.Item>
                    </Col>
                    <Col xs={24} sm={8}>
                        <Form.Item
                            name="postalCode"
                            noStyle
                            rules={[{ required: true, message: 'Introduceți codul poștal!' }]}
                        >
                            <Input placeholder="Cod poștal" />
                        </Form.Item>
                    </Col>
                </Row>
            </Form.Item>

            <Row gutter={[16, 0]}>
                <Col xs={24} sm={12}>
                    <Form.Item
                        name="profession"
                        label="Profesie"
                    >
                        <Input placeholder="Profesie" />
                    </Form.Item>
                </Col>
                <Col xs={24} sm={12}>
                    <Form.Item
                        name="workplace"
                        label="Loc de muncă"
                    >
                        <Input placeholder="Loc de muncă" />
                    </Form.Item>
                </Col>
            </Row>

            {/* Medical Data Section */}
            <Divider orientation="left">
                <Title level={4}>Date Medicale</Title>
            </Divider>

            <Form.Item
                name="medicalHistory"
                label="Istoric medical"
                rules={[{ required: true, message: 'Introduceți istoricul medical!' }]}
            >
                <TextArea rows={4} placeholder="Istoric medical" />
            </Form.Item>

            <Form.Item
                name="allergies"
                label="Alergii"
            >
                <TextArea rows={3} placeholder="Alergii" />
            </Form.Item>

            <Form.Item
                name="cardiologicalConsultations"
                label="Consultații cardiologice"
                rules={[{ required: true, message: 'Introduceți consultațiile cardiologice!' }]}
            >
                <TextArea rows={4} placeholder="Consultații cardiologice" />
            </Form.Item>

            <Form.Item>
                <Space size="middle">
                    <Button type="primary" htmlType="submit" size="large">
                        Salvează
                    </Button>
                    <Button htmlType="button" size="large" onClick={() => form.resetFields()}>
                        Resetează
                    </Button>
                </Space>
            </Form.Item>
        </Form>
    );
};

export default PatientForm; 