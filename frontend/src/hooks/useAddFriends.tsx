import React from 'react';

const useAddFriends = (deleteUserFromList: (id: number) => void) => {
  const sendFriendRequest = async (id: string) => {
    const URL =
      `${process.env.REACT_APP_BACKEND_BASE_URL}/add-friend?` +
      new URLSearchParams({
        friendId: id,
      });
    fetch(URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        token: localStorage.getItem('token') || '',
      },
    }).then((res) => {
      if (res.status === 200) {
        deleteUserFromList(parseInt(id));
      }
    });
  };

  return { sendFriendRequest };
};

export default useAddFriends;
