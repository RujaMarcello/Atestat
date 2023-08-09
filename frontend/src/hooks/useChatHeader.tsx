import React from 'react';

import { useChatProvider } from '../components/chat-notes/context/context';

const useChatHeader = () => {
  const { handleCurrentSearchedValue } = useChatProvider();

  const handleInputValue = (event: React.ChangeEvent<HTMLInputElement>) => {
    handleCurrentSearchedValue(event.target.value);
  };
  return { handleInputValue };
};

export default useChatHeader;
