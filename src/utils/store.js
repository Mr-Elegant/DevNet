import { configureStore } from '@reduxjs/toolkit';
import userReducer from "./userSlice";
import feedReducer from "./feedSlice";
import connectionReducer from "./connectionSlice";
import requestReducer from './requestsSlice';
import themeReducer from './themeSlice';

const store = configureStore({

  reducer: {
    user: userReducer,
    feed: feedReducer,
    connections : connectionReducer,
    requests: requestReducer,
    theme: themeReducer, 
  },
})


export default store;