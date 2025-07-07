/* eslint-disable jsx-a11y/media-has-caption */
import React, { useRef, useEffect } from 'react';

const Player = ({ activeSong, isPlaying, volume, seekTime, onEnded, onTimeUpdate, onLoadedData, repeat }) => {
  const ref = useRef(null);
  
  // Function to get the best available audio source
  const getAudioSource = (song) => {
    if (!song || !song.hub || !song.hub.actions) {
      console.warn('No audio source available for song:', song?.title);
      return null;
    }

    // Look for audio URI in actions array
    const audioAction = song.hub.actions.find(action => 
      action.type === 'uri' && 
      action.uri && 
      (action.uri.includes('.m4a') || action.uri.includes('.mp3') || action.uri.includes('audio'))
    );

    if (audioAction) {
      console.log('🎵 Playing:', song.title, 'by', song.subtitle);
      console.log('🔗 Audio source:', audioAction.uri);
      return audioAction.uri;
    }

    // Fallback: try the first URI action
    const firstUriAction = song.hub.actions.find(action => action.type === 'uri' && action.uri);
    if (firstUriAction) {
      console.log('🎵 Using fallback audio source for:', song.title);
      return firstUriAction.uri;
    }

    console.warn('No valid audio source found for:', song.title);
    return null;
  };

  const audioSource = getAudioSource(activeSong);

  // Handle play/pause logic
  useEffect(() => {
    if (ref.current) {
      if (isPlaying && audioSource) {
        ref.current.play().catch(error => {
          console.error('Audio play error:', error);
        });
      } else {
        ref.current.pause();
      }
    }
  }, [isPlaying, audioSource]);

  useEffect(() => {
    if (ref.current) {
      ref.current.volume = volume;
    }
  }, [volume]);

  // updates audio element only on seekTime change (and not on each rerender):
  useEffect(() => {
    if (ref.current) {
      ref.current.currentTime = seekTime;
    }
  }, [seekTime]);

  // Handle audio loading errors
  const handleError = (e) => {
    console.error('Audio loading error:', e);
    console.error('Failed to load audio for:', activeSong?.title);
  };

  // Handle successful audio loading
  const handleLoadStart = () => {
    console.log('Loading audio for:', activeSong?.title);
  };

  if (!audioSource) {
    return null; // Don't render audio element if no source
  }

  return (
    <audio
      src={audioSource}
      ref={ref}
      loop={repeat}
      onEnded={onEnded}
      onTimeUpdate={onTimeUpdate}
      onLoadedData={onLoadedData}
      onError={handleError}
      onLoadStart={handleLoadStart}
      preload="metadata"
    />
  );
};

export default Player;
