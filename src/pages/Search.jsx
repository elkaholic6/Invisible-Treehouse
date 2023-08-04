import { useSelector } from 'react-redux';
import { useParams, Link } from 'react-router-dom';
import { useFetchNftsQuery } from '../redux/services/nftStorageApi';

import { Error, Loader, TreehouseSongCard } from '../components';
import fetchIPFSMetadata from '../customHooks/fetchIPFSMetadata';
import { useState, useEffect } from 'react';

const Search = () => {
    const [results, setResults] = useState([]);
    const [songMetadataArray, setSongMetadataArray] = useState([]);
    
    const { searchTerm } = useParams();
    const { activeSong, isPlaying, songData, currentIndex } = useSelector((state) => state.player);
    const { data, isFetching, error } = useFetchNftsQuery();

    useEffect(() => {
        const fetchMetadataAndSetState = async () => {
          try {
            const metadata = await fetchIPFSMetadata(data);
            setSongMetadataArray(metadata);
            const filteredSongs = metadata.filter((song) => {
                return song.name.toLowerCase().includes(searchTerm.toLowerCase()) || song.properties.artist.toLowerCase().includes(searchTerm.toLowerCase()) || song.description.includes(searchTerm.toUpperCase());
            });
            setResults(filteredSongs);
          } catch (error) {
            console.log('Error fetching metadata', error);
          }
        };
        if(data) {
          fetchMetadataAndSetState();
        }
      }, [data, searchTerm]);
    
    

    return (
        <div className='flex flex-col'>
            <h2 className='font-bold text-3xl text-white text-left mt-4 mb-10'>
                Showing results for <span className='font-black'>{searchTerm}</span>
            </h2>
            <div className='flex flex-wrap sm:justify-start justify-center gap-8'>
                {results?.map(({name, animation_url, image, properties, cid}) => (
                <Link
                  to={{
                    pathname: `/treehouse-song/${cid}`,
                    
                  }}
                  state={{
                    songInfo: {
                      name,
                      artist: properties.artist,
                      animation_url,
                      image,
                      isPlaying,
                      activeSong,
                      songData,
                      id: cid,
                      songList: songMetadataArray,
                      i: currentIndex
                    },
                  }}
                  key={cid}
                >
                  <TreehouseSongCard
                      key={cid}
                      name={name}
                      artist={properties.artist}
                      animation_url={animation_url}
                      image={image}
                      isPlaying={isPlaying}
                      activeSong={activeSong}
                      songData={songData}
                      id={cid}
                      songList={results}
                      i={currentIndex}
                  />
                  </Link>
              ))}
            </div>
        </div>
    );
};

export default Search;

