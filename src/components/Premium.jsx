import axios from "axios";
import { useEffect, useState } from "react";
import { BASE_URL } from "../utils/constants";

const Premium = () => {
  const [isUserPremium, setIsUserPremium] = useState(false);
  
  // useEffect(()=> {
  //   verifyPremiumUser();
  // }, [])


  // const verifyPremiumUser = async () => {
  //   const res = await axios.get(BASE_URL + "/premium/verify", {
  //     withCredentials: true,
  //   });

  //   if (res.data.isPremium) {
  //     setIsUserPremium(true);
  //   }
  // }


  const handleBuyClick = async (type) => {
    const order = await axios.post(BASE_URL + "/payment/create", {
      membershipType: type,
    },
    {withCredentials: true}
    )

    const {amount, keyId, currency, notes, orderId} = order.data;

    const options = {
      key: keyId,
      amount,
      currency,
      name: "DevNet",
      description: "Lets Connect with fellow devs",
      order_id: orderId,
      prefill: {
        name: notes.firstName + " " + notes.lastName,
        email: notes.emailId,
        contact: "8572874207"
      },
      theme: {
        color: "#FD3FCA",
      },

    }

    
    const rzp = new window.Razorpay(options);
    rzp.open()


  }


  return (
    <div>
      <div className="w-full flex flex-col lg:flex-row gap-8 my-10 justify-center">
        {/* Free */}
        <div className="card w-96 bg-[#0f111a] shadow-xl border border-[#2a2d3a] rounded-xl transition-all duration-300 hover:scale-[1.03] hover:shadow-[0_0_20px_#6f4aff33]">
          <div className="card-body">
            <h2 className="card-title text-2xl font-bold">Free</h2>
            <p className="text-4xl font-extrabold mt-2">₹0</p>

            <ul className="mt-4 space-y-2 text-sm opacity-90">
              <li>✔ Basic Access</li>
              <li>✔ Limited Features</li>
              <li>✖ No Analytics</li>
            </ul>


            <button className="btn btn-outline mt-6 w-full border-[#6f4aff] text-[#6f4aff] hover:bg-[#6f4aff] hover:text-white transition-all duration-300">Current Access</button>
          </div>
        </div>

        {/* Silver */}
        <div className="card w-96 bg-[#0f111a] shadow-xl border border-[#6f4aff] rounded-xl relative transition-all duration-300 hover:scale-[1.03] hover:shadow-[0_0_25px_#6f4aff66]">
          <div className="badge absolute right-4 top-4 bg-[#6f4aff] border-0 text-white">POPULAR</div>
          <div className="card-body">
            <h2 className="card-title text-2xl font-bold">Silver</h2>
            <p className="text-4xl font-extrabold mt-2">₹199<span className="text-sm">/year</span></p>

            <ul className="mt-4 space-y-2 text-sm opacity-90">
              <li>✔ All Free Features</li>
              <li>✔ Chat with other people</li>
              <li>✔ 100 connection Requests per day</li>
              <li>✔ Blue Tick</li>
              <li>✔ 1 year</li>
            </ul>

            <button onClick={()=> handleBuyClick("silver")} className="btn mt-6 w-full border-0 bg-[#6f4aff] hover:bg-[#5a39e6] transition-all duration-300 text-white">Get Silver</button>
          </div>
        </div>

        {/* Gold */}
        <div className="card w-96 bg-[#0f111a] shadow-xl border border-[#f5b000] rounded-xl transition-all duration-300 hover:scale-[1.03] hover:shadow-[0_0_25px_#f5b00066]">
          <div className="card-body">
            <h2 className="card-title text-2xl font-bold">Gold</h2>
            <p className="text-4xl font-extrabold mt-2">₹399<span className="text-sm">/year</span></p>

            <ul className="mt-4 space-y-2 text-sm opacity-90">
              <li>✔ All Silver Features</li>
              <li>✔ Priority Support</li>
              <li>✔ Inifinite connection Requests per day</li>
              <li>✔ Unlimited Posting</li>
              <li>✔ Lifetime</li>
              <li>✔ Integrated AI Support</li>
            </ul>

            <button onClick={()=> handleBuyClick("gold")} className="btn mt-6 w-full border-0 bg-[#f5b000] hover:bg-[#d99a00] transition-all duration-300 text-black font-semibold">Get Gold</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Premium;
