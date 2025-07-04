import {createSlice} from "@reduxjs/toolkit";

const feedSlice = createSlice({
    name: "feed",
    initialState: null,

    // Reducers define how the state should change in response to actions
    reducers: {
        // This reducer replaces the entire feed with the payload
        addFeed : (state, action) => {
            return action.payload;
        },
        // This reducer removes a user from the feed based on their _id
        removeUserFromFeed: (state, action) => {
            const newFeed = state.filter((user) => user._id !== action.payload)
            return newFeed;
        },
    }
});

// Export the actions so they can be used in components or thunks
export const {addFeed, removeUserFromFeed} = feedSlice.actions;

// Export the reducer to be included in the Redux store
export default feedSlice.reducer;