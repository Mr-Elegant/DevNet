// ==========================================
// 1. IMPORTS
// ==========================================
import { useState } from "react"; // Hook to manage all the form inputs
import axios from "axios"; // HTTP client to talk to your new backend routes
import { BASE_URL } from "../utils/constants"; // Your server URL

// We pass a 'onPostCreated' prop so we can tell the parent Feed component to refresh its list!
const CreatePost = ({ onPostCreated }) => {
  // ==========================================
  // 2. STATE MANAGEMENT
  // ==========================================
  // Track which type of post the user is currently creating
  const [postType, setPostType] = useState("devlog");

  // Track the actual form data
  const [formData, setFormData] = useState({
    title: "",
    content: "",
    codeSnippet: "",
    codeLanguage: "javascript",
    tags: "", // Stored as a comma-separated string while typing
    projectUrl: "",
    images: [],
  });

  // Track loading states for buttons
  const [isUploading, setIsUploading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // ==========================================
  // 3. EVENT HANDLERS
  // ==========================================
  // Reusable helper to update our form state when a user types
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // Reusing your battle-tested Cloudinary upload logic!
  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setIsUploading(true);
    const uploadData = new FormData();
    uploadData.append("file", file); // Must match backend multer config

    try {
      const res = await axios.post(`${BASE_URL}/uploadFile`, uploadData, {
        withCredentials: true,
        headers: { "Content-Type": "multipart/form-data" },
      });

      // Add the new Cloudinary URL to our images array
      setFormData((prev) => ({
        ...prev,
        images: [...prev.images, res.data.fileUrl],
      }));
    } catch (error) {
      console.error("Image upload failed:", error);
    } finally {
      setIsUploading(false);
    }
  };

  // The function that sends the finalized data to MongoDB
  const handleSubmit = async () => {
    // Basic validation: Content is absolutely required
    if (!formData.content.trim()) return alert("Post content is required!");

    setIsSubmitting(true);
    try {
      // Clean up the tags: "React, Node" -> ["react", "node"]
      const tagsArray = formData.tags
        ? formData.tags.split(",").map((tag) => tag.trim().toLowerCase()).filter((t) => t)
        : [];

      // Package exactly what the backend expects
      const payload = {
        ...formData,
        type: postType,
        tags: tagsArray,
      };

      // Send to the Express route we just built
      await axios.post(`${BASE_URL}/post/create`, payload, {
        withCredentials: true,
      });

      // Reset the form back to zero!
      setFormData({
        title: "",
        content: "",
        codeSnippet: "",
        codeLanguage: "javascript",
        tags: "",
        projectUrl: "",
        images: [],
      });
      
      // Tell the parent component (GlobalFeed) to fetch the newest posts!
      if (onPostCreated) onPostCreated();

    } catch (error) {
      console.error("Failed to create post:", error);
      alert("Something went wrong while posting!");
    } finally {
      setIsSubmitting(false);
    }
  };

  // ==========================================
  // 4. DYNAMIC UI RENDER
  // ==========================================
  return (
    <div className="w-full max-w-3xl mx-auto mb-8 rounded-3xl bg-base-200/50 backdrop-blur-xl border border-base-content/10 shadow-2xl overflow-hidden">
      <div className="p-6 sm:p-8">
        
        {/* POST TYPE SELECTOR (Modern Pill Tabs) */}
        <div className="tabs tabs-boxed bg-base-300/40 p-1.5 rounded-2xl mb-6 flex-wrap justify-center sm:justify-start gap-1 border border-base-content/5">
          <button 
            type="button"
            className={`tab rounded-xl px-4 py-2 text-xs font-bold transition-all ${
              postType === "devlog" 
                ? "bg-primary text-primary-content shadow-lg shadow-primary/10" 
                : "text-base-content/65 hover:text-base-content"
            }`} 
            onClick={() => setPostType("devlog")}
          >
            ⚡ Dev Log
          </button>
          <button 
            type="button"
            className={`tab rounded-xl px-4 py-2 text-xs font-bold transition-all ${
              postType === "article" 
                ? "bg-primary text-primary-content shadow-lg shadow-primary/10" 
                : "text-base-content/65 hover:text-base-content"
            }`} 
            onClick={() => setPostType("article")}
          >
            📝 Article
          </button>
          <button 
            type="button"
            className={`tab rounded-xl px-4 py-2 text-xs font-bold transition-all ${
              postType === "question" 
                ? "bg-error text-error-content shadow-lg shadow-error/10" 
                : "text-base-content/65 hover:text-base-content"
            }`} 
            onClick={() => setPostType("question")}
          >
            🐛 Ask Question
          </button>
          <button 
            type="button"
            className={`tab rounded-xl px-4 py-2 text-xs font-bold transition-all ${
              postType === "launch" 
                ? "bg-success text-success-content shadow-lg shadow-success/10" 
                : "text-base-content/65 hover:text-base-content"
            }`} 
            onClick={() => setPostType("launch")}
          >
            🚀 Project Launch
          </button>
        </div>

        {/* DYNAMIC FIELDS */}
        <div className="space-y-5">
          
          {/* TITLE: Articles, Questions, and Launches */}
          {postType !== "devlog" && (
            <div className="form-control">
              <input 
                type="text" 
                name="title"
                value={formData.title}
                onChange={handleInputChange}
                required
                placeholder={postType === "question" ? "Describe the core issue / bug..." : "Give your post a catchy title..."} 
                className="input input-bordered w-full font-bold text-base bg-base-100/50 border-base-content/10 focus:border-primary focus:outline-none transition-all rounded-xl" 
              />
            </div>
          )}

          {/* MAIN CONTENT */}
          <div className="form-control">
            <textarea 
              name="content"
              value={formData.content}
              onChange={handleInputChange}
              required
              placeholder={postType === "question" ? "Provide complete context about the issue, what you have tried, and copy-paste any relevant error messages..." : "What are you working on today? (Markdown is fully supported)"} 
              className="textarea textarea-bordered w-full h-36 text-sm bg-base-100/50 border-base-content/10 focus:border-primary focus:outline-none transition-all rounded-xl leading-relaxed"
            ></textarea>
          </div>

          {/* CODE SNIPPET */}
          {(postType === "devlog" || postType === "question") && (
            <div className="p-4 rounded-2xl bg-neutral text-neutral-content border border-base-content/10 space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-[10px] font-black uppercase tracking-wider text-neutral-content/60">💻 Code Snippet (Optional)</span>
                
                {/* Language Selector */}
                <select 
                  name="codeLanguage" 
                  value={formData.codeLanguage} 
                  onChange={handleInputChange} 
                  className="select select-bordered select-xs bg-neutral-focus text-neutral-content border-neutral-content/10 rounded-lg text-[10px]"
                >
                  <option value="javascript">JavaScript / JSX</option>
                  <option value="python">Python</option>
                  <option value="java">Java</option>
                  <option value="cpp">C++</option>
                  <option value="html">HTML/CSS</option>
                </select>
              </div>
              <textarea 
                name="codeSnippet"
                value={formData.codeSnippet}
                onChange={handleInputChange}
                className="textarea textarea-ghost w-full font-mono text-xs bg-neutral-focus text-neutral-content focus:outline-none focus:bg-neutral-focus/80 h-32 leading-relaxed"
                placeholder="Paste code snippet here..."
              ></textarea>
            </div>
          )}

          {/* PROJECT URL */}
          {postType === "launch" && (
            <div className="form-control">
              <input 
                type="url" 
                name="projectUrl"
                value={formData.projectUrl}
                onChange={handleInputChange}
                required
                placeholder="🔗 Live URL link to your app, repository, or website..." 
                className="input input-bordered w-full bg-base-100/50 border-base-content/10 focus:border-primary focus:outline-none transition-all rounded-xl text-sm" 
              />
            </div>
          )}

          {/* BOTTOM TOOLBAR (Tags, Images, Submit) */}
          <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center mt-6 pt-5 border-t border-base-content/10">
            
            <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto flex-1">
              {/* Image Uploader */}
              <div className="shrink-0">
                <input type="file" id="postImageUpload" className="hidden" accept="image/*" onChange={handleImageUpload} />
                <label 
                  htmlFor="postImageUpload" 
                  className={`btn btn-sm btn-outline border-base-content/10 hover:bg-base-content/5 text-base-content rounded-xl h-9 min-h-[36px] font-semibold text-xs transition-all ${isUploading ? 'loading' : ''}`}
                >
                  📸 Add Screenshot
                </label>
              </div>

              {/* Tags Input */}
              <input 
                type="text" 
                name="tags"
                value={formData.tags}
                onChange={handleInputChange}
                placeholder="Tags (comma-separated, e.g. react, api)" 
                className="input input-bordered input-sm w-full sm:w-64 bg-base-100/50 border-base-content/10 focus:border-primary focus:outline-none transition-all rounded-xl text-xs h-9" 
              />
            </div>

            {/* Post Button */}
            <motion.button 
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleSubmit} 
              disabled={isSubmitting || !formData.content.trim()} 
              className={`btn btn-sm sm:btn-md rounded-xl font-bold tracking-wide w-full sm:w-auto h-9 min-h-[36px] ${
                postType === "launch" 
                  ? "btn-success shadow-lg shadow-success/10 text-success-content" 
                  : postType === "question" 
                    ? "btn-error shadow-lg shadow-error/10 text-error-content" 
                    : "btn-primary shadow-lg shadow-primary/10 text-primary-content"
              }`}
            >
              {isSubmitting ? "Posting..." : "Post to DevNet"}
            </motion.button>

          </div>

          {/* Image Previews */}
          {formData.images.length > 0 && (
            <div className="flex gap-3 mt-4 overflow-x-auto pb-2">
              {formData.images.map((img, idx) => (
                <div key={idx} className="relative group shrink-0">
                  <img src={img} alt="Preview" className="w-16 h-16 object-cover rounded-xl shadow-md border border-base-content/10" />
                </div>
              ))}
            </div>
          )}

        </div>
      </div>
    </div>
  );
};

export default CreatePost;