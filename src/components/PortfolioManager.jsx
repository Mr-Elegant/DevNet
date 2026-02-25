// ==========================================
// 1. IMPORTS
// ==========================================
import { useState } from "react"; // Hook for local UI state (form inputs, toggles)
import { useDispatch, useSelector } from "react-redux"; // Hooks to interact with Redux store
import axios from "axios"; // HTTP client for API requests
import { BASE_URL } from "../utils/constants"; // Backend server URL
import { addUser } from "../utils/userSlice"; // Redux action to update the user globally

const PortfolioManager = () => {
  // ==========================================
  // 2. GLOBAL STATE & HOOKS
  // ==========================================
  // Get the logged-in user from Redux
  const user = useSelector((store) => store.user);
  const dispatch = useDispatch();

  // ==========================================
  // 3. LOCAL COMPONENT STATE
  // ==========================================
  // Load existing projects from the user object, or default to an empty array
  const [projects, setProjects] = useState(user?.projects || []);
  
  // Toggles the visibility of the "Add New Project" form
  const [showForm, setShowForm] = useState(false);
  
  // Tracks if a screenshot is currently uploading to Cloudinary
  const [isUploading, setIsUploading] = useState(false);
  
  // Tracks if the final save request is running (disables the save button to prevent spam)
  const [isSaving, setIsSaving] = useState(false);

  // Holds the text/data for the new project currently being typed in the form
  const [newProject, setNewProject] = useState({
    title: "",
    description: "",
    technologies: "", // Kept as a string while typing
    liveUrl: "",
    githubUrl: "",
    images: [], // Array to hold uploaded Cloudinary URLs
  });

  // ==========================================
  // 4. IMAGE UPLOAD LOGIC
  // ==========================================
  const handleImageUpload = async (e) => {
    // Grab the first file the user selected
    const file = e.target.files[0];
    if (!file) return; // If they cancelled the upload, stop here

    setIsUploading(true); // Show loading state
    
    // Package the file into FormData (required for sending physical files via Axios)
    const formData = new FormData();
    formData.append("file", file); // 'file' matches the multer configuration in backend

    try {
      // POST the file to your secure Cloudinary upload route
      const res = await axios.post(`${BASE_URL}/uploadFile`, formData, {
        withCredentials: true,
        headers: { "Content-Type": "multipart/form-data" },
      });

      // Extract the secure URL from Cloudinary's response
      const { fileUrl } = res.data;

      // Add this new URL to the newProject's images array without deleting previous ones
      setNewProject((prev) => ({
        ...prev,
        images: [...prev.images, fileUrl],
      }));
      
    } catch (error) {
      console.error("Image upload failed:", error);
    } finally {
      setIsUploading(false); // Hide loading state
    }
  };

  // ==========================================
  // 5. ADD & DELETE LOCAL LOGIC
  // ==========================================
  const handleAddProjectToState = () => {
    // Validation: Don't allow saving if there is no title
    if (!newProject.title.trim()) return alert("Project title is required!");

    // 👇 FIX: Safely parse the technologies string into an array. 
    // If it's empty, return an empty array [] to prevent future crashes!
    const techArray = newProject.technologies
      ? newProject.technologies
          .split(",") // Split by comma
          .map((tech) => tech.trim()) // Remove extra spaces
          .filter((tech) => tech !== "") // Remove empty entries
      : [];

    // Combine the form data with the cleanly formatted tech array
    const projectToAdd = {
      ...newProject,
      technologies: techArray,
    };

    // Push the new project into our local state array
    setProjects([...projects, projectToAdd]);
    
    // Wipe the form clean and close it
    setNewProject({ title: "", description: "", technologies: "", liveUrl: "", githubUrl: "", images: [] });
    setShowForm(false);
  };

  // Removes a project from the local UI state by filtering out its index
  const handleRemoveProject = (indexToRemove) => {
    setProjects(projects.filter((_, index) => index !== indexToRemove));
  };

  // ==========================================
  // 6. SAVE TO DATABASE LOGIC
  // ==========================================
  const handleSavePortfolio = async () => {
    setIsSaving(true);
    try {
      // Send the entire local projects array to the backend PATCH route
      const res = await axios.patch(
        `${BASE_URL}/profile/projects`,
        { projects: projects },
        { withCredentials: true }
      );

      // Update Redux with the new user data returned by the backend
      dispatch(addUser(res.data.data));
      
      alert("Portfolio saved successfully! 🚀");
    } catch (error) {
      console.error("Failed to save portfolio:", error);
      alert("Failed to save portfolio.");
    } finally {
      setIsSaving(false);
    }
  };

  // ==========================================
  // 7. RENDER UI
  // ==========================================
  return (
    // Main Wrapper Container
    <div className="w-full max-w-4xl mx-auto p-4 sm:p-8 bg-base-200 shadow-xl rounded-2xl border border-primary/20 my-10">
      
      {/* HEADER SECTION */}
      <div className="flex justify-between items-center mb-8 border-b border-base-300 pb-4">
        <div>
          <h2 className="text-3xl font-bold text-primary">Developer Portfolio</h2>
          <p className="opacity-70 text-sm mt-1">Showcase your best projects to potential connections.</p>
        </div>
        {/* Master Save Button */}
        <button 
          onClick={handleSavePortfolio} 
          disabled={isSaving}
          className="btn btn-primary shadow-lg hover:scale-105 transition-transform"
        >
          {isSaving ? "Saving..." : "Save Portfolio"}
        </button>
      </div>

      {/* EXISTING PROJECTS GRID */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        
        {/* Empty State Message */}
        {projects?.length === 0 && !showForm && (
          <div className="col-span-full text-center py-10 opacity-50 italic">
            No projects added yet. Time to flex your skills!
          </div>
        )}

        {/* 👇 FIX: Added '?.' to safely map over projects array */}
        {projects?.map((proj, idx) => (
          <div key={idx} className="card bg-base-100 shadow-xl border border-base-300 overflow-hidden group">
            
            {/* Display Image OR a Placeholder if no images exist */}
            {proj.images && proj.images.length > 0 ? (
              <figure className="h-48 w-full overflow-hidden bg-base-300">
                <img src={proj.images[0]} alt={proj.title} className="object-cover w-full h-full group-hover:scale-110 transition-transform duration-500" />
              </figure>
            ) : (
              <div className="h-48 w-full bg-base-300 flex items-center justify-center opacity-50">
                <span className="text-4xl">💻</span>
              </div>
            )}

            <div className="card-body p-5">
              <h3 className="card-title text-xl">{proj.title}</h3>
              <p className="text-sm opacity-80 line-clamp-2">{proj.description}</p>
              
              {/* Tech Stack Badges */}
              <div className="flex flex-wrap gap-2 mt-3">
                {/* 👇 THE MAIN FIX: Added '?.' so it safely ignores undefined technology arrays! */}
                {proj.technologies?.map((tech, i) => (
                  <span key={i} className="badge badge-primary badge-outline badge-sm">{tech}</span>
                ))}
              </div>

              {/* Action Buttons (GitHub, Live, Delete) */}
              <div className="card-actions justify-between items-center mt-4 pt-4 border-t border-base-200">
                <div className="flex gap-2">
                  {proj.githubUrl && <a href={proj.githubUrl} target="_blank" rel="noreferrer" className="btn btn-xs btn-ghost">GitHub</a>}
                  {proj.liveUrl && <a href={proj.liveUrl} target="_blank" rel="noreferrer" className="btn btn-xs btn-secondary">Live App</a>}
                </div>
                {/* Delete Project Button (Only deletes locally until Save is clicked) */}
                <button onClick={() => handleRemoveProject(idx)} className="btn btn-xs btn-error btn-outline">Delete</button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* NEW PROJECT FORM TOGGLE */}
      {!showForm ? (
        <button onClick={() => setShowForm(true)} className="btn btn-outline btn-block border-dashed border-2">
          + Add New Project
        </button>
      ) : (
        /* THE ACTUAL ADD PROJECT FORM */
        <div className="bg-base-100 p-6 rounded-xl border border-secondary/30 shadow-inner animation-fade-in">
          <h3 className="text-xl font-bold mb-4">New Project Details</h3>
          
          <div className="space-y-4">
            
            {/* Title & Tech Stack Inputs */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="form-control">
                <label className="label"><span className="label-text">Project Title *</span></label>
                <input type="text" className="input input-bordered" placeholder="e.g. E-Commerce API" value={newProject.title} onChange={(e) => setNewProject({...newProject, title: e.target.value})} />
              </div>
              <div className="form-control">
                <label className="label"><span className="label-text">Technologies Used</span></label>
                <input type="text" className="input input-bordered" placeholder="React, Node.js, MongoDB" value={newProject.technologies} onChange={(e) => setNewProject({...newProject, technologies: e.target.value})} />
                <label className="label"><span className="label-text-alt opacity-60">Comma separated</span></label>
              </div>
            </div>

            {/* Description Textarea */}
            <div className="form-control">
              <label className="label"><span className="label-text">Description</span></label>
              <textarea className="textarea textarea-bordered h-24" placeholder="What does this app do? What problems did you solve?" value={newProject.description} onChange={(e) => setNewProject({...newProject, description: e.target.value})}></textarea>
            </div>

            {/* URLs Inputs */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="form-control">
                <label className="label"><span className="label-text">GitHub Repository URL</span></label>
                <input type="url" className="input input-bordered" placeholder="https://github.com/..." value={newProject.githubUrl} onChange={(e) => setNewProject({...newProject, githubUrl: e.target.value})} />
              </div>
              <div className="form-control">
                <label className="label"><span className="label-text">Live Deployment URL</span></label>
                <input type="url" className="input input-bordered" placeholder="https://myapp.com" value={newProject.liveUrl} onChange={(e) => setNewProject({...newProject, liveUrl: e.target.value})} />
              </div>
            </div>

            {/* Image Uploader */}
            <div className="form-control mt-2">
              <label className="label"><span className="label-text">Project Screenshots</span></label>
              <div className="flex items-center gap-4">
                <input type="file" accept="image/*" id="projectImage" className="hidden" onChange={handleImageUpload} />
                <label htmlFor="projectImage" className={`btn btn-secondary btn-sm ${isUploading ? 'loading' : ''}`}>
                  {isUploading ? 'Uploading...' : 'Upload Image'}
                </label>
                
                {/* Thumbnails of currently uploaded images */}
                <div className="flex gap-2">
                  {/* 👇 FIX: Safely map over images */}
                  {newProject.images?.map((img, i) => (
                    <div key={i} className="avatar">
                      <div className="w-10 h-10 rounded shadow">
                        <img src={img} alt="thumbnail" />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Form Action Buttons */}
            <div className="flex justify-end gap-3 mt-6 border-t border-base-200 pt-4">
              {/* Closes the form without saving */}
              <button onClick={() => setShowForm(false)} className="btn btn-ghost">Cancel</button>
              {/* Pushes to local state */}
              <button onClick={handleAddProjectToState} className="btn btn-primary">Add to Portfolio</button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default PortfolioManager;