import React from 'react';

import { FriendDto } from '../generated/api';

const useFriend = (
  data: FriendDto,
  addFriendRequest: (id: number, chatId: number) => void,
  deleteUserFromList: (id: number) => void,
) => {
  const acceptFriendRequest = async (id: string) => {
    const URL =
      `${process.env.REACT_APP_BACKEND_BASE_URL}/accept-friend?` +
      new URLSearchParams({
        friendId: id,
      });
    fetch(URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        token: localStorage.getItem('token') || '',
      },
    }).then(async (response) => {
      const res = await response.json();

      if (response.status == 200) {
        addFriendRequest(data.id, res.chatId);
      }
    });
  };

  const rejectFriendRequest = async (id: string) => {
    const URL =
      `${process.env.REACT_APP_BACKEND_BASE_URL}/reject-friend?` +
      new URLSearchParams({
        friendId: id,
      });
    fetch(URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        token: localStorage.getItem('token') || '',
      },
    }).then((response) => {
      if (response.status == 200) {
        deleteUserFromList(data.id);
      }
    });
  };

  return { acceptFriendRequest, rejectFriendRequest };
};

export default useFriend;
