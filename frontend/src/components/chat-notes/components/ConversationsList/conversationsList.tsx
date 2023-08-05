import { Spin } from 'antd';
import React, { useEffect, useState } from 'react';

import { ConversationDto } from '../../../../generated/api';
import api from '../../../../utils/api';
import { useChatProvider } from '../../context/context';
import styles from '../../index.module.scss';
import { WINDOW } from '../../window';
import Conversation from '../Conversation/conversation';

const ConversationsList = () => {
  const [conversationsList, setConversationsList] = useState<ConversationDto[]>([]);
  const { handleWindow, handleChatId, handleCurrentUserData, currentSearchedValue } = useChatProvider();
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
