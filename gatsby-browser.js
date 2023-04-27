import React from 'react';
import Chatbot from './src/components/Chatbot';

export const wrapPageElement = ({ element }) => {
  return (
    <>
      {element}
      <Chatbot />
    </>
  );
};