import React, { useEffect, useRef, useState } from 'react';

import { useChatProvider } from '../components/chat-notes/context/context';
import api from '../utils/api';
const useChatContent = () => {
  const { currentWindow } = useChatProvider();
  const [showScrollbar, setShowScrollbar] = useState<boolean>(true);
  const [friendsRequestsCount, setFriendsRequestsCount] = useState(0);

  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const handleFriendsRequestsCount = (count: number) => {
    setFriendsRequestsCount(count);
  };

  const handleScroll = () => {
    setShowScrollbar(true);

    clearTimeout(timerRef.current || 0);

    timerRef.current = setTimeout(() => {
      setShowScrollbar(false);
    }, 2000);

    return () => {
      window.removeEventListener('scroll', handleScroll);
      if (timerRef.current !== null) {
        clearTimeout(timerRef.current);
      }
    };
  };

  useEffect(() => {
    const handleCounts = async () => {
      const response = await api.chat.getToolbarCountsGet({ token: localStorage.getItem('token') || '' });

      setFriendsRequestsCount(response.data);
    };
    handleCounts();
  }, []);

  return { currentWindow, showScrollbar, friendsRequestsCount, handleFriendsRequestsCount, handleScroll };
};

export default useChatContent;
