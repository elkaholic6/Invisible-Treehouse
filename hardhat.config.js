require("@nomicfoundation/hardhat-toolbox");
require('dotenv').config();
const fs = require('fs');

const alchemyUrl = process.env.REACT_APP_ALCHEMY_API_URL;
const accounts = process.env.REACT_APP_PRIVATE_KEY;

task("accounts", "Prints the list of accounts", async (taskArgs, hre) => {
  const accounts = await hre.ethers.getSigners();

  for (const account of accounts) {
    console.log(account.address);
  }
});

module.exports = {
  defaultNetwork: "sepolia",
  etherscan: {
    apiKey: process.env.REACT_APP_ETHERSCAN_API,
  },
  networks: {
    localhost: {
      url: "http://127.0.0.1:8545",
      chainId: 31337
    },
    hardhat: {
      chainId: 1337
    },
    sepolia: {
      url: alchemyUrl,
      accounts: [ accounts ]
    }
  },
  solidity: {
    version: "0.8.17",
    settings: {
      optimizer: {
        enabled: true,
        runs: 200
      }
    }
  }
};