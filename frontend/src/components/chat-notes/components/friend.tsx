import { CheckOutlined, CloseOutlined } from '@ant-design/icons';
import { Avatar, Button } from 'antd';
import { FC } from 'react';

import styles from '../index.module.scss';
// interface MessageListProps {
//   children?: ReactNode;
// }

const Friend: FC<any> = ({ data, addFriendRequest, deleteUserFromList }) => {
  const acceptFriendRequest = async (id: any) => {
    const URL =
      'http://localhost:3001/api/accept-friend?' +
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
        addFriendRequest(data.id);
      }
    });
  };

  const rejectFriendRequest = async (id: any) => {
    const URL =
      'http://localhost:3001/api/reject-friend?' +
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
    <div className={styles.converationContainer}>
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
                onClick={() => acceptFriendRequest(data.id)}
                style={{ color: 'green', borderColor: 'green' }}
                icon={<CheckOutlined />}
              />
              <Button onClick={() => rejectFriendRequest(data.id)} danger icon={<CloseOutlined />} />
            </div>
          ) : null}
        </div>
        <div className={styles.conversationBorder}></div>
      </div>
    </div>
  );
};

export default Friend;
