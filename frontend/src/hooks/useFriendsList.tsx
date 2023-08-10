import React, { useEffect, useState } from 'react';

import { useChatProvider } from '../components/chat-notes/context/context';
import { FriendDto } from '../generated/api';
import api from '../utils/api';

const useFriendsList = (handleFriendsRequestsCount: (count: number) => void) => {
  const [friendsList, setFriendsList] = useState<FriendDto[]>([]);
  const { isSortApplied } = useChatProvider();
  const [isLoading, setIsLoading] = useState<boolean>(false);

  useEffect(() => {
    const count = friendsList.filter((friend) => friend.status === 'padding').length;
    handleFriendsRequestsCount(count);
  }, [friendsList, handleFriendsRequestsCount]);

  useEffect(() => {}, [isSortApplied]);
  useEffect(() => {
    const handleFriendsList = async () => {
      try {
        setIsLoading(true);
        const response = await api.friend.friendsListGet({ token: localStorage.getItem('token') || '' });
        if (isSortApplied) {
          const sortedResponse = response.data.sort((a, b) => {
            if (a.status === 'padding' && b.status !== 'padding') {
              return -1;
            } else {
              return 1;
            }
          });
          setFriendsList(sortedResponse);
        } else {
          setFriendsList(response.data);
        }
      } catch (error) {
        console.log(error);
      }
      setIsLoading(false);
    };
    handleFriendsList();
  }, [isSortApplied]);

  const addFriendRequest = (id: number, chatId: number) => {
    const updatedData = friendsList.map((el: FriendDto) => {
      if (el.id === id) {
        return { ...el, status: 'accepted', chatId: chatId };
      }
      return el;
    });
    setFriendsList(updatedData);
  };

  const deleteUserFromList = (id: number) => {
    const result = friendsList.filter((el: FriendDto) => el.id != id);
    setFriendsList(result);
  };
  return { friendsList, isLoading, addFriendRequest, deleteUserFromList };
};

export default useFriendsList;
