import React, { FC } from 'react';

import useChatContent from '../../../hooks/useChatContent';
import ToolBar from '../chat-footer/toolBar';
import ChatHeader from '../chat-header/header';
import AddFriendsList from '../components/AddFriendList/addFriendsList';
import ConversationsList from '../components/ConversationsList/conversationsList';
import FriendsList from '../components/FriendsList/friendsList';
import MessagesArea from '../components/MessagesArea/messagesArea';
import styles from '../index.module.scss';
import { WINDOW } from '../window';
const ChatContent: FC = () => {
  const { currentWindow, showScrollbar, friendsRequestsCount, handleFriendsRequestsCount, handleScroll } =
    useChatContent();

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
                <FriendsList handleFriendsRequestsCount={handleFriendsRequestsCount} />
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
