import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector, shallowEqual } from 'react-redux';

import PlayPause from './PlayPause';
import { playPause, setActiveSong } from '../redux/features/playerSlice';
import { fetchListedMetadata } from '../customHooks/fetchListedMetadata';
import { FaTag } from 'react-icons/fa';


const TreehouseSongCard = ({ isPlaying, activeSong, songData, image, animation_url, songList, name, artist, i, id, songArr }) => {
    const dispatch = useDispatch();
    const [listedNFTs, setListedNFTs] = useState([]);
    const [isListed, setIsListed] = useState(false);
    const [isSmallScreen, setIsSmallScreen] = useState(false);


    const { currentTitle, currentArtist } = useSelector(((state) => state.player), shallowEqual);

    useEffect(() => {
        const fetchMetadataAndSetState = async () => {
          try {
            const metadata = await fetchListedMetadata();
            setListedNFTs(metadata);
          } catch (error) {
            console.log('Error fetching metadata', error);
          }
        };
        fetchMetadataAndSetState();
      }, []);

    useEffect(() => {
        for(const song of listedNFTs) {
            if(song.cid === id) {
                setIsListed(true);
            }
        }
    }, [listedNFTs]);

    useEffect(() => {
        const handleWindowResize = () => {
          setIsSmallScreen(window.innerWidth < 768);
        };
    
        window.addEventListener('resize', handleWindowResize);
    
        handleWindowResize();
    
        // Cleanup the event listener on unmount
        return () => {
          window.removeEventListener('resize', handleWindowResize);
        };
      }, []);

    const handlePauseClick = (e) => {
      dispatch(playPause(false));
      e.preventDefault();
    };
  
    const handlePlayClick = (e) => {
      dispatch(setActiveSong({animation_url, name, image, songList, id, i, artist, songArr}));
      dispatch(playPause(true));
      e.preventDefault();
    };


    return (
        <div className='flex flex-col w-[250px] p-4 bg-white/5 bg-opacity-80 backdrop-blur-sm animate-slideup rounded-lg cursor-pointer'>
            {!isSmallScreen ? (
                <div className='relative w-full h-54 group'>
                    <div className={`absolute inset-0 justify-center items-center bg-black bg-opacity-50 group-hover:flex ${currentTitle === name && currentArtist === artist ? 'flex bg-black bg-opacity-70' : 'hidden'}`} >
                        <PlayPause
                            isPlaying={isPlaying}
                            activeSong={activeSong}
                            songData={songData}
                            id={id}
                            artist={artist}
                            name={name}
                            handlePause={handlePauseClick}
                            handlePlay={handlePlayClick}
                        /> 
                    </div>
                <img alt='song_img' src={image} width='350' height='350'/>
                </div>
            ) : (
                <div className='relative w-full h-54'>
                    <div className={`flex absolute bottom-2 right-2`} >
                        <PlayPause
                            isPlaying={isPlaying}
                            activeSong={activeSong}
                            songData={songData}
                            id={id}
                            artist={artist}
                            name={name}
                            handlePause={handlePauseClick}
                            handlePlay={handlePlayClick}
                        /> 
                    </div>
                <img alt='song_img' src={image} width='350' height='350'/>
                </div>
            )}
            <div className='mt-4 flex flex-col'>
                <p className='font-semibold text-lg text-white truncate'>
                    {name}
                </p>
                <div className='flex flex-row justify-between'>
                    <p className='text-sm truncate text-gray-300 mt-1'>
                        {artist}
                    </p>
                    {isListed && (
                        <FaTag className='text-sm text-yellow-600 mt-1' />
                    )}
                </div>
            </div>
        </div>
    );
};

export default TreehouseSongCard;