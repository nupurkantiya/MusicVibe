import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { transformAppleMusicSong, transformSearchResults, handleApiError } from '../../shared/utils/apiTransformers';

export const shazamCoreApi = createApi({
  reducerPath: 'shazamCoreApi',
  baseQuery: fetchBaseQuery({
    baseUrl: 'https://shazam-core.p.rapidapi.com/',
    prepareHeaders: (headers) => {
      headers.set('X-RapidAPI-Key', import.meta.env.VITE_SHAZAM_CORE_RAPID_API_KEY);
      headers.set('X-RapidAPI-Host', 'shazam-core.p.rapidapi.com');

      return headers;
    },
  }),
  endpoints: (builder) => ({
    // Use country charts instead of broken world charts
    getTopCharts: builder.query({ 
      query: () => 'v1/charts/country?country_code=US',
      transformResponse: (response) => {
        try {
          if (Array.isArray(response)) {
            return response.map(transformAppleMusicSong).filter(song => song !== null);
          }
          return [];
        } catch (error) {
          console.error('Error transforming top charts:', error);
          return [];
        }
      },
      transformErrorResponse: (error) => handleApiError(error, 'topCharts')
    }),
    
    getSongsByGenre: builder.query({ 
      query: (genre) => `v1/charts/genre-world?genre_code=${genre}`,
      transformResponse: (response) => {
        try {
          if (Array.isArray(response)) {
            return response.map(transformAppleMusicSong).filter(song => song !== null);
          }
          return [];
        } catch (error) {
          console.error('Error transforming genre songs:', error);
          return [];
        }
      },
      transformErrorResponse: (error) => handleApiError(error, 'genreSongs')
    }),
    
    getSongsByCountry: builder.query({ 
      query: (countryCode) => `v1/charts/country?country_code=${countryCode}`,
      transformResponse: (response) => {
        try {
          if (Array.isArray(response)) {
            return response.map(transformAppleMusicSong).filter(song => song !== null);
          }
          return [];
        } catch (error) {
          console.error('Error transforming country songs:', error);
          return [];
        }
      },
      transformErrorResponse: (error) => handleApiError(error, 'countrySongs')
    }),
    
    getSongsBySearch: builder.query({ 
      query: (searchTerm) => `v1/search/multi?search_type=SONGS_ARTISTS&query=${encodeURIComponent(searchTerm)}`,
      transformResponse: (response) => {
        try {
          return transformSearchResults(response);
        } catch (error) {
          console.error('Error transforming search results:', error);
          return [];
        }
      },
      transformErrorResponse: (error) => handleApiError(error, 'search')
    }),
    
    getArtistDetails: builder.query({ 
      query: (artistId) => `v2/artists/details?artist_id=${artistId}`,
      transformErrorResponse: (error) => handleApiError(error, 'artistDetails')
    }),
    
    // Updated song details - might need different approach
    getSongDetails: builder.query({ 
      query: ({ songid }) => `v1/tracks/details?track_id=${songid}`,
      transformResponse: (response) => {
        try {
          // If it's Apple Music format, transform it
          if (response && response.attributes) {
            return transformAppleMusicSong(response);
          }
          return response;
        } catch (error) {
          console.error('Error transforming song details:', error);
          return null;
        }
      },
      transformErrorResponse: (error) => handleApiError(error, 'songDetails')
    }),
    
    getSongRelated: builder.query({ 
      query: ({ songid }) => `v1/tracks/related?track_id=${songid}`,
      transformResponse: (response) => {
        try {
          if (Array.isArray(response)) {
            return response.map(transformAppleMusicSong).filter(song => song !== null);
          }
          return [];
        } catch (error) {
          console.error('Error transforming related songs:', error);
          return [];
        }
      },
      transformErrorResponse: (error) => handleApiError(error, 'relatedSongs')
    }),
  }),
});

export const {
  useGetTopChartsQuery,
  useGetSongsByGenreQuery,
  useGetSongsByCountryQuery,
  useGetSongsBySearchQuery,
  useGetArtistDetailsQuery,
  useGetSongDetailsQuery,
  useGetSongRelatedQuery,
} = shazamCoreApi;
