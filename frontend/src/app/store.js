import { configureStore } from '@reduxjs/toolkit';
import rootReducer from './rootReducer';
import { setupAxiosInterceptors } from '../services/axiosInstance';

const store = configureStore({
  reducer: rootReducer,
  middleware: (getDefaultMiddleware) => getDefaultMiddleware({ serializableCheck: false })
});

setupAxiosInterceptors(store);

export default store;