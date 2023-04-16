import React, { FC, useEffect, useState } from 'react';

import { FriendDto } from '../../../generated/api';
import api from '../../../utils/api';
import Friend from './friend';

interface FriendsListProps {
  handleFriendsRequestsCount: (count: number) => void;
}

const FriendsList: FC<FriendsListProps> = ({ handleFriendsRequestsCount }) => {
  const [friendsList, setFriendsList] = useState<FriendDto[]>([]);

  useEffect(() => {
    const count = friendsList.filter((friend) => friend.status === 'padding').length;

    handleFriendsRequestsCount(count);
  }, [friendsList, handleFriendsRequestsCount]);

  useEffect(() => {
    const handleFriendsList = async () => {
      try {
        const response = await api.friend.friendsListGet({ token: localStorage.getItem('token') || '' });
        setFriendsList(response.data);
      } catch (error) {
        console.log(error);
      }
    };
    handleFriendsList();
  }, []);

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

  return (
    <React.Fragment>
      {friendsList &&
        friendsList.map((element: FriendDto) => {
          return (
            <Friend
              deleteUserFromList={deleteUserFromList}
              addFriendRequest={addFriendRequest}
              key={element.id}
              data={element}
            />
          );
        })}
    </React.Fragment>
  );
};

export default FriendsList;
