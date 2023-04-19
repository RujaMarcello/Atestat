import React, { useEffect, useState } from 'react';

import { useUserProvider } from '../../../context/User';
import { MessageDto } from '../../../generated/api';
import api from '../../../utils/api';
import { socket } from '../../../utils/socket';
import MessageChatInput from '../chat-footer/chatInput';
import MessageChatHeader from '../chat-header/messageChatHeader';
import { useChatProvider } from '../context/context';
import Messages from './messages';

const MessagesArea = () => {
  const { user } = useUserProvider();
  const { currentChatId } = useChatProvider();
  const [messages, setMessages] = useState<MessageDto[]>([]);
  useEffect(() => {
    socket.emit('join-room', currentChatId);
    socket.on('send-message', (data: MessageDto) => {
      const message = {
        chatId: data.chatId,
        lineText: data.lineText,
        userId: data.userId,
        createAt: data.createAt,
      };
      setMessages((prevMessages: MessageDto[]) => [...prevMessages, message]);
    });
    return () => {
      socket.disconnect();
    };
  }, [currentChatId]);

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

    getMessages();
  }, [currentChatId]);

  const sendMessage = async (lineText: string) => {
    const message = {
      lineText: lineText,
      chatId: currentChatId,
      userId: user?.id !== undefined ? user.id.toString() : undefined,
      createAt: new Date().toISOString(),
    };
    setMessages((prevMessages: MessageDto[]) => {
      return [...prevMessages, message];
    });
    socket.emit('send-message', message);
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
