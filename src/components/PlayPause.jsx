import { FaPauseCircle, FaPlayCircle } from 'react-icons/fa';
import { useSelector } from 'react-redux';

const PlayPause = ({ isPlaying, activeSong, songData, name, artist, handlePause, handlePlay }) => {
  const { currentTitle, currentArtist } = useSelector((state) => state.player);

  return (
  isPlaying && currentTitle === name && currentArtist === artist ? (
    <FaPauseCircle 
      size={35}
      className='text-gray-300 cursor-pointer'
      onClick={handlePause}
    />
  ) : (
    <FaPlayCircle 
      size={35}
      className='text-gray-300 cursor-pointer'
      onClick={handlePlay}
    />
  ))
};

export default PlayPause;
