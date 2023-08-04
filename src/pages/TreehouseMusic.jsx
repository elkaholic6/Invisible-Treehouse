import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Link } from 'react-router-dom';
import TreehouseSongCard from '../components/TreehouseSongCard';
import { genres } from '../assets/constants';
import { selectGenreListId, playPause } from '../redux/features/playerSlice';
import fetchIPFSMetadata from '../customHooks/fetchIPFSMetadata';
import { useFetchNftsQuery } from '../redux/services/nftStorageApi';
import { Error, Loader } from '../components';


const TreehouseMusic = () => {

    const dispatch = useDispatch();

    const [songMetadataArray, setSongMetadataArray] = useState([]);

    const { activeSong, isPlaying, genreListId, songData, currentIndex } = useSelector((state) => state.player);
    const { data, isFetching, error } = useFetchNftsQuery();

    useEffect(() => {
        const fetchMetadataAndSetState = async () => {
          try {
            const metadata = await fetchIPFSMetadata(data);
            setSongMetadataArray(metadata);
          } catch (error) {
            console.log('Error fetching metadata', error);
          }
        };
        if(data) {
          fetchMetadataAndSetState();
        }
      }, [data]);

    if(error) return <Error />;


    const genreTitle = genres.find(({ value }) => value === genreListId)?.title;
    const genreValue = genres.find(({ value }) => value === genreListId)?.value;

    return (
        <div className='flex flex-col'>
            <div className='w-full flex justify-between items-center sm:flex-row flex-col mt-4 mb-10'>
                <h2 className='font-bold text-3xl text-white text-left'>Treehouse Music {genreTitle}</h2>
                <select 
                    onChange={(e) => dispatch(selectGenreListId(e.target.value))}
                    value={genreListId || 'all'}
                    className='bg-black text-gray-300 p-3 text-sm rounded-lg outline-none sm:mt-0 mt-5 cursor-pointer'
                >
                    {genres.map((genre) => <option key={genre.value} value={genre.value}>{genre.title}</option>)}
                </select>
            </div>
            <div className='flex flex-wrap sm:justify-start justify-center gap-8'>
                {songMetadataArray.length > 0 ? (
                    genreValue === 'ALL'
                    ? songMetadataArray.map(({ name, animation_url, image, properties, cid }) => (
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
                              i: currentIndex,
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
                            songList={songMetadataArray}
                            i={currentIndex}
                          />
                        </Link>
                      ))
                    : songMetadataArray
                        .filter(function (genre) {
                          return genre.description === genreValue;
                        })
                        .map(({ name, animation_url, image, properties, cid }) => (
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
                                i: currentIndex,
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
                              songList={songMetadataArray}
                              i={currentIndex}
                            />
                          </Link>
                        ))
                ) : (
                  <Loader title="Entering the Treehouse..." />
                )}
            </div>
        </div>
    )
};

export default TreehouseMusic;