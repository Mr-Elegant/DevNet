import axios from "axios";
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { BASE_URL } from "../utils/constants";
import { addUser } from "../store/userSlice";
import { motion } from "framer-motion";

const Premium = () => {
  const user = useSelector((store) => store.user);
  const dispatch = useDispatch();
  
  const [isUserPremium, setIsUserPremium] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    if (user?.isPremium) {
      setIsUserPremium(true);
    } else {
      verifyPremiumUser();
    }
  }, [user]);

  const verifyPremiumUser = async () => {
    try {
      const res = await axios.get(BASE_URL + "/premium/verify", {
        withCredentials: true,
      });

      if (res.data.isPremium) {
        setIsUserPremium(true);
        // Instantly update Redux so the Blue Tick appears everywhere
        dispatch(addUser(res.data)); 
      }
    } catch (error) {
      console.error("Verification failed:", error);
    }
  };

  const handleBuyClick = async (type) => {
    if (!window.Razorpay) {
      alert("Razorpay SDK failed to load. Are you online?");
      return;
    }

    setIsProcessing(true);

    try {
      const order = await axios.post(
        BASE_URL + "/payment/create",
        { membershipType: type },
        { withCredentials: true }
      );

      const { amount, keyId, currency, notes, orderId } = order.data;

      const options = {
        key: keyId,
        amount,
        currency,
        name: "DevNet Premium",
        description: `Upgrade to ${type.toUpperCase()} Plan`,
        order_id: orderId,
        prefill: {
          name: notes.firstName + " " + notes.lastName,
          email: notes.emailId,
        },
        theme: {
          color: "#FD3FCA",
        },
        handler: async function (response) {
          await verifyPremiumUser();
        },
      };

      const rzp = new window.Razorpay(options);
      
      rzp.on('payment.failed', function (response){
        alert("Payment Failed. Please try again.");
      });

      rzp.open();
    } catch (error) {
      console.error("Order creation failed:", error);
      alert("Failed to initialize payment gateway.");
    } finally {
      setIsProcessing(false);
    }
  };

  return isUserPremium ? (
    <div className="flex justify-center items-center min-h-[70vh] px-4 relative z-10">
      <div className="w-full max-w-md p-8 sm:p-10 rounded-3xl bg-base-200/50 backdrop-blur-xl border border-primary/30 shadow-2xl text-center space-y-6">
        <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mx-auto text-primary border border-primary/20 text-3xl animate-pulse">
          👑
        </div>
        <div>
          <h2 className="text-2xl font-black text-base-content tracking-tight">
            Premium Member Active
          </h2>
          <p className="text-sm text-base-content/60 mt-2 font-medium leading-relaxed">
            Congratulations! You have active premium privileges. A verified badge has been applied to your profile card.
          </p>
        </div>
        <div className="pt-2">
          <span className="badge badge-primary bg-primary/15 border border-primary/30 text-primary font-bold px-4 py-2 text-xs rounded-xl uppercase tracking-wider">
            Active Member
          </span>
        </div>
      </div>
    </div>
  ) : (
    <div className="container mx-auto px-4 py-12 max-w-6xl relative z-10">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-black tracking-tight text-base-content bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
          Choose Your Plan
        </h1>
        <p className="text-sm font-semibold text-base-content/50 uppercase tracking-widest mt-1">
          Unlock the dev-verse with DevNet Premium
        </p>
      </div>

      <div className="flex flex-col lg:flex-row gap-8 justify-center items-stretch">
        {/* Free Plan */}
        <div className="w-full max-w-xs rounded-3xl bg-base-200/40 backdrop-blur-xl border border-base-content/10 shadow-xl p-6 flex flex-col justify-between hover:scale-[1.01] transition-transform duration-300">
          <div className="space-y-6">
            <div>
              <h2 className="text-xl font-black text-base-content uppercase tracking-wider">Free</h2>
              <div className="text-3xl font-black text-base-content mt-2">₹0</div>
            </div>

            <ul className="space-y-3.5 text-xs font-semibold text-base-content/75">
              <li className="flex items-center gap-2"><span className="text-success text-sm">✓</span> Basic Profile Access</li>
              <li className="flex items-center gap-2"><span className="text-success text-sm">✓</span> Read Community Posts</li>
              <li className="flex items-center gap-2"><span className="text-error text-sm">✗</span> No Chat Messages</li>
              <li className="flex items-center gap-2"><span className="text-error text-sm">✗</span> Limited Swipe Cards</li>
            </ul>
          </div>

          <div className="mt-8">
            <button className="btn btn-outline border-base-content/10 text-base-content/50 w-full rounded-xl font-bold tracking-wide h-11 min-h-[44px]" disabled>
              Current Plan
            </button>
          </div>
        </div>

        {/* Silver Plan */}
        <div className="w-full max-w-xs rounded-3xl bg-base-200/50 backdrop-blur-xl border-2 border-primary shadow-2xl p-6 flex flex-col justify-between hover:scale-[1.02] transition-transform duration-300 relative overflow-hidden">
          <div className="absolute right-3 top-3">
            <span className="badge badge-primary bg-primary/15 border border-primary/20 text-primary text-[8px] font-black tracking-widest uppercase px-2 py-1.5 rounded-lg shadow-sm">
              Popular
            </span>
          </div>
          <div className="space-y-6">
            <div>
              <h2 className="text-xl font-black text-base-content uppercase tracking-wider">Silver</h2>
              <div className="flex items-baseline gap-1 mt-2">
                <span className="text-3xl font-black text-base-content">₹199</span>
                <span className="text-xs font-semibold text-base-content/55">/year</span>
              </div>
            </div>

            <ul className="space-y-3.5 text-xs font-semibold text-base-content/75">
              <li className="flex items-center gap-2"><span className="text-success text-sm">✓</span> All Free Plan Features</li>
              <li className="flex items-center gap-2"><span className="text-success text-sm">✓</span> Chat with Developers</li>
              <li className="flex items-center gap-2"><span className="text-success text-sm">✓</span> 100 swipes per day</li>
              <li className="flex items-center gap-2"><span className="text-success text-sm">✓</span> Verified Silver Badge</li>
              <li className="flex items-center gap-2"><span className="text-success text-sm">✓</span> Collaborative Whiteboard</li>
            </ul>
          </div>

          <div className="mt-8">
            <motion.button 
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => handleBuyClick("silver")} 
              disabled={isProcessing} 
              className="btn btn-primary w-full rounded-xl font-bold tracking-wide text-primary-content h-11 min-h-[44px] shadow-lg shadow-primary/20"
            >
              {isProcessing ? "Processing..." : "Get Silver"}
            </motion.button>
          </div>
        </div>

        {/* Gold Plan */}
        <div className="w-full max-w-xs rounded-3xl bg-base-200/40 backdrop-blur-xl border-2 border-warning shadow-xl p-6 flex flex-col justify-between hover:scale-[1.01] transition-transform duration-300">
          <div className="space-y-6">
            <div>
              <h2 className="text-xl font-black text-base-content uppercase tracking-wider">Gold</h2>
              <div className="flex items-baseline gap-1 mt-2">
                <span className="text-3xl font-black text-base-content">₹399</span>
                <span className="text-xs font-semibold text-base-content/55">/year</span>
              </div>
            </div>

            <ul className="space-y-3.5 text-xs font-semibold text-base-content/75">
              <li className="flex items-center gap-2"><span className="text-success text-sm">✓</span> All Silver Plan Features</li>
              <li className="flex items-center gap-2"><span className="text-success text-sm">✓</span> Unlimited swipes per day</li>
              <li className="flex items-center gap-2"><span className="text-success text-sm">✓</span> Unlimited Forum Postings</li>
              <li className="flex items-center gap-2"><span className="text-success text-sm">✓</span> Gold Verification Badge</li>
              <li className="flex items-center gap-2"><span className="text-success text-sm">✓</span> Lifetime Support & AI</li>
            </ul>
          </div>

          <div className="mt-8">
            <motion.button 
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => handleBuyClick("gold")} 
              disabled={isProcessing} 
              className="btn btn-warning w-full rounded-xl font-bold tracking-wide text-warning-content h-11 min-h-[44px] shadow-lg shadow-warning/20"
            >
              {isProcessing ? "Processing..." : "Get Gold"}
            </motion.button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Premium;