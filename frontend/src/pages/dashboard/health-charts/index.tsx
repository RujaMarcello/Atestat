import { FC, useState, useEffect } from 'react';
import { Tabs } from 'antd';
import { useUserProvider } from '../../../context/User';
import { RoleDtoNameEnum } from '../../../generated/api';
import styles from './index.module.scss';
import SensorData from './components/SensorData';
import DoctorRecommendations from './components/DoctorRecommendations';
import ReportGenerator from './components/ReportGenerator';
import MedicalRecords from './components/MedicalRecords';
import AlertsManagement from './components/AlertsManagement';

const { TabPane } = Tabs;

const HealthCharts: FC = () => {
    const user = useUserProvider();
    const isDoctor = user.user?.userRole?.name === RoleDtoNameEnum.Admin;
    const isSuperAdmin = user.user?.userRole?.name === RoleDtoNameEnum.Superadmin;
    const canEditRecommendations = isDoctor || isSuperAdmin;
    const [activeTab, setActiveTab] = useState<string>('sensor-data');

    useEffect(() => {
        // Verificăm dacă există un tab activ în localStorage
        const savedTab = localStorage.getItem('activeHealthChartsTab');
        if (savedTab) {
            setActiveTab(savedTab);
            // Ștergem valoarea din localStorage pentru a nu persista între sesiuni
            localStorage.removeItem('activeHealthChartsTab');
        }
    }, []);

    const handleTabChange = (key: string) => {
        setActiveTab(key);
    };

    return (
        <div className={styles.container}>
            <h1>Dashboard Medical</h1>

            <Tabs activeKey={activeTab} onChange={handleTabChange} className={styles.tabs}>
                <TabPane tab="Vizualizare Date Senzori" key="sensor-data">
                    <SensorData />
                </TabPane>

                {(isDoctor || isSuperAdmin) && (
                    <TabPane tab="Date Medicale" key="medical-records">
                        <MedicalRecords />
                    </TabPane>
                )}

                <TabPane tab="Recomandările Medicului" key="recommendations">
                    <DoctorRecommendations isDoctor={canEditRecommendations} />
                </TabPane>

                {(isDoctor || isSuperAdmin) && (
                    <TabPane tab="Gestionare Alerte" key="alerts-management">
                        <AlertsManagement />
                    </TabPane>
                )}

                <TabPane tab="Generator Rapoarte" key="reports">
                    <ReportGenerator />
                </TabPane>
            </Tabs>
        </div>
    );
};

export default HealthCharts;