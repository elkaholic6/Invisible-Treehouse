import NFTMarketplace from '../../artifacts/contracts/marketplace/NFTMarketplace.sol/NFTMarketplace.json';
import { ethers } from "ethers";

const marketplaceAddress = "0x027628dB4329763Da08Ecb0ADA120c1a5408be92";
const abi = NFTMarketplace.abi;
const { ethereum } = window;

let marketplaceContract;

if (ethereum) {
    const walletProvider = new ethers.providers.Web3Provider(window.ethereum);
    const walletSigner = walletProvider.getSigner();
    marketplaceContract = new ethers.Contract(marketplaceAddress, abi, walletSigner);
     
}

export { marketplaceContract };