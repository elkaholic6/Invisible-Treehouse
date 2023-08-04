import React from 'react';

const ConsoleLogMessage = ({ message }) => {
  return (
    <div className="flex flex-col justify-center items-center text-red-500 text-xs">
      {message}
    </div>
  );
};

export default ConsoleLogMessage;