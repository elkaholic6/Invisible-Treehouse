import { ethers } from "ethers";
import Minter from '../../artifacts/contracts/mint/Minter.sol/Minter.json';
import { marketplaceContractWithoutSigner } from "./fetchMarketplaceContract";
import { marketplaceContract } from "./fetchMarketplaceContractWithWallet";



async function getTokensOwned(fullAccount) {
    const tokensOwned = await marketplaceContractWithoutSigner.getTokensOwned(fullAccount);
    return tokensOwned;
  };

async function getListedTokensOwned(fullAccount) {
    const listedTokensOwned = await marketplaceContract.displayUserTokens(fullAccount);
    return listedTokensOwned;
  };

async function getOwnerListedTokens(minterContract, owner) {
  return await marketplaceContractWithoutSigner.getOwnerAmountListed(minterContract, owner);
}

  export default async function fetchUserTokens(fullAccount) {
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    const signer = provider.getSigner();
    const minterAbi = Minter.abi;
    
    const tokensOwned = await getTokensOwned(fullAccount);
    const listedTokensOwned = await getListedTokensOwned(fullAccount);
    let listedSongArray = [];

    if(tokensOwned.length > 0) {
      for (const song of listedTokensOwned) {
        const minterContract = new ethers.Contract(song.minterContract, minterAbi, signer);
        const balance = await minterContract.balanceOf(fullAccount, 1);
        const quantityListed = await getOwnerListedTokens(minterContract.address, fullAccount);

        const songNFT = await minterContract.uri(1);
        const cleanedUrl = songNFT.replace("ipfs://", "").replace("/metadata.json", "");

        const response = await fetch(`https://ipfs.io/ipfs/${cleanedUrl}/metadata.json`);
        const metadata = await response.json();
        const cleanedAudio = metadata.animation_url.replace('ipfs://', 'https://ipfs.io/ipfs/');
        const cleanedImage = metadata.image.replace('ipfs://', 'https://ipfs.io/ipfs/');
        const _listingId = parseInt(song.listingId.toString());
        const _tokenId = parseInt(song.tokenId.toString());
        const _quantityOwned = parseInt(parseInt(balance.toString()));
        const _quantityListed = parseInt(quantityListed.toString());
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
          quantityOwned: _quantityOwned,
          quantityListed: _quantityListed,
          tokenId: _tokenId,
          minterContract: song.minterContract,
          currentlyListed: _currentlyListed
        }

        listedSongArray.push(nftMetadata);
      }
      return listedSongArray;
    }
  }