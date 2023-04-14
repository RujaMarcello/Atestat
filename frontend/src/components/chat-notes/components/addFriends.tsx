import { UserAddOutlined } from '@ant-design/icons';
import { Avatar, Button } from 'antd';
import { FC } from 'react';

import { FriendDto } from '../../../generated/api';
import styles from '../index.module.scss';
interface AddFriendsProps {
  data: FriendDto;
  deleteUserFromList: (id: number) => void;
}
const AddFriends: FC<AddFriendsProps> = ({ data, deleteUserFromList }) => {
  const sendFriendRequest = async (id: string) => {
    const URL =
      'http://localhost:3001/api/add-friend?' +
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
              <i>{data.email}</i>
            </p>
          </div>
          <div className={styles.frendsRequestOptions}>
            <Button
              onClick={() => sendFriendRequest(data.id.toString())}
              size="large"
              type="text"
              icon={<UserAddOutlined />}
            />
          </div>
        </div>
        <div className={styles.conversationBorder}></div>
      </div>
    </div>
  );
};

export default AddFriends;
