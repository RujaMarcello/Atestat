import { CheckOutlined, CloseOutlined } from '@ant-design/icons';
import { Avatar, Badge, Button } from 'antd';
import { FC } from 'react';

import styles from './index.module.scss';
// interface MessageListProps {
//   children?: ReactNode;
// }

const FriendsList: FC = () => {
  return (
    <div className={styles.converationContainer}>
      <div>
        <Avatar size={64} src="https://i.imgur.com/KniTFHh.jpg" />
      </div>
      <div className={styles.conversationDataContainer}>
        <div className={styles.converationData}>
          <div>
            <h1>
              <strong>Ruja Marcello</strong>
            </h1>
            <p>
              <i>rujamarcello@yahoo.com</i>
            </p>
          </div>
          <div className={styles.frendsRequestOptions}>
            <Button danger icon={<CloseOutlined />} />
            <Button style={{ marginLeft: '15px', color: 'green', borderColor: 'green' }} icon={<CheckOutlined />} />
          </div>
        </div>
        <div className={styles.conversationBorder}></div>
      </div>
    </div>
  );
};

export default FriendsList;