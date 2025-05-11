import { FC, useState } from 'react';
import { Card, Row, Col, Select, DatePicker } from 'antd';
import ReactApexChart from 'react-apexcharts';
import styles from './SensorData.module.scss';

const { Option } = Select;
const { RangePicker } = DatePicker;

// Date mock - ar fi înlocuite cu apeluri API reale
const mockHeartRateData = {
    series: [{
        name: 'Ritm Cardiac (BPM)',
        data: [75, 78, 80, 79, 85, 88, 82, 75, 78, 76, 80, 82]
    }],
    options: {
        chart: {
            height: 350,
            type: 'line' as const,
            toolbar: {
                show: true
            },
            zoom: {
                enabled: true
            }
        },
        stroke: {
            curve: 'smooth' as const,
            width: 3
        },
        title: {
            text: 'Monitorizare Ritm Cardiac',
            align: 'left' as const
        },
        xaxis: {
            categories: ['8AM', '9AM', '10AM', '11AM', '12PM', '1PM', '2PM', '3PM', '4PM', '5PM', '6PM', '7PM'],
            title: {
                text: 'Ora'
            }
        },
        yaxis: {
            title: {
                text: 'BPM'
            }
        },
        markers: {
            size: 4
        },
        colors: ['#FF4560']
    }
};

const mockBloodPressureData = {
    series: [{
        name: 'Sistolică',
        data: [120, 122, 125, 130, 125, 128, 126, 122, 120, 118, 122, 125]
    }, {
        name: 'Diastolică',
        data: [80, 82, 84, 85, 82, 83, 82, 80, 79, 78, 80, 82]
    }],
    options: {
        chart: {
            height: 350,
            type: 'line' as const,
            toolbar: {
                show: true
            },
            zoom: {
                enabled: true
            }
        },
        stroke: {
            curve: 'smooth' as const,
            width: 3
        },
        title: {
            text: 'Tensiune Arterială',
            align: 'left' as const
        },
        xaxis: {
            categories: ['8AM', '9AM', '10AM', '11AM', '12PM', '1PM', '2PM', '3PM', '4PM', '5PM', '6PM', '7PM'],
            title: {
                text: 'Ora'
            }
        },
        yaxis: {
            title: {
                text: 'mmHg'
            }
        },
        markers: {
            size: 4
        },
        colors: ['#008FFB', '#00E396']
    }
};

const mockOxygenData = {
    series: [{
        name: 'Saturație Oxigen (%)',
        data: [97, 98, 97, 97, 98, 97, 96, 97, 98, 98, 97, 98]
    }],
    options: {
        chart: {
            height: 350,
            type: 'line' as const,
            toolbar: {
                show: true
            },
            zoom: {
                enabled: true
            }
        },
        stroke: {
            curve: 'smooth' as const,
            width: 3
        },
        title: {
            text: 'Nivel Oxigen în Sânge',
            align: 'left' as const
        },
        xaxis: {
            categories: ['8AM', '9AM', '10AM', '11AM', '12PM', '1PM', '2PM', '3PM', '4PM', '5PM', '6PM', '7PM'],
            title: {
                text: 'Ora'
            }
        },
        yaxis: {
            min: 90,
            max: 100,
            title: {
                text: 'SpO2 (%)'
            }
        },
        markers: {
            size: 4
        },
        colors: ['#775DD0']
    }
};

const SensorData: FC = () => {
    const [dataType, setDataType] = useState('heart-rate');

    const renderChart = () => {
        switch (dataType) {
            case 'heart-rate':
                return (
                    <ReactApexChart
                        options={mockHeartRateData.options}
                        series={mockHeartRateData.series}
                        type="line"
                        height={350}
                    />
                );
            case 'blood-pressure':
                return (
                    <ReactApexChart
                        options={mockBloodPressureData.options}
                        series={mockBloodPressureData.series}
                        type="line"
                        height={350}
                    />
                );
            case 'oxygen':
                return (
                    <ReactApexChart
                        options={mockOxygenData.options}
                        series={mockOxygenData.series}
                        type="line"
                        height={350}
                    />
                );
            default:
                return null;
        }
    };

    return (
        <div className={styles.container}>
            <Row gutter={[16, 16]}>
                <Col span={24}>
                    <Card title="Vizualizare Date Senzori" className={styles.controlsCard}>
                        <Row gutter={[16, 16]} align="middle">
                            <Col span={8}>
                                <label>Selectează Parametru:</label>
                                <Select
                                    style={{ width: '100%' }}
                                    value={dataType}
                                    onChange={setDataType}
                                >
                                    <Option value="heart-rate">Ritm Cardiac</Option>
                                    <Option value="blood-pressure">Tensiune Arterială</Option>
                                    <Option value="oxygen">Saturație Oxigen</Option>
                                </Select>
                            </Col>
                            <Col span={16}>
                                <label>Selectează Interval:</label>
                                <RangePicker style={{ width: '100%' }} />
                            </Col>
                        </Row>
                    </Card>
                </Col>

                <Col span={24}>
                    <Card className={styles.chartCard}>
                        {renderChart()}
                    </Card>
                </Col>
            </Row>
        </div>
    );
};

export default SensorData; 