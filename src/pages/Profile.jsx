import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { useParams, Link } from 'react-router-dom';
import NFTMarketplace from '../../artifacts/contracts/marketplace/NFTMarketplace.sol/NFTMarketplace.json';
import { ethers } from "ethers";
import OwnedNFTsCards from '../components/OwnedNFTsCards';
import TreehouseSongCard from '../components/TreehouseSongCard';
import { FaEthereum, FaWallet } from 'react-icons/fa';
import fetchUserTokens from '../customHooks/fetchUserTokens';
import fetchIPFSMetadata from '../customHooks/fetchIPFSMetadata';
import { useFetchNftsQuery } from '../redux/services/nftStorageApi';
import { Loader } from '../components';





const marketplaceAddress = "0x316Fbd5e5759CEcF3fcBBC59965d7787abbd4290";
const marketplaceAbi = NFTMarketplace.abi;
const provider = new ethers.providers.Web3Provider(window.ethereum);
const signer = provider.getSigner();
const marketplaceContract = new ethers.Contract(marketplaceAddress, marketplaceAbi, signer);
console.log('marketplaceContract: ', marketplaceContract);

export { marketplaceContract };

function Profile() {
    const [listedNFTs, setListedNFTs] = useState([]);
    const [slicedAccount, setSlicedAccount] = useState('');
    const [ethBalance, setEthBalance] = useState(null);
    const [songMetadataArray, setSongMetadataArray] = useState([]);
    const [userIPFSSongs, setUserIPFSSongs] = useState([]);
    const { fullAccount } = useParams();

    const { activeSong, isPlaying, genreListId, songData, currentIndex } = useSelector((state) => state.player);
    const { data, isFetching, error } = useFetchNftsQuery();


    function roundToTenThousandth(number) {
      return Number(number.toFixed(4));
    }


    useEffect(() => {
      const _slicedAccount = fullAccount.slice(0, 5) + '...' + fullAccount.slice(38, 42)
      setSlicedAccount(_slicedAccount);

      async function getBalance() {
        try {
          const { ethereum } = window;
          console.log('ethereum: ', ethereum);
          if (!ethereum) {
            console.log('Make sure you have metamask!');
            return;
          }
          const balanceInWei = await ethereum.request({ method: 'eth_getBalance', params: [fullAccount, 'latest'] });

          const balanceInEth = parseFloat(ethers.utils.formatEther(balanceInWei));
          const roundedNumber = roundToTenThousandth(balanceInEth);
          setEthBalance(roundedNumber);
        } catch(error) {
          console.error("Error fetching balance", error);
        }
      };

      getBalance();
    }, []);

    useEffect(() => {
      const fetchMetadataAndSetState = async () => {
        try {
          const metadata = await fetchUserTokens(fullAccount);
          setListedNFTs(metadata);
          const ipfsMetadata = await fetchIPFSMetadata(data);
          setSongMetadataArray(ipfsMetadata);

          const userSongs = ipfsMetadata.filter((item) => item.properties.songOwner === fullAccount); 
          setUserIPFSSongs(userSongs);
          
        } catch (error) {
          console.log('Error fetching metadata', error);
        }
      };
  
      fetchMetadataAndSetState();
    }, [data]);



  return (
    <div className='flex flex-col'>
      <div className='flex justify-between'>
        <span className='font-bold text-3xl text-white text-left'>Profile</span>
        {ethBalance !== null ? (
          <span className='font-bold text-xl text-white flex items-center'>
            <FaWallet className='mr-2'/>
            {ethBalance} ETH
          </span>
        ) : (
          <p>Loading balance...</p>
        )}
      </div>
      <div className='w-full flex items-start flex-col mt-1 mb-10'>
        <h2 className='text-l text-gray-300 flex items-center'>
          <FaEthereum classname='mr-2' /> 
          {slicedAccount}
        </h2>
      </div>
      <div>
          <span className='font-bold text-3xl text-white flex flex-wrap sm:justify-start justify-center mt-6'>Your NFTs</span>
      </div>
      <div className='flex flex-wrap sm:justify-start justify-center gap-8 mt-4'>
      {listedNFTs && listedNFTs.length > 0 ? (
          listedNFTs
              .map(({ image, minterContract, quantityOwned, quantityListed, tokenId, listingCreator, listingId, currentlyListed, pricePerToken, name, animation_url, properties, cid }) => (
                <Link
                  to={{
                    pathname: `/treehouse-nft/${minterContract}/${tokenId}/${listingId}`,
                    
                  }}
                  state={{
                    nftData: {
                      image,
                      minterContract,
                      quantityOwned,
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
                  key={cid}
                >
                  <OwnedNFTsCards
                      image={image}
                      minterContract={minterContract}
                      quantityOwned={quantityOwned}
                      quantityListed={quantityListed}
                      tokenId={tokenId}
                      listingCreator={listingCreator}
                      listingId={listingId}
                      currentlyListed={currentlyListed}
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
        <Loader title="Loading your NFTS..." />
        )}
        </div>
        <div className='mt-12'>
          <span className='font-bold text-3xl text-white flex flex-wrap sm:justify-start justify-center mt-6'>Your Uploaded Songs</span>
        </div>
      <div className='flex flex-wrap sm:justify-start justify-center gap-8 mt-4'>
        {userIPFSSongs.length > 0 ? (
                userIPFSSongs
                    .filter(function (song) {
                        return song.properties.songOwner === fullAccount
                    })
                    .map(({ name, animation_url, image, properties, cid}) => (
                      <Link
                        to={{
                          pathname: `/treehouse-song/${cid}`,
                          
                        }}
                        state={{
                          songInfo: {
                            name,
                            artist: properties.artist,
                            animation_url,
                            image,
                            isPlaying,
                            activeSong,
                            songData,
                            id: cid,
                            songList: songMetadataArray,
                            i: currentIndex
                          },
                        }}
                        key={cid}
                    >
                        <TreehouseSongCard
                            key={cid}
                            name={name}
                            artist={properties.artist}
                            animation_url={animation_url}
                            image={image}
                            isPlaying={isPlaying}
                            activeSong={activeSong}
                            songData={songData}
                            id={cid}
                            songList={songMetadataArray}
                            i={currentIndex}
                        />
                      </Link>
                    ))
                
                ) : (
                  <Loader title="Loading your songs..." />
                )}
        </div>
    </div>
  )
}

export default Profile