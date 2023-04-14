import React, { useEffect, useState } from 'react';

import { ConversationDto } from '../../../generated/api';
import api from '../../../utils/api';
import Conversation from '../components/conversation';

const ConversationsList = () => {
  const [conversationsList, setConversationsList] = useState<ConversationDto[]>([]);

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
          return (
            <Conversation
              lastLineText={el.lastLineText}
              lastMessageSentAt={el.lastSentMessage}
              profilePictureUrl={'groupName' in el ? el.groupPicture || '' : el.profilePictureUrl || ''}
              name={'groupName' in el ? el.groupName || '' : el.firstName || ''}
              key={el.chatId}
            />
          );
        })}
    </React.Fragment>
  );
};

export default ConversationsList;
