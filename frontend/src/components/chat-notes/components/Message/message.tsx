import { FC } from 'react';

import { useUserProvider } from '../../../../context/User/User';
import shortTime from '../../../../utils/time';
import styles from '../../index.module.scss';
import { MessageProps } from './map';
const Message: FC<MessageProps> = ({ lineText, userId, time }) => {
  const { user } = useUserProvider();
  const sentByMe = user && user.id?.toString() === userId.toString();

  return (
    <div className={sentByMe ? styles.textMessageContainerUser : styles.textMessageContainerPeople}>
      <div className={styles.message}>
        <p>{lineText}</p>
        <div className={styles.sentHoure}>{shortTime(time)}</div>
      </div>
    </div>
  );
};

export default Message;
