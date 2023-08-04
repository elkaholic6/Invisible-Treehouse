import { configureStore } from '@reduxjs/toolkit';

import playerReducer from './features/playerSlice';
import { nftStorageApi } from './services/nftStorageApi';

export const store = configureStore({
  reducer: {
    [nftStorageApi.reducerPath]: nftStorageApi.reducer,
    player: playerReducer,
  },
  middleware: (getDefaultMiddleware) => getDefaultMiddleware()
    .concat(nftStorageApi.middleware),
});
