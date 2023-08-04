import React from 'react';


const Track = ({ isPlaying, isActive, currentTitle, currentArtist, songCoverArt }) => {
  return(
  <div className="flex-1 flex items-center">
    <div className='h-16 w-20 mt-2'>
      <img src={songCoverArt} alt="cover art" className={`${isPlaying && isActive ? 'animate-[spin_5s_linear_infinite]' : ''} rounded-full`} />
    </div>
    <div className="w-full overflow-auto">
      <p className={`whitespace-nowrap text-white font-bold text-lg ml-4 hover:animate-autoscroll animation-delay-2000`}>
        {currentTitle ? currentTitle : 'No active Song'}
      </p>
      <p className="truncate text-gray-300 ml-4 w-20 sm:w-fit">
        {currentArtist ? currentArtist : 'No active Artist'}
      </p>
    </div>
  </div>
)};
export default Track;
