import { useState, useEffect, useRef } from 'react';

const Track = ({ isPlaying, isActive, currentTitle, currentArtist, songCoverArt }) => {
  const titleContainerRef = useRef(null);
  const artistContainerRef = useRef(null);
  const [titleOverflow, setTitleOverflow] = useState(false);
  const [artistOverflow, setArtistOverflow] = useState(false);
  const [titleAnimation, setTitleAnimation] = useState(false);
  const [artistAnimation, setArtistAnimation] = useState(false);
  const [toggle, setToggle] = useState(false);

  useEffect(() => {
    const checkOverflow = (container, content) => {
      if (container && content && content.scrollWidth > container.clientWidth) {
        if(content.textContent === currentTitle) {
          setTitleAnimation(true);
        }
        if(content.textContent === currentArtist) {
          setArtistAnimation(true);
        }
        return true;
      } else {
        if(content.textContent === currentTitle) {
          setTitleAnimation(false);
        }
        if(content.textContent === currentArtist) {
          setArtistAnimation(false);
        }
        return false;
      }
    };

    setTitleOverflow(checkOverflow(titleContainerRef.current, titleContainerRef.current));
    setArtistOverflow(checkOverflow(artistContainerRef.current, artistContainerRef.current ));

  }, [toggle]);

  useEffect(() => {
    setArtistAnimation(false);
    setTitleAnimation(false);
    setToggle(!toggle);

  }, [currentTitle, currentArtist])

  return (
    <div className="flex-1 flex items-center">
      <div className={`${window.innerWidth >= 350 ? 'h-6 w-10 md:h-12 md:w-16 mb-4 mr-2' : 'hidden'}`}>
        <img src={songCoverArt} alt="cover art" className={`${isPlaying && isActive ? 'animate-[spin_5s_linear_infinite]' : ''} rounded-full ${window.innerWidth >= 350 ? '' : 'hidden'}`} />
      </div>
      <div className="max-w-[100px] md:max-w-[200px] lg:max-w-[300px] mr-3 overflow-hidden">
        <p
          ref={titleContainerRef}
          className={`whitespace-nowrap text-white font-bold text-sm md:text-lg ${
            titleOverflow ? 'animate-autoscroll animation-delay-2000' : ''} ${!titleAnimation ? 'animate-none' : ''}`}
        >
          {currentTitle ? currentTitle : 'No active Song'}
        </p>
        <p
          ref={artistContainerRef}
          className={`whitespace-nowrap text-gray-300 text-sm md:text-base ${
            artistOverflow ? 'animate-autoscroll animation-delay-2000' : ''} ${!artistAnimation ? 'animate-none' : ''}`}
        >
          {currentArtist ? currentArtist : 'No active Artist'}
        </p>
      </div>
    </div>
  );
};

export default Track;
