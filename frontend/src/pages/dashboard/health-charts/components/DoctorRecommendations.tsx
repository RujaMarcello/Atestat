import { FC, useState, useEffect } from 'react';
import { Card, Button, Table, Form, Input, Select, Modal, Tabs, List, Typography, Tag, message, Row, Col } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import ReactApexChart from 'react-apexcharts';
import styles from './DoctorRecommendations.module.scss';
import { db } from '../../../../firebase';
import { collection, query, where, getDocs, addDoc, deleteDoc, doc, updateDoc } from 'firebase/firestore';
import PatientSelector from './PatientSelector';

const { Option } = Select;
const { TextArea } = Input;
const { TabPane } = Tabs;
const { Title, Text } = Typography;

interface DoctorRecommendationsProps {
    isDoctor: boolean;
}

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

// Traduceri pentru tipurile de recomandări
const recommendationTypeMap: { [key: string]: string } = {
    'exercitii': 'Exerciții',
    'activitate': 'Activitate Fizică',
    'stil-viata': 'Stil de Viață',
    'dieta': 'Dietă',
    'odihna': 'Odihnă'
};

// Funcția inversă pentru a obține cheile pentru tipurile de recomandări
const getRecommendationTypeKey = (displayName: string): string => {
    return Object.entries(recommendationTypeMap).find(([key, value]) => value === displayName)?.[0] || 'exercitii';
};

const DoctorRecommendations: FC<DoctorRecommendationsProps> = ({ isDoctor }) => {
    const [recommendations, setRecommendations] = useState<any[]>([]);
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [form] = Form.useForm();
    const [viewingRecommendation, setViewingRecommendation] = useState<any>(null);
    const [isViewModalVisible, setIsViewModalVisible] = useState(false);
    const [selectedPatient, setSelectedPatient] = useState<any>(null);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (selectedPatient) {
            fetchRecommendations(selectedPatient.id);
        }
    }, [selectedPatient]);

    const fetchRecommendations = async (patientId: string) => {
        try {
            setLoading(true);
            const recommendationsRef = collection(db, 'recomandari');

            // Modificat: Folosim doar where fără orderBy pentru a evita erori
            const q = query(
                recommendationsRef,
                where('pacientID', '==', patientId)
            );

            const querySnapshot = await getDocs(q);

            const recomandariData: any[] = [];

            querySnapshot.docs.forEach(doc => {
                const data = doc.data();

                // Verificăm dacă data.dataCreare există și e validă
                let createdAtDate = '';
                if (data.dataCreare) {
                    try {
                        createdAtDate = new Date(data.dataCreare.toDate()).toISOString().split('T')[0];
                    } catch (e) {
                        console.warn('Format de dată invalid:', e);
                        createdAtDate = '';
                    }
                }

                recomandariData.push({
                    id: doc.id,
                    type: recommendationTypeMap[data.tipRecomandare] || data.tipRecomandare,
                    description: data.descriere || '',
                    status: data.status || 'active',
                    progress: data.progres || 0,
                    createdAt: createdAtDate,
                    medicID: data.medicID || '',
                    pacientID: data.pacientID,
                    rawData: data
                });
            });

            // Sortăm manual, fără a folosi orderBy din Firestore
            recomandariData.sort((a, b) => {
                if (!a.createdAt) return 1;
                if (!b.createdAt) return -1;
                return b.createdAt.localeCompare(a.createdAt);
            });

            setRecommendations(recomandariData);
        } catch (error) {
            console.error('Eroare la preluarea recomandărilor:', error);
            message.error('Nu s-au putut încărca recomandările.');
        } finally {
            setLoading(false);
        }
    };

    const columns = [
        {
            title: 'Tip',
            dataIndex: 'type',
            key: 'type',
            render: (text: string) => <Tag color={getTagColor(text)}>{text}</Tag>,
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

    const getTagColor = (type: string) => {
        switch (type) {
            case 'Exerciții': return 'blue';
            case 'Activitate Fizică': return 'green';
            case 'Stil de Viață': return 'purple';
            case 'Dietă': return 'orange';
            case 'Odihnă': return 'cyan';
            default: return 'default';
        }
    };

    const handlePatientSelect = (patient: any) => {
        if (!patient || !patient.id) {
            console.error('Pacient invalid selectat:', patient);
            message.error('Eroare la selectarea pacientului.');
            return;
        }
        setSelectedPatient(patient);
    };

    const handleAddRecommendation = () => {
        if (!selectedPatient) {
            message.warning('Selectați un pacient înainte de a adăuga o recomandare.');
            return;
        }
        setIsModalVisible(true);
    };

    const handleSubmit = async (values: any) => {
        try {
            setLoading(true);

            if (!selectedPatient || !selectedPatient.id) {
                message.error('Selectați un pacient pentru a adăuga recomandarea.');
                return;
            }

            // Convertim tipul de recomandare la formatul stocat în baza de date
            const recommendationTypeKey = getRecommendationTypeKey(values.type);

            // Creăm documentul pentru adăugare în Firestore
            const recommendationData = {
                tipRecomandare: recommendationTypeKey,
                descriere: values.description,
                status: 'active',
                progres: 0,
                dataCreare: new Date(),
                pacientID: selectedPatient.id,
                medicID: 'current_doctor_id' // Aici ar trebui ID-ul medicului curent
            };

            // Adaugă recomandarea în Firestore
            const docRef = await addDoc(collection(db, 'recomandari'), recommendationData);

            message.success('Recomandare adăugată cu succes!');

            // Actualizăm lista de recomandări
            await fetchRecommendations(selectedPatient.id);

            setIsModalVisible(false);
            form.resetFields();
        } catch (error) {
            console.error('Eroare la adăugarea recomandării:', error);
            message.error('Nu s-a putut adăuga recomandarea.');
        } finally {
            setLoading(false);
        }
    };

    const handleView = (record: any) => {
        setViewingRecommendation(record);
        setIsViewModalVisible(true);
    };

    const handleDelete = async (id: string) => {
        try {
            setLoading(true);

            if (!id) {
                message.error('ID-ul recomandării lipsește.');
                return;
            }

            // Confirmăm ștergerea
            Modal.confirm({
                title: 'Ștergere recomandare',
                content: 'Sigur doriți să ștergeți această recomandare?',
                okText: 'Da',
                okType: 'danger',
                cancelText: 'Nu',
                onOk: async () => {
                    try {
                        // Ștergem recomandarea din Firestore
                        await deleteDoc(doc(db, 'recomandari', id));

                        message.success('Recomandare ștearsă cu succes!');

                        // Actualizăm lista de recomandări
                        if (selectedPatient && selectedPatient.id) {
                            await fetchRecommendations(selectedPatient.id);
                        }
                    } catch (err) {
                        console.error('Eroare la ștergerea recomandării:', err);
                        message.error('Nu s-a putut șterge recomandarea.');
                    } finally {
                        setLoading(false);
                    }
                },
                onCancel: () => {
                    setLoading(false);
                }
            });
        } catch (error) {
            console.error('Eroare la procesarea ștergerii:', error);
            message.error('A apărut o eroare la procesarea cererii.');
            setLoading(false);
        }
    };

    const updateProgress = async (id: string, newProgress: number) => {
        try {
            setLoading(true);

            if (!id) {
                message.error('ID-ul recomandării lipsește.');
                return;
            }

            // Actualizăm progresul în Firestore
            await updateDoc(doc(db, 'recomandari', id), {
                progres: newProgress,
                status: newProgress === 100 ? 'completed' : 'active'
            });

            message.success('Progres actualizat cu succes!');

            // Actualizăm lista de recomandări
            if (selectedPatient && selectedPatient.id) {
                await fetchRecommendations(selectedPatient.id);
            }

            // Dacă recomandarea este cea vizualizată, actualizăm și obiectul de vizualizare
            if (viewingRecommendation && viewingRecommendation.id === id) {
                setViewingRecommendation({
                    ...viewingRecommendation,
                    progress: newProgress,
                    status: newProgress === 100 ? 'completed' : 'active'
                });
            }
        } catch (error) {
            console.error('Eroare la actualizarea progresului:', error);
            message.error('Nu s-a putut actualiza progresul.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className={styles.container}>
            <Row gutter={[16, 16]}>
                <Col span={24}>
                    <PatientSelector onPatientSelect={handlePatientSelect} />
                </Col>

                <Col span={24}>
                    <Card className={styles.recommendationsCard}>
                        <div className={styles.header}>
                            <Title level={4}>Recomandările Medicului</Title>
                            {isDoctor && (
                                <Button
                                    type="primary"
                                    icon={<PlusOutlined />}
                                    onClick={handleAddRecommendation}
                                    disabled={!selectedPatient}
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
                            loading={loading}
                            locale={{
                                emptyText: selectedPatient
                                    ? 'Nu există recomandări pentru acest pacient.'
                                    : 'Selectați un pacient pentru a vedea recomandările.'
                            }}
                        />
                    </Card>
                </Col>
            </Row>

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
                            <Option value="Odihnă">Odihnă</Option>
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
                        <Button type="primary" htmlType="submit" block loading={loading}>
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
                                            <Text type="secondary">Data adăugării:</Text>
                                            <Text style={{ marginLeft: 8 }}>{viewingRecommendation.createdAt}</Text>
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
                        {isDoctor && (
                            <TabPane tab="Actualizare Progres" key="progress">
                                <div className={styles.progressContainer}>
                                    <Title level={5}>Actualizează Progresul</Title>
                                    <div className={styles.progressButtons}>
                                        {[0, 25, 50, 75, 100].map(progress => (
                                            <Button
                                                key={progress}
                                                type={viewingRecommendation.progress === progress ? 'primary' : 'default'}
                                                onClick={() => updateProgress(viewingRecommendation.id, progress)}
                                            >
                                                {progress}%
                                            </Button>
                                        ))}
                                    </div>
                                </div>
                            </TabPane>
                        )}
                    </Tabs>
                )}
            </Modal>
        </div>
    );
};

export default DoctorRecommendations; 