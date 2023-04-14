import { ArrowRightOutlined, CameraOutlined, PlusOutlined } from '@ant-design/icons';
import { Button, Input } from 'antd';
import { FC } from 'react';

import styles from '../index.module.scss';

const MessageChatInput: FC = () => {
  return (
    <div className={styles.messageChatFooterContainer}>
      <Button size="large" style={{ color: '#AA14F0' }} icon={<PlusOutlined />} type="text"></Button>
      <Input
        suffix={<Button style={{ color: '#AA14F0' }} type="text" icon={<ArrowRightOutlined />}></Button>}
        size="large"
        style={{ borderRadius: '20px' }}
      ></Input>
      <Button size="large" style={{ color: '#AA14F0' }} icon={<CameraOutlined />} type="text"></Button>
    </div>
  );
};

export default MessageChatInput;
