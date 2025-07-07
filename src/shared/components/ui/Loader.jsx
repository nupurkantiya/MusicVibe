import React from 'react';

const Loader = ({ title }) => (
  <div className="w-full flex justify-center items-center flex-col">
    <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-white"></div>
    <h1 className="font-bold text-2xl text-white mt-2">{title || 'Loading'}</h1>
  </div>
);

export default Loader;
