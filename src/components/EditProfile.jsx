import { useState } from "react";
import { BASE_URL } from "../utils/constants";
import { useDispatch } from "react-redux";
import axios from "axios";
import UserCard from "./UserCard";
import { addUser } from "../utils/userSlice";

const EditProfile = ({ user }) => {
  const [firstName, setFirstName] = useState(user.firstName);
  const [lastName, setLastName] = useState(user.lastName);
  const [photoUrl, setPhotoUrl] = useState(user.photoUrl);
  const [age, setAge] = useState(user.age);
  const [gender, setGender] = useState(user.gender || "");
  const [about, setAbout] = useState(user.about || "");
  const [error, setError] = useState("");
  const [showToast, setShowToast] = useState(false);

  const dispatch = useDispatch();

  const saveProfile = async () => {
    setError("");
    try {
      const res = await axios.patch(
        `${BASE_URL}/profile/edit`,
        { firstName, lastName, photoUrl, age, gender, about },
        { withCredentials: true }
      );
      dispatch(addUser(res?.data?.data));
      setShowToast(true);
      setTimeout(() => setShowToast(false), 3000);
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || "Something went wrong.");
    }
  };

  return (
    <>
      <div className="flex flex-col lg:flex-row justify-center items-start gap-10 my-10 px-4">
        {/* Form Card */}
        <div className="relative w-full max-w-md rounded-2xl overflow-hidden transition-transform hover:scale-105 p-3">
          {/* Neon animated border */}
          <div className="absolute inset-0 rounded-2xl p-[2px] bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-500 animate-spin-slow opacity-80 pointer-events-none"></div>

          {/* Glassy inner card */}
          <div className="relative z-10 bg-black/70 backdrop-blur-xl rounded-2xl p-6 text-white shadow-lg">
            <h2 className="text-2xl font-bold text-center mb-4">Edit Profile</h2>

            <div className="space-y-4">
              <input
                type="text"
                placeholder="First Name"
                className="w-full px-4 py-2 bg-[#2a2a2a] text-white rounded-lg outline-none focus:ring-2 focus:ring-pink-500"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
              />
              <input
                type="text"
                placeholder="Last Name"
                className="w-full px-4 py-2 bg-[#2a2a2a] text-white rounded-lg outline-none focus:ring-2 focus:ring-pink-500"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
              />
              <input
                type="text"
                placeholder="Photo URL"
                className="w-full px-4 py-2 bg-[#2a2a2a] text-white rounded-lg outline-none focus:ring-2 focus:ring-pink-500"
                value={photoUrl}
                onChange={(e) => setPhotoUrl(e.target.value)}
              />
              <input
                type="number"
                placeholder="Age"
                className="w-full px-4 py-2 bg-[#2a2a2a] text-white rounded-lg outline-none focus:ring-2 focus:ring-pink-500"
                value={age}
                onChange={(e) => setAge(Number(e.target.value))}
              />
              <input
                type="text"
                placeholder="Gender"
                className="w-full px-4 py-2 bg-[#2a2a2a] text-white rounded-lg outline-none focus:ring-2 focus:ring-pink-500"
                value={gender}
                onChange={(e) => setGender(e.target.value)}
              />
              <input
                type="text"
                placeholder="About"
                className="w-full px-4 py-2 bg-[#2a2a2a] text-white rounded-lg outline-none focus:ring-2 focus:ring-pink-500"
                value={about}
                onChange={(e) => setAbout(e.target.value)}
              />
              {error && <p className="text-red-400 text-sm">{error}</p>}

              <button
                className="w-full bg-pink-600 hover:bg-pink-700 text-white font-semibold py-2 rounded-lg"
                onClick={saveProfile}
              >
                Save Profile
              </button>
            </div>
          </div>
        </div>

        {/* Glass Shader Wrapped UserCard */}
        <div className="relative w-full max-w-sm rounded-2xl overflow-hidden transition-transform hover:scale-105 p-3">
          <div className="absolute inset-0 rounded-2xl p-[2px] bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 animate-pulse opacity-80 pointer-events-none"></div>

          <div className="relative z-10 bg-black/70 backdrop-blur-xl rounded-2xl shadow-lg">
            <UserCard
              user={{ firstName, lastName, photoUrl, age, gender, about }}
            />
          </div>
        </div>
      </div>

      {showToast && (
        <div className="toast toast-top toast-center py-10 mx-[-5%] my-10">
          <div className="alert alert-success">
            <span>Profile saved successfully.</span>
          </div>
        </div>
      )}
    </>
  );
};

export default EditProfile;
