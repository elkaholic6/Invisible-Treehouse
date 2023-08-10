import React from 'react';
import CustomSeekbar from './CustomSeekbar';
import 'tailwindcss/tailwind.css';

const Seekbar = ({ value, min, max, onInput, appTime, seekvalue, isSeeking, onChange, onSeekEnd, onSeekStart }) => {
  const formatTime = (time) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60).toString().padStart(2, '0');
    return `${minutes}:${seconds}`;
  };


  return (
    <div className="flex flex-row items-center">
      <p className={`${window.innerWidth < 350 ? 'text-xs' : 'text-sm'} text-white`}>{value === 0 ? '0:00' : formatTime(value)}</p>
      <CustomSeekbar
        step="any"
        min={min}
        max={max}
        seekvalue={seekvalue}
        onChange={onChange}
        value={value}
        onSeekEnd={onSeekEnd}
        onSeekStart={onSeekStart}
        className="md:block w-24 md:w-56 2xl:w-96 h-1 mx-4 2xl:mx-6 rounded-lg cursor-pointer"
      />
      <p className={`${window.innerWidth < 350 ? 'text-xs' : 'text-sm'} text-white`}>{max === 0 ? '0:00' : formatTime(max)}</p>
    </div>
  );
};

export default Seekbar;
