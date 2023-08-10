import React, { useEffect, useRef, useState } from 'react';

import Message from '../components/chat-notes/components/Message/message';
import { MessageDto } from '../generated/api';

const useMessages = (messages: MessageDto[]) => {
  const [showScrollbar, setShowScrollbar] = useState<boolean>(true);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const allMessagesRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (allMessagesRef.current) {
      allMessagesRef.current.scrollTop = allMessagesRef.current.scrollHeight;
    }
  }, [messages]);

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

  const messagesList = messages.map((el: MessageDto, index: number) => {
    return <Message key={index} lineText={el.lineText} userId={el.userId?.toString()} time={el.createAt} />;
  });

  return { showScrollbar, allMessagesRef, messagesList, handleScroll };
};

export default useMessages;
