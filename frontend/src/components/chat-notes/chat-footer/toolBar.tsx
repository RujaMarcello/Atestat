import { MessageOutlined, TeamOutlined, UsergroupAddOutlined } from '@ant-design/icons';
import { Badge, Button } from 'antd';
import { FC } from 'react';

import { useChatProvider } from '../context/context';
import styles from '../index.module.scss';
import { WINDOW } from '../window';

const ToolBar: FC = () => {
  const { currentWindow, handleWindow } = useChatProvider();

  return (
    <div className={styles.toolBarContainer}>
      <Badge color="#AA14F0" offset={[-27, 10]} count={5}>
        <Button
          style={{ fontSize: '1.5rem', color: currentWindow === WINDOW.conversation ? '#AA14F0' : 'black' }}
          size="large"
          onClick={() => handleWindow(WINDOW.conversation)}
          type="text"
          icon={<MessageOutlined />}
        ></Button>
        <div className={styles.toolName}>Conversation</div>
      </Badge>
      <Badge color="#AA14F0" offset={[-11, 12]} count={3}>
        <Button
          style={{ fontSize: '1.5rem', color: currentWindow === WINDOW.friends ? '#AA14F0' : 'black' }}
          size="large"
          onClick={() => handleWindow(WINDOW.friends)}
          type="text"
          icon={<TeamOutlined />}
        ></Button>
        <div className={styles.toolName}>Friends</div>
      </Badge>
      <Badge>
        <Button
          style={{ fontSize: '1.5rem', color: currentWindow === WINDOW.addFriends ? '#AA14F0' : 'black' }}
          size="large"
          onClick={() => handleWindow(WINDOW.addFriends)}
          type="text"
          icon={<UsergroupAddOutlined />}
        ></Button>
        <div className={styles.toolName}>Add Friends</div>
      </Badge>
    </div>
  );
};

export default ToolBar;
