import { FilterOutlined, SearchOutlined } from '@ant-design/icons';
import { Button, Input } from 'antd';
import { FC, ReactNode, useState } from 'react';

import { useChatProvider } from '../context/context';
import styles from '../index.module.scss';
interface ChatHeaderProps {
  children?: ReactNode;
}

const ChatHeader: FC<ChatHeaderProps> = () => {
  const [isPressed, setIsPressed] = useState(false);
  const { currentSearchedValue } = useChatProvider();
  const { handleCurrentSearchedValue } = useChatProvider();
  const handleFilterClick = () => {
    setIsPressed(!isPressed);
  };

  const handleInputValue = (event: React.ChangeEvent<HTMLInputElement>) => {
    handleCurrentSearchedValue(event.target.value);
  };

  return (
    <div className={styles.conversationHeader}>
      <h1 className={styles.title}>Chat</h1>
      <div className={styles.searchBar}>
        <Input
          defaultValue={currentSearchedValue}
          onChange={handleInputValue}
          size="large"
          style={{ borderRadius: '5x', marginTop: '15px' }}
          prefix={<SearchOutlined />}
          placeholder="Search"
        />

        <Button
          style={{
            color: isPressed ? 'white' : '#AA14F0',
            backgroundColor: isPressed ? '#AA14F0' : '#EEEEEE',
            marginLeft: '5px',
            marginTop: '18px',
          }}
          type="text"
          onClick={handleFilterClick}
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
