import { configureStore } from '@reduxjs/toolkit';

import authReducer from './authSlice';
import mailReducer from './mailSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    mail: mailReducer,
  },
});
