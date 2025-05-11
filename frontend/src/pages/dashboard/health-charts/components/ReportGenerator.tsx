import { FC, useState, useEffect } from 'react';
import { Card, Button, Form, DatePicker, Select, Checkbox, Row, Col, Divider, Typography, Table, Space, message } from 'antd';
import { FilePdfOutlined, PrinterOutlined, DownloadOutlined } from '@ant-design/icons';
import ReactApexChart from 'react-apexcharts';
import styles from './ReportGenerator.module.scss';
import PatientSelector from './PatientSelector';
import { db } from '../../../../firebase';
import { collection, query, where, getDocs, orderBy, limit } from 'firebase/firestore';

const { RangePicker } = DatePicker;
const { Option } = Select;
const { Title, Text } = Typography;

// Date mock pentru graficul de sumar
const summaryChartOptions = {
    chart: {
        height: 350,
        type: 'area' as const,
        toolbar: {
            show: true
        },
    },
    dataLabels: {
        enabled: false
    },
    stroke: {
        curve: 'smooth' as const
    },
    xaxis: {
        type: 'datetime' as const,
        categories: [
            '2023-03-01T00:00:00.000Z',
            '2023-03-02T00:00:00.000Z',
            '2023-03-03T00:00:00.000Z',
            '2023-03-04T00:00:00.000Z',
            '2023-03-05T00:00:00.000Z',
            '2023-03-06T00:00:00.000Z',
            '2023-03-07T00:00:00.000Z'
        ],
    },
    tooltip: {
        x: {
            format: 'dd/MM/yy'
        },
    },
};

const summaryChartSeries = [
    {
        name: 'Ritm Cardiac (Medie)',
        data: [78, 82, 79, 81, 76, 84, 80]
    },
    {
        name: 'Pași',
        data: [5000, 8000, 6500, 9000, 7500, 10000, 8500]
    }
];

const columns = [
    {
        title: 'Data',
        dataIndex: 'date',
        key: 'date',
    },
    {
        title: 'Ritm Cardiac (Medie)',
        dataIndex: 'heartRateAvg',
        key: 'heartRateAvg',
        render: (text: number) => `${text} BPM`,
    },
    {
        title: 'Ritm Cardiac (Max)',
        dataIndex: 'heartRateMax',
        key: 'heartRateMax',
        render: (text: number) => `${text} BPM`,
    },
    {
        title: 'Ritm Cardiac (Min)',
        dataIndex: 'heartRateMin',
        key: 'heartRateMin',
        render: (text: number) => `${text} BPM`,
    },
    {
        title: 'Pași',
        dataIndex: 'steps',
        key: 'steps',
        render: (text: number) => text.toLocaleString(),
    },
    {
        title: 'Calorii Arse',
        dataIndex: 'caloriesBurned',
        key: 'caloriesBurned',
        render: (text: number) => `${text} kcal`,
    },
    {
        title: 'Somn',
        dataIndex: 'sleepHours',
        key: 'sleepHours',
        render: (text: number) => `${text} ore`,
    },
];

const ReportGenerator: FC = () => {
    const [reportGenerated, setReportGenerated] = useState(false);
    const [selectedPatient, setSelectedPatient] = useState<any>(null);
    const [loading, setLoading] = useState(false);
    const [reportData, setReportData] = useState<any[]>([]);
    const [form] = Form.useForm();

    // Resetăm formularul și raportul generat când se schimbă pacientul
    useEffect(() => {
        setReportGenerated(false);
        form.resetFields();
    }, [selectedPatient, form]);

    const handlePatientSelect = (patient: any) => {
        if (!patient || !patient.id) {
            console.error('Pacient invalid selectat:', patient);
            message.error('Eroare la selectarea pacientului.');
            return;
        }
        setSelectedPatient(patient);
    };

    const fetchSensorData = async (patientId: string, dataTypes: string[], startDate: Date, endDate: Date) => {
        try {
            setLoading(true);
            const sensorData: any[] = [];
            const pulsData: any[] = [];
            const pasiData: any[] = [];
            const somnData: any[] = [];

            // Convertim tipurile de date în colecțiile corespunzătoare
            const collections: { [key: string]: string } = {
                heart_rate: 'puls',
                steps: 'pasi',
                sleep: 'somn',
                blood_pressure: 'tensiune',
                oxygen: 'oxigen',
                calories: 'calorii'
            };

            // Verificăm fiecare tip de dată selectat și preluăm datele din Firebase
            for (const dataType of dataTypes) {
                const collectionName = collections[dataType];
                if (!collectionName) continue;

                try {
                    const collectionRef = collection(db, collectionName);
                    const q = query(
                        collectionRef,
                        where('pacientID', '==', patientId),
                        where('dataInregistrarii', '>=', startDate),
                        where('dataInregistrarii', '<=', endDate)
                    );

                    const querySnapshot = await getDocs(q);

                    // Procesăm datele în funcție de colecție
                    querySnapshot.docs.forEach(doc => {
                        const data = doc.data();

                        let date = new Date();
                        if (data.dataInregistrarii) {
                            try {
                                date = data.dataInregistrarii.toDate();
                            } catch (e) {
                                console.warn('Format de dată invalid:', e);
                            }
                        }

                        const dateString = date.toISOString().split('T')[0];

                        // În funcție de tipul de date, le stocăm diferit
                        if (collectionName === 'puls') {
                            pulsData.push({
                                date: dateString,
                                value: data.valoare || 0
                            });
                        } else if (collectionName === 'pasi') {
                            pasiData.push({
                                date: dateString,
                                value: data.valoare || 0
                            });
                        } else if (collectionName === 'somn') {
                            somnData.push({
                                date: dateString,
                                value: data.durataOre || 0
                            });
                        }
                    });

                } catch (error) {
                    console.error(`Eroare la preluarea datelor de ${collectionName}:`, error);
                }
            }

            // Agregăm datele pe zile pentru a crea raportul
            // În primul rând, identificăm toate zilele unice
            const allDates = new Set<string>();

            [...pulsData, ...pasiData, ...somnData].forEach(item => {
                allDates.add(item.date);
            });

            // Pentru fiecare zi, agregăm toate datele disponibile
            Array.from(allDates).sort().forEach(date => {
                const dailyPulse = pulsData.filter(p => p.date === date);
                const dailySteps = pasiData.filter(p => p.date === date);
                const dailySleep = somnData.filter(p => p.date === date);

                const heartRateValues = dailyPulse.map(p => p.value);
                const heartRateAvg = heartRateValues.length ?
                    Math.round(heartRateValues.reduce((a, b) => a + b, 0) / heartRateValues.length) : 0;
                const heartRateMax = heartRateValues.length ? Math.max(...heartRateValues) : 0;
                const heartRateMin = heartRateValues.length ? Math.min(...heartRateValues) : 0;

                const stepsTotal = dailySteps.reduce((sum, curr) => sum + curr.value, 0);
                const sleepHours = dailySleep.length ? dailySleep[0].value : 0;

                sensorData.push({
                    key: date,
                    date: date,
                    heartRateAvg,
                    heartRateMax,
                    heartRateMin,
                    steps: stepsTotal,
                    caloriesBurned: Math.round(stepsTotal * 0.04), // Estimare simplă
                    sleepHours
                });
            });

            // Sortăm datele după dată (descrescător)
            sensorData.sort((a, b) => b.date.localeCompare(a.date));

            return sensorData;
        } catch (error) {
            console.error('Eroare la preluarea datelor pentru raport:', error);
            message.error('Nu s-au putut încărca datele pentru raport.');
            return [];
        } finally {
            setLoading(false);
        }
    };

    const handleGenerateReport = async (values: any) => {
        if (!selectedPatient) {
            message.warning('Selectați un pacient înainte de a genera raportul.');
            return;
        }

        try {
            setLoading(true);
            console.log('Valori generare raport:', values);

            const { dateRange, reportType, dataTypes } = values;

            if (!dateRange || !dateRange[0] || !dateRange[1]) {
                message.error('Selectați un interval de timp valid.');
                return;
            }

            const startDate = dateRange[0].startOf('day').toDate();
            const endDate = dateRange[1].endOf('day').toDate();

            // Preluăm datele pentru raport din Firebase
            const reportData = await fetchSensorData(
                selectedPatient.id,
                dataTypes,
                startDate,
                endDate
            );

            setReportData(reportData);
            setReportGenerated(true);
        } catch (error) {
            console.error('Eroare la generarea raportului:', error);
            message.error('Nu s-a putut genera raportul.');
        } finally {
            setLoading(false);
        }
    };

    // Calculăm statisticile sumare pentru raport
    const calculateSummaryStats = () => {
        if (!reportData.length) return { avgSteps: 0, avgHeartRate: 0, avgSleep: 0 };

        const avgSteps = Math.round(
            reportData.reduce((sum, item) => sum + item.steps, 0) / reportData.length
        );

        const avgHeartRate = Math.round(
            reportData.reduce((sum, item) => sum + item.heartRateAvg, 0) / reportData.length
        );

        const avgSleep = parseFloat(
            (reportData.reduce((sum, item) => sum + item.sleepHours, 0) / reportData.length).toFixed(1)
        );

        return { avgSteps, avgHeartRate, avgSleep };
    };

    // Generăm datele pentru grafic
    const generateChartData = () => {
        if (!reportData.length) return {
            categories: [],
            series: [
                { name: 'Ritm Cardiac (Medie)', data: [] },
                { name: 'Pași', data: [] }
            ]
        };

        // Sortăm datele după dată (crescător)
        const sortedData = [...reportData].sort((a, b) => a.date.localeCompare(b.date));

        const categories = sortedData.map(item => item.date + 'T00:00:00.000Z');
        const heartRateSeries = sortedData.map(item => item.heartRateAvg);
        const stepsSeries = sortedData.map(item => item.steps);

        return {
            categories,
            series: [
                { name: 'Ritm Cardiac (Medie)', data: heartRateSeries },
                { name: 'Pași', data: stepsSeries }
            ]
        };
    };

    const { avgSteps, avgHeartRate, avgSleep } = calculateSummaryStats();
    const chartData = generateChartData();

    const customChartOptions = {
        ...summaryChartOptions,
        xaxis: {
            ...summaryChartOptions.xaxis,
            categories: chartData.categories
        }
    };

    return (
        <div className={styles.container}>
            <Row gutter={[16, 16]}>
                <Col span={24}>
                    <PatientSelector onPatientSelect={handlePatientSelect} />
                </Col>

                <Col span={24}>
                    <Card title="Generează Raport Sănătate">
                        <Form
                            form={form}
                            layout="vertical"
                            onFinish={handleGenerateReport}
                            initialValues={{
                                dataTypes: ['heart_rate', 'steps', 'sleep']
                            }}
                        >
                            <Row gutter={16}>
                                <Col span={12}>
                                    <Form.Item
                                        name="dateRange"
                                        label="Interval Raport"
                                        rules={[{ required: true, message: 'Te rugăm selectează un interval' }]}
                                    >
                                        <RangePicker style={{ width: '100%' }} />
                                    </Form.Item>
                                </Col>
                                <Col span={12}>
                                    <Form.Item
                                        name="reportType"
                                        label="Tip Raport"
                                        rules={[{ required: true, message: 'Te rugăm selectează un tip de raport' }]}
                                    >
                                        <Select placeholder="Selectează tipul raportului">
                                            <Option value="daily">Sumar Zilnic</Option>
                                            <Option value="weekly">Sumar Săptămânal</Option>
                                            <Option value="monthly">Sumar Lunar</Option>
                                            <Option value="custom">Personalizat</Option>
                                        </Select>
                                    </Form.Item>
                                </Col>
                            </Row>

                            <Form.Item
                                name="dataTypes"
                                label="Include Date"
                            >
                                <Checkbox.Group>
                                    <Row>
                                        <Col span={8}>
                                            <Checkbox value="heart_rate">Ritm Cardiac</Checkbox>
                                        </Col>
                                        <Col span={8}>
                                            <Checkbox value="blood_pressure">Tensiune Arterială</Checkbox>
                                        </Col>
                                        <Col span={8}>
                                            <Checkbox value="oxygen">Saturație Oxigen</Checkbox>
                                        </Col>
                                        <Col span={8}>
                                            <Checkbox value="steps">Pași</Checkbox>
                                        </Col>
                                        <Col span={8}>
                                            <Checkbox value="calories">Calorii</Checkbox>
                                        </Col>
                                        <Col span={8}>
                                            <Checkbox value="sleep">Somn</Checkbox>
                                        </Col>
                                    </Row>
                                </Checkbox.Group>
                            </Form.Item>

                            <Form.Item>
                                <Button
                                    type="primary"
                                    htmlType="submit"
                                    loading={loading}
                                    disabled={!selectedPatient}
                                >
                                    Generează Raport
                                </Button>
                            </Form.Item>
                        </Form>
                    </Card>
                </Col>

                {reportGenerated && (
                    <>
                        <Col span={24}>
                            <Card title="Previzualizare Raport"
                                extra={
                                    <Space>
                                        <Button icon={<FilePdfOutlined />}>Exportă PDF</Button>
                                        <Button icon={<PrinterOutlined />}>Printează</Button>
                                        <Button icon={<DownloadOutlined />}>Descarcă Date</Button>
                                    </Space>
                                }
                            >
                                <div className={styles.reportHeader}>
                                    <Title level={3}>Raport Activitate Sănătate</Title>
                                    <Text>
                                        {selectedPatient ? `${selectedPatient.nume} ${selectedPatient.prenume} (${selectedPatient.cnp})` : ''}
                                    </Text>
                                    <Text>{form.getFieldValue('dateRange')?.[0]?.format('D MMMM, YYYY')} - {form.getFieldValue('dateRange')?.[1]?.format('D MMMM, YYYY')}</Text>
                                </div>

                                <Divider />

                                <div className={styles.summarySection}>
                                    <Title level={4}>Sumar Activitate</Title>
                                    <Row gutter={[16, 16]}>
                                        <Col span={8}>
                                            <Card className={styles.summaryCard}>
                                                <Title level={2}>{avgSteps.toLocaleString()}</Title>
                                                <Text>Pași Zilnici (Medie)</Text>
                                            </Card>
                                        </Col>
                                        <Col span={8}>
                                            <Card className={styles.summaryCard}>
                                                <Title level={2}>{avgHeartRate} BPM</Title>
                                                <Text>Ritm Cardiac Mediu</Text>
                                            </Card>
                                        </Col>
                                        <Col span={8}>
                                            <Card className={styles.summaryCard}>
                                                <Title level={2}>{avgSleep} ore</Title>
                                                <Text>Somn Mediu</Text>
                                            </Card>
                                        </Col>
                                    </Row>
                                </div>

                                <div className={styles.chartSection}>
                                    <Title level={4}>Tendințe Activitate</Title>
                                    <ReactApexChart
                                        options={customChartOptions}
                                        series={chartData.series}
                                        type="area"
                                        height={350}
                                    />
                                </div>

                                <div className={styles.dataSection}>
                                    <Title level={4}>Date Detaliate</Title>
                                    <Table
                                        dataSource={reportData}
                                        columns={columns}
                                        pagination={false}
                                        loading={loading}
                                    />
                                </div>
                            </Card>
                        </Col>
                    </>
                )}
            </Row>
        </div>
    );
};

export default ReportGenerator; 