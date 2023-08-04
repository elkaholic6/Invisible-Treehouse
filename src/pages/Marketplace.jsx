import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { genres } from '../assets/constants';
import { selectGenreListId } from '../redux/features/playerSlice';
import ListedNFTsCards from '../components/ListedNFTsCards';
import { fetchListedMetadata } from '../customHooks/fetchListedMetadata';
import { Loader } from '../components';

function Marketplace() {
  const [listedNFTs, setListedNFTs] = useState([]);
  const [isWalletConnected, setIsWalletConnected] = useState(false);

  const dispatch = useDispatch();

  useEffect(() => {
    // Check if the user's wallet is connected
    const checkWalletConnection = async () => {
      try {
        const wallet = await window.ethereum.request({ method: 'eth_accounts' });
        if(wallet.length > 0) {
          setIsWalletConnected(true);
        }
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
  
  useEffect(() => {
    const fetchMetadataAndSetState = async () => {
      try {
        if(isWalletConnected) {
          const metadata = await fetchListedMetadata();
          setListedNFTs(metadata);
        }
      } catch (error) {
        console.log('Error fetching metadata', error);
      }
    };

    fetchMetadataAndSetState();
  }, [isWalletConnected]);
  const { activeSong, isPlaying, genreListId, songData, currentIndex } = useSelector((state) => state.player);

    const genreTitle = genres.find(({ value }) => value === genreListId)?.title;
    const genreValue = genres.find(({ value }) => value === genreListId)?.value;


  return (
    <div className='flex flex-col'>
      <div className='w-full flex justify-between items-center sm:flex-row flex-col mt-4 mb-10'>
        <h2 className='font-bold text-3xl text-white text-left'>Treehouse Marketplace {genreTitle}</h2>
        <select 
            onChange={(e) => dispatch(selectGenreListId(e.target.value))}
            value={genreListId || 'pop'}
            className='bg-black text-gray-300 p-3 text-sm rounded-lg outline-none sm:mt-0 mt-5 cursor-pointer'
        >
            {genres.map((genre) => <option key={genre.value} value={genre.value}>{genre.title}</option>)}
        </select>
      </div>
        <>
            <div className='flex flex-wrap sm:justify-start justify-center gap-8'>
              {listedNFTs.length > 0 ? (
                  genreValue === 'ALL'
                  ? listedNFTs.map(({ image, minterContract, quantity, quantityListed, tokenId, listingCreator, listingId, currentlyListed, pricePerToken, name, animation_url, properties, cid }) => (
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
                        <ListedNFTsCards
                          image={image}
                          minterContract={minterContract}
                          quantity={quantity}
                          quantityListed={quantity}
                          tokenId={tokenId}
                          listingCreator={listingCreator}
                          listingId={listingId}
                          currentlyListed={currentlyListed}
                          pricePerToken={pricePerToken}
                          key={cid}
                          name={name}
                          artist={properties.artist}
                          animation_url={animation_url}
                          isPlaying={isPlaying}
                          activeSong={activeSong}
                          songData={songData}
                          id={cid}
                          songList={listedNFTs}
                          i={currentIndex}
                        />
                      </Link>
                    ))
                  : listedNFTs
                      .filter(function (genre) {
                        return genre.description === genreValue;
                      })
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
                          <ListedNFTsCards
                            image={image}
                            minterContract={minterContract}
                            quantity={quantity}
                            quantityListed={quantity}
                            tokenId={tokenId}
                            listingCreator={listingCreator}
                            listingId={listingId}
                            currentlyListed={currentlyListed}
                            pricePerToken={pricePerToken}
                            key={cid}
                            name={name}
                            artist={properties.artist}
                            animation_url={animation_url}
                            isPlaying={isPlaying}
                            activeSong={activeSong}
                            songData={songData}
                            id={cid}
                            songList={listedNFTs}
                            i={currentIndex}
                          />
                        </Link>
                      ))
              ) : (
                <Loader title="Entering the Marketplace..." />
              )}
            </div>
        </>
    </div>
  )
}

export default Marketplace;