import React from 'react'

function UploadMusicButton({ open, setOpen }) {
  return (
    <div>
        <button 
            onClick={() => setOpen(!open)}
            type="button"
            className="md:flex flex-initial w-32 btn bg-[#3a9619] text-white hover:bg-[#2e7715] rounded-md font-normal py-1 pl-3.5 mr-3">
            Upload Music
        </button>
    </div>
  )
}

export default UploadMusicButton