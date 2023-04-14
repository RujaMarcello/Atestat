import { FC, useState } from 'react';

import ChatContent from './chat-content/chatContent';
import MessageChatInput from './chat-footer/chatInput';
import ToolBar from './chat-footer/toolBar';
import ChatHeader from './chat-header/header';
import MessageChatHeader from './chat-header/messageChatHeader';
import styles from './index.module.scss';
import { WINDOW } from './window';

const Chat: FC = () => {
  const [currentWindow, setCurrentWindos] = useState<string>(WINDOW.conversation);

  const handleWindow = (window: string) => {
    setCurrentWindos(window);
  };

  return (
    <div className={styles.container}>
      {currentWindow === WINDOW.chat ? <MessageChatHeader handleWindow={handleWindow} /> : <ChatHeader />}
      <div className={styles.bodyContainer}>
        <ChatContent handleWindow={handleWindow} currentWindow={currentWindow} />
        {currentWindow === WINDOW.chat ? (
          <MessageChatInput />
        ) : (
          <ToolBar selectedWindow={currentWindow} handleWindow={handleWindow} />
        )}
      </div>
    </div>
  );
};

export default Chat;
