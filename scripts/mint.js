// import { ethers } from "ethers";
// import Minter from '../artifacts/contracts/mint/Minter.sol/Minter.json';
// // require('dotenv').config();


// async function mintNFT(contractAddress) {
//   // Connect to the network and create a provider
//   const provider = new ethers.providers.Web3Provider(window.ethereum);
//   console.log('provider, ', provider);
//   const signer = provider.getSigner();
//   console.log('signer: ', signer);

//   const account = await signer.getAddress();
//   console.log("Minting contracts with the account: ", account);

//   // Set the contract address and ABI
// //   const contractAddress = "0xc70Fc585c8b57dd255A219efE30A3644AAA7BCBA";
//   const contractABI = Minter.abi;

//   // Create a contract instance
//   const contract = new ethers.Contract(contractAddress, contractABI, signer);

//   // Call the mint function
//   const tokenId = 1; // The ID of the token you want to mint
//   const amount = 1; // The number of tokens to mint
//   const value = ethers.utils.parseUnits("0.00005", "ether"); // The price in ether

//   // Send the transaction
//   const transaction = await contract.mint(amount, { value: value });
//   await transaction.wait();

//   console.log("Mint transaction complete!");
// }

// export default mintNFT;
// // mint()
// //   .then(() => process.exit(0))
// //   .catch((error) => {
// //     console.error(error);
// //     process.exit(1);
// //   });
