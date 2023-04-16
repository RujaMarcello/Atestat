import React, { FC, useEffect, useRef, useState } from 'react';

import { MessageDto } from '../../../generated/api';
import styles from '../index.module.scss';
import Message from './message';
interface MessagesProps {
  messages: any;
}

const Messages: FC<any> = ({ messages }) => {
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

  const messagesList = messages.map((el: MessageDto) => {
    return <Message key={el.id} lineText={el.lineText} userId={el.userId} time={el.createAt} />;
  });

  return (
    <div
      ref={allMessagesRef}
      onScroll={handleScroll}
      className={`${styles.chatContentMessages} ${showScrollbar ? '' : styles.hideScrollbar}`}
    >
      {messagesList}
    </div>
  );
};

export default Messages;
