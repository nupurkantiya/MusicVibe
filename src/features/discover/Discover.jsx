import React from 'react';
import { useSelector } from 'react-redux';

import { Error, Loader, SongCard } from '../../shared/components';
import { useGetTopChartsQuery } from '../../store/api/shazamApi';

const Discover = () => {
  const { activeSong, isPlaying } = useSelector((state) => state.player);
  
  // Use top charts since genre API is broken
  const { data, isFetching, error } = useGetTopChartsQuery();

  if (isFetching) return <Loader title="Loading top songs..." />;

  if (error) {
    console.error('Discover page error:', error);
    return (
      <div className="flex flex-col items-center justify-center h-64">
        <Error />
        <p className="text-gray-400 mt-4 text-center">
          Unable to load discover content.<br />
          Please check your internet connection and try again.
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col">
      <div className="w-full flex justify-between items-center sm:flex-row flex-col mt-4 mb-10">
        <h2 className="font-bold text-3xl text-white text-left">Discover Top Charts</h2>
        <p className="text-gray-400 text-sm mt-2 sm:mt-0">
          Trending music from around the world
        </p>
      </div>

      <div className="flex flex-wrap sm:justify-start justify-center gap-8">
        {data && data.length > 0 ? (
          data.map((song, i) => (
            <SongCard
              key={song.key || i}
              song={song}
              isPlaying={isPlaying}
              activeSong={activeSong}
              data={data}
              i={i}
            />
          ))
        ) : (
          <div className="flex flex-col items-center justify-center w-full h-64">
            <p className="text-gray-400 text-lg">No songs available</p>
            <p className="text-gray-500 text-sm mt-2">Please try refreshing the page.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Discover;
