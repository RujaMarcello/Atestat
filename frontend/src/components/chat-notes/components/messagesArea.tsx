import React, { useEffect, useState } from 'react';

import api from '../../../utils/api';
import MessageChatInput from '../chat-footer/chatInput';
import MessageChatHeader from '../chat-header/messageChatHeader';
import { useChatProvider } from '../context/context';
import Messages from './messages';

const MessagesArea = () => {
  const { currentChatId } = useChatProvider();
  const [messages, setMessages] = useState<any>([]);

  useEffect(() => {
    const getMessages = async () => {
      try {
        const response = await api.chat.getMessagesGet({
          chatId: currentChatId,
          token: localStorage.getItem('token') || '',
        });
        setMessages(response.data);
      } catch (error) {
        console.log(error);
      }
    };

    const fetchDataInterval = setInterval(getMessages, 3000);

    return () => clearInterval(fetchDataInterval);
  }, [currentChatId]);

  const sendMessage = async (lineText: string) => {
    const URL =
      `${process.env.REACT_APP_BACKEND_BASE_URL}/send-message?` + new URLSearchParams({ chatId: currentChatId });
    await fetch(URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        token: localStorage.getItem('token') || '',
      },
      body: JSON.stringify({ lineText: lineText }),
    });
  };

  return (
    <React.Fragment>
      <MessageChatHeader />
      <Messages messages={messages} />
      <MessageChatInput onSend={sendMessage} />
    </React.Fragment>
  );
};

export default MessagesArea;
