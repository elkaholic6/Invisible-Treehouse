import NFTMarketplace from '../../artifacts/contracts/marketplace/NFTMarketplace.sol/NFTMarketplace.json';
import { ethers } from "ethers";


const marketplaceAddress = "0x027628dB4329763Da08Ecb0ADA120c1a5408be92";
const abi = NFTMarketplace.abi;
const provider = new ethers.providers.Web3Provider(window.ethereum);
const marketplaceContractWithoutSigner = new ethers.Contract(marketplaceAddress, abi, provider);


export { marketplaceAddress, marketplaceContractWithoutSigner };