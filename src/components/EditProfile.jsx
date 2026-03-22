import { useState } from "react";
import { BASE_URL } from "../utils/constants";
import { useDispatch } from "react-redux";
import axios from "axios";
import { addUser } from "../utils/userSlice";
import UserCard from "./UserCard";

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

  // 👈 NEW: Secure Image Upload & Auto-Save Handler
  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setIsUploading(true);
    setError(""); // Clear any previous errors

    const formData = new FormData();
    formData.append("file", file); // Must match backend upload.single("file")

    try {
      // 1. Upload the image to Cloudinary
      const uploadRes = await axios.post(`${BASE_URL}/uploadFile`, formData, {
        withCredentials: true,
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      
      const newPhotoUrl = uploadRes.data.fileUrl;
      
      // 2. Instantly update the local preview card & form input
      setPhotoUrl(newPhotoUrl); 

      // 3. AUTO-SAVE: Send the new Cloudinary URL directly to your database
      const updateRes = await axios.patch(
        `${BASE_URL}/profile/edit`, 
        { photoUrl: newPhotoUrl }, // Only update the photo field
        { withCredentials: true }
      );

      // 4. Update the global Redux store so the navbar avatar updates instantly too!
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
      // Build the payload
      const payload = {
        firstName,
        lastName,
        photoUrl,
        gender,
        about,
      };

      // Only include age if it has a value, and convert to number
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
      <div className="container mx-auto px-4 py-10">
        <div className="flex flex-col lg:flex-row justify-center items-start gap-8 max-w-6xl mx-auto">
          {/* Edit Form Card */}
          <div className="card w-full lg:w-1/2 bg-base-200 shadow-xl border border-primary/20">
            <div className="card-body">
              <h2 className="card-title text-2xl mb-6">Edit Profile</h2>

              <div className="form-control">
                <label className="label">
                  <span className="label-text">First Name</span>
                </label>
                <input
                  type="text"
                  placeholder="First Name"
                  className="input input-bordered w-full"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                />
              </div>

              <div className="form-control">
                <label className="label">
                  <span className="label-text">Last Name</span>
                </label>
                <input
                  type="text"
                  placeholder="Last Name"
                  className="input input-bordered w-full"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                />
              </div>

              {/* 📸 Profile Picture Upload Section */}
              <div className="form-control mb-4">
                <label className="label">
                  <span className="label-text font-semibold mb-3">Profile Photo</span>
                </label>
                
                <div className="flex items-center gap-4 mb-4">
                  {/* Current Photo Thumbnail */}
                  <div className="avatar">
                    <div className="w-16 h-16 rounded-full ring ring-primary ring-offset-base-100 ring-offset-2 object-cover overflow-hidden">
                      <img 
                        src={photoUrl || "https://www.w3schools.com/howto/img_avatar.png"} 
                        alt="Profile Preview" 
                      />
                    </div>
                  </div>

                  {/* Upload Button */}
                  <div className="flex flex-col gap-1">
                    <input
                      type="file"
                      id="profileImageUpload"
                      className="hidden"
                      accept="image/*"
                      onChange={handleImageUpload}
                    />
                    <label
                      htmlFor="profileImageUpload"
                      className={`btn btn-secondary btn-sm ${isUploading ? 'loading' : ''}`}
                    >
                      {isUploading ? "Uploading..." : "Upload New Photo"}
                    </label>
                    <span className="text-xs text-base-content/60">
                      Or paste a direct URL below
                    </span>
                  </div>
                </div>

                {/* Manual URL Input (Fallback) */}
                <input
                  type="text"
                  value={photoUrl}
                  onChange={(e) => setPhotoUrl(e.target.value)}
                  className="input input-bordered w-full text-sm"
                  placeholder="https://..."
                />
              </div>

              <div className="form-control">
                <label className="label">
                  <span className="label-text">Age</span>
                </label>
                <input
                  type="number"
                  placeholder="25"
                  min="18"
                  className="input input-bordered w-full"
                  value={age}
                  onChange={(e) => setAge(e.target.value)}
                />
              </div>

              <div className="form-control">
                <label className="label">
                  <span className="label-text">Gender</span>
                </label>
                <select
                  className="select select-bordered w-full"
                  value={gender}
                  onChange={(e) => setGender(e.target.value)}
                >
                  <option value="">Select gender</option>
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                  <option value="other">Other</option>
                </select>
              </div>

              <div className="form-control">
                <label className="label">
                  <span className="label-text">About</span>
                </label>
                <textarea
                  placeholder="Tell us about yourself"
                  className="textarea textarea-bordered h-24 m-6"
                  value={about}
                  onChange={(e) => setAbout(e.target.value)}
                />
              </div>

              {error && (
                <div className="alert alert-error mt-4">
                  <span>{error}</span>
                </div>
              )}

              <div className="card-actions mt-6">
                <button
                  className="btn btn-primary w-full"
                  onClick={saveProfile}
                >
                  Save Profile
                </button>
              </div>
            </div>
          </div>

          {/* Preview Card */}
          <div className="card w-full lg:w-1/2 bg-base-200 shadow-xl border border-secondary/20">
            <div className="card-body">
              <h2 className="card-title text-2xl mb-6">Preview</h2>
              <UserCard
                user={{ firstName, lastName, photoUrl, age, gender, about }}
                isPreview={true} 
              />
            </div>
          </div>
        </div>
      </div>

      {/* Success Toast */}
      {showToast && (
        <div className="toast toast-top toast-center z-50">
          <div className="alert alert-success">
            <span>✓ Profile saved successfully!</span>
          </div>
        </div>
      )}
    </>
  );
};

export default EditProfile;