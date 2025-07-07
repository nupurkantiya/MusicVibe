import React from 'react';
import { Link } from 'react-router-dom';
import { useDispatch } from 'react-redux';

import PlayPause from './ui/PlayPause';
import { playPause, setActiveSong } from '../../store/slices/playerSlice';
import { getSongImage, isValidSong } from '../utils/apiTransformers';

const SongCard = ({ song, isPlaying, activeSong, data, i }) => {
  const dispatch = useDispatch();

  // Don't render if song data is invalid
  if (!isValidSong(song)) {
    console.warn('Invalid song data in SongCard:', song);
    return null;
  }

  const handlePauseClick = () => {
    dispatch(playPause(false));
  };

  const handlePlayClick = () => {
    dispatch(setActiveSong({ song, data, i }));
    dispatch(playPause(true));
  };

  // Get the best available image
  const songImage = getSongImage(song, 'medium');
  const fallbackImage = '/src/assets/logo.svg'; // Use the logo as fallback

  return (
    <div className="flex flex-col w-[250px] p-4 bg-white/5 bg-opacity-80 backdrop-blur-sm animate-slideup rounded-lg cursor-pointer">
      <div className="relative w-full h-56 group">
        <div className={`absolute inset-0 justify-center items-center bg-black bg-opacity-50 group-hover:flex ${activeSong?.title === song.title ? 'flex bg-black bg-opacity-70' : 'hidden'}`}>
          <PlayPause
            isPlaying={isPlaying}
            activeSong={activeSong}
            song={song}
            handlePause={handlePauseClick}
            handlePlay={handlePlayClick}
          />
        </div>
        <img 
          alt={`${song.title} cover art`} 
          src={songImage || fallbackImage} 
          className="w-full h-full rounded-lg object-cover"
          onError={(e) => {
            e.target.src = fallbackImage;
          }}
        />
      </div>

      <div className="mt-4 flex flex-col">
        <p className="font-semibold text-lg text-white truncate">
          <Link to={`/songs/${song?.key}`}>
            {song.title}
          </Link>
        </p>
        <p className="text-sm truncate text-gray-300 mt-1">
          <Link to={song.artists && song.artists.length > 0 ? `/artists/${song.artists[0]?.adamid}` : '/top-artists'}>
            {song.subtitle}
          </Link>
        </p>
      </div>
    </div>
  );
};

export default SongCard;
