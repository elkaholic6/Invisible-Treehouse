import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ethers } from "ethers";
import { treehouseLogo } from '../assets';

let provider;
let signer;

function ConnectWallet({ fullAccount, setFullAccount }) {
    const [currentAccount, setCurrentAccount] = useState("Connect Wallet");
    
    
    const checkIfWalletIsConnected = async () => {
      try {
        const { ethereum } = window;
        if (!ethereum) {
          console.log("Make sure you have metamask!");
          return;
        }
  
        const accounts = await ethereum.request({ method: "eth_accounts" });
        const account = accounts[0];
        if(account == undefined) {
          return;
        }
        const slicedAccount = account.slice(0, 5) + '...' + account.slice(38, 42)
  
        if (accounts.length !== 0) {        
          setCurrentAccount(slicedAccount);
          setFullAccount(account);
          console.log("Found an authorized account:", account);
        } else {
          console.log("No authorized account found")
        }
      } catch (error) {
        console.log(error);
      }
    }

        //  This updates/maintains button state on page refresh
        useEffect(() => {
            checkIfWalletIsConnected();
        }, [])

        //   This is so that the button automatically updates when a wallet is disconnected
        useEffect(() => {
        if (window.ethereum) {
            window.ethereum.on("accountsChanged", (accounts) => {
            if (accounts.length > 0) {
                const account = accounts[0];
                setFullAccount(account);
                const slicedAccount = account.slice(0, 5) + '...' + account.slice(38, 42)
                setCurrentAccount(slicedAccount);
            } else {
                setCurrentAccount("Connect Wallet");
                setFullAccount("");
            }
            });
        }
        }, []);
  
    const connectWallet = async () => {
      try {
        const { ethereum } = window;
        if (!ethereum) {
          const metamaskLink = "https://metamask.io/download.html";
          alert(`To use this feature, please install MetaMask.\n\nGo here to download: ${metamaskLink}`);
          return;
        }
  
        const accounts = await ethereum.request({ method: "eth_requestAccounts" });
        provider = new ethers.providers.Web3Provider(window.ethereum);
        signer = provider.getSigner();
      } catch (error) {
        console.log(error)
      }
    }

  return (
    <div className="flex flex-row justify-start items-center">
      {currentAccount === 'Connect Wallet' ? (
        <button 
          className="md:flex hidden flex-initial w-32 btn bg-[#228c42] text-white hover:bg-[#1c6f35] rounded-md font-normal py-1 pl-2.5 mr-10 md:mr-3"
          onClick={connectWallet}>
            Connect Wallet
        </button>     
        ) : (
          <div className='md:flex hidden'>
            <Link to={`/treehouse-profile/${fullAccount}`}>
              <img src={treehouseLogo} alt='treehouseLogo' className='w-full h-12 object-contain rounded-full' />
            </Link> 
          </div>
        )
      }
    </div>
  )
}

export default ConnectWallet