import { Spin } from 'antd';
import React, { FC } from 'react';

import { FriendDto } from '../../../../generated/api';
import useFriendsList from '../../../../hooks/useFriendsList';
import { useChatProvider } from '../../context/context';
import styles from '../../index.module.scss';
import Friend from '../Friend/friend';
import { FriendsListProps } from './map';

const FriendsList: FC<FriendsListProps> = ({ handleFriendsRequestsCount }) => {
  const { friendsList, isLoading, addFriendRequest, deleteUserFromList } = useFriendsList(handleFriendsRequestsCount);
  const { currentSearchedValue } = useChatProvider();

  return (
    <React.Fragment>
      {isLoading === true ? (
        <Spin className={styles.loadingSpin} size="large" />
      ) : (
        friendsList &&
        friendsList.map((element: FriendDto, index: number) => {
          if (
            (currentSearchedValue !== '' &&
              element.firstName.toLowerCase().includes(currentSearchedValue.toLocaleLowerCase())) ||
            element.lastName.toLowerCase().includes(currentSearchedValue.toLowerCase())
          ) {
            return (
              <Friend
                deleteUserFromList={deleteUserFromList}
                addFriendRequest={addFriendRequest}
                key={index}
                data={element}
              />
            );
          }
        })
      )}
    </React.Fragment>
  );
};

export default FriendsList;
