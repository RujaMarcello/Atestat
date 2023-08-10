import React, { useEffect, useState } from 'react';

import { ConversationDto } from '../generated/api';
import api from '../utils/api';
const useConversationList = () => {
  const [conversationsList, setConversationsList] = useState<ConversationDto[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  useEffect(() => {
    const handleConversationsList = async () => {
      try {
        setLoading(true);
        const response = await api.friend.getAllConversationsGet({ token: localStorage.getItem('token') || '' });
        setConversationsList(response.data);
      } catch (error) {
        setLoading(false);
        console.log(error);
      }
      setLoading(false);
    };

    handleConversationsList();
  }, []);
  return { conversationsList, loading };
};

export default useConversationList;
