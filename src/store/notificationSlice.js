import { createSlice } from "@reduxjs/toolkit";

const notificationSlice = createSlice({
  name: "notifications",
  initialState: [],
  reducers: {
    addNotification: (state, action) => {
      // Group messages by sender so we don't spam the list with 10 separate notifications from the same person
      const existingIndex = state.findIndex(
        (n) =>
          n.senderId === action.payload.senderId &&
          n.type === action.payload.type,
      );

      if (existingIndex !== -1) {
        state[existingIndex].count += 1;
        state[existingIndex].text = action.payload.text; // Update with latest message text
      } else {
        state.unshift({ ...action.payload, count: 1 });
      }
    },
    removeNotification: (state, action) => {
      // Remove notification when user clicks on it
      return state.filter(
        (n) =>
          !(
            n.senderId === action.payload.senderId &&
            n.type === action.payload.type
          ),
      );
    },
    clearAllNotifications: () => [],
  },
});



export const { addNotification, removeNotification, clearAllNotifications } =
  notificationSlice.actions;
export default notificationSlice.reducer;