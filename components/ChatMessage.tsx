import React from 'react';
import { Message, Sender } from '../types';

interface ChatMessageProps {
  message: Message;
}

const ChatMessage: React.FC<ChatMessageProps> = ({ message }) => {
  const isUser = message.sender === Sender.USER;
  const isError = message.isError;

  // Function to convert basic markdown-like syntax to HTML specifically for line breaks and lists
  // For a full markdown support we would use a library like react-markdown, 
  // but for this task simple formatting is sufficient.
  const formatText = (text: string) => {
    return text.split('\n').map((line, i) => (
      <React.Fragment key={i}>
        {line}
        <br />
      </React.Fragment>
    ));
  };

  return (
    <div
      className={`flex w-full mb-4 ${
        isUser ? 'justify-end' : 'justify-start'
      }`}
    >
      <div
        className={`max-w-[85%] md:max-w-[70%] px-5 py-3.5 shadow-sm rounded-3xl text-[15px] leading-relaxed ${
          isError 
            ? 'bg-red-50 text-red-600 border border-red-200 rounded-br-none'
            : isUser
            ? 'bg-sky-100 text-sky-900 rounded-br-none border border-sky-200'
            : 'bg-joy-100 text-joy-900 border border-joy-200 rounded-bl-none'
        }`}
      >
        <div className="break-words">
          {formatText(message.text)}
        </div>
        <div
          className={`text-[10px] mt-2 opacity-70 ${
            isUser ? 'text-joy-100 text-right' : 'text-calm-400 text-left'
          }`}
        >
          {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </div>
      </div>
    </div>
  );
};

export default ChatMessage;
