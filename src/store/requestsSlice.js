import { createSlice } from "@reduxjs/toolkit";

const requestSlice = createSlice({
  name: "requests",
  initialState: null,
  reducers: {
    // Adds an array of requests to the store
    addRequests: (state, action) => action.payload,
    // Removes a request by its ID (remove request from requests page after clicking on accept or reject)
    removeRequest: (state, action) => {
      const newArray = state.filter((r) => r._id !== action.payload);
      return newArray;
    },
  },
});

export const {addRequests, removeRequest} = requestSlice.actions;

export default requestSlice.reducer;