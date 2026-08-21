import { useState } from "react";
import { BASE_URL } from "../utils/constants";
import { useDispatch } from "react-redux";
import axios from "axios";
import { addUser } from "../store/userSlice";
import UserCard from "../components/UserCard";
import { motion } from "framer-motion";

const EditProfile = ({ user }) => {
  const [firstName, setFirstName] = useState(user.firstName);
  const [lastName, setLastName] = useState(user.lastName);
  const [photoUrl, setPhotoUrl] = useState(user.photoUrl);
  const [age, setAge] = useState(user.age || "");
  const [gender, setGender] = useState(user.gender || "");
  const [about, setAbout] = useState(user.about || "");
  const [error, setError] = useState("");
  const [showToast, setShowToast] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  
  const dispatch = useDispatch();

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setIsUploading(true);
    setError("");

    const formData = new FormData();
    formData.append("file", file);

    try {
      const uploadRes = await axios.post(`${BASE_URL}/uploadFile`, formData, {
        withCredentials: true,
        headers: { "Content-Type": "multipart/form-data" },
      });
      
      const newPhotoUrl = uploadRes.data.fileUrl;
      setPhotoUrl(newPhotoUrl); 

      const updateRes = await axios.patch(
        `${BASE_URL}/profile/edit`, 
        { photoUrl: newPhotoUrl },
        { withCredentials: true }
      );

      dispatch(addUser(updateRes.data.data));
    } catch (err) {
      console.error("Profile picture upload failed:", err);
      setError("Failed to upload image. Please try again.");
    } finally {
      setIsUploading(false);
    }
  };

  const saveProfile = async () => {
    setError("");
    try {
      const payload = { firstName, lastName, photoUrl, gender, about };
      if (age !== "" && age !== null && age !== undefined) {
        payload.age = Number(age);
      }

      const res = await axios.patch(
        `${BASE_URL}/profile/edit`,
        payload,
        { withCredentials: true }
      );
      dispatch(addUser(res?.data?.data));
      setShowToast(true);
      setTimeout(() => setShowToast(false), 3000);
    } catch (err) {
      console.error(err);
      setError(err.response?.data || "Something went wrong.");
    }
  };

  return (
    <>
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-8">
        
        {/* EDIT FORM BENTO */}
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="xl:col-span-7 bg-base-200/40 backdrop-blur-3xl p-8 rounded-3xl border border-white/5 shadow-2xl relative overflow-hidden"
        >
          {/* Subtle top glow */}
          <div className="absolute top-0 left-1/4 right-1/4 h-1 bg-gradient-to-r from-transparent via-primary/50 to-transparent blur-sm"></div>

          <h2 className="text-2xl font-black tracking-tight mb-8">Personal Configuration</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* First Name */}
            <div className="flex flex-col gap-2">
              <label className="text-xs font-bold uppercase tracking-widest text-base-content/50 ml-1">First Name</label>
              <input
                type="text"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                className="bg-base-300/30 border border-white/10 rounded-2xl py-3 px-4 text-sm font-medium focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/50 transition-all placeholder:text-base-content/20"
                placeholder="First Name"
              />
            </div>

            {/* Last Name */}
            <div className="flex flex-col gap-2">
              <label className="text-xs font-bold uppercase tracking-widest text-base-content/50 ml-1">Last Name</label>
              <input
                type="text"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                className="bg-base-300/30 border border-white/10 rounded-2xl py-3 px-4 text-sm font-medium focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/50 transition-all placeholder:text-base-content/20"
                placeholder="Last Name"
              />
            </div>

            {/* Age */}
            <div className="flex flex-col gap-2">
              <label className="text-xs font-bold uppercase tracking-widest text-base-content/50 ml-1">Age</label>
              <input
                type="number"
                min="18"
                value={age}
                onChange={(e) => setAge(e.target.value)}
                className="bg-base-300/30 border border-white/10 rounded-2xl py-3 px-4 text-sm font-medium focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/50 transition-all placeholder:text-base-content/20"
                placeholder="25"
              />
            </div>

            {/* Gender */}
            <div className="flex flex-col gap-2">
              <label className="text-xs font-bold uppercase tracking-widest text-base-content/50 ml-1">Gender</label>
              <select
                value={gender}
                onChange={(e) => setGender(e.target.value)}
                className="bg-base-300/30 border border-white/10 rounded-2xl py-3 px-4 text-sm font-medium focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/50 transition-all"
              >
                <option value="" className="bg-base-200">Select...</option>
                <option value="male" className="bg-base-200">Male</option>
                <option value="female" className="bg-base-200">Female</option>
                <option value="other" className="bg-base-200">Other</option>
              </select>
            </div>

            {/* About - Full Width */}
            <div className="flex flex-col gap-2 md:col-span-2">
              <label className="text-xs font-bold uppercase tracking-widest text-base-content/50 ml-1">Bio / About</label>
              <textarea
                value={about}
                onChange={(e) => setAbout(e.target.value)}
                className="bg-base-300/30 border border-white/10 rounded-2xl py-3 px-4 text-sm font-medium focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/50 transition-all placeholder:text-base-content/20 min-h-[100px] resize-none"
                placeholder="SysAdmin by day, Hacker by night..."
              />
            </div>

            {/* Avatar Upload - Full Width */}
            <div className="md:col-span-2 bg-base-300/20 rounded-2xl p-4 border border-white/5 flex flex-col sm:flex-row items-center gap-6 mt-2">
              <div className="relative group cursor-pointer">
                <div className="w-20 h-20 rounded-full ring-2 ring-primary ring-offset-2 ring-offset-base-100 overflow-hidden">
                  <img src={photoUrl || "https://www.w3schools.com/howto/img_avatar.png"} alt="Avatar" className="w-full h-full object-cover" />
                </div>
                {/* Hover overlay for direct click upload */}
                <label htmlFor="profileImageUpload" className="absolute inset-0 bg-black/50 rounded-full opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity cursor-pointer">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6 text-white">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6.827 6.175A2.31 2.31 0 015.186 7.23c-.38.054-.757.112-1.134.175C2.999 7.58 2.25 8.507 2.25 9.574V18a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9.574c0-1.067-.75-1.994-1.802-2.169a47.865 47.865 0 00-1.134-.175 2.31 2.31 0 01-1.64-1.055l-.822-1.316a2.192 2.192 0 00-1.736-1.039 48.774 48.774 0 00-5.232 0 2.192 2.192 0 00-1.736 1.039l-.821 1.316z" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 12.75a4.5 4.5 0 11-9 0 4.5 4.5 0 019 0zM18.75 10.5h.008v.008h-.008V10.5z" />
                  </svg>
                </label>
              </div>
              
              <div className="flex-1 flex flex-col gap-2 w-full">
                <input
                  type="file"
                  id="profileImageUpload"
                  className="hidden"
                  accept="image/*"
                  onChange={handleImageUpload}
                />
                <input
                  type="text"
                  value={photoUrl}
                  onChange={(e) => setPhotoUrl(e.target.value)}
                  className="bg-base-300/30 border border-white/10 rounded-xl py-2 px-3 text-xs font-mono focus:outline-none focus:border-primary/50 transition-all w-full"
                  placeholder="https://..."
                />
                <span className="text-[10px] uppercase tracking-wider text-base-content/40 font-bold">
                  {isUploading ? "Uploading..." : "Click avatar or paste URL"}
                </span>
              </div>
            </div>

            {/* Error & Save */}
            <div className="md:col-span-2 mt-4 flex flex-col items-end gap-3">
              {error && <span className="text-xs text-error font-bold">{error}</span>}
              <button
                onClick={saveProfile}
                className="w-full sm:w-auto px-10 py-3.5 rounded-2xl bg-gradient-to-r from-primary to-secondary text-base-100 font-black uppercase tracking-widest text-sm hover:scale-105 transition-transform shadow-[0_0_20px_rgba(255,255,255,0.1)] hover:shadow-primary/40"
              >
                Commit Changes
              </button>
            </div>

          </div>
        </motion.div>

        {/* PROFILE PREVIEW BENTO */}
        <motion.div 
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="xl:col-span-5 flex items-center justify-center relative perspective-[1000px]"
        >
          {/* Subtle animated floating effect for the preview card */}
          <motion.div
             animate={{ y: [0, -10, 0] }}
             transition={{ repeat: Infinity, duration: 6, ease: "easeInOut" }}
             className="relative z-10"
          >
             <UserCard
                user={{ firstName, lastName, photoUrl, age, gender, about, isPremium: user.isPremium, membershipType: user.membershipType }}
                isPreview={true} 
             />
          </motion.div>

          {/* Floor shadow */}
          <div className="absolute -bottom-10 left-1/2 -translate-x-1/2 w-64 h-10 bg-black/40 blur-xl rounded-[100%] pointer-events-none"></div>
        </motion.div>

      </div>

      {/* Success Toast */}
      {showToast && (
        <div className="toast toast-bottom toast-center sm:toast-top z-[9999]">
          <div className="alert alert-success bg-success/20 backdrop-blur-xl border border-success/30 text-success font-bold rounded-2xl shadow-2xl">
            <svg xmlns="http://www.w3.org/2000/svg" className="stroke-current shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
            <span>Configuration Saved Successfully</span>
          </div>
        </div>
      )}
    </>
  );
};

export default EditProfile;