import { useDispatch, useSelector } from "react-redux";
import { addRequests, removeRequest } from "../store/requestsSlice";
import { useEffect, useState } from "react";
import axios from "axios";
import { BASE_URL } from "../utils/constants";
import AOS from "aos";
import "aos/dist/aos.css";
import VerifiedBadge from "../components/VerifiedBadge";
import { motion } from "framer-motion";

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
    <div className="container mx-auto px-4 py-8 max-w-3xl relative z-10">
      
      {/* Page Header & Tabs */}
      <div className="flex flex-col sm:flex-row items-center justify-between mb-10 gap-6">
        <div>
          <h1 className="text-3xl font-black tracking-tight text-base-content bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
            Friend Requests
          </h1>
          <p className="text-xs font-semibold text-base-content/50 uppercase tracking-widest mt-1">Pending & Ignored</p>
        </div>
        
        <div className="tabs tabs-boxed bg-base-200/50 backdrop-blur-xl border border-base-content/5 p-1 rounded-2xl flex gap-1">
          <button 
            type="button"
            className={`tab rounded-xl px-4 py-2 text-xs font-bold transition-all ${
              activeTab === "pending" 
                ? "bg-primary text-primary-content shadow-lg shadow-primary/20" 
                : "text-base-content/60 hover:text-base-content"
            }`} 
            onClick={() => setActiveTab("pending")}
          >
            Pending ({requests.length})
          </button>
          <button 
            type="button"
            className={`tab rounded-xl px-4 py-2 text-xs font-bold transition-all ${
              activeTab === "ignored" 
                ? "bg-error text-error-content shadow-lg shadow-error/20" 
                : "text-base-content/60 hover:text-base-content"
            }`} 
            onClick={() => setActiveTab("ignored")}
          >
            Ignored ({ignoredRequests.length})
          </button>
        </div>
      </div>

      {/* Empty State */}
      {activeData.length === 0 && (
        <div className="flex justify-center items-center min-h-[50vh] px-4">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="w-full p-8 sm:p-10 rounded-3xl bg-base-200/50 backdrop-blur-xl border border-base-content/10 shadow-2xl text-center space-y-5"
          >
            <div className="w-16 h-16 rounded-full bg-base-content/5 flex items-center justify-center mx-auto text-base-content/60 border border-base-content/10 text-3xl">
              {activeTab === "pending" ? "📭" : "🗑️"}
            </div>
            <div>
              <h2 className="text-xl font-black text-base-content tracking-tight">
                {activeTab === "pending" ? "All Caught Up!" : "No Ignored Requests"}
              </h2>
              <p className="text-xs font-semibold text-base-content/55 mt-1.5 leading-relaxed">
                {activeTab === "pending" ? "You have no pending requests at the moment." : "You haven't ignored any requests yet."}
              </p>
            </div>
          </motion.div>
        </div>
      )}

      {/* Requests list */}
      <div className="space-y-4">
        {activeData.map((request, index) => {
          const sender = request.fromUserId;
          const { _id, firstName, lastName, photoUrl, age, gender, about, isPremium, membershipType } = sender;

          const isIgnored = activeTab === "ignored";

          return (
            <div
              key={request._id}
              data-aos="fade-up"
              data-aos-delay={index * 80}
              className={`rounded-3xl bg-base-200/40 backdrop-blur-xl border border-base-content/10 shadow-xl p-5 hover:shadow-2xl transition-all duration-300 hover:scale-[1.01] ${
                isIgnored ? "opacity-75" : "hover:border-primary/20"
              }`}
            >
              <div className="flex flex-col sm:flex-row items-center sm:items-start justify-between gap-5">
                <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4 flex-1">
                  
                  <div className="avatar shrink-0">
                    <div className={`w-16 h-16 rounded-full ring-2 ring-offset-2 ring-offset-base-100 ${
                      isIgnored ? "ring-error/30" : "ring-primary/40"
                    }`}>
                      <img src={photoUrl} alt={`${firstName} ${lastName}`} className="object-cover" />
                    </div>
                  </div>

                  <div className="text-center sm:text-left flex-1 min-w-0">
                    <h2 className="text-lg font-black tracking-tight text-base-content flex items-center justify-center sm:justify-start gap-1">
                      {firstName} {lastName}
                      <VerifiedBadge isPremium={isPremium} membershipType={membershipType} />
                    </h2>
                    {age && gender && (
                      <span className="text-[10px] font-bold px-2 py-0.5 mt-1 inline-block rounded bg-base-content/5 text-base-content/70 uppercase">
                        {age} • {gender}
                      </span>
                    )}
                    {about && (
                      <p className="text-xs font-semibold text-base-content/70 mt-3 line-clamp-2 leading-relaxed">
                        {about}
                      </p>
                    )}
                  </div>
                </div>

                <div className="flex sm:flex-col gap-2.5 mt-4 sm:mt-0 w-full sm:w-auto shrink-0">
                  {activeTab === "pending" ? (
                    <>
                      <button
                        onClick={() => reviewRequest("rejected", request._id)}
                        className="btn btn-outline border-error/20 hover:border-error hover:bg-error/5 text-error rounded-xl font-bold tracking-wide w-full sm:w-24 h-9 min-h-[36px]"
                      >
                        Ignore
                      </button>
                      <button
                        onClick={() => reviewRequest("accepted", request._id)}
                        className="btn btn-primary rounded-xl font-bold tracking-wide w-full sm:w-24 h-9 min-h-[36px] shadow-md shadow-primary/10"
                      >
                        Accept
                      </button>
                    </>
                  ) : (
                    <button 
                      onClick={() => reviewRequest("accepted", request._id, true)} 
                      className="btn btn-primary btn-outline rounded-xl font-bold tracking-wide w-full sm:w-40 h-9 min-h-[36px]"
                    >
                      ↺ Accept Ignore
                    </button>
                  )}
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