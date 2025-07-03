import { Route, Routes } from "react-router-dom";
import Body from "./components/Body";
import Login from "./components/Login";
import Profile from "./components/Profile";
import Feed from "./components/Feed";
import Connections from "./components/Connections";
import Requests from "./components/Requests";
import Signup from "./components/Signup";

const App = () => {
  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-[#0f0f0f] via-[#1a1a1a] to-[#121212] text-white relative overflow-hidden">
      {/* Background Shine / Pattern Layer */}
      <div className="absolute inset-0 bg-[url('/noise.png')] opacity-5 pointer-events-none" />

      {/* Glass Container */}
      <div className="relative z-10 mx-auto max-w-8xl p-4 md:p-8 backdrop-blur-md bg-white/5 border border-white/10 rounded-xl shadow-inner shadow-black/10">
        <Routes>
          <Route path="/signup" element={<Signup />} />
          <Route path="/login" element={<Login />} />
          <Route path="/" element={<Body />}>
            <Route index element={<Feed />} />           
            <Route path="/profile" element={<Profile />} />
            <Route path="/connections" element={<Connections />} />
            <Route path="/requests" element={<Requests />}  /> 
          </Route>
        </Routes>
      </div>
    </div>
  );
};

export default App;
