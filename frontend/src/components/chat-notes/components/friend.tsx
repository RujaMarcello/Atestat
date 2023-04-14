import { CheckOutlined, CloseOutlined } from '@ant-design/icons';
import { Avatar, Button } from 'antd';
import { FC } from 'react';

import { FriendDto } from '../../../generated/api';
import { useChatProvider } from '../context/context';
import styles from '../index.module.scss';
import { WINDOW } from '../window';

interface FriendProps {
  addFriendRequest: (id: number, chatId: number) => void;
  deleteUserFromList: (id: number) => void;
  data: FriendDto;
}

const Friend: FC<FriendProps> = ({ data, addFriendRequest, deleteUserFromList }) => {
  const { handleWindow, handleChatId } = useChatProvider();

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

  return (
    <div
      onClick={() => {
        if (data.status !== 'padding') {
          handleWindow(WINDOW.chat);
          handleChatId(data.chatId?.toString() || '');
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
