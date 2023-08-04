import React from 'react';
import { useDispatch, useSelector, shallowEqual } from 'react-redux';

import PlayPause from './PlayPause';
import { playPause, setActiveSong } from '../redux/features/playerSlice';

const ListedNFTsCards = ({ image, minterContract, quantity, quantityListed, tokenId, listingCreator, listingId, currentlyListed, pricePerToken, isPlaying, activeSong, songData, animation_url, songList, name, artist, i, id, songArr }) => {
    const dispatch = useDispatch();

    const { currentTitle, currentArtist } = useSelector(((state) => state.player), shallowEqual);

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
                <div className='mt-4 flex flex-col'>
                <p className='text-sm truncate flex flex-row justify-start'>
                    <span className='font-bold text-lg text-white mt-1'>{name}</span>
                </p>
                <p className='text-sm truncate flex flex-row justify-start'>
                    <span className='text-white mt-1'>{artist}</span>
                </p>
                <p className='text-sm truncate flex flex-row justify-between'>
                    <span className='text-blue-300 mr-2 mt-1'>Quantity Listed:</span>
                    <span className='font-bold text-white mt-1 text-right'>{quantityListed}</span>
                </p>
                <p className='text-sm truncate flex flex-row justify-between'>
                    <span className='text-blue-300 mr-2 mt-1'>Price Per Token:</span>
                    <span className='font-bold text-white mt-1 text-right'>{pricePerToken} ETH</span>
                </p>
                </div>
        </div>
    );
};

export default ListedNFTsCards;