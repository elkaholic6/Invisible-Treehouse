import { ethers } from "ethers";
import Minter from '../../artifacts/contracts/mint/Minter.sol/Minter.json';
import { marketplaceContract } from "./fetchMarketplaceContract";


export async function fetchListedMetadata() {
    let transaction = await marketplaceContract.displayAllListedNfts();
    let listedSongArray = [];
    for (const song of transaction) {
      const songMinterContractAddress = song.minterContract;
      const abi = Minter.abi;
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const signer = provider.getSigner();
      const minterContract = new ethers.Contract(songMinterContractAddress, abi, signer);

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