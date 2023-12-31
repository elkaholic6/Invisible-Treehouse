import React, { useState, useEffect } from 'react'
import { marketplaceContract } from '../customHooks/fetchMarketplaceContractWithWallet';
import { marketplaceAddress } from '../customHooks/fetchMarketplaceContract';
import Minter from '../../artifacts/contracts/mint/Minter.sol/Minter.json';
import { ethers } from "ethers";
import { createPortal } from 'react-dom';
import { RiCloseLine } from 'react-icons/ri';
import ErrorMessage from './ErrorMessage';

function UpdateListing({ minterContractFromNFTDetails, imageFromNFTDetails, listingIdFromNFTDetails }) {
    const [open, setOpen] = useState(false);
    const [genre, setGenre] = useState('POP');
    const [minterAddress, setMinterAddress] = useState('');
    const [quantity, setQuantity] = useState('');
    const [price, setPrice] = useState('');
    const [imageUri, setImageUri] = useState('');
    const [progressPercentage, setProgressPercentage] = useState(0);
    const [connectedWallet, setConnectedWallet] = useState('');
    const [isUpdating, setIsUpdating] = useState(false);
    const [error, setError] = useState(null);

    const [isWalletConnected, setIsWalletConnected] = useState(false);

    useEffect(() => {
        // Check if the user's wallet is connected
        const checkWalletConnection = async () => {
          try {
            const accounts = await window.ethereum.request({ method: 'eth_accounts' });
            const account = accounts[0];
            setConnectedWallet(account);
            setIsWalletConnected(true);
          } catch (error) {
            setIsWalletConnected(false);
          }
        };
      
        checkWalletConnection();
      
        // Cleanup function to reset the wallet connection status when the component unmounts
        return () => {
          setConnectedWallet('');
          setIsWalletConnected(false);
        };
      }, []);
      


    const canvas = document.querySelector('#canvas');
    const canvasCtx = canvas.getContext('2d');


    function openImage(_imageUri) {
        let activeImage = new Image();
        const width = canvas.width;
        const height = canvas.height;

        activeImage.addEventListener('load', () => {
            canvasCtx.drawImage(activeImage, 0, 0, width, height);
        });

        activeImage.src = _imageUri;
    };

    if (imageUri) {
        openImage(imageUri)
    };

    if (minterAddress) {
        getImageFromURI();
    };
    
    async function getImageFromURI() {
        const minterContractAddress = minterAddress;
        const abi = Minter.abi;
        const provider = new ethers.providers.Web3Provider(window.ethereum);
        const signer = provider.getSigner();
        const _minterContract = new ethers.Contract(minterContractAddress, abi, signer);
        const uri = await _minterContract.uri(1);
        const cleanedUrl = uri.replace("ipfs://", "").replace("/metadata.json", "");

        const response = await fetch(`https://ipfs.io/ipfs/${cleanedUrl}/metadata.json`);
        const metadata = await response.json();
        const cleanedImage = metadata.image.replace('ipfs://', 'https://ipfs.io/ipfs/');

        setImageUri(cleanedImage);
    }

    const resetFields = () => {
        setMinterAddress('');
        setQuantity('');
        setPrice('');
        setIsUpdating(false);
        setError(null);
      };

    async function updateTheListing() {
        try {
            setError(null); 
            const value = ethers.utils.parseUnits(price, "ether");

            const abi = Minter.abi;
            const provider = new ethers.providers.Web3Provider(window.ethereum);
            const signer = provider.getSigner();
            const _minterContractFromNFTDetails = new ethers.Contract(minterContractFromNFTDetails, abi, signer);
            

            const listingParams = {
                minterContract: minterContractFromNFTDetails,
                tokenId: 1,
                quantity: quantity,
                pricePerToken: value,
                currentlyListed: true
            };
            const isApproved = await _minterContractFromNFTDetails.isApprovedForAll(connectedWallet, marketplaceAddress);
            if(!isApproved) {
                await _minterContractFromNFTDetails.setApprovalForAll(marketplaceAddress, true);
            }
            setIsUpdating(true);
            await marketplaceContract.updateListing(listingParams, listingIdFromNFTDetails);
            
            setTimeout(() => {
                setOpen(false);
                resetFields();
            }, 2000); 

            setIsUpdating(false);
        } catch (error) {
            const errorMessage = error.message;
            setError(errorMessage);
            setIsUpdating(false);
        }

    }

  return (
<div className="flex flex-row justify-start items-center">
    {isWalletConnected ? (
        <>
        <button 
        onClick={() => setOpen(!open)}
        type="button"
        className="flex flex-initial justify-center w-32 btn bg-[#3a9619] text-white hover:bg-[#2e7715] rounded-md font-normal py-1 ml-3">
        Update
        </button>

        {open && (
        <>
        {createPortal(
        <div className='bg-black bg-opacity-40 absolute inset-0 bottom-28 flex justify-center items-center z-10'>
            <div className='bg-[#f3e8db] rounded-lg w-96 h-[90%] sm:h-[80%] overflow-y-auto'>
                <div className='flex justify-between items-center'>
                        <h4 className='text-2xl flex justify-center p-2 ml-4 font-medium text-black'>Update NFT</h4>
                        <RiCloseLine 
                        className='w-6 h-6 text-black mr-2 mb-4 cursor-pointer' 
                        onClick={() => {
                            setOpen(false);
                            resetFields();
                        }}
                        />
                </div>
                <div className="inline-block mt-0">
                    <form>
                        {minterContractFromNFTDetails ? (
                            <div className="grid grid-cols-5 gap-4">
                                <div className="text-black flex items-center text-l pl-8">Address:</div>
                                <input 
                                name="minterAddress-field"
                                type='text'
                                autoComplete="off"
                                placeholder="NFT Contract Address"
                                value={minterContractFromNFTDetails}
                                onChange={(e) => {
                                    setMinterAddress(minterContractFromNFTDetails);
                                }}
                                required
                                disabled={true}
                                className="flex-1 col-start-2 col-span-4 bg-transparent border-none outline-none placeholder-gray-500 text-base text-black p-1 bg-[#d8cdc4] my-2 mr-8 ml-4 rounded-lg"
                                />
                            </div>
                        ) : (
                            <div className="grid grid-cols-5 gap-4">
                                <div className="text-black flex items-center text-l pl-8">Address:</div>
                                <input 
                                name="minterAddress-field"
                                type='text'
                                autoComplete="off"
                                placeholder="NFT Contract Address"
                                value={minterAddress}
                                onChange={(e) => {
                                    setMinterAddress(e.target.value);
                                }}
                                required
                                className="flex-1 col-start-2 col-span-4 bg-transparent border-none outline-none placeholder-gray-500 text-base text-black p-1 bg-[#d8cdc4] my-2 mr-8 ml-4 rounded-lg"
                                />
                            </div>
                        )}
                        <div className="grid grid-cols-5 gap-4">
                            <div className="text-black flex items-center text-l pl-8">Quantity:</div>
                            <input 
                            name="quantity-field"
                            type='text'
                            autoComplete="off"
                            placeholder="Quantity"
                            value={quantity}
                            onChange={(e) => {
                                setQuantity(e.target.value);
                            }}
                            required
                            className="flex-1 col-start-2 col-span-4 bg-transparent border-none outline-none placeholder-gray-500 text-base text-black p-1 bg-[#d8cdc4] my-2 mr-8 ml-4 rounded-lg"
                            />
                        </div>
                        <div className="grid grid-cols-5 gap-4">
                            <div className="text-black flex items-center text-l pl-8">Price:</div>
                            <input 
                            name="price-field"
                            type='text'
                            autoComplete="off"
                            placeholder="Price in ether e.g. 0.01"
                            value={price ? price : ""}
                            onChange={(e) => {
                                setPrice(e.target.value);
                            }}
                            required
                            className="flex-1 col-start-2 col-span-4 bg-transparent border-none outline-none placeholder-gray-500 text-base text-black p-1 bg-[#d8cdc4] my-2 mr-8 ml-4 rounded-lg"
                            />
                        </div>
                        {imageFromNFTDetails ? (
                            <div>
                                <h5 className='text-xs ml-5 mt-1 text-gray-700'>Preview of image shown below: 350x350px</h5>
                                <div className='flex justify-center rounded-sm'>
                                    <img alt='song_img' src={imageFromNFTDetails} width='350' height='350'/>
                                </div>
                            </div>
                        ) : (
                            <div>
                                <h5 className='text-xs ml-5 mt-1 text-gray-700'>Preview of image shown below: 350x350px</h5>
                                <canvas id='canvas' 
                                        width='350' 
                                        height='350' 
                                        className='bg-[#e6dcd1] ml-4 mt-1 mb-2'
                                        placeholder='Preview image'>
                                </canvas>
                            </div>
                        )}
                        
                </form>
                </div>
                <div className='flex items-center flex-row'>

                    {/* <-- UPDATE LIST BUTTON --> */}
                    <div>
                            <div className='m-3 flex justify-end space-x-3'>
                                <button 
                                id='UpdateListing-btn'
                                onClick={updateTheListing}
                                className='px-5 py-2 bg-[#d47e3d] text-black rounded-lg font hover:bg-[#b3682e]'
                                disabled={isUpdating || !(quantity.trim() !== '' && price.trim() !== '')}
                                >
                                {isUpdating ? (
                                        <div className="flex items-center gap-2 text-black">
                                            <span className="h-5 w-5 block rounded-full border-4 border-t-blue-300 animate-spin"></span>
                                            Updating...
                                        </div>
                                    ) : (
                                        <div className="flex items-center gap-2 text-black">
                                            Update
                                        </div>
                                )}
                                </button>
                            </div>
                    </div>                      
                
                    {error ? (
                        <div className='visible'>
                            <ErrorMessage message={error} />
                        </div>
                    ) : (
                        <div className='invisible'></div>
                    )}
                </div>
                
                {/* <-- PROGRESS BAR --> */}
                <div className={`flex flex-start bg-[#0a0806] overflow-hidden w-5/6 ml-8 h-1.5 my-1 rounded-sm font-sans text-xs font-medium text-center ${progressPercentage === 0 ? 'invisible' : 'visible'}`}>
                    <div 
                        className="flex justify-center items-center h-full bg-[#afb748] text-white" 
                        style={{ width: `${progressPercentage}%`}}>    
                    </div>
                </div> 
            </div>
            </div>,
        document.getElementById('modal-root')
        )};
        </>
        )}
        </>
    ) : (
        "Please connect wallet"
    )}
</div>
  )
}

export default UpdateListing