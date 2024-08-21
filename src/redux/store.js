import { configureStore } from '@reduxjs/toolkit';

import playerReducer from './features/playerSlice';
import { pinataApi } from './services/nftStorageApi';

export const store = configureStore({
  reducer: {
    [pinataApi.reducerPath]: pinataApi.reducer,
    player: playerReducer,
  },
  middleware: (getDefaultMiddleware) => getDefaultMiddleware()
    .concat(pinataApi.middleware),
});
