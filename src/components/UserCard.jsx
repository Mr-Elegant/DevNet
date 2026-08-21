import { useState } from "react";
import axios from "axios";
import { BASE_URL } from "../utils/constants";
import { useDispatch, useSelector } from "react-redux";
import { removeUserFromFeed } from "../store/feedSlice";
import { useSocket } from "../context/SocketContext";
import VerifiedBadge from "./VerifiedBadge";

const UserCard = ({ user, isPreview = false }) => {
  const { _id, firstName, lastName, photoUrl, age, gender, about, skills, isPremium, membershipType } = user;

  const [isRequesting, setIsRequesting] = useState(false);

  const dispatch = useDispatch();
  const socket = useSocket();
  const loggedInUser = useSelector((store) => store.user);

  const handleSendRequest = async (status, targetUserId) => {
    if (isRequesting) return;
    setIsRequesting(true);

    try {
      await axios.post(
        `${BASE_URL}/request/send/${status}/${targetUserId}`,
        {},
        { withCredentials: true },
      );

      dispatch(removeUserFromFeed(targetUserId));

      if (status === "interested" && socket && loggedInUser) {
        socket.emit("sendConnectionRequest", {
          senderId: loggedInUser._id,
          receiverId: targetUserId,
          firstName: loggedInUser.firstName,
          lastName: loggedInUser.lastName,
          text: "Sent you a connection request!"
        });
      }
    } catch (err) {
      console.error(err);
      setIsRequesting(false);
    }
  };

  return (
    <div className="w-96 rounded-3xl overflow-hidden bg-base-200/60 backdrop-blur-2xl border border-base-content/10 shadow-2xl shadow-base-content/5 transition-all duration-500 hover:-translate-y-2 hover:shadow-primary/20 hover:border-primary/40 flex flex-col h-[520px] group">
      {/* Photo with Overlay */}
      <div className="relative h-[340px] w-full overflow-hidden">
        <img
          src={photoUrl}
          alt={`${firstName} ${lastName}`}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-base-200 via-base-200/30 to-transparent flex flex-col justify-end p-6">
          <div className="flex items-center gap-1.5 mb-1">
            <h2 className="text-2xl font-black tracking-tight text-base-content flex items-center gap-1">
              {firstName} {lastName}
            </h2>
            <VerifiedBadge isPremium={isPremium} membershipType={membershipType} />
          </div>
          {age && gender && (
            <p className="text-xs font-semibold uppercase tracking-wider text-base-content/60">
              {age} yrs • {gender}
            </p>
          )}
        </div>
      </div>

      {/* Profile Details */}
      <div className="p-6 flex-1 flex flex-col justify-between">
        <div className="space-y-3">
          {/* Skills Badges */}
          {skills && skills.length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              {skills.slice(0, 4).map((skill, index) => (
                <span 
                  key={index} 
                  className="text-[9px] font-extrabold px-2.5 py-1 rounded-lg bg-primary/10 border border-primary/20 text-primary uppercase tracking-wider"
                >
                  {skill}
                </span>
              ))}
              {skills.length > 4 && (
                <span className="text-[9px] font-extrabold px-2.5 py-1 rounded-lg bg-base-content/10 text-base-content/70 uppercase">
                  +{skills.length - 4} more
                </span>
              )}
            </div>
          )}
          
          <p className="text-xs font-medium text-base-content/75 line-clamp-3 leading-relaxed">
            {about || "No bio provided."}
          </p>
        </div>

        {/* Action Buttons for non-preview mode */}
        {!isPreview && (
          <div className="flex items-center justify-between gap-4 mt-4">
            <button
              className="btn btn-outline border-base-content/10 text-base-content hover:bg-base-content/10 flex-1 rounded-xl font-bold h-11 min-h-[44px]"
              onClick={() => handleSendRequest("ignored", _id)}
              disabled={isRequesting}
            >
              Ignore
            </button>
            <button
              className="btn btn-primary flex-1 rounded-xl font-bold text-primary-content h-11 min-h-[44px] shadow-lg shadow-primary/20"
              onClick={() => handleSendRequest("interested", _id)}
              disabled={isRequesting}
            >
              {isRequesting ? "Connecting..." : "Connect"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default UserCard;
