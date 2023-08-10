import { Spin } from 'antd';
import React from 'react';

import { FriendDto } from '../../../../generated/api';
import useAddFriendsList from '../../../../hooks/useAddFriendsList';
import { useChatProvider } from '../../context/context';
import styles from '../../index.module.scss';
import AddFriends from '../AddFriends/addFriends';

const AddFriendsList = () => {
  const { addFriendList, isLoading, deleteUserFromList } = useAddFriendsList();
  const { currentSearchedValue } = useChatProvider();

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
