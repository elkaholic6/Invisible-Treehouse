import React from 'react';
import { treehouseLogo } from '../assets';

const PleaseConnectWallet = () => {
    return (
    <div className="flex flex-col items-center justify-center mt-5">
      <div className="text-white text-5xl font-bold mb-6 text-center">Welcome to the <span className='bg-gradient-to-r from-[#107013] via-green-600 to-green-800 text-transparent bg-clip-text'>Invisible Treehouse</span></div>
      <div className="flex items-center space-x-4">
        <div className="w-20 h-20 rounded-full flex items-center justify-center">
          <img
            src={treehouseLogo}
            alt="forest-icon"
            className="w-18 h-18 rounded-full"
          />
        </div>
      </div>
      <div className="text-white mt-8 px-5 text-center">
        Discover the hidden <span className='text-[#ece750]'>treasures</span> of the forest by connecting your wallet and entering the world of
        digital wonders.
      </div>
    </div>
    );
};


export default PleaseConnectWallet;
