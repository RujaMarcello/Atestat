import React, { useEffect, useState } from 'react';

import { ConversationDto } from '../../../generated/api';
import api from '../../../utils/api';
import Conversation from '../components/conversation';
import { useChatProvider } from '../context/context';
import { WINDOW } from '../window';

const ConversationsList = () => {
  const [conversationsList, setConversationsList] = useState<ConversationDto[]>([]);
  const { handleWindow, handleChatId, handleCurrentUserData, currentSearchedValue } = useChatProvider();

  useEffect(() => {
    const handleConversationsList = async () => {
      try {
        const response = await api.friend.getAllConversationsGet({ token: localStorage.getItem('token') || '' });

        setConversationsList(response.data);
      } catch (error) {
        console.log(error);
      }
    };
    handleConversationsList();
  }, []);

  return (
    <React.Fragment>
      {conversationsList &&
        conversationsList.map((el: ConversationDto) => {
          if (
            (currentSearchedValue !== '' && el.firstName?.includes(currentSearchedValue)) ||
            el.lastName?.includes(currentSearchedValue)
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
        })}
    </React.Fragment>
  );
};

export default ConversationsList;
