import { MessageFilled } from '@ant-design/icons';
import { FC, ReactNode } from 'react';

import styles from '../window-chat/index.module.scss';
import { EmptyLayoutProps } from './map';

const WindowChat: FC<EmptyLayoutProps> = ({ children }) => {
  return <MessageFilled className={styles.popup} />;
};

export default WindowChat;
