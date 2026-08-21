import { configureStore } from '@reduxjs/toolkit';
import userReducer from "./userSlice";
import feedReducer from "./feedSlice";
import connectionReducer from "./connectionSlice";
import requestReducer from './requestsSlice';
import themeReducer from './themeSlice';
import notificationReducer from './notificationSlice';

const store = configureStore({

  reducer: {
    user: userReducer,
    feed: feedReducer,
    connections : connectionReducer,
    requests: requestReducer,
    theme: themeReducer, 
    notifications: notificationReducer,
  },
})


export default store;