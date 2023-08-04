import React, { useEffect, useState} from 'react';
import { useParams, useLocation, Link } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import PlayPause from '../components/PlayPause';
import { playPause, setActiveSong } from '../redux/features/playerSlice';



import { fetchListedMetadata } from '../customHooks/fetchListedMetadata';

function SongDetails() {
    const dispatch = useDispatch();
    const { cid } = useParams();
    const [listedNFTs, setListedNFTs] = useState([]);
    const [isListed, setIsListed] = useState(false);
    const [sameCID, setSameCID] = useState(false);
    const [songArray, setSongArray] = useState([]);

    const { activeSong, isPlaying, genreListId, songData, currentIndex } = useSelector((state) => state.player);

    const location = useLocation();
    const songInfo = location.state;

    const handlePauseClick = (e) => {
        dispatch(playPause(false));
        e.preventDefault();
      };
    
      const handlePlayClick = (e) => {
        dispatch(setActiveSong({
            animation_url: songInfo.songInfo.animation_url, 
            name: songInfo.songInfo.name, 
            image: songInfo.songInfo.image, 
            songList: songInfo.songInfo.songList, 
            id: songInfo.songInfo.id, 
            i: songInfo.songInfo.i, 
            artist: songInfo.songInfo.artist}));
        dispatch(playPause(true));
        e.preventDefault();
      };

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
        const sameSongArray = [];
        for(const song of listedNFTs) {
            if(song.cid === cid) {
                setIsListed(true);
                sameSongArray.push(song);
            }
        }
        if(sameSongArray.length > 1) {
            setSameCID(true);
        }
        setSongArray(sameSongArray);
    }, [listedNFTs]);


  return (
    <div className="flex flex-col justify-center items-center py-4">
        {songInfo ? (
            <div>
                {!isListed ? (
                    <div className="bg-white/5 bg-opacity-80 backdrop-blur-sm rounded-lg p-4 w-full md:w-[500px]">
                        <div className="relative w-full h-54 group">
                            <div className={`flex absolute bottom-2 right-2`} >
                                <PlayPause
                                    isPlaying={isPlaying}
                                    activeSong={activeSong}
                                    songData={songData}
                                    id={cid}
                                    artist={songInfo.songInfo.artist}
                                    name={songInfo.songInfo.name}
                                    handlePause={handlePauseClick}
                                    handlePlay={handlePlayClick}
                                /> 
                            </div>
                            <img alt="song_img" src={songInfo.songInfo.image} className="w-full h-full object-cover" />
                        </div>
                        <div className="mt-4 flex flex-col items-center md:items-start">
                            <p className='text-sm truncate flex flex-row justify-start'>
                                <span className='font-bold text-lg text-white mt-1'>{songInfo.songInfo.name}</span>
                            </p>
                            <p className='text-sm truncate flex flex-row justify-start'>
                                <span className='text-white mt-1'>{songInfo.songInfo.artist}</span>
                            </p>
                        </div>
                    </div>
                ) : (
                    <div className="bg-white/5 bg-opacity-80 backdrop-blur-sm rounded-lg p-4 w-full md:w-[500px]">
                        <div className="relative w-full h-54 group">
                            <div className={`flex absolute bottom-2 right-2 cursor-pointer`} >
                                <PlayPause
                                    isPlaying={isPlaying}
                                    activeSong={activeSong}
                                    songData={songData}
                                    id={cid}
                                    artist={songInfo.songInfo.artist}
                                    name={songInfo.songInfo.name}
                                    handlePause={handlePauseClick}
                                    handlePlay={handlePlayClick}
                                /> 
                            </div>
                            <img alt="song_img" src={songInfo.songInfo.image} className="w-full h-full object-cover" />
                        </div>
                        <div className="mt-4 flex flex-col items-center md:items-start">
                            <p className='text-sm truncate flex flex-row justify-start'>
                                <span className='font-bold text-lg text-white mt-1'>{songInfo.songInfo.name}</span>
                            </p>
                            <p className='text-sm truncate flex flex-row justify-start'>
                                <span className='text-white mt-1'>{songInfo.songInfo.artist}</span>
                            </p>
                        </div>
                        <div className='flex justify-center mt-4'>
                        {isListed && (
                            <>
                            {!sameCID ? (
                            songArray
                                .map(({ image, minterContract, quantity, quantityListed, tokenId, listingCreator, listingId, currentlyListed, pricePerToken, name, animation_url, properties, cid }) => (
                                <Link
                                    to={{
                                    pathname: `/treehouse-nft/${minterContract}/${tokenId}/${listingId}`,
                                    
                                    }}
                                    state={{
                                    nftData: {
                                        image,
                                        minterContract,
                                        quantity,
                                        quantityListed,
                                        tokenId,
                                        listingCreator,
                                        listingId,
                                        currentlyListed,
                                        pricePerToken,
                                        name,
                                        artist: properties.artist,
                                        animation_url,
                                        isPlaying,
                                        activeSong,
                                        songData,
                                        id: cid,
                                        songList: listedNFTs,
                                        i: currentIndex,
                                    },
                                    }}
                                    key={cid + listingId}
                                >
                                    <button 
                                        type="button"
                                        className="flex-initial justify-center w-32 btn bg-[#3a9619] text-white hover:bg-[#2e7715] rounded-md font-normal py-1">
                                        View Listing
                                    </button>
                                </Link>
                                ))
                            ) : (
                            <Link to={`/treehouse-marketplace`}>
                                <button 
                                    type="button"
                                    className="flex-initial justify-center w-32 btn bg-[#3a9619] text-white hover:bg-[#2e7715] rounded-md font-normal py-1">
                                    View Listings
                                </button>
                            </Link>
                            )}
                            </>
                            )}
                        </div>
                    </div>
                )}
            </div>
            ) : (
                "Loading..."
            )}
    </div>
  )
}

export default SongDetails
