import { ArrowRightOutlined, CameraOutlined, PlusOutlined } from '@ant-design/icons';
import { Button, Input } from 'antd';
import { FC, useState } from 'react';

import styles from '../index.module.scss';

interface MessageChatInputProps {
  onSend: (text: string) => void;
}

const MessageChatInput: FC<MessageChatInputProps> = ({ onSend }) => {
  const [lineText, setLineText] = useState<string>('');

  const handleInputValue = (event: any) => {
    setLineText(event.target.value);
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (!lineText.trim()) {
      return;
    }
    if (event.key === 'Enter') {
      event.preventDefault();
      onSend(lineText);
      setLineText('');
    }
  };

  return (
    <div className={styles.messageChatFooterContainer}>
      <Button size="large" style={{ color: '#AA14F0' }} icon={<PlusOutlined />} type="text"></Button>

      <Input
        onKeyDown={handleKeyDown}
        value={lineText}
        onChange={handleInputValue}
        suffix={
          <Button
            style={{ color: '#AA14F0' }}
            onClick={() => {
              onSend(lineText);
              setLineText('');
            }}
            type="text"
            icon={<ArrowRightOutlined />}
          ></Button>
        }
        size="large"
        style={{ borderRadius: '20px' }}
      />

      <Button size="large" style={{ color: '#AA14F0' }} icon={<CameraOutlined />} type="text"></Button>
    </div>
  );
};

export default MessageChatInput;
