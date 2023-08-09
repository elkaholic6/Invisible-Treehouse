import { ethers } from "ethers";
import Minter from '../../artifacts/contracts/mint/Minter.sol/Minter.json';
import { marketplaceContractWithoutSigner } from "./fetchMarketplaceContract";


export async function fetchListedMetadata() {
  
  const API_KEY = import.meta.env.VITE_REACT_APP_ALCHEMY_API_KEY;


    let transaction = await marketplaceContractWithoutSigner.displayAllListedNfts();
    let listedSongArray = [];
    for (const song of transaction) {
      const songMinterContractAddress = song.minterContract;
      const abi = Minter.abi;
      const provider = new ethers.providers.JsonRpcProvider(`https://eth-goerli.g.alchemy.com/v2/${API_KEY}`);
      const minterContract = new ethers.Contract(songMinterContractAddress, abi, provider);

      const songNFT = await minterContract.uri(parseInt(song.tokenId.toString()));
      const cleanedUrl = songNFT.replace("ipfs://", "").replace("/metadata.json", "");

      const response = await fetch(`https://ipfs.io/ipfs/${cleanedUrl}/metadata.json`);
      const metadata = await response.json();
      const cleanedAudio = metadata.animation_url.replace('ipfs://', 'https://ipfs.io/ipfs/');
      const cleanedImage = metadata.image.replace('ipfs://', 'https://ipfs.io/ipfs/');
      const _listingId = parseInt(song.listingId.toString());
      const _tokenId = parseInt(song.tokenId.toString());
      const _quantity = parseInt(song.quantity.toString());

      const _currentlyListed = song.currentlyListed;
      const _pricePerToken = song.pricePerToken;
      const value = ethers.utils.formatEther(_pricePerToken);

      const nftMetadata = {
        ...metadata,
        animation_url: cleanedAudio,
        image: cleanedImage,
        cid: cleanedUrl,
        listingCreator: song.listingCreator,
        listingId: _listingId,
        pricePerToken: value,
        quantity: _quantity,
        quantityListed: _quantity,
        tokenId: _tokenId,
        minterContract: song.minterContract,
        currentlyListed: _currentlyListed
      }

      listedSongArray.push(nftMetadata);
    };
    return listedSongArray;
}