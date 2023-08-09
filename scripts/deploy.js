import { ethers } from "ethers";
import Minter from '../artifacts/contracts/mint/Minter.sol/Minter.json';
import { marketplaceAddress } from "../src/customHooks/fetchMarketplaceContract";

const API_KEY = import.meta.env.VITE_REACT_APP_ALCHEMY_API_KEY;


const provider = new ethers.providers.JsonRpcProvider(`https://eth-goerli.g.alchemy.com/v2/${API_KEY}`);
const signer = provider.getSigner();
let account;

async function getAccountAddress() {
  account = await signer.getAddress();
  return account;
}

async function deploy(_ipfs, marketplaceContract, royaltyFee) {
  console.log('deploy function is being called');
  account = await getAccountAddress();


  const minterFactory = new ethers.ContractFactory(
    Minter.abi,
    Minter.bytecode,
    signer
  );
  const minter = await minterFactory.deploy(
    _ipfs, 
    marketplaceContract,
    10000, 
    "Invisible Treehouse", 
    "TREE",
    royaltyFee
  );

  const contract = await minter.deployed();

  console.log("Minter contract deployed at address:", minter.address);
  return contract;

}

async function mintNFT(contractAddress, quantity) {
  account = await getAccountAddress();

  const contractABI = Minter.abi;


  const contract = new ethers.Contract(contractAddress, contractABI, signer);
  const transaction = await contract.mint(quantity);
  await transaction.wait();

  console.log("Mint transaction complete!");
}

async function deployAndMint(_ipfs, quantity, royaltyFee) {
  const _contract = await deploy(_ipfs, marketplaceAddress, royaltyFee);
  await mintNFT(_contract.address, quantity);
}

export default deployAndMint;