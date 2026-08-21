import axios from "axios";
import { BASE_URL } from "../utils/constants";
import { useDispatch } from "react-redux";
import { removeUserFromFeed } from "../store/feedSlice";

const ProfileCard = ({ user }) => {
  const { _id, firstName, lastName, photoUrl, age, gender, about } = user;  // Destructure user properties
  const dispatch = useDispatch();   // Initialize Redux dispatcher



 return (
    <div className="relative w-80 rounded-2xl overflow-hidden group transition-transform hover:scale-105">
      {/* Animated neon border */}
      <div className="absolute inset-0 rounded-2xl p-[2px] bg-gradient-to-r from-primary via-secondary to-accent animate-spin-slow opacity-80 group-hover:opacity-100"></div>

      {/* Frosted glass card */}
      <div className="relative rounded-2xl overflow-hidden bg-base-200/80 backdrop-blur-2xl shadow-2xl z-10">
        <div className="relative">
          <img
            src={photoUrl}
            alt={`${firstName} ${lastName}`}
            className="w-full h-96 object-cover"
          />
          <div className="absolute bottom-0 w-full bg-gradient-to-t from-base-300/90 via-base-300/40 to-transparent p-4 text-base-content">
            <h2 className="text-2xl font-black text-primary">{firstName} {lastName}</h2>
            {age && gender && <p className="text-sm text-secondary font-bold tracking-wide uppercase">{age}, {gender}</p>}
          </div>
        </div>

        <div className="p-4 text-gray-200">
          <h1 className="text-xl mb-4 line-clamp-3">{about}</h1>

        </div>
      </div>

      {/* Subtle diagonal shine */}
      <div className="absolute inset-0 rounded-2xl overflow-hidden z-20 pointer-events-none">
        <div className="absolute -left-1/2 top-0 w-full h-full bg-white opacity-10 rotate-45 animate-shimmer"></div>
      </div>
    </div>
  );
};

export default ProfileCard;