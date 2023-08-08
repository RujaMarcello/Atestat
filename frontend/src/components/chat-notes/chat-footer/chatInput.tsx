import { ArrowRightOutlined, CameraOutlined, PlusOutlined } from '@ant-design/icons';
import { Button, Input } from 'antd';
import { FC } from 'react';

import useChatFooterInput from '../../../hooks/useChatFooterInput';
import styles from '../index.module.scss';

interface MessageChatInputProps {
  onSend: (text: string) => void;
}

const MessageChatInput: FC<MessageChatInputProps> = ({ onSend }) => {
  const { sendMessage, lineText, handleInputValue, handleKeyDown } = useChatFooterInput(onSend);

  return (
    <div className={styles.messageChatFooterContainer}>
      <Button size="large" style={{ color: '#AA14F0' }} icon={<PlusOutlined />} type="text"></Button>

      <Input
        onKeyDown={handleKeyDown}
        value={lineText}
        onChange={handleInputValue}
        suffix={
          <Button style={{ color: '#AA14F0' }} onClick={sendMessage} type="text" icon={<ArrowRightOutlined />}></Button>
        }
        size="large"
        style={{ borderRadius: '20px' }}
      />

      <Button size="large" style={{ color: '#AA14F0' }} icon={<CameraOutlined />} type="text"></Button>
    </div>
  );
};

export default MessageChatInput;
