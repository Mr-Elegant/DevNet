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
    <div className="card w-96 bg-base-200 shadow-xl border border-primary/20 hover:shadow-2xl transition-all duration-300 hover:scale-105">
      <figure className="relative">
        <img
          src={photoUrl}
          alt={`${firstName} ${lastName}`}
          className="w-full h-96 object-cover"
        />
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-base-300 to-transparent p-4">
          <h2 className="card-title text-primary">{firstName} {lastName}</h2>
          {age && gender && (
            <p className="text-sm text-base-content/70">{age}, {gender}</p>
          )}
        </div>
      </figure>

      <div className="card-body">
        <p className="text-sm text-base-content/80 line-clamp-3">{about}</p>
        <div className="card-actions justify-between mt-4">
          <button
            className="btn btn-ghost flex-1"
            onClick={() => handleSendRequest("ignored", _id)}
          >
            Ignore
          </button>
          <button
            className="btn btn-primary flex-1"
            onClick={() => handleSendRequest("interested", _id)}
          >
            Interested
          </button>
        </div>
      </div>
    </div>
  );
};

export default UserCard;