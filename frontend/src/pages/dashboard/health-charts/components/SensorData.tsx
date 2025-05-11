import { FC, useState, useEffect, useRef } from 'react';
import { Card, Row, Col, Select, DatePicker, Button, Space, InputNumber, message } from 'antd';
import ReactApexChart from 'react-apexcharts';
import styles from './SensorData.module.scss';
import PatientSelector from './PatientSelector';
import { db } from '../../../../firebase';
import { collection, query, orderBy, limit, onSnapshot, addDoc, getDocs, Timestamp, where } from 'firebase/firestore';

const { Option } = Select;
const { RangePicker } = DatePicker;

// Definim tipurile pentru datele graficului
interface ChartDataPoint {
    x: number;
    y: number;
}

// Definim interfața pentru seria de date
interface ChartSeries {
    name: string;
    data: number[] | ChartDataPoint[];
}

// Definim interfața pentru opțiunile graficului
interface ChartOptions {
    chart: {
        height: number;
        type: 'line' | 'area' | 'bar' | 'pie' | 'donut' | 'radialBar' | 'scatter' | 'bubble' | 'heatmap' | 'candlestick' | 'boxPlot' | 'radar' | 'polarArea' | 'rangeBar' | 'rangeArea' | 'treemap';
        animations: {
            enabled: boolean;
            easing?: string;
            dynamicAnimation?: {
                speed: number;
            };
        };
        toolbar: {
            show: boolean;
        };
        zoom: {
            enabled: boolean;
        };
        redrawOnParentResize?: boolean;
        redrawOnWindowResize?: boolean;
    };
    stroke: {
        curve: 'smooth' | 'straight' | 'stepline';
        width: number;
    };
    title: {
        text: string;
        align: 'left' | 'center' | 'right';
    };
    xaxis: {
        type: 'datetime' | 'category' | 'numeric';
        categories: string[] | number[];
        labels: {
            show?: boolean;
            rotate?: number;
            hideOverlappingLabels?: boolean;
            datetimeFormatter?: {
                year: string;
                month: string;
                day: string;
                hour: string;
            };
        };
    };
    yaxis: {
        title: {
            text: string;
        };
        min?: number;
        max?: number;
        tickAmount?: number;
    };
    markers: {
        size: number;
        hover?: {
            size: number;
        };
    };
    colors: string[];
    dataLabels?: {
        enabled: boolean;
    };
    grid?: {
        padding: {
            right: number;
        };
    };
}

// Definim interfața pentru datele graficului
interface ChartData {
    series: ChartSeries[];
    options: ChartOptions;
}

// Actualizez configurația pentru a dezactiva animațiile complet
const initialHeartRateData: ChartData = {
    series: [{
        name: 'Ritm Cardiac (BPM)',
        data: []
    }],
    options: {
        chart: {
            height: 350,
            type: 'line',
            animations: {
                enabled: false // Dezactivăm complet animațiile
            },
            toolbar: {
                show: true
            },
            zoom: {
                enabled: true
            },
            redrawOnParentResize: false,
            redrawOnWindowResize: false
        },
        stroke: {
            curve: 'straight', // Un stil mai simplu pentru linie
            width: 2
        },
        title: {
            text: 'Monitorizare Ritm Cardiac',
            align: 'left'
        },
        xaxis: {
            type: 'category',
            categories: [],
            labels: {
                show: true,
                rotate: 0,
                hideOverlappingLabels: true
            }
        },
        yaxis: {
            title: {
                text: 'BPM'
            },
            min: 40,
            max: 140,
            tickAmount: 10
        },
        markers: {
            size: 3,
            hover: {
                size: 5
            }
        },
        colors: ['#008FFB'], // Culoare schimbată în albastru
        dataLabels: {
            enabled: false
        },
        grid: {
            padding: {
                right: 30
            }
        }
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

// Adăugăm configurația pentru graficul de umiditate
const initialHumidityData: ChartData = {
    series: [{
        name: 'Umiditate (%)',
        data: []
    }],
    options: {
        chart: {
            height: 350,
            type: 'line',
            animations: {
                enabled: false // Dezactivăm complet animațiile
            },
            toolbar: {
                show: true
            },
            zoom: {
                enabled: true
            },
            redrawOnParentResize: false,
            redrawOnWindowResize: false
        },
        stroke: {
            curve: 'straight', // Un stil mai simplu pentru linie
            width: 2
        },
        title: {
            text: 'Monitorizare Umiditate',
            align: 'left'
        },
        xaxis: {
            type: 'category',
            categories: [],
            labels: {
                show: true,
                rotate: 0,
                hideOverlappingLabels: true
            }
        },
        yaxis: {
            title: {
                text: '%'
            },
            min: 0,
            max: 100,
            tickAmount: 10
        },
        markers: {
            size: 3,
            hover: {
                size: 5
            }
        },
        colors: ['#008FFB'], // Culoare schimbată în albastru
        dataLabels: {
            enabled: false
        },
        grid: {
            padding: {
                right: 30
            }
        }
    }
};

const SensorData: FC = () => {
    const [dataType, setDataType] = useState('heart-rate');
    const [selectedPatient, setSelectedPatient] = useState<any>(null);
    const [heartRateData, setHeartRateData] = useState<ChartData>(initialHeartRateData);
    const [humidityData, setHumidityData] = useState<ChartData>(initialHumidityData);
    const [pulseValue, setPulseValue] = useState<number>(72);
    const [humidityValue, setHumidityValue] = useState<number>(45);
    const [simulationRunning, setSimulationRunning] = useState<boolean>(false);
    const [humiditySimulationRunning, setHumiditySimulationRunning] = useState<boolean>(false);
    const simulationIntervalRef = useRef<NodeJS.Timeout | null>(null);
    const humiditySimulationIntervalRef = useRef<NodeJS.Timeout | null>(null);
    const chartUpdateIntervalRef = useRef<NodeJS.Timeout | null>(null);
    const [firestoreInitialized, setFirestoreInitialized] = useState<boolean>(false);
    const [humidityCollectionInitialized, setHumidityCollectionInitialized] = useState<boolean>(false);

    // Funcție pentru a verifica și inițializa colecțiile
    const checkFirestoreCollections = async () => {
        try {
            console.log("Verificăm colecțiile din Firestore...");

            // Verificăm colecția de puls
            const pulseCollectionRef = collection(db, "puls");
            const pulseSnapshot = await getDocs(pulseCollectionRef);
            console.log(`Colecția 'puls' conține ${pulseSnapshot.size} documente.`);
            setFirestoreInitialized(true);

            // Verificăm colecția de umiditate
            const humidityCollectionRef = collection(db, "umiditate");
            const humiditySnapshot = await getDocs(humidityCollectionRef);
            console.log(`Colecția 'umiditate' conține ${humiditySnapshot.size} documente.`);
            setHumidityCollectionInitialized(true);
        } catch (error) {
            console.error("Eroare la verificarea colecțiilor:", error);
            message.error("Nu s-a putut verifica conexiunea cu baza de date.");
        }
    };

    // Verificăm colecțiile la inițializarea componentei
    useEffect(() => {
        checkFirestoreCollections();
    }, []);

    // Funcție pentru a încărca datele de puls din Firestore
    const fetchPulseData = async () => {
        if (!selectedPatient) return;

        try {
            const pulseRef = collection(db, "puls");
            const q = query(
                pulseRef,
                where("pacientID", "==", selectedPatient.id)
            );

            console.log("Interogare pentru pacientul cu ID:", selectedPatient.id);
            const querySnapshot = await getDocs(q);
            console.log("Număr de documente returnate:", querySnapshot.size);

            // Array simplu pentru date
            const pulseData: number[] = [];
            const timestamps: string[] = [];
            const timestampObjects: Date[] = []; // Pentru sortare

            querySnapshot.docs.forEach((doc) => {
                const data = doc.data();

                if (data.dataInregistrarii && data.valoare) {
                    const timestamp = data.dataInregistrarii.toDate();
                    timestampObjects.push(timestamp);
                    pulseData.push(data.valoare);
                    timestamps.push(timestamp.toLocaleTimeString('ro-RO', {
                        hour: '2-digit',
                        minute: '2-digit',
                        second: '2-digit'
                    }));
                }
            });

            // Sortăm datele cronologic folosind timestamp-urile ca obiecte Date pentru acuratețe
            const combinedData = timestampObjects.map((timestamp, index) => ({
                timestamp,
                value: pulseData[index],
                displayTime: timestamps[index]
            }));

            combinedData.sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime());

            // Extragem datele sortate
            const sortedPulseData = combinedData.map(item => item.value);
            const sortedTimestamps = combinedData.map(item => item.displayTime);

            if (sortedPulseData.length === 0) {
                message.warning("Nu există date de puls pentru acest pacient.");
                return;
            }

            // Actualizăm numărul de puncte pentru coerență cu updateChartWithNewValue
            const maxPoints = 30;
            const limitedPulseData = sortedPulseData.slice(-maxPoints);
            const limitedTimestamps = sortedTimestamps.slice(-maxPoints);

            // Actualizare directă, fără animații
            setHeartRateData({
                series: [{
                    name: 'Ritm Cardiac (BPM)',
                    data: limitedPulseData
                }],
                options: {
                    ...initialHeartRateData.options, // Folosim opțiunile inițiale fără animații
                    xaxis: {
                        ...initialHeartRateData.options.xaxis,
                        type: 'category',
                        categories: limitedTimestamps
                    },
                    title: {
                        ...initialHeartRateData.options.title,
                        text: `Monitorizare Ritm Cardiac - ${selectedPatient?.nume || ''} ${selectedPatient?.prenume || ''}`
                    },
                    // Actualizăm limitele axei Y pentru a corespunde cu noile valori posibile
                    yaxis: {
                        ...initialHeartRateData.options.yaxis,
                        min: 50,
                        max: 130
                    }
                }
            });
        } catch (error) {
            console.error("Eroare la încărcarea datelor de puls:", error);
            message.error("Nu s-au putut încărca datele de puls.");
        }
    };

    // Funcția pentru adăugarea unei noi valori de puls
    const addPulseValue = async (value: number) => {
        if (!selectedPatient) {
            message.warning("Selectați un pacient înainte de a adăuga valori de puls.");
            return;
        }

        try {
            const currentTime = new Date();

            console.log("Se adaugă valoare de puls pentru pacientul:", selectedPatient);
            console.log("Valoare:", value, "Timestamp:", currentTime);

            const newData = {
                pacientID: selectedPatient.id,
                valoare: value,
                dataInregistrarii: Timestamp.fromDate(currentTime)
            };

            // Adăugăm documentul în colecția "puls"
            const docRef = await addDoc(collection(db, "puls"), newData);

            console.log("Document adăugat cu ID:", docRef.id);

            // Actualizăm imediat datele locale pentru o experiență mai fluidă
            updateChartWithNewValue(value, currentTime);

            message.success(`Valoare de puls adăugată: ${value} BPM`);
        } catch (error) {
            console.error("Eroare la adăugarea valorii de puls:", error);
            message.error("Nu s-a putut adăuga valoarea de puls.");
        }
    };

    // Funcția pentru a actualiza chart-ul cu o nouă valoare (optimizată pentru actualizare instantanee)
    const updateChartWithNewValue = (value: number, timestamp: Date) => {
        const newTimestamp = timestamp.toLocaleTimeString('ro-RO', {
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit'
        });

        // Actualizare imediată, fără tranziții
        setHeartRateData(prevData => {
            // Verificăm dacă avem serii și categorii existente
            const existingSeries = prevData.series[0].data as number[];
            const existingCategories = prevData.options.xaxis.categories as string[];

            // Mărim numărul de puncte afișate pentru a vedea mai multe actualizări
            const maxPoints = 30;
            const newSeries = [...existingSeries, value];
            const newCategories = [...existingCategories, newTimestamp];

            // Dacă avem prea multe puncte, eliminăm cele mai vechi
            const slicedSeries = newSeries.length > maxPoints ?
                newSeries.slice(-maxPoints) : newSeries;
            const slicedCategories = newCategories.length > maxPoints ?
                newCategories.slice(-maxPoints) : newCategories;

            return {
                series: [{
                    name: 'Ritm Cardiac (BPM)',
                    data: slicedSeries
                }],
                options: {
                    ...prevData.options,
                    xaxis: {
                        ...prevData.options.xaxis,
                        categories: slicedCategories
                    }
                }
            };
        });
    };

    // Funcția pentru a genera o valoare aleatorie de puls, cu variații mai mari
    const generateRandomPulseValue = (lastValue: number): number => {
        // Variație mai amplă, între -5 și +5 pentru schimbări mai vizibile
        const variation = Math.floor(Math.random() * 11) - 5;
        const newValue = lastValue + variation;

        // Asigurăm că valoarea rămâne în limite normale de puls
        if (newValue < 55) return 55;
        if (newValue > 125) return 125;
        return newValue;
    };

    // Pornire/oprire simulare puls
    const togglePulseSimulation = () => {
        if (simulationRunning) {
            // Oprim simularea
            if (simulationIntervalRef.current) {
                clearInterval(simulationIntervalRef.current);
                simulationIntervalRef.current = null;
            }
            setSimulationRunning(false);
            message.info("Simulare oprită.");
        } else {
            // Pornim simularea
            if (!selectedPatient) {
                message.warning("Selectați un pacient înainte de a porni simularea.");
                return;
            }

            // Adăugăm prima valoare imediat
            addPulseValue(pulseValue);

            // Setăm intervalul pentru adăugarea de valori noi mult mai rapid
            simulationIntervalRef.current = setInterval(() => {
                const lastValue = pulseValue;
                const newValue = generateRandomPulseValue(lastValue);
                setPulseValue(newValue);
                addPulseValue(newValue);
            }, 500); // O nouă valoare la fiecare 500ms (0.5 secunde) pentru actualizări foarte rapide

            setSimulationRunning(true);
            message.success("Simulare pornită. Se vor adăuga valori de puls la fiecare 0.5 secunde.");
        }
    };

    // Funcție pentru a încărca datele de umiditate din Firestore
    const fetchHumidityData = async () => {
        if (!selectedPatient) return;

        try {
            const humidityRef = collection(db, "umiditate");
            const q = query(
                humidityRef,
                where("pacientID", "==", selectedPatient.id)
            );

            console.log("Interogare umiditate pentru pacientul cu ID:", selectedPatient.id);
            const querySnapshot = await getDocs(q);
            console.log("Număr de documente de umiditate returnate:", querySnapshot.size);

            // Array simplu pentru date
            const humidityValues: number[] = [];
            const timestamps: string[] = [];
            const timestampObjects: Date[] = []; // Pentru sortare

            querySnapshot.docs.forEach((doc) => {
                const data = doc.data();

                if (data.dataInregistrarii && data.valoare) {
                    const timestamp = data.dataInregistrarii.toDate();
                    timestampObjects.push(timestamp);
                    humidityValues.push(data.valoare);
                    timestamps.push(timestamp.toLocaleTimeString('ro-RO', {
                        hour: '2-digit',
                        minute: '2-digit',
                        second: '2-digit'
                    }));
                }
            });

            // Sortăm datele cronologic
            const combinedData = timestampObjects.map((timestamp, index) => ({
                timestamp,
                value: humidityValues[index],
                displayTime: timestamps[index]
            }));

            combinedData.sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime());

            // Extragem datele sortate
            const sortedHumidityData = combinedData.map(item => item.value);
            const sortedTimestamps = combinedData.map(item => item.displayTime);

            if (sortedHumidityData.length === 0) {
                message.warning("Nu există date de umiditate pentru acest pacient.");
                return;
            }

            // Limitare la ultimele puncte
            const maxPoints = 30;
            const limitedHumidityData = sortedHumidityData.slice(-maxPoints);
            const limitedTimestamps = sortedTimestamps.slice(-maxPoints);

            // Actualizare directă, fără animații
            setHumidityData({
                series: [{
                    name: 'Umiditate (%)',
                    data: limitedHumidityData
                }],
                options: {
                    ...initialHumidityData.options,
                    xaxis: {
                        ...initialHumidityData.options.xaxis,
                        type: 'category',
                        categories: limitedTimestamps
                    },
                    title: {
                        ...initialHumidityData.options.title,
                        text: `Monitorizare Umiditate - ${selectedPatient?.nume || ''} ${selectedPatient?.prenume || ''}`
                    },
                    yaxis: {
                        ...initialHumidityData.options.yaxis,
                        min: 0,
                        max: 100
                    }
                }
            });
        } catch (error) {
            console.error("Eroare la încărcarea datelor de umiditate:", error);
            message.error("Nu s-au putut încărca datele de umiditate.");
        }
    };

    // Funcția pentru adăugarea unei noi valori de umiditate
    const addHumidityValue = async (value: number) => {
        if (!selectedPatient) {
            message.warning("Selectați un pacient înainte de a adăuga valori de umiditate.");
            return;
        }

        try {
            const currentTime = new Date();

            console.log("Se adaugă valoare de umiditate pentru pacientul:", selectedPatient);
            console.log("Valoare:", value, "Timestamp:", currentTime);

            const newData = {
                pacientID: selectedPatient.id,
                valoare: value,
                dataInregistrarii: Timestamp.fromDate(currentTime)
            };

            // Adăugăm documentul în colecția "umiditate"
            const docRef = await addDoc(collection(db, "umiditate"), newData);

            console.log("Document de umiditate adăugat cu ID:", docRef.id);

            // Actualizăm imediat datele locale
            updateHumidityChartWithNewValue(value, currentTime);

            message.success(`Valoare de umiditate adăugată: ${value}%`);
        } catch (error) {
            console.error("Eroare la adăugarea valorii de umiditate:", error);
            message.error("Nu s-a putut adăuga valoarea de umiditate.");
        }
    };

    // Funcția pentru a actualiza chart-ul cu o nouă valoare de umiditate
    const updateHumidityChartWithNewValue = (value: number, timestamp: Date) => {
        const newTimestamp = timestamp.toLocaleTimeString('ro-RO', {
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit'
        });

        // Actualizare imediată, fără tranziții
        setHumidityData(prevData => {
            // Verificăm dacă avem serii și categorii existente
            const existingSeries = prevData.series[0].data as number[];
            const existingCategories = prevData.options.xaxis.categories as string[];

            const maxPoints = 30;
            const newSeries = [...existingSeries, value];
            const newCategories = [...existingCategories, newTimestamp];

            // Limitare la numărul maxim de puncte
            const slicedSeries = newSeries.length > maxPoints ?
                newSeries.slice(-maxPoints) : newSeries;
            const slicedCategories = newCategories.length > maxPoints ?
                newCategories.slice(-maxPoints) : newCategories;

            return {
                series: [{
                    name: 'Umiditate (%)',
                    data: slicedSeries
                }],
                options: {
                    ...prevData.options,
                    xaxis: {
                        ...prevData.options.xaxis,
                        categories: slicedCategories
                    }
                }
            };
        });
    };

    // Generare valoare aleatorie de umiditate
    const generateRandomHumidityValue = (lastValue: number): number => {
        // Variație de umiditate între -3 și +3
        const variation = Math.floor(Math.random() * 7) - 3;
        const newValue = lastValue + variation;

        // Valoarea rămâne între 20% și 80%
        if (newValue < 20) return 20;
        if (newValue > 80) return 80;
        return newValue;
    };

    // Pornire/oprire simulare umiditate
    const toggleHumiditySimulation = () => {
        if (humiditySimulationRunning) {
            // Oprim simularea
            if (humiditySimulationIntervalRef.current) {
                clearInterval(humiditySimulationIntervalRef.current);
                humiditySimulationIntervalRef.current = null;
            }
            setHumiditySimulationRunning(false);
            message.info("Simulare umiditate oprită.");
        } else {
            // Pornim simularea
            if (!selectedPatient) {
                message.warning("Selectați un pacient înainte de a porni simularea.");
                return;
            }

            // Adăugăm prima valoare imediat
            addHumidityValue(humidityValue);

            // Setăm intervalul pentru adăugarea de valori noi
            humiditySimulationIntervalRef.current = setInterval(() => {
                const lastValue = humidityValue;
                const newValue = generateRandomHumidityValue(lastValue);
                setHumidityValue(newValue);
                addHumidityValue(newValue);
            }, 500); // O nouă valoare la fiecare 500ms

            setHumiditySimulationRunning(true);
            message.success("Simulare umiditate pornită. Se vor adăuga valori la fiecare 0.5 secunde.");
        }
    };

    // Modificăm efectul pentru a gestiona încărcarea datelor în funcție de dataType
    useEffect(() => {
        if (selectedPatient) {
            if (dataType === 'heart-rate') {
                fetchPulseData();
            } else if (dataType === 'humidity') {
                fetchHumidityData();
            }
        }
    }, [selectedPatient, dataType]);

    // Efect pentru a curăța intervalele la demontarea componentei
    useEffect(() => {
        return () => {
            if (simulationIntervalRef.current) {
                clearInterval(simulationIntervalRef.current);
            }
            if (humiditySimulationIntervalRef.current) {
                clearInterval(humiditySimulationIntervalRef.current);
            }
            if (chartUpdateIntervalRef.current) {
                clearInterval(chartUpdateIntervalRef.current);
            }
        };
    }, []);

    const handlePatientSelect = (patient: any) => {
        // Oprește simularea curentă dacă există
        if (simulationRunning) {
            if (simulationIntervalRef.current) {
                clearInterval(simulationIntervalRef.current);
                simulationIntervalRef.current = null;
            }
            setSimulationRunning(false);
        }

        setSelectedPatient(patient);
        console.log("Pacient selectat:", patient);

        // Resetăm datele chartului la selectarea unui nou pacient
        setHeartRateData({
            ...initialHeartRateData,
            options: {
                ...initialHeartRateData.options,
                title: {
                    ...initialHeartRateData.options.title,
                    text: `Monitorizare Ritm Cardiac - ${patient?.nume || ''} ${patient?.prenume || ''}`
                }
            }
        });
    };

    // Modificăm renderChart pentru a include graficul de umiditate
    const renderChart = () => {
        switch (dataType) {
            case 'heart-rate':
                return (
                    <ReactApexChart
                        options={heartRateData.options}
                        series={heartRateData.series}
                        type="line"
                        height={350}
                    />
                );
            case 'humidity':
                return (
                    <ReactApexChart
                        options={humidityData.options}
                        series={humidityData.series}
                        type="line"
                        height={350}
                    />
                );
            case 'blood-pressure':
                return (
                    <ReactApexChart
                        options={{
                            ...mockBloodPressureData.options,
                            title: {
                                ...mockBloodPressureData.options.title,
                                text: `Tensiune Arterială - ${selectedPatient?.nume || ''} ${selectedPatient?.prenume || ''}`
                            },
                            yaxis: {
                                ...mockBloodPressureData.options.yaxis,
                                min: 60,
                                max: 160,
                                tickAmount: 10
                            }
                        }}
                        series={mockBloodPressureData.series}
                        type="line"
                        height={350}
                    />
                );
            case 'oxygen':
                return (
                    <ReactApexChart
                        options={{
                            ...mockOxygenData.options,
                            title: {
                                ...mockOxygenData.options.title,
                                text: `Nivel Oxigen în Sânge - ${selectedPatient?.nume || ''} ${selectedPatient?.prenume || ''}`
                            }
                        }}
                        series={mockOxygenData.series}
                        type="line"
                        height={350}
                    />
                );
            default:
                return null;
        }
    };

    // Panoul de simulare a citirii pulsului
    const renderPulseSimulationPanel = () => {
        if (dataType !== 'heart-rate') return null;

        return (
            <Card title="Simulare Citiri Puls" className={styles.simulationCard}>
                <Space direction="vertical" style={{ width: '100%' }}>
                    {!firestoreInitialized && (
                        <div style={{ marginBottom: '10px', color: '#ff4d4f' }}>
                            Se verifică conexiunea la baza de date...
                        </div>
                    )}
                    <div>
                        <label>Valoare puls (BPM):</label>
                        <InputNumber
                            min={40}
                            max={180}
                            value={pulseValue}
                            onChange={(value) => setPulseValue(value as number)}
                            style={{ width: '100%', marginBottom: '10px' }}
                            disabled={simulationRunning || !firestoreInitialized}
                        />
                    </div>
                    <Space>
                        <Button
                            type="primary"
                            onClick={() => addPulseValue(pulseValue)}
                            disabled={simulationRunning || !firestoreInitialized}
                        >
                            Adaugă Valoare Manuală
                        </Button>
                        <Button
                            type="primary"
                            danger={simulationRunning}
                            onClick={togglePulseSimulation}
                            disabled={!firestoreInitialized}
                        >
                            {simulationRunning ? 'Oprește Simularea' : 'Pornește Simularea'}
                        </Button>
                    </Space>
                </Space>
            </Card>
        );
    };

    // Panou de simulare pentru umiditate
    const renderHumiditySimulationPanel = () => {
        if (dataType !== 'humidity') return null;

        return (
            <Card title="Simulare Citiri Umiditate" className={styles.simulationCard}>
                <Space direction="vertical" style={{ width: '100%' }}>
                    {!humidityCollectionInitialized && (
                        <div style={{ marginBottom: '10px', color: '#ff4d4f' }}>
                            Se verifică conexiunea la baza de date...
                        </div>
                    )}
                    <div>
                        <label>Valoare umiditate (%):</label>
                        <InputNumber
                            min={0}
                            max={100}
                            value={humidityValue}
                            onChange={(value) => setHumidityValue(value as number)}
                            style={{ width: '100%', marginBottom: '10px' }}
                            disabled={humiditySimulationRunning || !humidityCollectionInitialized}
                        />
                    </div>
                    <Space>
                        <Button
                            type="primary"
                            onClick={() => addHumidityValue(humidityValue)}
                            disabled={humiditySimulationRunning || !humidityCollectionInitialized}
                        >
                            Adaugă Valoare Manuală
                        </Button>
                        <Button
                            type="primary"
                            danger={humiditySimulationRunning}
                            onClick={toggleHumiditySimulation}
                            disabled={!humidityCollectionInitialized}
                        >
                            {humiditySimulationRunning ? 'Oprește Simularea' : 'Pornește Simularea'}
                        </Button>
                    </Space>
                </Space>
            </Card>
        );
    };

    return (
        <div className={styles.container}>
            <Row gutter={[16, 16]}>
                <Col span={24}>
                    <PatientSelector onPatientSelect={handlePatientSelect} />
                </Col>

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
                                    <Option value="humidity">Umiditate</Option>
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

                {dataType === 'heart-rate' && (
                    <Col span={24}>
                        {renderPulseSimulationPanel()}
                    </Col>
                )}

                {dataType === 'humidity' && (
                    <Col span={24}>
                        {renderHumiditySimulationPanel()}
                    </Col>
                )}

                <Col span={24}>
                    <Card className={styles.chartCard}>
                        {selectedPatient ? renderChart() : <div className={styles.noPatient}>Selectați un pacient pentru a vizualiza datele</div>}
                    </Card>
                </Col>
            </Row>
        </div>
    );
};

export default SensorData; 