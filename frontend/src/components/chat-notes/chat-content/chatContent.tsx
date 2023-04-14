import { FC, useEffect, useRef, useState } from 'react';

import api from '../../../utils/api';
import AddFriends from '../components/addFriends';
import Conversation from '../components/conversation';
import Friend from '../components/friend';
import Message from '../components/message';
import styles from '../index.module.scss';
import { WINDOW } from '../window';
interface ChatContentProps {
  currentWindow: string;
  handleWindow: (window: string) => void;
}

const ChatContent: FC<ChatContentProps> = ({ currentWindow, handleWindow }) => {
  const [showScrollbar, setShowScrollbar] = useState<boolean>(true);
  const [data, setData] = useState<any>();
  const deleteUserFromList = (id: any) => {
    const result = data.filter((el: any) => el.id != id);
    setData(result);
  };
  const addFriendRequest = (id: any) => {
    const updatedData = data.map((el: any) => {
      if (el.id === id) {
        return { ...el, status: 'accepted' };
      }
      return el;
    });
    setData(updatedData);
  };

  useEffect(() => {
    switch (currentWindow) {
      case WINDOW.addFriends: {
        const handleAddFriendsList = async () => {
          try {
            const response = await api.chat.addFriendListGet({ token: localStorage.getItem('token') || '' });
            setData(response.data);
          } catch (error) {
            console.log(error);
          }
        };
        handleAddFriendsList();
        break;
      }
      case WINDOW.friends: {
        const URL = 'http://localhost:3001/api/friends-list';
        fetch(URL, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            token: localStorage.getItem('token') || '',
          },
        })
          .then((response) => response.json())
          .then((response) => {
            console.log(response);
            setData(response);
          });
        break;
      }
    }
  }, [currentWindow]);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const handleScroll = () => {
    setShowScrollbar(true);

    clearTimeout(timerRef.current || 0);

    timerRef.current = setTimeout(() => {
      setShowScrollbar(false);
    }, 2000);

    return () => {
      window.removeEventListener('scroll', handleScroll);
      if (timerRef.current !== null) {
        clearTimeout(timerRef.current);
      }
    };
  };
  return (
    <div
      onScroll={handleScroll}
      className={`${currentWindow === WINDOW.chat ? styles.chatContentMessages : styles.chatContentGeneral} ${
        showScrollbar ? '' : styles.hideScrollbar
      }`}
    >
      {currentWindow === WINDOW.chat ? (
        <div>
          <Message provider={'user'} />
          <Message provider={'people'} />
        </div>
      ) : currentWindow === WINDOW.friends ? (
        data &&
        data.map((element: any) => {
          return (
            <Friend
              deleteUserFromList={deleteUserFromList}
              addFriendRequest={addFriendRequest}
              key={element.id}
              data={element}
            />
          );
        })
      ) : currentWindow === WINDOW.addFriends ? (
        data &&
        data.map((element: any) => {
          return <AddFriends deleteUserFromList={deleteUserFromList} key={element.id} data={element} />;
        })
      ) : (
        <Conversation handleWindow={handleWindow} />
      )}
    </div>
  );
};

export default ChatContent;
