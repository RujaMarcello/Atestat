import { Spin } from 'antd';
import React from 'react';

import { ConversationDto } from '../../../generated/api';
import useConversationList from '../../../hooks/useConversationList';
import Conversation from '../components/conversation';
import { useChatProvider } from '../context/context';
import styles from '../index.module.scss';
import { WINDOW } from '../window';

const ConversationsList = () => {
  const { conversationsList, loading } = useConversationList();
  const { handleWindow, handleChatId, handleCurrentUserData, currentSearchedValue } = useChatProvider();

  return (
    <React.Fragment>
      {loading === true ? (
        <Spin className={styles.loadingSpin} size="large" />
      ) : (
        conversationsList &&
        conversationsList.map((el: ConversationDto) => {
          if (
            (currentSearchedValue !== '' &&
              el.firstName?.toLowerCase().includes(currentSearchedValue.toLocaleLowerCase())) ||
            el.lastName?.toLowerCase().includes(currentSearchedValue.toLocaleLowerCase())
          ) {
            return (
              <Conversation
                onClick={() => {
                  handleWindow(WINDOW.chat);
                  handleChatId(el.chatId.toString() || '');
                  handleCurrentUserData({
                    name: el.firstName + ' ' + el.lastName,
                    profilePictureUrl: el.profilePictureUrl || '',
                  });
                }}
                lastLineText={el.lastLineText}
                lastMessageSentAt={el.lastSentMessage}
                profilePictureUrl={el.profilePictureUrl || ''}
                name={'groupName' in el ? el.groupName || '' : el.firstName + ' ' + el.lastName}
                key={el.chatId}
              />
            );
          }
        })
      )}
    </React.Fragment>
  );
};

export default ConversationsList;
