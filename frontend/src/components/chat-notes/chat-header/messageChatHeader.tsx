import { LeftOutlined } from '@ant-design/icons';
import { Avatar, Button } from 'antd';
import { FC } from 'react';

import { useChatProvider } from '../context/context';
import styles from '../index.module.scss';
import { WINDOW } from '../window';

const MessageChatHeader: FC = () => {
  const { handleWindow } = useChatProvider();
  const { currentUserData } = useChatProvider();
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
        <Avatar size={48} src={currentUserData.profilePictureUrl}></Avatar>
        <h1 className={styles.messageChatHeaderFriendName}>{currentUserData.name}</h1>
      </div>
    </div>
  );
};

export default MessageChatHeader;
