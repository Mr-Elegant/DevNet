import axios from "axios";
import { BASE_URL } from "../utils/constants";
import { useDispatch } from "react-redux";
import { removeUserFromFeed } from "../utils/feedSlice";

const UserCard = ({ user }) => {
  const { _id, firstName, lastName, photoUrl, age, gender, about } = user;
  const dispatch = useDispatch();

  const handleSendRequest = async (status, userId) => {
    try {
      await axios.post(
        `${BASE_URL}/request/send/${status}/${userId}`,
        {},
        { withCredentials: true }
      );
      dispatch(removeUserFromFeed(userId));
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="relative w-80 rounded-2xl overflow-hidden group transition-transform hover:scale-105">
      {/* Animated neon border */}
      <div className="absolute inset-0 rounded-2xl p-[2px] bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-500 animate-spin-slow opacity-80 group-hover:opacity-100"></div>

      {/* Frosted glass card */}
      <div className="relative rounded-2xl overflow-hidden bg-[#1f1f1f]/80 backdrop-blur-md shadow-xl z-10">
        <div className="relative">
          <img
            src={photoUrl}
            alt={`${firstName} ${lastName}`}
            className="w-full h-96 object-cover"
          />
          <div className="absolute bottom-0 w-full bg-gradient-to-t from-black/80 via-transparent to-transparent p-4 text-white">
            <h2 className="text-2xl font-bold text-pink-400">{firstName} {lastName}</h2>
            {age && gender && <p className="text-sm text-blue-300">{age}, {gender}</p>}
          </div>
        </div>

        <div className="p-4 text-gray-200">
          <p className="text-sm mb-4 line-clamp-3">{about}</p>
          <div className="flex justify-between gap-4">
            <button
              className="w-1/2 py-2 rounded-full bg-gray-700 text-gray-200 hover:bg-gray-600"
              onClick={() => handleSendRequest("ignored", _id)}
            >
              Ignore
            </button>
            <button
              className="w-1/2 py-2 rounded-full bg-pink-500 text-white hover:bg-pink-600"
              onClick={() => handleSendRequest("interested", _id)}
            >
              Interested
            </button>
          </div>
        </div>
      </div>

      {/* Subtle diagonal shine */}
      <div className="absolute inset-0 rounded-2xl overflow-hidden z-20 pointer-events-none">
        <div className="absolute -left-1/2 top-0 w-full h-full bg-white opacity-10 rotate-45 animate-shimmer"></div>
      </div>
    </div>
  );
};

export default UserCard;