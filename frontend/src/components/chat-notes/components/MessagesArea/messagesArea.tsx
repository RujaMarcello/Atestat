import React from 'react';

import useMessagesArea from '../../../../hooks/useMessagesArea';
import MessageChatInput from '../../chat-footer/chatInput';
import MessageChatHeader from '../../chat-header/messageChatHeader';
import Messages from '../Messages/messages';

const MessagesArea = () => {
  const { messages, sendMessage } = useMessagesArea();
  return (
    <React.Fragment>
      <MessageChatHeader />
      <Messages messages={messages} />
      <MessageChatInput onSend={sendMessage} />
    </React.Fragment>
  );
};

export default MessagesArea;
