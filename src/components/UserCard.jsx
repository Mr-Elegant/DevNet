import {useState} from "react";
import axios from "axios";
import { BASE_URL } from "../utils/constants";
import { useDispatch, useSelector } from "react-redux";
import { removeUserFromFeed } from "../utils/feedSlice";
import { useSocket } from "../utils/SocketContext"; // Import Socket

// UserCard component to display user information and handle interactions.
const UserCard = ({ user, isPreview = false }) => {
  const { _id, firstName, lastName, photoUrl, age, gender, about } = user;

  const [isRequesting, setIsRequesting] = useState(false);

  const dispatch = useDispatch();
  const socket = useSocket(); // Get the global socket
  const loggedInUser = useSelector((store) => store.user); // Get the senders info

  const handleSendRequest = async (status, targetUserId) => {

    if(isRequesting) return;   // Prevent double-clicks

    setIsRequesting(true);    // Disable buttons

    try {
      // 1. Send the actual request to your backend database
      await axios.post(
        `${BASE_URL}/request/send/${status}/${targetUserId}`,
        {},
        { withCredentials: true },
      );

      // 2. Remove the user from the current feed
      dispatch(removeUserFromFeed(targetUserId));

      // 3. 👈 NEW: If they clicked "interested", trigger the real-time notification!
      if (status === "interested" && socket && loggedInUser) {
        socket.emit("sendConnectionRequest", {
          senderId: loggedInUser._id,
          receiverId: targetUserId,
          firstName: loggedInUser.firstName,
          lastName: loggedInUser.lastName,
          text: "Sent you a connection request!" // Ensure text is sent!
        });
      }
    } catch (err) {
      console.error(err);
      setIsRequesting(false); // Only re-enable if it failed
    }
  };

  return (

    <div className="card w-96 bg-base-200 shadow-xl border border-primary/20 hover:shadow-2xl transition-all duration-300 hover:scale-105">
      <figure className="relative">
        <img
          src={photoUrl}
          alt={`${firstName} ${lastName}`}
          className="w-full h-96 object-cover"
        />
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-base-300 to-transparent p-4">
          <h2 className="card-title text-primary">
            {firstName} {lastName}
          </h2>
          {age && gender && (
            <p className="text-sm text-base-content/70">
              {age}, {gender}
            </p>
          )}
        </div>
      </figure>

      <div className="card-body">
        <p className="text-sm text-base-content/80 line-clamp-3">{about}</p>

        {/* 👇 2. Wrap the buttons in this condition so they only show if it is NOT a preview */}
        {!isPreview && (
          <div className="card-actions justify-between mt-4">
            <button
              className="btn btn-ghost flex-1"
              onClick={() => handleSendRequest("ignored", _id)}
              disabled={isRequesting} // 👈 Disable while loading
            >
              Ignore
            </button>
            <button
              className="btn btn-primary flex-1"
              onClick={() => handleSendRequest("interested", _id)}
              disabled={isRequesting} // 👈 Disable while loading
            >
              {isRequesting ? "Sending..." : "Interested"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default UserCard;
