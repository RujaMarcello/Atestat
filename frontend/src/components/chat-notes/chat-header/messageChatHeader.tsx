import { LeftOutlined } from '@ant-design/icons';
import { Avatar, Button } from 'antd';
import { FC } from 'react';

import styles from '../index.module.scss';
import { WINDOW } from '../window';
interface MessageChatHeaderProps {
  handleWindow: (window: string) => void;
}
const MessageChatHeader: FC<MessageChatHeaderProps> = ({ handleWindow }) => {
  return (
    <div className={styles.messageChatHeaderContainer}>
      <Button
        onClick={() => handleWindow(WINDOW.conversation)}
        type="text"
        size="large"
        style={{ color: '#AA14F0' }}
        icon={<LeftOutlined />}
      ></Button>
      <div className={styles.messageChatHeaderImage}>
        <Avatar size={48} src="https://i.imgur.com/KniTFHh.jpg"></Avatar>
        <h1 className={styles.messageChatHeaderFriendName}>Ceapa</h1>
      </div>
    </div>
  );
};

export default MessageChatHeader;
