import { FC, useState } from 'react';
import { Card, Button, Form, DatePicker, Select, Checkbox, Row, Col, Divider, Typography, Table, Space } from 'antd';
import { FilePdfOutlined, PrinterOutlined, DownloadOutlined } from '@ant-design/icons';
import ReactApexChart from 'react-apexcharts';
import styles from './ReportGenerator.module.scss';

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

const mockReportData = [
    {
        key: '1',
        date: '2023-03-07',
        heartRateAvg: 80,
        heartRateMax: 115,
        heartRateMin: 65,
        steps: 8500,
        caloriesBurned: 320,
        sleepHours: 7.5,
    },
    {
        key: '2',
        date: '2023-03-06',
        heartRateAvg: 84,
        heartRateMax: 130,
        heartRateMin: 62,
        steps: 10000,
        caloriesBurned: 420,
        sleepHours: 8,
    },
    {
        key: '3',
        date: '2023-03-05',
        heartRateAvg: 76,
        heartRateMax: 110,
        heartRateMin: 60,
        steps: 7500,
        caloriesBurned: 280,
        sleepHours: 6.5,
    },
    {
        key: '4',
        date: '2023-03-04',
        heartRateAvg: 81,
        heartRateMax: 125,
        heartRateMin: 64,
        steps: 9000,
        caloriesBurned: 350,
        sleepHours: 7,
    },
    {
        key: '5',
        date: '2023-03-03',
        heartRateAvg: 79,
        heartRateMax: 118,
        heartRateMin: 63,
        steps: 6500,
        caloriesBurned: 260,
        sleepHours: 8.5,
    },
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

    const handleGenerateReport = (values: any) => {
        console.log('Valori generare raport:', values);
        setReportGenerated(true);
        // Într-o aplicație reală, aici ar fi un apel API pentru generarea raportului
    };

    return (
        <div className={styles.container}>
            <Row gutter={[16, 16]}>
                <Col span={24}>
                    <Card title="Generează Raport Sănătate">
                        <Form
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
                                <Button type="primary" htmlType="submit">
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
                                    <Text>1 Martie, 2023 - 7 Martie, 2023</Text>
                                </div>

                                <Divider />

                                <div className={styles.summarySection}>
                                    <Title level={4}>Sumar Activitate</Title>
                                    <Row gutter={[16, 16]}>
                                        <Col span={8}>
                                            <Card className={styles.summaryCard}>
                                                <Title level={2}>7.928</Title>
                                                <Text>Pași Zilnici (Medie)</Text>
                                            </Card>
                                        </Col>
                                        <Col span={8}>
                                            <Card className={styles.summaryCard}>
                                                <Title level={2}>80 BPM</Title>
                                                <Text>Ritm Cardiac Mediu</Text>
                                            </Card>
                                        </Col>
                                        <Col span={8}>
                                            <Card className={styles.summaryCard}>
                                                <Title level={2}>7,4 ore</Title>
                                                <Text>Somn Mediu</Text>
                                            </Card>
                                        </Col>
                                    </Row>
                                </div>

                                <div className={styles.chartSection}>
                                    <Title level={4}>Tendințe Activitate</Title>
                                    <ReactApexChart
                                        options={summaryChartOptions}
                                        series={summaryChartSeries}
                                        type="area"
                                        height={350}
                                    />
                                </div>

                                <div className={styles.dataSection}>
                                    <Title level={4}>Date Detaliate</Title>
                                    <Table
                                        dataSource={mockReportData}
                                        columns={columns}
                                        pagination={false}
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