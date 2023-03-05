import { CameraOutlined, PlusOutlined } from '@ant-design/icons';
import { Button, Input, Layout } from 'antd';
import { FC, ReactNode } from 'react';
import { Outlet } from 'react-router-dom';

import styles from './index.module.scss';

const MessageChatFooter: FC = () => {
  return (
    <div className={styles.messageChatFooterContainer}>
      <Button size="large" style={{ color: '#AA14F0' }} icon={<PlusOutlined />} type="text"></Button>
      <Input size="large" style={{ borderRadius: '20px' }}></Input>
      <Button size="large" style={{ color: '#AA14F0' }} icon={<CameraOutlined />} type="text"></Button>
    </div>
  );
};

export default MessageChatFooter;