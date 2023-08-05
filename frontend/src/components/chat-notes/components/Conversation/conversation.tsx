import { Avatar } from 'antd';
import { FC } from 'react';

import shortTime from '../../../../utils/time';
import styles from '../../index.module.scss';
import { ConversationProps } from './map';

const Conversation: FC<ConversationProps> = ({ lastMessageSentAt, profilePictureUrl, name, lastLineText, onClick }) => {
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
