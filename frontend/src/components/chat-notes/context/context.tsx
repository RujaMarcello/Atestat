import { createContext, FC, ReactNode, useContext, useState } from 'react';

import { WINDOW } from '../window';

interface CurrentUserData {
  name: string;
  profilePictureUrl: string;
}

interface ChatContextInterface {
  handleWindow: (currentWindow: WINDOW) => void;
  currentWindow: WINDOW;
  currentChatId: string;
  handleChatId: (currentChatId: string) => void;
  currentUserData: CurrentUserData;
  handleCurrentUserData: (user: CurrentUserData) => void;
  isSortApplied: boolean;
  handleSort: (isSortApplied: boolean) => void;
}

const defaultChatValues: ChatContextInterface = {
  currentWindow: WINDOW.conversation,
  handleWindow(): void {},
  currentChatId: '',
  handleChatId(): void {},
  currentUserData: {
    name: '',
    profilePictureUrl: '',
  },
  handleCurrentUserData(): void {},
  isSortApplied: false,
  handleSort(): void {},
};

export const ChatContext = createContext<ChatContextInterface>(defaultChatValues);

interface ChatProviderProps {
  children: ReactNode;
}

const ChatProvider: FC<ChatProviderProps> = ({ children }) => {
  const [currentWindow, setCurrentWindow] = useState<WINDOW>(WINDOW.conversation);
  const [currentChatId, setCurrentChatId] = useState<string>('');
  const [currentUserData, setCurrentUserData] = useState<CurrentUserData>(defaultChatValues.currentUserData);
  const [isSortApplied, setIsSortApplied] = useState<boolean>(false);
  const handleWindow = (window: WINDOW) => {
    setCurrentWindow(window);
    setCurrentChatId('');
  };

  const handleSort = (isSortUses: boolean) => {
    setIsSortApplied(isSortUses);
  };

  const handleChatId = (chatId: string) => {
    setCurrentChatId(chatId);
  };

  const handleCurrentUserData = (user: CurrentUserData) => {
    setCurrentUserData(user);
  };

  return (
    <ChatContext.Provider
      value={{
        handleSort,
        isSortApplied,
        currentUserData,
        handleCurrentUserData,
        currentChatId,
        handleChatId,
        currentWindow,
        handleWindow,
      }}
    >
      {children}
    </ChatContext.Provider>
  );
};

export default ChatProvider;
export const useChatProvider = (): ChatContextInterface => useContext(ChatContext);
