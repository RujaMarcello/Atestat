import React, { useEffect, useState } from 'react';

import { FriendDto } from '../../../generated/api';
import api from '../../../utils/api';
import AddFriends from './addFriends';

const AddFriendsList = () => {
  const [addFriendList, setAddFriendList] = useState<FriendDto[]>([]);

  useEffect(() => {
    const handleAddFriendsList = async () => {
      try {
        const response = await api.friend.addFriendListGet({ token: localStorage.getItem('token') || '' });
        setAddFriendList(response.data);
      } catch (error) {
        console.log(error);
      }
    };
    handleAddFriendsList();
  }, []);

  const deleteUserFromList = (id: number) => {
    const result = addFriendList.filter((el: FriendDto) => el.id != id);
    setAddFriendList(result);
  };

  return (
    <React.Fragment>
      {addFriendList &&
        addFriendList.map((element: FriendDto) => {
          return <AddFriends deleteUserFromList={deleteUserFromList} key={element.id} data={element} />;
        })}
    </React.Fragment>
  );
};

export default AddFriendsList;