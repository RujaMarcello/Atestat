import { BellOutlined } from '@ant-design/icons';
import { Badge } from 'antd';
import { FC, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import styles from './index.module.scss';

const HeaderContent: FC = () => {
  const navigate = useNavigate();
  const [alertCount, setAlertCount] = useState(3); // Mock data pentru numărul de alerte necitite

  const handleAlertsClick = () => {
    navigate('/dashboard/alerts');
  };

  return (
    <div className={styles.container}>
      <h1>
        {/* <strong>Component</strong> */}
      </h1>
      <div className={styles.endContainer}>
        <Badge count={alertCount} size="small">
          <BellOutlined
            className={styles.notifications}
            style={{ fontSize: '20px', cursor: 'pointer' }}
            onClick={handleAlertsClick}
          />
        </Badge>
      </div>
    </div>
  );
};

export default HeaderContent;
