import { FC } from 'react';

import ChatContent from './chat-content/chatContent';
import ChatProvider from './context/context';

const Chat: FC = () => {
  return (
    <ChatProvider>
      <ChatContent />
    </ChatProvider>
  );
};

export default Chat;
