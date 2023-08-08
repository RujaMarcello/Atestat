import React, { useEffect, useState } from 'react';

import { FriendDto } from '../generated/api';
import api from '../utils/api';

const useAddFriendsList = () => {
  const [addFriendList, setAddFriendList] = useState<FriendDto[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  useEffect(() => {
    const handleAddFriendsList = async () => {
      try {
        setIsLoading(true);
        const response = await api.friend.addFriendListGet({ token: localStorage.getItem('token') || '' });
        setAddFriendList(response.data);
      } catch (error) {
        console.log(error);
      }
      setIsLoading(false);
    };
    handleAddFriendsList();
  }, []);

  const deleteUserFromList = (id: number) => {
    const result = addFriendList.filter((el: FriendDto) => el.id != id);
    setAddFriendList(result);
  };

  return { addFriendList, isLoading, deleteUserFromList };
};

export default useAddFriendsList;
