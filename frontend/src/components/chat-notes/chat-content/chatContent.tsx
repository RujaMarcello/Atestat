import React, { FC, useEffect, useRef, useState } from 'react';

import api from '../../../utils/api';
import ToolBar from '../chat-footer/toolBar';
import ChatHeader from '../chat-header/header';
import AddFriendsList from '../components/addFriendsList';
import ConversationsList from '../components/conversationsList';
import FriendList from '../components/friendsList';
import MessagesArea from '../components/messagesArea';
import { useChatProvider } from '../context/context';
import styles from '../index.module.scss';
import { WINDOW } from '../window';

const ChatContent: FC = () => {
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

  return (
    <React.Fragment>
      <div className={styles.container}>
        {currentWindow !== WINDOW.chat && (
          <>
            <ChatHeader />
            <div
              onScroll={handleScroll}
              className={`${styles.chatContentGeneral} ${showScrollbar ? '' : styles.hideScrollbar}`}
            >
              {currentWindow === WINDOW.friends && (
                <FriendList handleFriendsRequestsCount={handleFriendsRequestsCount} />
              )}
              {currentWindow === WINDOW.addFriends && <AddFriendsList />}
              {currentWindow === WINDOW.conversation && <ConversationsList />}
            </div>
            <ToolBar friendsRequestCount={friendsRequestsCount} />
          </>
        )}
        {currentWindow === WINDOW.chat && <MessagesArea />}
      </div>
    </React.Fragment>
  );
};

export default ChatContent;
