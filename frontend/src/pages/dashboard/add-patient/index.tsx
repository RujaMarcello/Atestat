import React from 'react';
import { Card, Typography, Row, Col } from 'antd';
import PatientForm from './components/PatientForm';
import styles from './index.module.scss';

const AddPatientPage: React.FC = () => {
    return (
        <div className={styles.container}>
            <Row justify="center">
                <Col xs={24} sm={24} md={20} lg={18} xl={16}>
                    <Card className={styles.card}>
                        <PatientForm />
                    </Card>
                </Col>
            </Row>
        </div>
    );
};

export default AddPatientPage; 