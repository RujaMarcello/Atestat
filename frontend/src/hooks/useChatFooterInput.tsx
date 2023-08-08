import React, { useState } from 'react';

const useChatFooterInput = (onSend: (text: string) => void) => {
  const [lineText, setLineText] = useState<string>('');

  const handleInputValue = (event: any) => {
    setLineText(event.target.value);
  };

  const sendMessage = () => {
    onSend(lineText);
    setLineText('');
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (!lineText.trim()) {
      return;
    }
    if (event.key === 'Enter') {
      event.preventDefault();
      onSend(lineText);
      setLineText('');
    }
  };

  return { sendMessage, lineText, handleInputValue, handleKeyDown };
};

export default useChatFooterInput;
