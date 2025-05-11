import { FC, useState } from 'react';
import { Card, Button, Table, Form, Input, Select, Modal, Tabs, List, Typography, Tag } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import ReactApexChart from 'react-apexcharts';
import styles from './DoctorRecommendations.module.scss';

const { Option } = Select;
const { TextArea } = Input;
const { TabPane } = Tabs;
const { Title, Text } = Typography;

interface DoctorRecommendationsProps {
    isDoctor: boolean;
}

// Date recomandări în format mock
const mockRecommendations = [
    {
        id: 1,
        type: 'Exerciții',
        description: 'Plimbări cu bicicleta timp de 30 de minute, de 3 ori pe săptămână',
        status: 'active',
        progress: 60,
        createdAt: '2023-03-10',
    },
    {
        id: 2,
        type: 'Activitate Fizică',
        description: 'Mers pe jos 10.000 de pași zilnic',
        status: 'active',
        progress: 75,
        createdAt: '2023-03-08',
    },
    {
        id: 3,
        type: 'Exerciții',
        description: 'Înot timp de 45 de minute, de două ori pe săptămână',
        status: 'completed',
        progress: 100,
        createdAt: '2023-02-20',
    },
];

const progressOptions = {
    chart: {
        height: 280,
        type: 'radialBar' as const,
    },
    plotOptions: {
        radialBar: {
            hollow: {
                size: '70%',
            },
            dataLabels: {
                name: {
                    show: false,
                },
                value: {
                    fontSize: '30px',
                    show: true,
                }
            }
        }
    },
    colors: ['#1890ff'],
    labels: ['Progres'],
};

const DoctorRecommendations: FC<DoctorRecommendationsProps> = ({ isDoctor }) => {
    const [recommendations, setRecommendations] = useState(mockRecommendations);
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [form] = Form.useForm();
    const [viewingRecommendation, setViewingRecommendation] = useState<any>(null);
    const [isViewModalVisible, setIsViewModalVisible] = useState(false);

    const columns = [
        {
            title: 'Tip',
            dataIndex: 'type',
            key: 'type',
            render: (text: string) => <Tag color={text === 'Exerciții' ? 'blue' : 'green'}>{text}</Tag>,
        },
        {
            title: 'Descriere',
            dataIndex: 'description',
            key: 'description',
            ellipsis: true,
        },
        {
            title: 'Status',
            dataIndex: 'status',
            key: 'status',
            render: (text: string) => (
                <Tag color={text === 'active' ? 'processing' : 'success'}>
                    {text === 'active' ? 'Activ' : 'Finalizat'}
                </Tag>
            ),
        },
        {
            title: 'Progres',
            dataIndex: 'progress',
            key: 'progress',
            render: (progress: number) => `${progress}%`,
        },
        {
            title: 'Data Adăugării',
            dataIndex: 'createdAt',
            key: 'createdAt',
        },
        {
            title: 'Acțiuni',
            key: 'actions',
            render: (_: any, record: any) => (
                <div className={styles.actionButtons}>
                    <Button
                        type="text"
                        icon={<EditOutlined />}
                        onClick={() => handleView(record)}
                    />
                    {isDoctor && (
                        <Button
                            type="text"
                            danger
                            icon={<DeleteOutlined />}
                            onClick={() => handleDelete(record.id)}
                        />
                    )}
                </div>
            ),
        },
    ];

    const handleAddRecommendation = () => {
        setIsModalVisible(true);
    };

    const handleSubmit = (values: any) => {
        const newRecommendation = {
            id: recommendations.length + 1,
            ...values,
            status: 'active',
            progress: 0,
            createdAt: new Date().toISOString().split('T')[0],
        };

        setRecommendations([...recommendations, newRecommendation]);
        setIsModalVisible(false);
        form.resetFields();
    };

    const handleView = (record: any) => {
        setViewingRecommendation(record);
        setIsViewModalVisible(true);
    };

    const handleDelete = (id: number) => {
        setRecommendations(recommendations.filter(rec => rec.id !== id));
    };

    return (
        <div className={styles.container}>
            <Card className={styles.recommendationsCard}>
                <div className={styles.header}>
                    <Title level={4}>Recomandările Medicului</Title>
                    {isDoctor && (
                        <Button
                            type="primary"
                            icon={<PlusOutlined />}
                            onClick={handleAddRecommendation}
                        >
                            Adaugă Recomandare
                        </Button>
                    )}
                </div>

                <Table
                    dataSource={recommendations}
                    columns={columns}
                    rowKey="id"
                    pagination={{ pageSize: 5 }}
                />
            </Card>

            {/* Modal pentru adăugare recomandare - doar pentru medici */}
            <Modal
                title="Adaugă Recomandare Nouă"
                visible={isModalVisible}
                onCancel={() => setIsModalVisible(false)}
                footer={null}
            >
                <Form form={form} layout="vertical" onFinish={handleSubmit}>
                    <Form.Item
                        name="type"
                        label="Tip Recomandare"
                        rules={[{ required: true, message: 'Te rugăm selectează un tip' }]}
                    >
                        <Select placeholder="Selectează tipul">
                            <Option value="Exerciții">Exerciții</Option>
                            <Option value="Activitate Fizică">Activitate Fizică</Option>
                            <Option value="Stil de Viață">Stil de Viață</Option>
                            <Option value="Dietă">Dietă</Option>
                        </Select>
                    </Form.Item>

                    <Form.Item
                        name="description"
                        label="Descriere"
                        rules={[{ required: true, message: 'Te rugăm adaugă o descriere' }]}
                    >
                        <TextArea rows={4} placeholder="Oferă instrucțiuni detaliate pentru pacient..." />
                    </Form.Item>

                    <Form.Item>
                        <Button type="primary" htmlType="submit" block>
                            Adaugă Recomandare
                        </Button>
                    </Form.Item>
                </Form>
            </Modal>

            {/* Modal pentru vizualizare recomandare */}
            <Modal
                title="Detalii Recomandare"
                visible={isViewModalVisible}
                onCancel={() => setIsViewModalVisible(false)}
                footer={[
                    <Button key="close" onClick={() => setIsViewModalVisible(false)}>
                        Închide
                    </Button>
                ]}
                width={700}
            >
                {viewingRecommendation && (
                    <Tabs defaultActiveKey="details">
                        <TabPane tab="Detalii" key="details">
                            <div className={styles.detailsContainer}>
                                <div className={styles.textDetails}>
                                    <Title level={4}>{viewingRecommendation.type}</Title>
                                    <Text>{viewingRecommendation.description}</Text>

                                    <div className={styles.metaDetails}>
                                        <div>
                                            <Text type="secondary">Status:</Text>
                                            <Tag
                                                color={viewingRecommendation.status === 'active' ? 'processing' : 'success'}
                                                style={{ marginLeft: 8 }}
                                            >
                                                {viewingRecommendation.status === 'active' ? 'Activ' : 'Finalizat'}
                                            </Tag>
                                        </div>

                                        <div>
                                            <Text type="secondary">Data Adăugării: </Text>
                                            <Text>{viewingRecommendation.createdAt}</Text>
                                        </div>
                                    </div>
                                </div>

                                <div className={styles.progressChart}>
                                    <ReactApexChart
                                        options={progressOptions}
                                        series={[viewingRecommendation.progress]}
                                        type="radialBar"
                                        height={280}
                                    />
                                </div>
                            </div>
                        </TabPane>
                        <TabPane tab="Activitate" key="tracking">
                            <List
                                header={<div>Urmărire Activitate</div>}
                                bordered
                                dataSource={[
                                    { date: '2023-03-15', note: 'Am finalizat 30 de minute de ciclism' },
                                    { date: '2023-03-13', note: 'Am finalizat 20 de minute de ciclism' },
                                    { date: '2023-03-10', note: 'Am început recomandarea' },
                                ]}
                                renderItem={(item) => (
                                    <List.Item>
                                        <List.Item.Meta
                                            title={item.date}
                                            description={item.note}
                                        />
                                    </List.Item>
                                )}
                            />
                        </TabPane>
                    </Tabs>
                )}
            </Modal>
        </div>
    );
};

export default DoctorRecommendations; 