import React, { useEffect, useState } from 'react';

import { useChatProvider } from '../components/chat-notes/context/context';
import { useUserProvider } from '../context/User';
import { MessageDto } from '../generated/api';
import api from '../utils/api';
import { socket } from '../utils/socket';

const useMessagesArea = () => {
  const { user } = useUserProvider();
  const { currentChatId } = useChatProvider();
  const [messages, setMessages] = useState<MessageDto[]>([]);

  useEffect(() => {
    socket.connect();

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
    const message: MessageDto = {
      chatId: currentChatId,
      lineText: lineText,
      userId: user?.id ?? null,
      createAt: new Date().toISOString(),
    };
    setMessages((prevMessages: MessageDto[]) => [...prevMessages, message]);
    socket.emit('send-message', message);
  };

  return { messages, sendMessage };
};

export default useMessagesArea;
