import NFTMarketplace from '../../artifacts/contracts/marketplace/NFTMarketplace.sol/NFTMarketplace.json';
import { ethers } from "ethers";

const marketplaceAddress = "0x644BCEC4dd5cDF505467E215dfB6E45a61F77808";
const abi = NFTMarketplace.abi;
const { ethereum } = window;

let marketplaceContract;

if (ethereum) {
    const walletProvider = new ethers.providers.Web3Provider(window.ethereum);
    const walletSigner = walletProvider.getSigner();
    marketplaceContract = new ethers.Contract(marketplaceAddress, abi, walletSigner);
     
}

export { marketplaceContract };