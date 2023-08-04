import React, { useState, useEffect } from 'react';
import { useParams, useLocation, Link } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { playPause, setActiveSong } from '../redux/features/playerSlice';
import Minter from '../../artifacts/contracts/mint/Minter.sol/Minter.json';
import { ethers } from "ethers";
import { ListNFTModal } from '../components';
import { BuyNFT } from '../components';
import { CancelListing } from '../components';
import { UpdateListing } from '../components';
import PlayPause from '../components/PlayPause';


function NFTDetails() {
    const dispatch = useDispatch();
    const [ connectedAccount, setConnectedAccount ] = useState(null);
    const [ isWalletConnected, setIsWalletConnected ] = useState(false);
    const { minterContract, tokenId, listingId } = useParams();

    const { activeSong, isPlaying, genreListId, songData, currentIndex } = useSelector((state) => state.player);


    const location = useLocation();
    const nftData = location.state;

    const handlePauseClick = (e) => {
        dispatch(playPause(false));
        e.preventDefault();
      };
    
      const handlePlayClick = (e) => {
        dispatch(setActiveSong({
            animation_url: nftData.nftData.animation_url, 
            name: nftData.nftData.name, 
            image: nftData.nftData.image, 
            songList: nftData.nftData.songList, 
            id: nftData.nftData.id, 
            i: nftData.nftData.i, 
            artist: nftData.nftData.artist}));
        dispatch(playPause(true));
        e.preventDefault();
      };

    useEffect(() => {
        // Check if the user's wallet is connected
        const checkWalletConnection = async () => {
          try {
            const accounts = await window.ethereum.request({ method: 'eth_accounts' });
            const account = accounts[0];
            setConnectedAccount(account);
            setIsWalletConnected(true);
          } catch (error) {
            setIsWalletConnected(false);
          }
        };
      
        checkWalletConnection();
      
        // Cleanup function to reset the wallet connection status when the component unmounts
        return () => {
          setIsWalletConnected(false);
        };
      }, []);
    

  return (
    <div className="flex flex-col justify-center items-center py-4">
        {nftData ? (
            <div>
                {!nftData.nftData.currentlyListed ? (
                    <div className="bg-white/5 bg-opacity-80 backdrop-blur-sm rounded-lg p-4 w-full md:w-[500px]">
                        <div className="relative w-full h-54 group">
                            <div className={`flex absolute bottom-2 right-2 cursor-pointer`} >
                                <PlayPause
                                    isPlaying={isPlaying}
                                    activeSong={activeSong}
                                    songData={songData}
                                    id={nftData.nftData.cid}
                                    artist={nftData.nftData.artist}
                                    name={nftData.nftData.name}
                                    handlePause={handlePauseClick}
                                    handlePlay={handlePlayClick}
                                /> 
                            </div>
                            <img alt='song_img' src={nftData.nftData.image} width='500' height='500'/>
                        </div>
                        <div className="mt-4 flex flex-col items-center md:items-start">
                            <p className='text-sm truncate flex flex-row justify-start'>
                                <span className='font-bold text-lg text-white mt-1'>{nftData.nftData.name}</span>
                            </p>
                            <p className='text-sm truncate flex flex-row justify-start'>
                                <span className='text-white mt-1'>{nftData.nftData.artist}</span>
                            </p>
                            <p className='text-sm truncate flex flex-row justify-between'>
                                <span className='text-blue-300 mr-2 mt-4'>Token Address:</span>
                                <span className='font-bold text-white mt-4 text-right'>
                                    <Link to={`https://goerli.etherscan.io/address/${nftData.nftData.minterContract}`}>
                                        {(nftData.nftData.minterContract).slice(0,5) + '...' + (nftData.nftData.minterContract).slice(-5)}
                                    </Link>
                                </span>
                            </p>
                            <p className='text-sm truncate flex flex-row justify-between'>
                                <span className='text-blue-300 mr-2 mt-2'>Quantity Owned:</span>
                                <span className='font-bold text-white mt-2 text-right'>
                                        {nftData.nftData.quantityOwned}
                                </span>
                            </p>
                        </div>
                        <div className='flex justify-center mt-4'>
                            <ListNFTModal minterContractFromNFTDetails={nftData.nftData.minterContract} imageFromNFTDetails={nftData.nftData.image} nameFromNFTDetails={nftData.nftData.name} artistFromNFTDetails={nftData.nftData.artist} />
                        </div>
                    </div>
                ) : (
                    <div className="bg-white/5 bg-opacity-80 backdrop-blur-sm rounded-lg p-4 w-full md:w-[500px]">
                        <div className='relative w-full h-54 group'>
                            <div className={`flex absolute bottom-2 right-2 cursor-pointer`} >
                                <PlayPause
                                    isPlaying={isPlaying}
                                    activeSong={activeSong}
                                    songData={songData}
                                    id={nftData.nftData.cid}
                                    artist={nftData. nftData.artist}
                                    name={nftData.nftData.name}
                                    handlePause={handlePauseClick}
                                    handlePlay={handlePlayClick}
                                /> 
                            </div>
                            <img alt="song_img" src={nftData.nftData.image} className="w-full h-full object-cover" />   
                        </div>
                        <div className="mt-4 flex flex-col items-center md:items-start">
                            <p className='text-sm truncate flex flex-row justify-start'>
                                <span className='font-bold text-lg text-white mt-1'>{nftData.nftData.name}</span>
                            </p>
                            <p className='text-sm truncate flex flex-row justify-start'>
                                <span className='text-white mt-1'>{nftData.nftData.artist}</span>
                            </p>
                            <p className='text-sm truncate flex flex-row justify-between'>
                                <span className='text-blue-300 mr-2 mt-4'>Token Address:</span>
                                <span className='font-bold text-white mt-4 text-right'>
                                    <Link to={`https://goerli.etherscan.io/address/${nftData.nftData.minterContract}`}>
                                        {(nftData.nftData.minterContract).slice(0,5) + '...' + (nftData.nftData.minterContract).slice(-5)}
                                    </Link>
                                </span>
                            </p>
                            <p className='text-sm truncate flex flex-row justify-between'>
                                <span className='text-blue-300 mr-2 mt-2'>Listing Creator:</span>
                                <span className='font-bold text-white mt-2 text-right'>
                                    <Link to={`https://goerli.etherscan.io/address/${nftData.nftData.listingCreator}`}>
                                        {(nftData.nftData.listingCreator).slice(0,5) + '...' + (nftData.nftData.listingCreator).slice(-5)}
                                    </Link>
                                </span>
                            </p>
                            <p className='text-sm truncate flex flex-row justify-between'>
                                <span className='text-blue-300 mr-2 mt-2'>Quantity Listed:</span>
                                <span className='font-bold text-white mt-2 text-right'>
                                        {nftData.nftData.quantityListed}
                                </span>
                            </p>
                            <p className='text-sm truncate flex flex-row justify-between'>
                                <span className='text-blue-300 mr-2 mt-2'>Price Per Token:</span>
                                <span className='font-bold text-white mt-2 text-right'>
                                        {nftData.nftData.pricePerToken} ETH
                                </span>
                            </p>
                        </div>
                        <div className='flex justify-center mt-4'>
                            {connectedAccount && (
                                <div>
                                    {(nftData.nftData.listingCreator).toLowerCase() === connectedAccount.toLowerCase() ? (
                                        <div className='flex flex-row space-x-12'>
                                            <CancelListing 
                                                minterContractFromNFTDetails={nftData.nftData.minterContract}  
                                                imageFromNFTDetails={nftData.nftData.image}
                                                listingIdFromNFTDetails={listingId}
                                            />
                                            <UpdateListing 
                                                minterContractFromNFTDetails={nftData.nftData.minterContract}  
                                                imageFromNFTDetails={nftData.nftData.image}
                                                listingIdFromNFTDetails={listingId}
                                            />
                                        </div>
                                    ) : (
                                        <BuyNFT 
                                            minterContractFromNFTDetails={nftData.nftData.minterContract}  
                                            imageFromNFTDetails={nftData.nftData.image}
                                            listingIdFromNFTDetails={listingId}
                                            pricePerTokenFromNFTDetails={nftData.nftData.pricePerToken}
                                            nameFromNFTDetails={nftData.nftData.name}
                                            artistFromNFTDetails={nftData.nftData.artist}
                                        />
                                    )}
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </div>
            ) : (
                "Loading..."
            )
        }
    </div>
  )
}

export default NFTDetails