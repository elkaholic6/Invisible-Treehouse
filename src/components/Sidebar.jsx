import { useState } from 'react';
import { NavLink, Link } from 'react-router-dom';
import { RiCloseLine } from 'react-icons/ri';
import { treehouseLogoMidjourney } from '../assets';
import { links } from '../assets/constants';
import { HiOutlineMenu } from 'react-icons/hi';
import UploadMusicButton from './UploadMusicButton';

const NavLinks = ({ handleClick, fullAccount, showProfileLink }) => (
  <div className='mt-10'>
    {links.map((item) => (
      <>
        {showProfileLink && item.name === 'Profile' ? null : (
          <NavLink 
            key={item.name}
            to={item.to === '/treehouse-profile/:fullAccount' ? `/treehouse-profile/${fullAccount}` : item.to} 
            className='flex flex-row justify-start items-end my-8 text-sm font-medium text-gray-400 hover:text-green-500'
            onClick={() => handleClick && handleClick()}
          >
            <item.icon className='w-6 h-6 mr-2' />
            {item.name}
          </NavLink>
        )}
      </>
    ))}
  </div>
);

const Sidebar = ({ open, setOpen, fullAccount }) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <>
      <div className='md:flex hidden flex-col w-[240px] py-10 px-4 bg-gradient-to-tl from-black to-[#5a2d01]'>
        <Link
          to={{
            pathname: `/`,
          }}
        >
          <img src={treehouseLogoMidjourney} alt='logo' className='w-full h-22 object-contain rounded-full' />
        </Link>
        <NavLinks fullAccount={fullAccount} showProfileLink={!mobileMenuOpen}/>
      </div>
      <div className='absolute md:hidden block top-6 right-3'>
        {mobileMenuOpen ? (
          <RiCloseLine className='w-6 h-6 text-white mr-2' onClick={() => setMobileMenuOpen(false)} />
        ) : <HiOutlineMenu className='w-6 h-6 text-white mr-2' onClick={() => setMobileMenuOpen(true)} />}
      </div>

      <div className={`absolute top-0 h-screen w-2/3 bg-gradient-to-tl from-white/10 to-[#593c28] backdrop-blur-lg z-10 p-6 md:hidden smooth-transition ${mobileMenuOpen ? 'left-0' : '-left-full'}`}>
        <div className='flex items-center'>
          <Link
            to={{
              pathname: `/`,
            }}
          >
            <img src={treehouseLogoMidjourney} alt='logo' className=' h-20 object-contain rounded-full' onClick={() => setMobileMenuOpen(false)}/>
          </Link>
        </div>
        <div className='absolute top-28'>
          <NavLinks fullAccount={fullAccount} showProfileLink={!mobileMenuOpen} handleClick={() => setMobileMenuOpen(false) }/>
        </div>
        <div className='absolute top-1/2'>
          <UploadMusicButton open={open} setOpen={setOpen}/>
        </div>
      </div>
    </>
  )
};

export default Sidebar;
