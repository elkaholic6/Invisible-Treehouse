import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { FiSearch, FiX } from 'react-icons/fi';

const Searchbar = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();

    navigate(`/search/${searchTerm}`)
  };

  const handleClear = () => {
    setSearchTerm('');
    navigate('/');
  };

  return (
    <form onSubmit={handleSubmit} autoComplete="off" className="p-2 text-gray-400 focus-within:text-gray-600">
      <label htmlFor="search-field" className="sr-only">
        Search all songs
      </label>
      <div className="flex flex-row justify-start items-center">
        <FiSearch className="w-5 h-5 ml-4"/>
        <input 
        name="search-field"
        autoComplete="off"
        id="search-field"
        placeholder="Search"
        type="text"
        value={searchTerm}
        onChange={(e) => {
          setSearchTerm(e.target.value)}
        }
        className="flex-1 bg-transparent border-none outline-none placeholder-gray-500 text-base text-white p-4"
        />
        {searchTerm && (
          <button
            type="button"
            className="cursor-pointer"
            onClick={handleClear}
          >
            <FiX className="w-5 h-5" />
          </button>
        )}
      </div>
    </form>
  )
}

export default Searchbar;
