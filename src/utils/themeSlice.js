import { createSlice } from "@reduxjs/toolkit";

const getInitialTheme = () => {
  const savedTheme = localStorage.getItem("devnet-theme");
  return savedTheme || "dark";
};

const themeSlice = createSlice({
  name: "theme",
  initialState: getInitialTheme(),
  reducers: {
    setTheme: (state, action) => {
      localStorage.setItem("devnet-theme", action.payload);
      document.documentElement.setAttribute("data-theme", action.payload);
      return action.payload;
    },
  },
});

export const { setTheme } = themeSlice.actions;
export default themeSlice.reducer;