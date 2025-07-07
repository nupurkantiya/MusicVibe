// Data transformation utilities for API responses
// Converts Apple Music API format to the format expected by components

/**
 * Transforms Apple Music API song data to legacy Shazam format
 * @param {Object} appleMusicSong - Song object from Apple Music API
 * @returns {Object} - Transformed song object for components
 */
export const transformAppleMusicSong = (appleMusicSong) => {
  if (!appleMusicSong || !appleMusicSong.attributes) {
    console.warn('Invalid song data received:', appleMusicSong);
    return null;
  }

  const { attributes, id, relationships } = appleMusicSong;

  return {
    key: id,
    title: attributes.name || 'Unknown Title',
    subtitle: attributes.artistName || 'Unknown Artist',
    images: {
      coverart: attributes.artwork?.url?.replace('{w}x{h}', '400x400') || '',
      coverarthq: attributes.artwork?.url?.replace('{w}x{h}', '800x800') || '',
      background: attributes.artwork?.url?.replace('{w}x{h}', '1200x1200') || ''
    },
    artists: relationships?.artists?.data?.map(artist => ({
      id: artist.id,
      adamid: artist.id
    })) || [],
    hub: {
      type: 'APPLEMUSIC',
      actions: attributes.previews ? [
        {
          name: 'apple',
          type: 'uri',
          uri: attributes.previews[0]?.url || ''
        }
      ] : [],
      options: []
    },
    // Additional metadata
    duration: attributes.durationInMillis,
    releaseDate: attributes.releaseDate,
    genre: attributes.genreNames?.[0] || 'Unknown',
    isExplicit: attributes.contentRating === 'explicit',
    // Apple Music specific
    appleMusicId: id,
    albumName: attributes.albumName,
    trackNumber: attributes.trackNumber
  };
};

/**
 * Transforms search results from RapidAPI Shazam format
 * @param {Object} searchResponse - Response from search API
 * @returns {Array} - Array of transformed songs
 */
export const transformSearchResults = (searchResponse) => {
  if (!searchResponse || !searchResponse.tracks || !searchResponse.tracks.hits) {
    console.warn('Invalid search response:', searchResponse);
    return [];
  }

  return searchResponse.tracks.hits.map(hit => {
    const { track } = hit;
    
    return {
      key: track.key,
      title: track.title || 'Unknown Title',
      subtitle: track.subtitle || 'Unknown Artist',
      images: {
        coverart: track.images?.coverart || '',
        coverarthq: track.images?.coverarthq || '',
        background: track.images?.background || ''
      },
      artists: track.artists || [],
      hub: track.hub || {},
      // Additional Shazam data
      share: track.share || {},
      url: track.url || '',
      layout: track.layout
    };
  });
};

/**
 * Transforms artist search results
 * @param {Object} searchResponse - Response from search API  
 * @returns {Array} - Array of transformed artists
 */
export const transformArtistResults = (searchResponse) => {
  if (!searchResponse || !searchResponse.artists || !searchResponse.artists.hits) {
    return [];
  }

  return searchResponse.artists.hits.map(hit => {
    const { artist } = hit;
    
    return {
      adamid: artist.adamid,
      name: artist.name,
      avatar: artist.avatar || '',
      verified: artist.verified || false,
      weburl: artist.weburl || ''
    };
  });
};

/**
 * Handles API errors and provides fallback data
 * @param {Error} error - API error object
 * @param {string} context - Context where error occurred
 * @returns {Object} - Error info and fallback data
 */
export const handleApiError = (error, context = 'API') => {
  console.error(`${context} Error:`, error);
  
  const errorInfo = {
    hasError: true,
    message: error.message || 'Unknown error occurred',
    status: error.response?.status || 500,
    context
  };

  // Provide fallback data based on context
  switch (context) {
    case 'songs':
      return { ...errorInfo, fallbackData: [] };
    case 'artist':
      return { ...errorInfo, fallbackData: null };
    case 'geolocation':
      return { ...errorInfo, fallbackData: { country: 'US' } };
    default:
      return errorInfo;
  }
};

/**
 * Checks if song data is valid for rendering
 * @param {Object} song - Song object to validate
 * @returns {boolean} - Whether song has required fields
 */
export const isValidSong = (song) => {
  return song && 
         song.key && 
         song.title && 
         typeof song.title === 'string' &&
         song.title.trim() !== '';
};

/**
 * Gets the best available image from song data
 * @param {Object} song - Song object
 * @param {string} quality - 'low', 'medium', 'high'
 * @returns {string} - Image URL
 */
export const getSongImage = (song, quality = 'medium') => {
  if (!song || !song.images) {
    return '/path/to/default-song-image.jpg'; // Add a default image
  }

  const { images } = song;
  
  switch (quality) {
    case 'low':
      return images.coverart || images.coverarthq || images.background || '';
    case 'high':
      return images.coverarthq || images.background || images.coverart || '';
    default: // medium
      return images.coverart || images.coverarthq || images.background || '';
  }
};

/**
 * Formats duration from milliseconds to MM:SS
 * @param {number} durationMs - Duration in milliseconds
 * @returns {string} - Formatted duration
 */
export const formatDuration = (durationMs) => {
  if (!durationMs || typeof durationMs !== 'number') return '0:00';
  
  const minutes = Math.floor(durationMs / 60000);
  const seconds = Math.floor((durationMs % 60000) / 1000);
  
  return `${minutes}:${seconds.toString().padStart(2, '0')}`;
};

/**
 * Gets preview URL from song data
 * @param {Object} song - Song object
 * @returns {string} - Preview URL or empty string
 */
export const getPreviewUrl = (song) => {
  if (!song || !song.hub || !song.hub.actions) return '';
  
  const previewAction = song.hub.actions.find(action => 
    action.type === 'uri' && action.uri && action.uri.includes('.m4a')
  );
  
  return previewAction ? previewAction.uri : '';
};

/**
 * Default export with commonly used transformations
 */
export default {
  transformAppleMusicSong,
  transformSearchResults,
  transformArtistResults,
  handleApiError,
  isValidSong,
  getSongImage,
  formatDuration,
  getPreviewUrl
};
