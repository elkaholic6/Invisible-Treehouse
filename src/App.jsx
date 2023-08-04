import { useSelector } from 'react-redux';
import React, { useState, useEffect } from 'react';
import { Route, Routes } from 'react-router-dom';

import { Searchbar, Sidebar, MusicPlayer, UploadMusicModal, ConnectWallet, PleaseConnectWallet } from './components';
import { Search, Marketplace, NFTDetails, Profile, SongDetails } from './pages';
import TreehouseMusic from './pages/TreehouseMusic';

const App = () => {
  const [open, setOpen] = useState(false);
  const [fullAccount, setFullAccount] = useState('');
  const [isWalletConnected, setIsWalletConnected] = useState(false);
  const { currentTitle } = useSelector((state) => state.player);


  useEffect(() => {
    const checkWalletConnection = async () => {
      try {
        const accounts = await window.ethereum.request({ method: 'eth_accounts' });
        if (accounts.length > 0) {
          setIsWalletConnected(true);
          setFullAccount(accounts[0]);
        } else {
          setIsWalletConnected(false);
          setFullAccount('');
        }
      } catch (error) {
        setIsWalletConnected(false);
        setFullAccount('');
      }
    };

    checkWalletConnection();

    const handleAccountsChanged = (accounts) => {
      if (accounts.length > 0) {
        setIsWalletConnected(true);
        setFullAccount(accounts[0]);
      } else {
        setIsWalletConnected(false);
        setFullAccount('');
      }
    };

    if (window.ethereum) {
      window.ethereum.on('accountsChanged', handleAccountsChanged);
    }

    return () => {
      if (window.ethereum) {
        window.ethereum.removeListener('accountsChanged', handleAccountsChanged);
      }
    };
  }, []);


  return (
    <div className="relative flex">
      {isWalletConnected ? (
        <>
          <Sidebar open={open} setOpen={setOpen} fullAccount={fullAccount}/>
          <div className="flex-1 flex flex-col bg-gradient-to-br from-black to-[#8a4601] min-h-screen">
              <div className='flex-1 flex flex-row justify-between mr-3'>
                <Searchbar />
                <div className='flex flex-row'>
                  <UploadMusicModal fullAccount={fullAccount} open={open} setOpen={setOpen}/>
                  <ConnectWallet fullAccount={fullAccount} setFullAccount={setFullAccount}/>
                </div>  
              </div>

              <div className="px-6 h-[calc(100vh-72px)] overflow-y-scroll hide-scrollbar flex xl:flex-row">
                <div className="flex-1 h-fit pb-40">
                  <Routes>
                    <Route path="/" element={<TreehouseMusic />} />
                    <Route path="/treehouse-marketplace" element={<Marketplace />} />
                    <Route path="/treehouse-song/:cid" element={<SongDetails />} />
                    <Route path="/search/:searchTerm" element={<Search />} />
                    <Route path="/treehouse-nft/:minterContract/:tokenId/:listingId" element={<NFTDetails />} />
                    <Route path="/treehouse-profile/:fullAccount" element={<Profile />} />
                  </Routes>
                </div>
              </div>
            </div>
          
            {currentTitle && (
              <div className="absolute h-28 bottom-0 left-0 right-0 flex animate-slideup bg-gradient-to-br from-white/10 to-[#804c2a] backdrop-blur-lg rounded-t-3xl z-10">
                <MusicPlayer />
              </div>
            )}  
          </>
        ) : (
          <div className="flex-1 flex flex-col bg-gradient-to-br from-black to-[#8a4601] min-h-screen">
            <div className="flex flex-1 justify-center items-center h-screen">
              <div className="flex flex-col items-center justify-center">
                <PleaseConnectWallet />
                <div className="flex flex-row pt-8">
                  <ConnectWallet fullAccount={fullAccount} setFullAccount={setFullAccount} />
                </div>
              </div>
            </div>
          </div>
        )}
      

      
    </div>
  );
};

export default App;