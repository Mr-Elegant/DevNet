#DevNet

- Created vite + react, install tailwind, daisy ui, react-router-dom, axios
- Create BrowserRouter and wrap app component in it
- Routes > Route=/ Body > RouteChildren
- Create and Outlet in your Body Componenet
- Create Login Page
- CORS - install cors in backend => add middleware to with configuration : origin: "http://localhost:5173", credentials: true, 
- Whenever we make API call pass (using axios) => {withCredentials: true}   -> if not pass causes: it will send send token to other api call
- install react-redux @reduxjs/toolkit
- create a utils folder => create store => wrap app component inside Provider => createSlice => add reducer to store
- update navbar features using useSelector() hook
- refactor our code to add constant file 
- should not access other routes without login
- if token is not present , redirect to login page
- Logout functionality on NavBar
- Profile page