import React, { FC } from 'react';

import { MessageDto } from '../../../../generated/api';
import useMessages from '../../../../hooks/useMessages';
import styles from '../../index.module.scss';
interface MessagesProps {
  messages: MessageDto[];
}

const Messages: FC<MessagesProps> = ({ messages }) => {
  const { showScrollbar, allMessagesRef, messagesList, handleScroll } = useMessages(messages);

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
