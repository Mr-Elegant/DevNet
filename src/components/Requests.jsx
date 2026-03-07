import { useDispatch, useSelector } from "react-redux";
import { addRequests, removeRequest } from "../utils/requestsSlice";
import { useEffect, useState } from "react";
import axios from "axios";
import { BASE_URL } from "../utils/constants";
import AOS from "aos";
import "aos/dist/aos.css";
// ✨ IMPORT THE BADGE
import VerifiedBadge from "./VerifiedBadge";

const Requests = () => {
  const requests = useSelector((store) => store.requests);
  const dispatch = useDispatch();

  const [activeTab, setActiveTab] = useState("pending");
  const [ignoredRequests, setIgnoredRequests] = useState([]);

  const fetchRequests = async () => {
    try {
      const res = await axios.get(`${BASE_URL}/user/requests/received`, {
        withCredentials: true,
      });
      dispatch(addRequests(res.data.data));

      const ignoredRes = await axios.get(`${BASE_URL}/user/requests/rejected`, {
        withCredentials: true,
      });
      setIgnoredRequests(ignoredRes.data.data);
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    fetchRequests();
    AOS.init({ duration: 800, once: true });
  }, []);

  const reviewRequest = async (status, _id, isRecovery = false) => {
    try {
      await axios.post(
        `${BASE_URL}/request/review/${status}/${_id}`,
        {},
        { withCredentials: true }
      );
      
      if (status === "rejected") {
        const requestToMove = requests.find((r) => r._id === _id);
        dispatch(removeRequest(_id));
        setIgnoredRequests((prev) => [requestToMove, ...prev]);
      } else if (status === "accepted" && !isRecovery) {
        dispatch(removeRequest(_id));
      } else if (status === "accepted" && isRecovery) {
        setIgnoredRequests((prev) => prev.filter((req) => req._id !== _id));
      }
    } catch (error) {
      console.error(error);
    }
  };

  if (!requests) return null;

  const activeData = activeTab === "pending" ? requests : ignoredRequests;

  return (
    <div className="container mx-auto px-4 py-10">
      <div className="flex flex-col md:flex-row items-center justify-between mb-8 max-w-3xl mx-auto gap-4">
        <h1 className="text-3xl font-bold text-base-content">
          Requests 🤝
        </h1>
        
        <div className="tabs tabs-boxed bg-base-300">
          <a 
            className={`tab ${activeTab === "pending" ? "tab-active bg-primary text-primary-content font-bold" : ""}`} 
            onClick={() => setActiveTab("pending")}
          >
            Pending ({requests.length})
          </a>
          <a 
            className={`tab ${activeTab === "ignored" ? "tab-active bg-error text-error-content font-bold" : ""}`} 
            onClick={() => setActiveTab("ignored")}
          >
            Ignored ({ignoredRequests.length})
          </a>
        </div>
      </div>

      {activeData.length === 0 && (
        <div className="flex justify-center items-center min-h-[50vh]">
          <div className="text-center">
            <div className="text-6xl mb-4">{activeTab === "pending" ? "📭" : "🗑️"}</div>
            <h1 className="text-2xl font-bold text-base-content/70">
              {activeTab === "pending" ? "No Connection Requests Found 🥲" : "No Ignored Requests"}
            </h1>
            <p className="text-base-content/50 mt-2">
              {activeTab === "pending" ? "You're all caught up!" : "You haven't rejected anyone yet."}
            </p>
          </div>
        </div>
      )}

      <div className="space-y-4 max-w-3xl mx-auto">
        {activeData.map((request, index) => {
          // Extract the data from the populated user object
          const sender = request.fromUserId;
          const { _id, firstName, lastName, photoUrl, age, gender, about, isPremium, membershipType } = sender;

          return (
            <div
              key={request._id}
              data-aos="fade-up"
              data-aos-delay={index * 100}
              className="card bg-base-200 shadow-xl border border-primary/20 hover:shadow-2xl transition-all duration-300 hover:scale-[1.02]"
            >
              <div className="card-body">
                <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4">
                  <div className="avatar">
                    <div className={`w-20 h-20 rounded-full ring ring-offset-base-100 ring-offset-2 ${activeTab === "ignored" ? "ring-error/50 opacity-70" : "ring-primary"}`}>
                      <img src={photoUrl} alt={`${firstName} ${lastName}`} />
                    </div>
                  </div>

                  <div className={`flex-1 text-center sm:text-left ${activeTab === "ignored" ? "opacity-70" : ""}`}>
                    {/* ✨ ADDED BADGE HERE */}
                    <h2 className="card-title text-xl justify-center sm:justify-start flex items-center">
                      {firstName} {lastName}
                      <VerifiedBadge isPremium={isPremium} membershipType={membershipType} />
                    </h2>
                    {age && gender && (
                      <p className="text-sm text-base-content/60">
                        {age}, {gender}
                      </p>
                    )}
                    <p className="text-sm text-base-content/70 mt-2">{about}</p>
                  </div>

                  <div className="flex sm:flex-col gap-2 mt-4 sm:mt-0 w-full sm:w-auto">
                    {activeTab === "pending" ? (
                      <>
                        <button
                          onClick={() => reviewRequest("rejected", request._id)}
                          className="btn btn-error btn-sm flex-1 sm:flex-none"
                        >
                          Reject
                        </button>
                        <button
                          onClick={() => reviewRequest("accepted", request._id)}
                          className="btn btn-success btn-sm flex-1 sm:flex-none"
                        >
                          Accept
                        </button>
                      </>
                    ) : (
                      <button 
                        onClick={() => reviewRequest("accepted", request._id, true)} 
                        className="btn btn-primary btn-sm flex-1 sm:flex-none w-full"
                      >
                        ↺ Restore & Accept
                      </button>
                    )}
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