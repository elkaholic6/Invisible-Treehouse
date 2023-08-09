import NFTMarketplace from '../../artifacts/contracts/marketplace/NFTMarketplace.sol/NFTMarketplace.json';
import { ethers } from "ethers";

const API_KEY = import.meta.env.VITE_REACT_APP_ALCHEMY_API_KEY;


const marketplaceAddress = "0x644BCEC4dd5cDF505467E215dfB6E45a61F77808";
const abi = NFTMarketplace.abi;
const walletProvider = new ethers.providers.Web3Provider(window.ethereum);
const walletSigner = walletProvider.getSigner();
const provider = new ethers.providers.JsonRpcProvider(`https://eth-goerli.g.alchemy.com/v2/${API_KEY}`);
const marketplaceContract = new ethers.Contract(marketplaceAddress, abi, walletSigner);
const marketplaceContractWithoutSigner = new ethers.Contract(marketplaceAddress, abi, provider);



export { marketplaceContract, marketplaceAddress, marketplaceContractWithoutSigner };