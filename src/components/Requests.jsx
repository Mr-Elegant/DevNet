import { useDispatch, useSelector } from "react-redux";
import { addRequests, removeRequest } from "../utils/requestsSlice";
import { useEffect } from "react";
import axios from "axios";
import { BASE_URL } from "../utils/constants";
import AOS from "aos";
import "aos/dist/aos.css";

const Requests = () => {
  const requests = useSelector((store) => store.requests);
  const dispatch = useDispatch();

  const reviewRequest = async (status, _id) => {
    try {
      await axios.post(
        `${BASE_URL}/request/review/${status}/${_id}`,
        {},
        { withCredentials: true }
      );
      dispatch(removeRequest(_id));
    } catch (error) {
      console.error(error);
    }
  };

  const fetchRequests = async () => {
    try {
      const res = await axios.get(`${BASE_URL}/user/requests/received`, {
        withCredentials: true,
      });
      dispatch(addRequests(res.data.data));
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    fetchRequests();
    AOS.init({ duration: 800, once: true });
  }, []);

  if (!requests) return null;

  if (requests.length === 0) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-base-content/70">
            No Connection Requests Found 🥲
          </h1>
          <p className="text-base-content/50 mt-2">
            You're all caught up!
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-10">
      <h1 className="text-3xl font-bold text-center mb-8 text-base-content">
        Connection Requests
      </h1>

      <div className="space-y-4 max-w-3xl mx-auto">
        {requests.map((request, index) => {
          const { _id, firstName, lastName, photoUrl, age, gender, about } =
            request.fromUserId;

          return (
            <div
              key={_id}
              data-aos="fade-up"
              data-aos-delay={index * 100}
              className="card bg-base-200 shadow-xl border border-primary/20 hover:shadow-2xl transition-all duration-300 hover:scale-[1.02]"
            >
              <div className="card-body">
                <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4">
                  {/* Avatar */}
                  <div className="avatar">
                    <div className="w-20 h-20 rounded-full ring ring-primary ring-offset-base-100 ring-offset-2">
                      <img src={photoUrl} alt={`${firstName} ${lastName}`} />
                    </div>
                  </div>

                  {/* User Info */}
                  <div className="flex-1 text-center sm:text-left">
                    <h2 className="card-title text-xl">
                      {firstName} {lastName}
                    </h2>
                    {age && gender && (
                      <p className="text-sm text-base-content/60">
                        {age}, {gender}
                      </p>
                    )}
                    <p className="text-sm text-base-content/70 mt-2">{about}</p>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex sm:flex-col gap-2 mt-4 sm:mt-0">
                    <button
                      onClick={() => reviewRequest("rejected", request._id)}
                      className="btn btn-error btn-sm"
                    >
                      Reject
                    </button>
                    <button
                      onClick={() => reviewRequest("accepted", request._id)}
                      className="btn btn-success btn-sm"
                    >
                      Accept
                    </button>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default Requests;