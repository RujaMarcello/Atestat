import { CheckOutlined, CloseOutlined } from '@ant-design/icons';
import { Avatar, Button } from 'antd';
import { FC } from 'react';

import useFriend from '../../../../hooks/useFriend';
import { useChatProvider } from '../../context/context';
import styles from '../../index.module.scss';
import { WINDOW } from '../../window';
import { FriendProps } from './map';
const Friend: FC<FriendProps> = ({ data, addFriendRequest, deleteUserFromList }) => {
  const { handleWindow, handleChatId, handleCurrentUserData } = useChatProvider();
  const { acceptFriendRequest, rejectFriendRequest } = useFriend(data, addFriendRequest, deleteUserFromList);

  return (
    <div
      onClick={() => {
        if (data.status !== 'padding') {
          handleWindow(WINDOW.chat);
          handleChatId(data.chatId?.toString() || '');
          handleCurrentUserData({
            name: data.firstName + ' ' + data.lastName,
            profilePictureUrl: data.profilePictureUrl || '',
          });
        }
      }}
      className={styles.converationContainer}
    >
      <div>
        <Avatar size={64} src={data.profilePictureUrl} />
      </div>
      <div className={styles.conversationDataContainer}>
        <div className={styles.converationData}>
          <div>
            <h1>
              <strong>{data.firstName}</strong>
            </h1>
            <p>
              <i>{data.lastName}</i>
            </p>
          </div>
          {data.status === 'padding' ? (
            <div className={styles.frendsRequestOptions}>
              <Button
                onClick={() => acceptFriendRequest(data.id.toString())}
                style={{ color: 'green', borderColor: 'green' }}
                icon={<CheckOutlined />}
              />
              <Button onClick={() => rejectFriendRequest(data.id.toString())} danger icon={<CloseOutlined />} />
            </div>
          ) : null}
        </div>
        <div className={styles.conversationBorder}></div>
      </div>
    </div>
  );
};

export default Friend;
