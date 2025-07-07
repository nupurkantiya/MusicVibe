import { configureStore } from '@reduxjs/toolkit';

import { shazamCoreApi } from './api/shazamApi';
import playerReducer from './slices/playerSlice';

export const store = configureStore({
  reducer: {
    [shazamCoreApi.reducerPath]: shazamCoreApi.reducer,
    player: playerReducer,
  },
  middleware: (getDefaultMiddleware) => getDefaultMiddleware().concat(shazamCoreApi.middleware),
});
