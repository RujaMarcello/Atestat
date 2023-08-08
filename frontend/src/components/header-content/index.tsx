import { BellOutlined } from '@ant-design/icons';
import { Avatar } from 'antd';
import { FC } from 'react';
import { useNavigate } from 'react-router-dom';

import { useUserProvider } from '../../context/User';
import styles from './index.module.scss';

const HeaderContent: FC = () => {
  const user = useUserProvider();
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
          src={user.user?.profilePictureUrl}
        />
      </div>
    </div>
  );
};

export default HeaderContent;
