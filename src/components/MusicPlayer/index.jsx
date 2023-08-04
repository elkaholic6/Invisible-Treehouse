import React, { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';

import { nextSong, prevSong, playPause } from '../../redux/features/playerSlice';
import Controls from './Controls';
import Player from './Player';
import Seekbar from './Seekbar';
import Track from './Track';
import VolumeBar from './VolumeBar';

const MusicPlayer = () => {
  const { activeSong, currentSongs, currentIndex, songCoverArt, currentTitle, currentArtist, isActive, isPlaying } = useSelector((state) => state.player);
  const [duration, setDuration] = useState(0);
  const [seekValue, setSeekValue] = useState(0);
  const [isSeeking, setIsSeeking] = useState(false);
  const [appTime, setAppTime] = useState(0);
  const [volume, setVolume] = useState(0.3);
  const [repeat, setRepeat] = useState(false);
  const [shuffle, setShuffle] = useState(false);
  const [time, setTime] = useState(0);

  const dispatch = useDispatch();

  const handlePlayPause = () => {
    if (!isActive) return;

    if (isPlaying) {
      dispatch(playPause(false));
    } else {
      dispatch(playPause(true));
    }
  };

  const handleNextSong = () => {
    if (!shuffle) {
      dispatch(nextSong((currentIndex + 1) % currentSongs.length));
    } else {
      dispatch(nextSong(Math.floor(Math.random() * currentSongs.length)));
    }
  };

  const handlePrevSong = () => {
    if (currentIndex === 0) {
      dispatch(prevSong(currentSongs.length - 1));
    } else if (shuffle) {
      dispatch(prevSong(Math.floor(Math.random() * currentSongs.length)));
    } else {
      dispatch(prevSong(currentIndex - 1));
    }
  };


  const handleSeekChange = (value) => {
    const time = parseInt(value);
    setSeekValue(time);
    setAppTime(time);
    setTime(time);
  }

  const handleSeekStart = () => {
    setIsSeeking(true);
  }

  const handleSeekEnd = () => {
    setIsSeeking(false);
  }

  return (
    <div className="relative sm:px-12 px-4 w-full flex items-center justify-between">
      <Track 
          isPlaying={isPlaying} 
          isActive={isActive} 
          activeSong={activeSong} 
          currentTitle={currentTitle} 
          songCoverArt={songCoverArt} 
          currentArtist={currentArtist}/>
      <div className="flex-1 flex flex-col items-center justify-center">
        <Controls
          isPlaying={isPlaying}
          isActive={isActive}
          repeat={repeat}
          setRepeat={setRepeat}
          shuffle={shuffle}
          setShuffle={setShuffle}
          currentSongs={currentSongs}
          handlePlayPause={handlePlayPause}
          handlePrevSong={handlePrevSong}
          handleNextSong={handleNextSong}
        />
        <Seekbar
          value={time}
          min="0"
          max={duration}
          appTime={appTime}
          seekvalue={seekValue}
          onChange={handleSeekChange}
          isSeeking={isSeeking}
          onSeekEnd={handleSeekEnd}
          onSeekStart={handleSeekStart}
        />
        <Player
          activeSong={activeSong}
          volume={volume}
          isPlaying={isPlaying}
          repeat={repeat}
          currentIndex={currentIndex}
          onEnded={handleNextSong}
          seekvalue={seekValue}
          isSeeking={isSeeking}
          onTimeUpdate={(event) => {
            setAppTime(event.target.currentTime);
            isSeeking ? time : setTime(event.target.currentTime);
            isSeeking ? '' : setSeekValue(event.target.currentTime);
          }}
          onLoadedData={(event) => setDuration(event.target.duration)}
        />
      </div>
      <VolumeBar value={volume} min="0" max="1" onChange={(event) => setVolume(event.target.value)} setVolume={setVolume} />
    </div>
  );
};

export default MusicPlayer;
