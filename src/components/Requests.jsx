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
      <h1 className="text-center text-white text-lg my-10">
        No Connection Requests Found 🥲
      </h1>
    );
  }

  return (
    <div className="text-center my-10 px-4">
      <h1 className="font-bold text-white text-3xl mb-6">Connection Requests</h1>

      {requests.map((request, index) => {
        const { _id, firstName, lastName, photoUrl, age, gender, about } =
          request.fromUserId;

        return (
          <div
            key={_id}
            data-aos="fade-up"
            data-aos-delay={index * 100}
            className="flex flex-col sm:flex-row items-center justify-between m-4 p-6 rounded-2xl w-full max-w-2xl mx-auto
              bg-white/10 backdrop-blur-md border"
            style={{
              borderColor: "#fd3fca",
              boxShadow: `
                inset 0 0 10px rgba(253, 63, 202, 0.3),
                0 0 20px rgba(253, 63, 202, 0.6)
              `,
              transition: "all 0.5s ease",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.boxShadow = `
                inset 0 0 15px rgba(253, 63, 202, 0.4),
                0 0 30px rgba(253, 63, 202, 0.8)
              `;
              e.currentTarget.style.transform = "scale(1.05)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.boxShadow = `
                inset 0 0 10px rgba(253, 63, 202, 0.3),
                0 0 20px rgba(253, 63, 202, 0.6)
              `;
              e.currentTarget.style.transform = "scale(1)";
            }}
          >
            <div className="flex items-center gap-4">
              <img
                alt="profile"
                className="w-20 h-20 rounded-full object-cover border"
                style={{ borderColor: "#fd3fca" }}
                src={photoUrl}
              />
              <div className="text-left">
                <h2 className="font-semibold text-xl">
                  {firstName + " " + lastName}
                </h2>
                {age && gender && (
                  <p className="text-sm text-gray-300">
                    {age}, {gender}
                  </p>
                )}
                <p className="text-sm text-gray-200">{about}</p>
              </div>
            </div>

            <div className="mt-4 sm:mt-0 flex gap-4">
              <button
                onClick={() => reviewRequest("rejected", request._id)}
                className="text-white font-semibold py-2 px-4 rounded-lg transition-all duration-300"
                style={{
                  backgroundColor: "#fd3fca",
                  boxShadow: "0 0 10px rgba(253, 63, 202, 0.6)",
                }}
              >
                Reject
              </button>
              <button
                onClick={() => reviewRequest("accepted", request._id)}
                className="text-white font-semibold py-2 px-4 rounded-lg transition-all duration-300"
                style={{
                  backgroundColor: "#fd3fca",
                  boxShadow: "0 0 10px rgba(253, 63, 202, 0.6)",
                }}
              >
                Accept
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default Requests;
