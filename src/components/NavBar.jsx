import { useDispatch, useSelector } from "react-redux";
import { Link, useNavigate } from "react-router-dom";
import { BASE_URL } from "../utils/constants";
import axios from "axios";
import { removeUser } from "../utils/userSlice";

const NavBar = () => {
  const user = useSelector((store) => store.user);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await axios.post(BASE_URL + "/logout", {}, { withCredentials: true });
      dispatch(removeUser());
      navigate("/login");
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <nav className="navbar bg-[#1F1F1F] text-neutral-content px-4 shadow-md sticky top-0 z-50">
      <div className="flex-1 gap-2">
        <Link to="/" className="flex items-center gap-2 hover:opacity-80 transition">
          <img src="/DevNet F1.png" alt="DevNet Logo" className="w-9 h-9 rounded-lg" />
          <span className="text-2xl font-bold text-sky-400 tracking-wide">DevNet</span>
        </Link>
      </div>

      {user && (
        <div className="flex items-center gap-4">
          <span className="hidden sm:inline text-sm text-gray-300">Welcome, {user.firstName}</span>

          <div className="dropdown dropdown-end relative">
            <button tabIndex={0} className="btn btn-ghost btn-circle avatar ring-2 ring-sky-400">
              <div className="w-10 rounded-full overflow-hidden">
                <img alt="User Avatar" src={user.photoUrl} />
              </div>
            </button>

            <ul
              tabIndex={0}
              className="menu dropdown-content bg-neutral rounded-lg mt-3 p-2 shadow-lg w-52 z-[999] text-sm"
            >
              <li>
                <Link to="/profile" className="flex justify-between">
                  Profile <span className="badge badge-primary text-white">New</span>
                </Link>
              </li>
              <li>
                <Link to="/connections">Connections</Link>
              </li>
              <li>
                <Link to="/requests">Requests</Link>
              </li>
              <li>
                <Link to="/premium" className="text-pink-400 hover:text-pink-500">Premium</Link>
              </li>
              <li>
                <button onClick={handleLogout} className="text-red-400 hover:text-red-500 text-left w-full">Logout</button>
              </li>
            </ul>
          </div>
        </div>
      )}
    </nav>
  );
};

export default NavBar;
