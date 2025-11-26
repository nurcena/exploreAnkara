// src/components/Response.tsx
import React from 'react';

interface ResponseProps {
  text: string;
}

const Response: React.FC<ResponseProps> = ({ text }) => {
  return (
    <div className="bg-gray-100 p-4 rounded-lg mb-4 max-w-xl self-start">
      <p className="text-gray-800">{text}</p>
    </div>
  );
};

export default Response;
