import { FC, useState, useEffect } from 'react';
import { Card, Select, Tabs, Typography, Row, Col, Timeline, Divider, Empty } from 'antd';
import ReactApexChart from 'react-apexcharts';
import { HeartOutlined, ArrowUpOutlined, ArrowDownOutlined, FieldTimeOutlined } from '@ant-design/icons';
import styles from './MedicalRecords.module.scss';

const { Option } = Select;
const { TabPane } = Tabs;
const { Title, Text } = Typography;

// Date mock pentru pacienți
const mockPatients = [
    {
        id: 1,
        name: 'Popescu Ion',
        heartRateData: {
            dates: ['2023-03-01', '2023-03-02', '2023-03-03', '2023-03-04', '2023-03-05', '2023-03-06', '2023-03-07'],
            values: [72, 75, 78, 71, 80, 76, 74]
        },
        bloodPressureData: {
            dates: ['2023-03-01', '2023-03-02', '2023-03-03', '2023-03-04', '2023-03-05', '2023-03-06', '2023-03-07'],
            systolic: [125, 130, 128, 135, 132, 125, 127],
            diastolic: [85, 82, 84, 88, 85, 80, 82]
        },
        oxygenData: {
            dates: ['2023-03-01', '2023-03-02', '2023-03-03', '2023-03-04', '2023-03-05', '2023-03-06', '2023-03-07'],
            values: [97, 98, 97, 96, 98, 97, 98]
        },
        ecgData: [
            {
                date: '2023-03-07',
                description: 'ECG de control - Ritm sinusal, frecvență 76/min',
                note: 'Fără modificări patologice'
            },
            {
                date: '2023-02-15',
                description: 'ECG de control - Ritm sinusal, frecvență 78/min',
                note: 'Fără modificări patologice'
            }
        ],
        consultations: [
            {
                date: '2023-03-15',
                doctor: 'Dr. Maria Ionescu',
                diagnosis: 'Hipertensiune arterială controlată medicamentos',
                prescription: 'Continuarea tratamentului actual',
                notes: 'Revenire la control în 3 luni'
            },
            {
                date: '2023-02-01',
                doctor: 'Dr. Maria Ionescu',
                diagnosis: 'Hipertensiune arterială',
                prescription: 'Concor 2.5mg - 1cp/zi, Prestarium 5mg - 1cp/zi',
                notes: 'Revenire la control în 6 săptămâni'
            }
        ],
        alerts: [
            {
                date: '2023-03-14 08:45',
                type: 'Avertizare',
                message: 'Tensiune arterială ridicată (145/95 mmHg)',
                status: 'Rezolvat'
            },
            {
                date: '2023-03-10 23:15',
                type: 'Alarmă',
                message: 'Ritm cardiac crescut (110 BPM) în repaus',
                status: 'Rezolvat'
            },
            {
                date: '2023-03-05 16:30',
                type: 'Avertizare',
                message: 'Saturație oxigen scăzută temporar (94%)',
                status: 'Rezolvat'
            }
        ]
    },
    {
        id: 2,
        name: 'Ionescu Maria',
        heartRateData: {
            dates: ['2023-03-01', '2023-03-02', '2023-03-03', '2023-03-04', '2023-03-05', '2023-03-06', '2023-03-07'],
            values: [68, 70, 72, 69, 73, 72, 70]
        },
        bloodPressureData: {
            dates: ['2023-03-01', '2023-03-02', '2023-03-03', '2023-03-04', '2023-03-05', '2023-03-06', '2023-03-07'],
            systolic: [120, 122, 124, 120, 125, 118, 121],
            diastolic: [78, 80, 82, 78, 80, 76, 79]
        },
        oxygenData: {
            dates: ['2023-03-01', '2023-03-02', '2023-03-03', '2023-03-04', '2023-03-05', '2023-03-06', '2023-03-07'],
            values: [98, 99, 98, 98, 99, 98, 98]
        },
        ecgData: [
            {
                date: '2023-03-05',
                description: 'ECG de control - Ritm sinusal, frecvență 70/min',
                note: 'Fără modificări patologice'
            }
        ],
        consultations: [
            {
                date: '2023-03-10',
                doctor: 'Dr. Vasile Popescu',
                diagnosis: 'Examen periodic, stare de sănătate bună',
                prescription: 'Fără medicație',
                notes: 'Revenire la control în 6 luni'
            }
        ],
        alerts: []
    }
];

const MedicalRecords: FC = () => {
    const [selectedPatient, setSelectedPatient] = useState<string | null>(null);
    const [patientData, setPatientData] = useState<any>(null);

    // Încărcarea datelor pacientului selectat
    useEffect(() => {
        if (selectedPatient) {
            const patient = mockPatients.find(p => p.id.toString() === selectedPatient);
            setPatientData(patient);
        } else if (mockPatients.length > 0) {
            setSelectedPatient(mockPatients[0].id.toString());
            setPatientData(mockPatients[0]);
        }
    }, [selectedPatient]);

    // Configurare grafic ritm cardiac
    const heartRateOptions = {
        chart: {
            type: 'line' as const,
            height: 300,
            toolbar: {
                show: true
            }
        },
        stroke: {
            curve: 'smooth' as const,
            width: 3
        },
        xaxis: {
            categories: patientData?.heartRateData.dates || [],
            title: {
                text: 'Data'
            }
        },
        yaxis: {
            title: {
                text: 'BPM'
            }
        },
        colors: ['#FF4560'],
        title: {
            text: 'Evoluție Ritm Cardiac',
            align: 'left' as const
        }
    };

    const heartRateSeries = [
        {
            name: 'Ritm Cardiac',
            data: patientData?.heartRateData.values || []
        }
    ];

    // Configurare grafic tensiune arterială
    const bloodPressureOptions = {
        chart: {
            type: 'line' as const,
            height: 300,
            toolbar: {
                show: true
            }
        },
        stroke: {
            curve: 'smooth' as const,
            width: 3
        },
        xaxis: {
            categories: patientData?.bloodPressureData.dates || [],
            title: {
                text: 'Data'
            }
        },
        yaxis: {
            title: {
                text: 'mmHg'
            }
        },
        colors: ['#008FFB', '#00E396'],
        title: {
            text: 'Evoluție Tensiune Arterială',
            align: 'left' as const
        }
    };

    const bloodPressureSeries = [
        {
            name: 'Sistolică',
            data: patientData?.bloodPressureData.systolic || []
        },
        {
            name: 'Diastolică',
            data: patientData?.bloodPressureData.diastolic || []
        }
    ];

    // Configurare grafic saturație oxigen
    const oxygenOptions = {
        chart: {
            type: 'line' as const,
            height: 300,
            toolbar: {
                show: true
            }
        },
        stroke: {
            curve: 'smooth' as const,
            width: 3
        },
        xaxis: {
            categories: patientData?.oxygenData.dates || [],
            title: {
                text: 'Data'
            }
        },
        yaxis: {
            min: 90,
            max: 100,
            title: {
                text: 'SpO2 (%)'
            }
        },
        colors: ['#775DD0'],
        title: {
            text: 'Evoluție Saturație Oxigen',
            align: 'left' as const
        }
    };

    const oxygenSeries = [
        {
            name: 'Saturație Oxigen',
            data: patientData?.oxygenData.values || []
        }
    ];

    return (
        <div className={styles.container}>
            <Card title="Date Medicale Pacient">
                <div className={styles.patientSelector}>
                    <Text strong>Selectează Pacient:</Text>
                    <Select
                        style={{ width: 300 }}
                        value={selectedPatient}
                        onChange={setSelectedPatient}
                    >
                        {mockPatients.map(patient => (
                            <Option key={patient.id} value={patient.id.toString()}>
                                {patient.name}
                            </Option>
                        ))}
                    </Select>
                </div>

                {patientData && (
                    <Tabs defaultActiveKey="evolution" className={styles.tabs}>
                        <TabPane tab="Evoluție" key="evolution">
                            <Row gutter={[16, 16]}>
                                <Col span={24}>
                                    <ReactApexChart
                                        options={heartRateOptions}
                                        series={heartRateSeries}
                                        type="line"
                                        height={300}
                                    />
                                </Col>
                                <Col span={24}>
                                    <ReactApexChart
                                        options={bloodPressureOptions}
                                        series={bloodPressureSeries}
                                        type="line"
                                        height={300}
                                    />
                                </Col>
                                <Col span={24}>
                                    <ReactApexChart
                                        options={oxygenOptions}
                                        series={oxygenSeries}
                                        type="line"
                                        height={300}
                                    />
                                </Col>
                            </Row>
                        </TabPane>

                        <TabPane tab="ECG" key="ecg">
                            {patientData.ecgData.length > 0 ? (
                                <div className={styles.ecgContainer}>
                                    <Timeline>
                                        {patientData.ecgData.map((ecg: any, index: number) => (
                                            <Timeline.Item
                                                key={index}
                                                color="blue"
                                                dot={<HeartOutlined />}
                                            >
                                                <Card className={styles.ecgCard}>
                                                    <Title level={5}>{ecg.date}</Title>
                                                    <Text strong>{ecg.description}</Text>
                                                    <p>{ecg.note}</p>
                                                    <div className={styles.ecgGraph}>
                                                        {/* Aici ar fi integrat un grafic ECG real */}
                                                        <div className={styles.mockEcg}>
                                                            <p><i>Vizualizare ECG nu este disponibilă în această versiune demo</i></p>
                                                        </div>
                                                    </div>
                                                </Card>
                                            </Timeline.Item>
                                        ))}
                                    </Timeline>
                                </div>
                            ) : (
                                <Empty description="Nu există date ECG înregistrate" />
                            )}
                        </TabPane>

                        <TabPane tab="Consultații" key="consultations">
                            {patientData.consultations.length > 0 ? (
                                <div className={styles.consultationsContainer}>
                                    <Timeline>
                                        {patientData.consultations.map((consultation: any, index: number) => (
                                            <Timeline.Item
                                                key={index}
                                                color="green"
                                                dot={<FieldTimeOutlined />}
                                            >
                                                <Card className={styles.consultationCard}>
                                                    <Title level={5}>{consultation.date}</Title>
                                                    <Text strong>{consultation.doctor}</Text>
                                                    <Divider />
                                                    <p><strong>Diagnostic:</strong> {consultation.diagnosis}</p>
                                                    <p><strong>Prescripție:</strong> {consultation.prescription}</p>
                                                    <p><strong>Observații:</strong> {consultation.notes}</p>
                                                </Card>
                                            </Timeline.Item>
                                        ))}
                                    </Timeline>
                                </div>
                            ) : (
                                <Empty description="Nu există consultații înregistrate" />
                            )}
                        </TabPane>

                        <TabPane tab="Alerte" key="alerts">
                            {patientData.alerts.length > 0 ? (
                                <div className={styles.alertsContainer}>
                                    <Timeline>
                                        {patientData.alerts.map((alert: any, index: number) => (
                                            <Timeline.Item
                                                key={index}
                                                color={alert.type === 'Alarmă' ? 'red' : 'orange'}
                                                dot={alert.type === 'Alarmă' ? <ArrowUpOutlined /> : <ArrowDownOutlined />}
                                            >
                                                <Card
                                                    className={`${styles.alertCard} ${alert.type === 'Alarmă' ? styles.alarmCard : styles.warningCard}`}
                                                >
                                                    <Title level={5}>{alert.date}</Title>
                                                    <Text strong>{alert.type}</Text>
                                                    <p>{alert.message}</p>
                                                    <Text type="secondary">Status: {alert.status}</Text>
                                                </Card>
                                            </Timeline.Item>
                                        ))}
                                    </Timeline>
                                </div>
                            ) : (
                                <Empty description="Nu există alerte înregistrate" />
                            )}
                        </TabPane>
                    </Tabs>
                )}
            </Card>
        </div>
    );
};

export default MedicalRecords; 