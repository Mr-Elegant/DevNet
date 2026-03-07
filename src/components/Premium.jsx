import axios from "axios";
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { BASE_URL } from "../utils/constants";
import { addUser } from "../utils/userSlice";

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
    <div className="flex justify-center items-center min-h-[60vh]">
      <div className="card bg-base-200 shadow-xl max-w-md">
        <div className="card-body text-center">
          <h2 className="card-title text-2xl justify-center">
            🎉 Premium Member
          </h2>
          <p className="text-base-content/70">
            You already have premium access to all features!
          </p>
          <div className="badge badge-primary badge-lg mt-4">Active</div>
        </div>
      </div>
    </div>
  ) : (
    <div className="container mx-auto px-4 py-10">
      <div className="text-center mb-10">
        <h1 className="text-4xl font-bold text-base-content mb-2">
          Choose Your Plan
        </h1>
        <p className="text-base-content/60">
          Unlock premium features and connect with developers worldwide
        </p>
      </div>

      <div className="flex flex-col lg:flex-row gap-8 justify-center items-center">
        {/* Free Plan */}
        <div className="card w-96 bg-base-200 shadow-xl border border-base-300 hover:scale-[1.02] transition-all duration-300">
          <div className="card-body">
            <h2 className="card-title text-2xl">Free</h2>
            <div className="text-4xl font-bold my-4">₹0</div>

            <ul className="space-y-2 text-sm text-base-content/70">
              <li className="flex items-center gap-2"><span className="text-success">✓</span> Basic Access</li>
              <li className="flex items-center gap-2"><span className="text-success">✓</span> Limited Features</li>
              <li className="flex items-center gap-2"><span className="text-error">✗</span> No Analytics</li>
            </ul>

            <div className="card-actions mt-6">
              <button className="btn btn-outline w-full" disabled>Current Plan</button>
            </div>
          </div>
        </div>

        {/* Silver Plan */}
        <div className="card w-96 bg-base-200 shadow-2xl border-2 border-primary hover:scale-[1.05] transition-all duration-300 relative">
          <div className="badge badge-primary absolute right-4 top-4">POPULAR</div>
          <div className="card-body">
            <h2 className="card-title text-2xl">Silver</h2>
            <div className="flex items-baseline gap-1">
              <span className="text-4xl font-bold">₹199</span>
              <span className="text-base-content/60">/year</span>
            </div>

            <ul className="space-y-2 text-sm text-base-content/70 my-4">
              <li className="flex items-center gap-2"><span className="text-success">✓</span> All Free Features</li>
              <li className="flex items-center gap-2"><span className="text-success">✓</span> Chat with other people</li>
              <li className="flex items-center gap-2"><span className="text-success">✓</span> 100 requests/day</li>
              <li className="flex items-center gap-2"><span className="text-success">✓</span> Blue Tick</li>
              <li className="flex items-center gap-2"><span className="text-success">✓</span> 1 year access</li>
            </ul>

            <div className="card-actions mt-6">
              <button onClick={() => handleBuyClick("silver")} disabled={isProcessing} className="btn btn-primary w-full">
                {isProcessing ? "Processing..." : "Get Silver"}
              </button>
            </div>
          </div>
        </div>

        {/* Gold Plan */}
        <div className="card w-96 bg-base-200 shadow-xl border-2 border-warning hover:scale-[1.02] transition-all duration-300">
          <div className="card-body">
            <h2 className="card-title text-2xl">Gold</h2>
            <div className="flex items-baseline gap-1">
              <span className="text-4xl font-bold">₹399</span>
              <span className="text-base-content/60">/year</span>
            </div>

            <ul className="space-y-2 text-sm text-base-content/70 my-4">
              <li className="flex items-center gap-2"><span className="text-success">✓</span> All Silver Features</li>
              <li className="flex items-center gap-2"><span className="text-success">✓</span> Priority Support</li>
              <li className="flex items-center gap-2"><span className="text-success">✓</span> Unlimited requests</li>
              <li className="flex items-center gap-2"><span className="text-success">✓</span> Unlimited Posting</li>
              <li className="flex items-center gap-2"><span className="text-success">✓</span> Lifetime access</li>
              <li className="flex items-center gap-2"><span className="text-success">✓</span> AI Support</li>
            </ul>

            <div className="card-actions mt-6">
              <button onClick={() => handleBuyClick("gold")} disabled={isProcessing} className="btn btn-warning w-full">
                {isProcessing ? "Processing..." : "Get Gold"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Premium;