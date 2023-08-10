import React from 'react';
import { MdSkipNext, MdSkipPrevious } from 'react-icons/md';
import { BsArrowRepeat, BsFillPauseFill, BsFillPlayFill, BsShuffle } from 'react-icons/bs';

const Controls = ({ isPlaying, repeat, setRepeat, shuffle, setShuffle, currentSongs, handlePlayPause, handlePrevSong, handleNextSong }) => (
  <div className={`flex items-center justify-around ${window.innerWidth < 350 ? 'w-32' : '2xl:w-64 max-w-[165px] md:max-w-[100%]'} `}>
    <BsArrowRepeat size={18} color={repeat ? 'red' : 'white'} onClick={() => setRepeat((prev) => !prev)} className="cursor-pointer mr-4" />
    {currentSongs?.length && <MdSkipPrevious size={25} color="#FFF" className="cursor-pointer mr-2" onClick={handlePrevSong} />}
    {isPlaying ? (
      <BsFillPauseFill size={40} color="#FFF" onClick={handlePlayPause} className="cursor-pointer" />
    ) : (
      <BsFillPlayFill size={40} color="#FFF" onClick={handlePlayPause} className="cursor-pointer" />
    )}
    {currentSongs?.length && <MdSkipNext size={25} color="#FFF" className="cursor-pointer ml-2" onClick={handleNextSong} />}
    <BsShuffle size={18} color={shuffle ? 'red' : 'white'} onClick={() => setShuffle((prev) => !prev)} className="cursor-pointer ml-4" />
  </div>
);

export default Controls;
