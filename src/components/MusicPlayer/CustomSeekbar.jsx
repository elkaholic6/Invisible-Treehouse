import React, { useRef, useState } from 'react';

const CustomSeekbar = ({ value, min, max, onChange, onSeekStart, onSeekEnd }) => {
  const trackRef = useRef(null);
  const [isDragging, setIsDragging] = useState(false);

  const trackWidth = 100;
  const thumbSize = 12;
  const thumbPosition = ((value - min) / (max - min)) * trackWidth;

  const handleMouseDown = () => {
    setIsDragging(true);
    onSeekStart(true);
    trackRef.current.addEventListener('mousemove', handleMouseMove);
    trackRef.current.addEventListener('mouseup', handleMouseUp);
  };

  const handleMouseUp = () => {
    setIsDragging(false);
    onSeekEnd(false);
    trackRef.current.removeEventListener('mousemove', handleMouseMove);
    trackRef.current.removeEventListener('mouseup', handleMouseUp);
  };

  const handleMouseMove = (event) => {
    const trackRect = trackRef.current.getBoundingClientRect();
    const clickX = event.clientX - trackRect.left;
    const clickPercentage = (clickX / trackRect.width) * 100;
    let newValue = (clickPercentage * (max - min)) / 100 + min;
    newValue = Math.min(Math.max(newValue, min), max);
    onChange(newValue);
  };

  const handleTouchStart = (event) => {
    setIsDragging(true);
    onSeekStart(true);
    trackRef.current.addEventListener('touchmove', handleTouchMove, { passive: false });
    trackRef.current.addEventListener('touchend', handleTouchEnd);
  };

  const handleTouchEnd = () => {
    setIsDragging(false);
    onSeekEnd(false);
    trackRef.current.removeEventListener('touchmove', handleTouchMove);
    trackRef.current.removeEventListener('touchend', handleTouchEnd);
  };

  const handleTouchMove = (event) => {
    const trackRect = trackRef.current.getBoundingClientRect();
    const touchX = event.touches[0].clientX - trackRect.left;
    const touchPercentage = (touchX / trackRect.width) * 100;
    let newValue = (touchPercentage * (max - min)) / 100 + min;
    newValue = Math.min(Math.max(newValue, min), max);
    onChange(newValue);
  };

  return (
    <div className="flex flex-row items-center">
      <div
        ref={trackRef}
        className="md:block w-24 md:w-56 2xl:w-96 h-1 mx-4 2xl:mx-6 rounded-lg bg-gray-300"
        style={{ 
          position: 'relative', 
          cursor: 'pointer',
        }}
        onMouseDown={handleMouseDown}
        onTouchStart={handleTouchStart}
      >
        <div
          className="h-full bg-red-500"
          style={{
            width: `${((value - min) / (max - min)) * 100}%`,
            position: 'absolute',
            top: 0,
            left: 0,
          }}
        ></div>
        <div
          className="h-5 w-5 2xl:h-6 2xl:w-6 bg-red-500 rounded-full"
          style={{
            position: `absolute`,
            top: '50%',
            left: `${thumbPosition - thumbSize / 2}%`,
            transform: `translateY(-50%)`,
          }}
        ></div>
      </div>
    </div>
  );
};

export default CustomSeekbar;
