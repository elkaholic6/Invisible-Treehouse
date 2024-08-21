import { ethers } from "ethers";
import Minter from '../artifacts/contracts/mint/Minter.sol/Minter.json';
import { marketplaceAddress } from "../src/customHooks/fetchMarketplaceContract";

let account;

async function getSigner() {
  try {
    if (!window.ethereum) {
      throw new Error('Ethereum provider (MetaMask) is not available');
    }
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    await window.ethereum.request({ method: 'eth_requestAccounts' });
    const signer = provider.getSigner();
    return signer;
  } catch (error) {
    console.error("Error getting signer:", error);
    throw error;
  }
}

async function getAccountAddress() {
  try {
    const signer = await getSigner();
    const account = await signer.getAddress();
    if (!account) {
      throw new Error('Account address is null');
    }
    return account;
  } catch (error) {
    console.error("Error getting account address:", error);
    throw error;
  }
}

async function deploy(_ipfs, marketplaceContract, royaltyFee) {
  account = await getAccountAddress();

  const signer = await getSigner();


  const minterFactory = new ethers.ContractFactory(
    Minter.abi,
    Minter.bytecode,
    signer
  );
  console.log("Deploying Minter contract...");
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
  const signer = await getSigner();
  const contractABI = Minter.abi;


  const contract = new ethers.Contract(contractAddress, contractABI, signer);
  const transaction = await contract.mint(quantity);
  await transaction.wait();

  console.log("Mint transaction complete!");
}

async function deployAndMint(_ipfs, quantity, royaltyFee) {
  const _contract = await deploy(_ipfs, marketplaceAddress, royaltyFee);
  console.log("Deployed contract address:", _contract.address);
  await mintNFT(_contract.address, quantity);
}

export default deployAndMint;