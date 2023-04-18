import { FilterOutlined, SearchOutlined } from '@ant-design/icons';
import { Button, Input } from 'antd';
import { FC, ReactNode } from 'react';

import { useChatProvider } from '../context/context';
import styles from '../index.module.scss';
interface ChatHeaderProps {
  children?: ReactNode;
}

const ChatHeader: FC<ChatHeaderProps> = () => {
  const { handleSort, isSortApplied } = useChatProvider();

  return (
    <div className={styles.conversationHeader}>
      <h1 className={styles.title}>Chat</h1>
      <div className={styles.searchBar}>
        <Input
          size="large"
          style={{ borderRadius: '5x', marginTop: '15px' }}
          prefix={<SearchOutlined />}
          placeholder="Search"
        />

        <Button
          style={{
            color: isSortApplied ? 'white' : '#AA14F0',
            backgroundColor: isSortApplied ? '#AA14F0' : '#EEEEEE',
            marginLeft: '5px',
            marginTop: '18px',
          }}
          type="text"
          onClick={() => handleSort(!isSortApplied)}
          shape="circle"
          icon={<FilterOutlined />}
        />
      </div>
      <div className={styles.utils}>
        <Button style={{ color: '#AA14F0', marginBottom: '5px' }} size="large" type="text">
          New Group
        </Button>
      </div>
    </div>
  );
};

export default ChatHeader;
