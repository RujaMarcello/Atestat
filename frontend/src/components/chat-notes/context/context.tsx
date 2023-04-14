import { createContext, FC, ReactNode, useContext, useState } from 'react';

import { WINDOW } from '../window';

interface ChatContextInterface {
  handleWindow: (currentWindow: WINDOW) => void;
  currentWindow: WINDOW;
  currentChatId: string;
  handleChatId: (currentChatId: string) => void;
}

const defaultChatValues: ChatContextInterface = {
  currentWindow: WINDOW.conversation,
  handleWindow(): void {},
  currentChatId: '',
  handleChatId(): void {},
};

export const ChatContext = createContext<ChatContextInterface>(defaultChatValues);

interface ChatProviderProps {
  children: ReactNode;
}

const ChatProvider: FC<ChatProviderProps> = ({ children }) => {
  const [currentWindow, setCurrentWindow] = useState<WINDOW>(WINDOW.conversation);
  const [currentChatId, setCurrentChatId] = useState<string>('');
  const handleWindow = (window: WINDOW) => {
    setCurrentWindow(window);
    setCurrentChatId('');
  };

  const handleChatId = (chatId: string) => {
    setCurrentChatId(chatId);
  };

  return (
    <ChatContext.Provider value={{ currentChatId, handleChatId, currentWindow, handleWindow }}>
      {children}
    </ChatContext.Provider>
  );
};

export default ChatProvider;
export const useChatProvider = (): ChatContextInterface => useContext(ChatContext);
