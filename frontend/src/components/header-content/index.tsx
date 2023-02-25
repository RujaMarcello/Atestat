import { BellOutlined } from '@ant-design/icons';
import { Avatar, Layout } from 'antd';
import { FC, ReactNode } from 'react';
import { Outlet } from 'react-router-dom';
import { useNavigate } from 'react-router-dom';

import styles from './index.module.scss';

const HeaderContent: FC = () => {
  const navigate = useNavigate();
  const handleNavigate = () => {
    navigate('/dashboard/profile');
  };
  return (
    <div className={styles.container}>
      <h1>
        <strong>Component</strong>
      </h1>
      <div className={styles.endContainer}>
        <BellOutlined className={styles.notifications} style={{ marginRight: '2vh' }} />
        <Avatar
          className={styles.avatar}
          onClick={handleNavigate}
          shape="circle"
          size={40}
          src="https://i.imgur.com/FHa6sEA.jpg"
        />
      </div>
    </div>
  );
};

export default HeaderContent;
