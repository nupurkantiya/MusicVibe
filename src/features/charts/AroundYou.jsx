import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useSelector } from 'react-redux';

import { Error, Loader, SongCard } from '../../shared/components';
import { useGetSongsByCountryQuery } from '../../store/api/shazamApi';

const CountryTracks = () => {
  const [country, setCountry] = useState('');
  const [loading, setLoading] = useState(true);
  const [geoError, setGeoError] = useState(null);
  const { activeSong, isPlaying } = useSelector((state) => state.player);
  
  // Skip the query if we don't have a country yet
  const { data, isFetching, error } = useGetSongsByCountryQuery(country, {
    skip: !country
  });

  useEffect(() => {
    const fetchLocation = async () => {
      try {
        setLoading(true);
        setGeoError(null);
        
        const response = await axios.get(
          `https://geo.ipify.org/api/v2/country?apiKey=${import.meta.env.VITE_GEO_API_KEY}`,
          { timeout: 10000 } // 10 second timeout
        );
        
        const countryCode = response?.data?.location?.country;
        
        if (countryCode) {
          setCountry(countryCode);
          console.log(`🌍 Detected country: ${countryCode}`);
        } else {
          console.warn('No country code in response, using fallback');
          setCountry('US'); // Fallback to US
        }
      } catch (err) {
        console.error('Geolocation API Error:', err);
        setGeoError(err.message);
        setCountry('US'); // Fallback to US on error
      } finally {
        setLoading(false);
      }
    };

    // Only fetch if we don't have a country yet
    if (!country) {
      fetchLocation();
    }
  }, [country]);

  // Show loading while fetching location or songs
  if (loading || (isFetching && !data)) {
    return <Loader title="Loading Songs around you..." />;
  }

  // Show error if both geolocation and API failed
  if (geoError && error) {
    return (
      <div className="flex flex-col items-center justify-center h-64">
        <Error />
        <p className="text-gray-400 mt-4 text-center">
          Unable to detect your location and fetch music data.<br />
          Please check your internet connection and try again.
        </p>
      </div>
    );
  }

  // Show error if only API failed
  if (error && !loading) {
    return (
      <div className="flex flex-col items-center justify-center h-64">
        <Error />
        <p className="text-gray-400 mt-4 text-center">
          Unable to fetch music for {country}.<br />
          {error.message || 'Please try again later.'}
        </p>
      </div>
    );
  }

  // Get country name for display
  const getCountryName = (code) => {
    const countryNames = {
      'US': 'United States',
      'IN': 'India',
      'GB': 'United Kingdom',
      'CA': 'Canada',
      'AU': 'Australia',
      'DE': 'Germany',
      'FR': 'France',
      'JP': 'Japan',
      'BR': 'Brazil',
      'MX': 'Mexico'
    };
    return countryNames[code] || code;
  };

  const displayCountry = getCountryName(country);

  return (
    <div className="flex flex-col">
      <div className="flex justify-between items-center">
        <h2 className="font-bold text-3xl text-white text-left mt-4 mb-10">
          Around you <span className="font-black">({displayCountry})</span>
        </h2>
        
        {geoError && (
          <p className="text-yellow-400 text-sm">
            ⚠️ Using fallback location
          </p>
        )}
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
            <p className="text-gray-400 text-lg">No songs found for {displayCountry}</p>
            <p className="text-gray-500 text-sm mt-2">Try refreshing the page or check back later.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default CountryTracks;
