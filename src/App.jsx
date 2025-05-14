import { Route, Routes } from "react-router-dom";
import Body from "./components/Body";
import Login from "./components/Login";
import Profile from "./components/Profile";
import Feed from "./components/Feed";

const App = () => {
  return (
    <div className="h-full">
      
      <Routes>
        <Route path='/' element={<Body />}>
           <Route path="/" element={<Feed />} />
           <Route path="/login" element={<Login />} />
           <Route path="/profile" element={<Profile />} />
        </Route>
      </Routes>
    </div>
  );
};

export default App;
