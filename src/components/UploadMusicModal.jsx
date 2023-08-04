import React, { useState, useEffect } from 'react'
import { NFTStorage } from 'nft.storage';
import deployAndMint from "../../scripts/deploy";
import { genres } from '../assets/constants';
import { RiCloseLine } from 'react-icons/ri';
import UploadMusicButton from './UploadMusicButton';
import ErrorMessage from './ErrorMessage';
import ConsoleLogMessage from './ConsoleLogMessage';


const API_KEY = import.meta.env.VITE_REACT_APP_NFT_STORAGE_KEY;

function UploadMusicModal({ fullAccount, open, setOpen }) {
    const [genre, setGenre] = useState('POP');
    const [artistTerm, setArtistTerm] = useState('');
    const [titleTerm, setTitleTerm] = useState('');
    const [audioTerm, setAudioTerm] = useState('');
    const [coverArtTerm, setCoverArtTerm] = useState('');
    const [quantity, setQuantity] = useState('');
    const [royaltyFee, setRoyaltyFee] = useState('');
    const [progressPercentage, setProgressPercentage] = useState(0);
    const [resizedImg, setResizedImg] = useState();
    const [isUploading, setIsUploading] = useState(false);
    const [URI, setURI] = useState('');
    const [isDeploying, setIsDeploying] = useState(false);
    const [readyForDeploy, setReadyForDeploy] = useState(false);
    const [error, setError] = useState(null);
    const [consoleLogMessage, setConsoleLogMessage] = useState('');


    const canvas = document.querySelector('#canvas');
    const canvasCtx = canvas.getContext('2d');

    function readUrl() {
        let file = coverArtTerm;
        const reader = new FileReader();

        reader.onload = e => {
            openImage(reader.result);
        };
        reader.readAsDataURL(file);
    };

    function openImage(imageSrc) {
        let activeImage = new Image();
        const width = canvas.width;
        const height = canvas.height;

        activeImage.addEventListener('load', () => {
            canvasCtx.drawImage(activeImage, 0, 0, width, height);

            canvas.toBlob(blob => {
                setResizedImg(blob);
            });
        });

        activeImage.src = imageSrc;
    };

    if (coverArtTerm) {
        readUrl()
    };

    if (progressPercentage === 100) {
        setTimeout(() => {
            setProgressPercentage(0);
            setOpen(false);
        }, 1000);
    };


    async function uploadMusicToIPFS() {
        try {
        setError(null);
        setConsoleLogMessage("Storing to ipfs...");
        setIsUploading(true);
        const client = new NFTStorage({ token: API_KEY });

        const audioBlob = new Blob([audioTerm]);
        const imageBlob = new Blob([coverArtTerm], { type: 'image/png' });

        const nft = {
            image: imageBlob,
            animation_url: audioBlob,
            name: titleTerm,
            description: genre,
            properties: {
                artist: artistTerm,
                songOwner: fullAccount,
            }
        }

        const metadata = await client.store(nft);

        setConsoleLogMessage('Metadata stored! Continue to make this an NFT');
        console.log('Metadata URI: ', metadata.url);
        const uri = metadata.url;
        setURI(uri);
        setIsUploading(false);
        setReadyForDeploy(true);

        } catch (error) {
            const errorMessage = error.message;
            setError(errorMessage);
            setIsUploading(false);
            setConsoleLogMessage('');
        }
    }

    async function deployNFT() {
        try {
        setIsDeploying(true);
        setConsoleLogMessage('First, deploying. Second, mint your NFT(s)...');
        await deployAndMint(URI, quantity, royaltyFee);
        console.log('nft contract deployed...');
        setConsoleLogMessage('NFT contract deployed! How cool!');
        setTimeout(() => {
            setReadyForDeploy(false);
            setIsDeploying(false);
            setOpen(false);
            resetFields();
        }, 2000); 
        


        } catch (error) {
            const errorMessage = error.message;
            setError(errorMessage);
            setIsDeploying(false);
            setConsoleLogMessage('');
        }
    }

    const resetFields = () => {
        setArtistTerm('');
        setTitleTerm('');
        setAudioTerm('');
        setCoverArtTerm('');
        setQuantity('');
        setRoyaltyFee('');
        setIsUploading(false);
        setIsDeploying(false);
        setError(null);
        setConsoleLogMessage('');
      };

return (
    <div className="flex flex-row justify-start items-center">
        {fullAccount && (
            <div className='md:flex hidden'>
                <UploadMusicButton open={open} setOpen={setOpen}/>
            </div>
        )}
        
        {open && (
        <div className='bg-black bg-opacity-40 absolute inset-0 bottom-28 flex justify-center items-center z-10'>
            <div className={`bg-[#f3e8db] rounded-lg w-96 ${readyForDeploy ? 'h-fit' : 'h-[80vh]' } overflow-y-auto`}>
                <div className='flex justify-between items-center'>
                        <h4 className='text-2xl flex justify-center p-2 ml-4 font-medium text-black'>Song Upload</h4>
                        <RiCloseLine 
                            className='w-6 h-6 text-black mr-2 mb-4 cursor-pointer' 
                            onClick={() => {
                                setOpen(false);
                                resetFields();
                            }}
                        />
                </div>
                {!readyForDeploy && (        
                <div className="inline-block mt-0">
                    <form>
                        <div className="grid grid-cols-5 gap-4">
                            <div className="text-black flex items-center text-l pl-8">Artist:</div>
                            <input 
                            name="artist-field"
                            type='text'
                            autoComplete="off"
                            placeholder="Artist Name(s)"
                            value={artistTerm}
                            onChange={(e) => setArtistTerm(e.target.value)}
                            required
                            className="flex-1 col-start-2 col-span-4 bg-transparent border-none outline-none placeholder-gray-500 text-base text-black p-1 bg-[#d8cdc4] my-2 mr-8 ml-4 rounded-lg"
                            />
                        </div>
                        <div className="grid grid-cols-5 gap-4">
                            <div className="text-black flex items-center text-l pl-8">Title:</div>
                            <input 
                            name="title-field"
                            type='text'
                            autoComplete="off"
                            placeholder="Song Title"
                            value={titleTerm}
                            onChange={(e) => setTitleTerm(e.target.value)}
                            required
                            className="flex-1 col-start-2 col-span-4 bg-transparent border-none outline-none placeholder-gray-500 text-base text-black p-1 bg-[#d8cdc4] my-2 mr-8 ml-4 rounded-lg"
                            />
                        </div>
                        <div className="grid grid-cols-5 gap-4">
                            <div className="text-black flex items-center text-l pl-8">Audio:</div>
                            <input 
                            name="audio-field"
                            type='file'
                            accept='.mp3, .mp4, .wav'
                            autoComplete="off"
                            onChange={(e) => setAudioTerm(e.target.files[0])}
                            required
                            className="flex-1 col-start-2 col-span-4 bg-transparent border-none outline-none placeholder-gray-500 text-base text-black p-1 bg-[#d8cdc4] my-2 mr-8 ml-4 rounded-lg"
                            />
                        </div>
                        <div className="grid grid-cols-5 gap-4">
                                <div className="text-black flex items-center text-l pl-8">Cover Art:</div>
                                <input 
                                name="coverArt-field"
                                type='file'
                                id="myfile"
                                accept='.png, .jpg'
                                autoComplete="off"
                                onChange={(e) => setCoverArtTerm(e.target.files[0])}
                                required
                                className="flex-1 col-start-2 col-span-4 bg-transparent border-none outline-none placeholder-gray-500 text-base text-black p-1 bg-[#d8cdc4] my-2 mr-8 ml-4 rounded-lg"
                                />
                        </div>
                        <h5 className='text-xs ml-5 mt-1 text-gray-700'>Preview of image shown below: 350x350px</h5>
                        <canvas id='canvas' 
                                width='350' 
                                height='350' 
                                className='bg-[#e6dcd1] ml-4 mt-1 mb-2'
                                placeholder='Preview image'>
                        </canvas>
                    </form>
                </div>
                )}

                {readyForDeploy && ( 
                <div className="inline-block mt-0">
                    <form>
                        <div className="grid grid-cols-5 gap-4">
                            <div className="text-black flex items-center text-l pl-8">Quantity:</div>
                            <input 
                            name="quantity-field"
                            type='text'
                            autoComplete="off"
                            placeholder="Quantity to mint"
                            value={quantity}
                            onChange={(e) => setQuantity(e.target.value)}
                            required
                            className="flex-1 col-start-2 col-span-4 bg-transparent border-none outline-none placeholder-gray-500 text-base text-black p-1 bg-[#d8cdc4] my-2 mr-8 ml-4 rounded-lg"
                            />
                        </div>
                        <div className="grid grid-cols-5 gap-4">
                            <div className="text-black flex items-center text-l pl-8">Royalty Fee:</div>
                            <input 
                            name="royaltyFee-field"
                            type='text'
                            autoComplete="off"
                            placeholder="Basis points, e.g. 500 = 5%"
                            value={royaltyFee}
                            onChange={(e) => setRoyaltyFee(e.target.value)}
                            required
                            className="flex-1 col-start-2 col-span-4 bg-transparent border-none outline-none placeholder-gray-500 text-base text-black p-1 bg-[#d8cdc4] my-2 mr-8 ml-4 rounded-lg"
                            />
                        </div>
                    </form>
                </div>
                )}
                
                <div className='flex items-center flex-row justify-between'>
                    

                    {/* <-- UPLOAD BUTTON --> */}
                    {!readyForDeploy && (
                        <>   
                        {/* <-- GENRE DROP DOWN --> */}
                            <select 
                                onChange={(e) => setGenre(e.target.value)}
                                value={genre}
                                className='bg-[#4f483c] text-gray-300 p-1 text-sm rounded-lg outline-none mt-1 ml-7 mb-1 h-10 cursor-pointer'
                            >
                                {genres.map((genre) => <option key={genre.value} value={genre.value}>{genre.title}</option>)}
                            </select>                     
                            <div className='m-3 flex justify-end space-x-3'>
                                <button 
                                onClick={uploadMusicToIPFS}
                                className='px-5 py-2 mr-3 bg-[#d47e3d] text-black rounded-lg font hover:bg-[#b3682e]'
                                disabled={isUploading || !(artistTerm && artistTerm.trim() !== '' && titleTerm && titleTerm.trim() !== '' && audioTerm && audioTerm.name.trim() !== '' && coverArtTerm && coverArtTerm.name.trim() !== '')}
                                >
                                {isUploading ? (
                                        <div className="flex items-center gap-2 text-black">
                                            <span className="h-5 w-5 block rounded-full border-4 border-t-blue-300 animate-spin"></span>
                                            Loading...
                                        </div>
                                    ) : (
                                        <div className="flex items-center gap-2 text-black">
                                            Upload
                                        </div>
                                )}
                                </button>
                            </div>
                        </>
                    )}

                    {/* <-- DEPLOY --> */}
                    {readyForDeploy && (
                        <div className='m-3 flex justify-end space-x-3'>
                            <button 
                            onClick={deployNFT}
                            className='px-5 py-2 ml-3 bg-[#d47e3d] text-black rounded-lg font hover:bg-[#b3682e]'
                            disabled={isDeploying || !(quantity.trim() !== '' && royaltyFee.trim() !== '')}
                            >
                            {isDeploying ? (
                                <div className="flex items-center gap-2 text-black">
                                    <span className="h-5 w-5 block rounded-full border-4 border-t-blue-300 animate-spin"></span>
                                    Deploying...
                                </div>
                                ) : (
                                    'Deploy'
                                )}
                            </button>
                        </div>
                    )}
                        
                </div>

                <div className='w-1/2 ml-4'>
                        {consoleLogMessage && !error ? (
                            <div className='visible'>
                                <ConsoleLogMessage message={consoleLogMessage} />
                            </div>
                        ) : (
                            <div className='invisible'></div>
                        )}

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
        </div>
        )}
    </div>
  )
}

export default UploadMusicModal