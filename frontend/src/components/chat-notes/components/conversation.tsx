import { Avatar, Badge } from 'antd';
import { FC } from 'react';

import shortTime from '../../../utils/time';
import styles from '../index.module.scss';

interface ConvarasationProps {
  name: string;
  lastMessageSentAt: string;
  profilePictureUrl: string;
  lastLineText: string;
  onClick?: () => void;
}

const Conversation: FC<ConvarasationProps> = ({
  lastMessageSentAt,
  profilePictureUrl,
  name,
  lastLineText,
  onClick,
}) => {
  const handleClick = () => {
    if (onClick) {
      onClick();
    }
  };

  return (
    <div onClick={handleClick} className={styles.converationContainer}>
      <div>
        <Avatar size={64} src={profilePictureUrl} />
      </div>
      <div className={styles.conversationDataContainer}>
        <div className={styles.converationData}>
          <div>
            <h1>
              <strong>{name}</strong>
            </h1>
            <p>
              <i>{lastLineText}</i>
            </p>
          </div>
          <div className={styles.converationTime}>
            <p>{shortTime(lastMessageSentAt)}</p>
          </div>
        </div>
        <div className={styles.conversationBorder}></div>
      </div>
    </div>
  );
};

export default Conversation;
