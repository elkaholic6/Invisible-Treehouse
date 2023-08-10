import React, { useRef, useEffect, useState } from 'react';


const Player = ({ activeSong, isPlaying, volume, onEnded, onTimeUpdate, onLoadedData, repeat, handleNextSong, seekvalue, isSeeking }) => {
  const ref = useRef(null);
  const [mounted, setMounted] = useState(false);
  const [startTime, setStartTime] = useState(0);
  const [streamedDuration, setStreamedDuration] = useState(0);
  const [totalStreamedDuration, setTotalStreamedDuration] = useState(0);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (mounted) {
      if (isPlaying) {
        setStartTime(ref.current.currentTime);
      } else {
        const duration = ref.current.currentTime - startTime;
        setStreamedDuration(duration);
        setTotalStreamedDuration(prevTotal => prevTotal + duration);
      }
    }
  }, [isPlaying, mounted]);

  useEffect(() => {
  }, [totalStreamedDuration]);

  useEffect(() => {
    setStartTime(0);
    setStreamedDuration(0);
    setTotalStreamedDuration(0);
  }, [activeSong]);


  useEffect(() => {
    if (!isSeeking) {
      ref.current.currentTime = seekvalue;
    }
  }, [isSeeking]);


  useEffect(() => {
  if (ref.current) {
    if (isPlaying) {
      ref.current.play().then(_ => {
        return
      })
      .catch(error => {
        return
      })
    } else {
      ref.current.pause();
    }
  }
}, [activeSong, isPlaying])

  useEffect(() => {
    ref.current.volume = volume;
  }, [volume]);



  return (
    <audio
      src={activeSong}
      ref={ref}
      preload='auto'
      loop={repeat}
      onEnded={onEnded}
      onTimeUpdate={onTimeUpdate}
      onLoadedData={onLoadedData}
    />
  );
};

export default Player;
