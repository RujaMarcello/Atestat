import { FC, useState, useEffect } from 'react';
import { Card, Tabs, Typography, Row, Col, Timeline, Divider, Empty, message, Spin } from 'antd';
import ReactApexChart from 'react-apexcharts';
import { HeartOutlined, ArrowUpOutlined, ArrowDownOutlined, FieldTimeOutlined } from '@ant-design/icons';
import styles from './MedicalRecords.module.scss';
import PatientSelector from './PatientSelector';
import { db } from '../../../../firebase';
import { doc, getDoc, collection, query, where, getDocs, orderBy, limit } from 'firebase/firestore';

const { TabPane } = Tabs;
const { Title, Text } = Typography;

const MedicalRecords: FC = () => {
    const [selectedPatient, setSelectedPatient] = useState<any>(null);
    const [patientData, setPatientData] = useState<any>(null);
    const [valoriNormale, setValoriNormale] = useState<any>(null);
    const [loading, setLoading] = useState<boolean>(false);
    const [chartLoading, setChartLoading] = useState<boolean>(false);
    const [pulseData, setPulseData] = useState<{ date: string; value: number }[]>([]);

    // Preluăm datele complete ale pacientului din Firebase
    useEffect(() => {
        if (selectedPatient && selectedPatient.id) {
            fetchPatientData(selectedPatient.id);
            fetchPulseData(selectedPatient.id);
        }
    }, [selectedPatient]);

    const fetchPatientData = async (patientId: string) => {
        try {
            setLoading(true);

            // Obținem documentul pacientului
            const pacientDoc = await getDoc(doc(db, "pacienti", patientId));

            if (pacientDoc.exists()) {
                const pacientData = pacientDoc.data();
                setPatientData(pacientData);

                // Obținem valorile normale ale pacientului
                if (pacientData.valoriNormaleID) {
                    const valoriNormaleDoc = await getDoc(doc(db, "valori_normale", pacientData.valoriNormaleID));
                    if (valoriNormaleDoc.exists()) {
                        setValoriNormale(valoriNormaleDoc.data());
                    }
                }
            }
        } catch (error) {
            console.error("Eroare la preluarea datelor pacientului:", error);
            message.error("Nu s-au putut încărca datele pacientului.");
        } finally {
            setLoading(false);
        }
    };

    // Preluăm datele de puls din Firestore
    const fetchPulseData = async (patientId: string) => {
        try {
            setChartLoading(true);

            console.log("Preluăm datele de puls pentru pacientul cu ID:", patientId);

            const pulseRef = collection(db, "puls");
            const q = query(
                pulseRef,
                where("pacientID", "==", patientId)
            );

            const querySnapshot = await getDocs(q);
            console.log(`S-au găsit ${querySnapshot.size} înregistrări de puls.`);

            // Parsăm și organizăm datele
            const pulseDataArray: { date: Date; value: number }[] = [];
            querySnapshot.docs.forEach((doc) => {
                const data = doc.data();
                if (data.dataInregistrarii && data.valoare) {
                    const dateObj = data.dataInregistrarii.toDate();
                    pulseDataArray.push({
                        date: dateObj,
                        value: data.valoare
                    });
                }
            });

            // Sortăm datele cronologic
            pulseDataArray.sort((a, b) => a.date.getTime() - b.date.getTime());

            // Formatăm data pentru afișare
            const formattedData = pulseDataArray.map(item => ({
                date: item.date.toLocaleString('ro-RO', {
                    month: 'short',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                }),
                value: item.value
            }));

            setPulseData(formattedData);
            console.log("Datele de puls au fost încărcate:", formattedData);
        } catch (error) {
            console.error("Eroare la preluarea datelor de puls:", error);
            message.error("Nu s-au putut încărca datele de puls.");
        } finally {
            setChartLoading(false);
        }
    };

    const handlePatientSelect = (patient: any) => {
        setSelectedPatient(patient);
    };

    const renderSimpleChart = () => {
        if (!pulseData || pulseData.length === 0) {
            return <div className={styles.noData}>Nu există date</div>;
        }

        // Eșantionăm datele dacă sunt prea multe pentru o afișare optimă
        let sampleData = [...pulseData];
        let sampleCategories = pulseData.map(item => item.date);

        // Dacă avem mai mult de 500 de puncte, reducem numărul pentru performanță
        if (pulseData.length > 500) {
            const sampleSize = Math.ceil(pulseData.length / 500);
            const sampledPoints: typeof pulseData = [];

            for (let i = 0; i < pulseData.length; i += sampleSize) {
                // Luăm primul punct din fiecare grup pentru a păstra tendința
                sampledPoints.push(pulseData[i]);
            }

            sampleData = sampledPoints;
            sampleCategories = sampledPoints.map(item => item.date);
        }

        const options = {
            chart: {
                type: 'line' as const,
                height: 350,
                width: '100%',
                toolbar: {
                    show: true,
                    tools: {
                        download: true,
                        selection: true,
                        zoom: true,
                        zoomin: true,
                        zoomout: true,
                        pan: true,
                        reset: true
                    }
                },
                animations: {
                    enabled: false
                },
                parentHeightOffset: 0
            },
            series: [{
                name: 'Ritm Cardiac',
                data: sampleData.map(item => item.value)
            }],
            xaxis: {
                categories: sampleCategories,
                labels: {
                    rotate: -45,
                    trim: true,
                    hideOverlappingLabels: true,
                    style: {
                        fontSize: '10px',
                        colors: '#64748B'
                    },
                    formatter: function (value: any) {
                        // Păstrăm doar luna și ziua pentru o afișare mai simplă
                        if (typeof value === 'string') {
                            const parts = value.split(',')[0].split(' ');
                            return parts.length > 1 ? parts[0] + ' ' + parts[1] : value;
                        }
                        return value;
                    },
                    show: true  // Menținem etichetele de pe axa X pentru orientare temporală
                },
                // Reducem numărul de etichete pe axa X pentru un aspect mai curat
                tickAmount: Math.min(8, Math.max(4, Math.floor(sampleCategories.length / 40))),
                axisBorder: {
                    show: true,
                    color: '#E2E8F0'
                },
                axisTicks: {
                    show: false
                }
            },
            yaxis: {
                min: Math.max(20, Math.min(...sampleData.map(item => item.value)) - 10),
                max: Math.max(...sampleData.map(item => item.value)) + 10,
                title: {
                    text: 'BPM',
                    style: {
                        color: '#64748B',
                        fontSize: '12px'
                    }
                },
                forceNiceScale: true,
                labels: {
                    formatter: (val: number) => Math.round(val).toString(),
                    show: false  // Ascundem valorile de pe axa Y
                },
                axisBorder: {
                    show: false
                },
                axisTicks: {
                    show: false
                }
            },
            grid: {
                padding: {
                    left: 10,
                    right: 10
                },
                borderColor: '#F1F5F9',
                strokeDashArray: 4,
                xaxis: {
                    lines: {
                        show: false
                    }
                },
                yaxis: {
                    lines: {
                        show: false  // Eliminăm și liniile de grid pentru un aspect mai curat
                    }
                }
            },
            stroke: {
                curve: 'smooth' as const,
                width: 4,  // Facem linia mai groasă pentru vizibilitate
                colors: ['#1890ff'],
                lineCap: 'round' as const
            },
            markers: {
                size: 0,
                hover: {
                    size: 0
                }
            },
            dataLabels: {
                enabled: false
            },
            colors: ['#1890ff'],
            fill: {
                type: 'gradient',
                gradient: {
                    shadeIntensity: 1,
                    opacityFrom: 0.5,
                    opacityTo: 0.1,
                    stops: [0, 90, 100]
                }
            },
            tooltip: {
                enabled: true,
                shared: false,
                intersect: false,
                followCursor: true,
                x: {
                    show: true,
                    formatter: function (val: any, opts: any) {
                        // Formatăm data complet pentru tooltip
                        const index = opts.dataPointIndex;
                        if (index >= 0 && index < sampleData.length) {
                            return sampleData[index].date;
                        }
                        return val;
                    }
                },
                y: {
                    formatter: function (value: number) {
                        return value + ' BPM';
                    },
                    title: {
                        formatter: () => 'Puls:'
                    }
                },
                style: {
                    fontSize: '12px'
                },
                marker: {
                    show: false
                }
            },
            title: {
                text: '',  // Eliminăm titlul din interiorul graficului pentru un aspect mai curat
                align: 'left' as const,
                style: {
                    fontSize: '16px',
                    fontWeight: 600,
                    color: '#334155'
                }
            },
            subtitle: {
                text: '',  // Eliminăm subtitlul din interiorul graficului
                align: 'left' as const,
                style: {
                    fontSize: '12px',
                    color: '#64748B'
                }
            },
            states: {
                hover: {
                    filter: {
                        type: 'none'
                    }
                }
            }
        };

        // Adăugăm liniile de referință pentru valorile normale de puls dacă sunt disponibile
        if (valoriNormale && valoriNormale.minPuls && valoriNormale.maxPuls) {
            (options as any).annotations = {
                yaxis: [
                    {
                        y: valoriNormale.minPuls,
                        borderColor: '#10B981',
                        strokeDashArray: 5,
                        borderWidth: 2,
                        opacity: 0.7,
                        label: {
                            text: 'Min Normal',
                            position: 'left',
                            offsetX: 10,
                            style: {
                                color: '#fff',
                                background: '#10B981',
                                fontSize: '11px',
                                fontWeight: 600,
                                padding: {
                                    left: 8,
                                    right: 8,
                                    top: 2,
                                    bottom: 2
                                }
                            }
                        }
                    },
                    {
                        y: valoriNormale.maxPuls,
                        borderColor: '#EF4444',
                        strokeDashArray: 5,
                        borderWidth: 2,
                        opacity: 0.7,
                        label: {
                            text: 'Max Normal',
                            position: 'left',
                            offsetX: 10,
                            style: {
                                color: '#fff',
                                background: '#EF4444',
                                fontSize: '11px',
                                fontWeight: 600,
                                padding: {
                                    left: 8,
                                    right: 8,
                                    top: 2,
                                    bottom: 2
                                }
                            }
                        }
                    }
                ]
            };
        }

        return (
            <ReactApexChart
                options={options}
                series={options.series}
                type="area"
                height={350}
                width="100%"
            />
        );
    };

    const renderPatientSummary = () => {
        if (!selectedPatient || !patientData) {
            return <Empty description="Selectați un pacient pentru a vizualiza datele medicale" />;
        }

        return (
            <Card className={styles.summaryCard}>
                <Title level={4}>Sumar Pacient</Title>
                <Row gutter={[16, 16]}>
                    <Col span={8}>
                        <div className={styles.infoItem}>
                            <Text strong>Nume:</Text>
                            <Text>{patientData.nume} {patientData.prenume}</Text>
                        </div>
                        <div className={styles.infoItem}>
                            <Text strong>Vârstă:</Text>
                            <Text>{patientData.varsta} ani</Text>
                        </div>
                        <div className={styles.infoItem}>
                            <Text strong>CNP:</Text>
                            <Text>{patientData.cnp}</Text>
                        </div>
                    </Col>
                    <Col span={8}>
                        <div className={styles.infoItem}>
                            <Text strong>Telefon:</Text>
                            <Text>{patientData.nrTelefon || 'N/A'}</Text>
                        </div>
                        <div className={styles.infoItem}>
                            <Text strong>Email:</Text>
                            <Text>{patientData.email || 'N/A'}</Text>
                        </div>
                        <div className={styles.infoItem}>
                            <Text strong>Profesie:</Text>
                            <Text>{patientData.profesie || 'N/A'}</Text>
                        </div>
                    </Col>
                    <Col span={8}>
                        <div className={styles.infoItem}>
                            <Text strong>Adresă:</Text>
                            <Text>{[patientData.strada, patientData.numar, patientData.bloc, patientData.apartament]
                                .filter(Boolean).join(', ')}</Text>
                        </div>
                        <div className={styles.infoItem}>
                            <Text strong>Oraș:</Text>
                            <Text>{patientData.oras || 'N/A'}</Text>
                        </div>
                        <div className={styles.infoItem}>
                            <Text strong>Județ:</Text>
                            <Text>{patientData.judet || 'N/A'}</Text>
                        </div>
                    </Col>
                </Row>

                <Divider />

                <Title level={4}>Istoric Medical</Title>
                <Row gutter={[16, 16]}>
                    <Col span={24}>
                        <div className={styles.infoItem}>
                            <Text strong>Istoric Medical:</Text>
                            <Text>{patientData.istoricMedical || 'Nu există informații'}</Text>
                        </div>
                    </Col>
                    <Col span={24}>
                        <div className={styles.infoItem}>
                            <Text strong>Alergii:</Text>
                            <Text>{Array.isArray(patientData.alergii) && patientData.alergii.length > 0
                                ? patientData.alergii.join(', ')
                                : 'Nu există alergii înregistrate'}</Text>
                        </div>
                    </Col>
                </Row>

                {valoriNormale && (
                    <>
                        <Divider />
                        <Title level={4}>Valori Normale</Title>
                        <Row gutter={[16, 16]}>
                            <Col span={8}>
                                <Card className={styles.valueCard}>
                                    <HeartOutlined className={styles.valueIcon} />
                                    <div>
                                        <Text strong>Ritm Cardiac</Text>
                                        <div className={styles.valueRange}>
                                            <Text>{valoriNormale.minPuls} - {valoriNormale.maxPuls} BPM</Text>
                                        </div>
                                    </div>
                                </Card>
                            </Col>
                            <Col span={8}>
                                <Card className={styles.valueCard}>
                                    <ArrowUpOutlined className={styles.valueIcon} />
                                    <div>
                                        <Text strong>Tensiune Sistolică</Text>
                                        <div className={styles.valueRange}>
                                            <Text>{valoriNormale.minSistolic || 110} - {valoriNormale.maxSistolic || 140} mmHg</Text>
                                        </div>
                                    </div>
                                </Card>
                            </Col>
                            <Col span={8}>
                                <Card className={styles.valueCard}>
                                    <ArrowDownOutlined className={styles.valueIcon} />
                                    <div>
                                        <Text strong>Tensiune Diastolică</Text>
                                        <div className={styles.valueRange}>
                                            <Text>{valoriNormale.minDiastolic || 70} - {valoriNormale.maxDiastolic || 90} mmHg</Text>
                                        </div>
                                    </div>
                                </Card>
                            </Col>
                        </Row>
                    </>
                )}
            </Card>
        );
    };

    const renderCharts = () => {
        if (!selectedPatient) {
            return <Empty description="Selectați un pacient pentru a vizualiza graficele de evoluție" />;
        }

        if (chartLoading) {
            return (
                <Card className={styles.chartCard}>
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '50px' }}>
                        <Spin size="large" />
                        <Text style={{ marginTop: 16, color: '#64748B' }}>Se încarcă datele de monitorizare...</Text>
                    </div>
                </Card>
            );
        }

        if (pulseData.length === 0) {
            return (
                <Card className={styles.chartCard}>
                    <Empty
                        description={
                            <span>
                                Nu există date de puls pentru pacientul <Text strong>{selectedPatient?.nume} {selectedPatient?.prenume}</Text>
                            </span>
                        }
                        image={Empty.PRESENTED_IMAGE_SIMPLE}
                    />
                </Card>
            );
        }

        return (
            <Card
                className={styles.chartCard}
                title={
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Text style={{ fontSize: '16px', fontWeight: 600, color: '#334155' }}>
                            <HeartOutlined style={{ marginRight: 8, color: '#FF4560' }} />
                            Monitorizare Ritm Cardiac
                        </Text>
                        <Text style={{ fontSize: '14px', color: '#64748B' }}>
                            {pulseData.length > 0 ?
                                `Ultima actualizare: ${pulseData[pulseData.length - 1].date}` :
                                'Nu sunt date disponibile'}
                        </Text>
                    </div>
                }
            >
                <div className={styles.chartWrapper}>
                    {renderSimpleChart()}
                </div>

                <div className={styles.chartStats}>
                    <div className={styles.statItem}>
                        <Text strong>Total înregistrări:</Text>
                        <Text>{pulseData.length}</Text>
                    </div>
                    <div className={styles.statItem}>
                        <Text strong>Ultima valoare:</Text>
                        <Text>{pulseData.length > 0 ? `${pulseData[pulseData.length - 1].value} BPM (${pulseData[pulseData.length - 1].date})` : 'N/A'}</Text>
                    </div>
                    <div className={styles.statItem}>
                        <Text strong>Valoare minimă:</Text>
                        <Text>{pulseData.length > 0 ? `${Math.min(...pulseData.map(item => item.value))} BPM` : 'N/A'}</Text>
                    </div>
                    <div className={styles.statItem}>
                        <Text strong>Valoare maximă:</Text>
                        <Text>{pulseData.length > 0 ? `${Math.max(...pulseData.map(item => item.value))} BPM` : 'N/A'}</Text>
                    </div>
                    <div className={styles.statItem}>
                        <Text strong>Valoare medie:</Text>
                        <Text>
                            {pulseData.length > 0
                                ? `${Math.round(pulseData.reduce((sum, item) => sum + item.value, 0) / pulseData.length)} BPM`
                                : 'N/A'}
                        </Text>
                    </div>
                </div>
            </Card>
        );
    };

    // Effect pentru actualizarea graficului când datele se modifică
    useEffect(() => {
        if (pulseData.length > 0) {
            // Forțăm o reîmprospătare completă a graficului prin actualizarea seriei
            const chartId = 'pulse-chart';

            // Curățăm timer-ul la unmount
            return () => {
                // Oprim orice actualizări în curs
                console.log('Cleanup chart data');
            };
        }
    }, [pulseData]);

    return (
        <div className={styles.container}>
            <Row gutter={[16, 16]}>
                <Col span={24}>
                    <PatientSelector onPatientSelect={handlePatientSelect} />
                </Col>

                <Col span={24}>
                    <Tabs defaultActiveKey="summary" className={styles.tabs}>
                        <TabPane tab="Sumar Pacient" key="summary">
                            {loading ? (
                                <div style={{ display: 'flex', justifyContent: 'center', padding: '50px' }}>
                                    <Spin size="large" tip="Se încarcă datele pacientului..." />
                                </div>
                            ) : (
                                renderPatientSummary()
                            )}
                        </TabPane>

                        <TabPane tab="Grafice Evoluție" key="charts">
                            {renderCharts()}
                        </TabPane>
                    </Tabs>
                </Col>
            </Row>
        </div>
    );
};

export default MedicalRecords; 