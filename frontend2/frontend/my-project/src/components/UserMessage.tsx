// src/components/UserMessage.tsx
import React from 'react';

interface UserMessageProps {
  text: string;
}

const UserMessage: React.FC<UserMessageProps> = ({ text }) => {
  return (
    <div className="bg-blue-100 p-4 rounded-lg mb-4 max-w-xl self-end">
      <p className="text-gray-800">{text}</p>
    </div>
  );
};

export default UserMessage;
