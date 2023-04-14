import { FC } from 'react';

import styles from '../index.module.scss';
interface MessageProps {
  provider: string;
}
const Message: FC<MessageProps> = ({ provider }) => {
  return (
    <div className={provider === 'user' ? styles.textMessageContainerUser : styles.textMessageContainerPeople}>
      <div className={styles.message}>
        <p>Test trece pe rand nou si nu taie cuvintele e ok totul</p>
        <div className={styles.sentHoure}>00:00</div>
      </div>
    </div>
  );
};

export default Message;
