import { Spin } from 'antd';
import React, { useEffect, useState } from 'react';

import { FriendDto } from '../../../generated/api';
import api from '../../../utils/api';
import { useChatProvider } from '../context/context';
import styles from '../index.module.scss';
import AddFriends from './addFriends';

const AddFriendsList = () => {
  const [addFriendList, setAddFriendList] = useState<FriendDto[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const { currentSearchedValue } = useChatProvider();
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

  return (
    <React.Fragment>
      {isLoading === true ? (
        <Spin className={styles.loadingSpin} size="large" />
      ) : (
        addFriendList &&
        addFriendList.map((element: FriendDto) => {
          if (
            (currentSearchedValue !== '' &&
              element.firstName.toLowerCase().includes(currentSearchedValue.toLowerCase())) ||
            element.lastName.toLowerCase().includes(currentSearchedValue.toLowerCase())
          ) {
            return <AddFriends deleteUserFromList={deleteUserFromList} key={element.id} data={element} />;
          }
        })
      )}
    </React.Fragment>
  );
};

export default AddFriendsList;
