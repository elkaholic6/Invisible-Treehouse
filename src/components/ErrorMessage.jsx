import React from 'react';

const ErrorMessage = ({ message }) => {
    function extractErrorMessage(error) {
        const startIndex = message.indexOf('execution reverted:');
        const endIndex = message.indexOf('"', startIndex);
      
        if (startIndex !== -1 && endIndex !== -1) {
          return message.slice(startIndex + 20, endIndex);
        }
      
        return 'An error occurred while processing your request.';
      }
      
  return (
    <div className="flex flex-col justify-center items-center text-red-500 text-xs">
      {extractErrorMessage(message)}
    </div>
  );
};

export default ErrorMessage;