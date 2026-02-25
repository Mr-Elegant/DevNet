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
    <div className="card bg-base-200 shadow-xl border border-primary/20 w-full max-w-3xl mx-auto mb-8">
      <div className="card-body p-6">
        
        {/* POST TYPE SELECTOR (DaisyUI Tabs) */}
        <div className="tabs tabs-boxed bg-base-300 mb-6 flex-wrap justify-center sm:justify-start">
          <a className={`tab ${postType === "devlog" ? "tab-active bg-primary text-primary-content font-bold" : ""}`} onClick={() => setPostType("devlog")}>⚡ Dev Log</a>
          <a className={`tab ${postType === "article" ? "tab-active bg-primary text-primary-content font-bold" : ""}`} onClick={() => setPostType("article")}>📝 Article</a>
          <a className={`tab ${postType === "question" ? "tab-active bg-error text-error-content font-bold" : ""}`} onClick={() => setPostType("question")}>🐛 Ask Question</a>
          <a className={`tab ${postType === "launch" ? "tab-active bg-success text-success-content font-bold" : ""}`} onClick={() => setPostType("launch")}>🚀 Project Launch</a>
        </div>

        {/* ==========================================
            DYNAMIC FIELDS (These appear/disappear based on the tab!) 
            ========================================== */}
        <div className="space-y-4">
          
          {/* TITLE: Articles, Questions, and Launches need titles. Quick Dev Logs do not. */}
          {postType !== "devlog" && (
            <input 
              type="text" 
              name="title"
              value={formData.title}
              onChange={handleInputChange}
              placeholder={postType === "question" ? "What's the bug?" : "Give your post a catchy title..."} 
              className="input input-bordered w-full font-bold text-lg" 
            />
          )}

          {/* MAIN CONTENT: Every post type needs this. It's where they write the Markdown. */}
          <textarea 
            name="content"
            value={formData.content}
            onChange={handleInputChange}
            placeholder={postType === "question" ? "Describe the error, what you've tried so far..." : "What are you working on today? (Markdown supported)"} 
            className="textarea textarea-bordered w-full h-32 text-base"
          ></textarea>

          {/* CODE SNIPPET: Great for Dev Logs and Questions */}
          {(postType === "devlog" || postType === "question") && (
            <div className="bg-base-300 p-3 rounded-lg border border-base-content/10">
              <div className="flex justify-between items-center mb-2">
                <span className="text-xs font-bold uppercase opacity-50 tracking-wider">💻 Attach Code Snippet (Optional)</span>
                {/* Language Selector */}
                <select name="codeLanguage" value={formData.codeLanguage} onChange={handleInputChange} className="select select-bordered select-xs">
                  <option value="javascript">JavaScript</option>
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
                placeholder="Paste your code here..." 
                className="textarea textarea-ghost w-full font-mono text-sm bg-base-100"
              ></textarea>
            </div>
          )}

          {/* PROJECT URL: Only shown if they are announcing a Launch */}
          {postType === "launch" && (
            <input 
              type="url" 
              name="projectUrl"
              value={formData.projectUrl}
              onChange={handleInputChange}
              placeholder="🔗 Link to your live app or GitHub..." 
              className="input input-bordered w-full" 
            />
          )}

          {/* ==========================================
              BOTTOM TOOLBAR (Tags, Images, Submit)
              ========================================== */}
          <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center mt-4 pt-4 border-t border-base-300">
            
            <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
              {/* Image Uploader */}
              <div>
                <input type="file" id="postImageUpload" className="hidden" accept="image/*" onChange={handleImageUpload} />
                <label htmlFor="postImageUpload" className={`btn btn-sm btn-ghost border-dashed border-2 border-base-content/20 ${isUploading ? 'loading' : ''}`}>
                  📸 Add Media
                </label>
              </div>

              {/* Tags Input */}
              <input 
                type="text" 
                name="tags"
                value={formData.tags}
                onChange={handleInputChange}
                placeholder="Tags (e.g. react, bug, api)" 
                className="input input-bordered input-sm w-full sm:w-64" 
              />
            </div>

            {/* Post Button */}
            <button 
              onClick={handleSubmit} 
              disabled={isSubmitting || !formData.content.trim()} 
              className={`btn btn-sm sm:btn-md w-full sm:w-auto ${postType === "launch" ? "btn-success" : postType === "question" ? "btn-error" : "btn-primary"}`}
            >
              {isSubmitting ? "Posting..." : "Post to DevNet"}
            </button>

          </div>

          {/* Image Previews (Shows tiny thumbnails of uploaded pictures before posting) */}
          {formData.images.length > 0 && (
            <div className="flex gap-2 mt-3 overflow-x-auto pb-2">
              {formData.images.map((img, idx) => (
                <div key={idx} className="indicator">
                  {/* Note: In a real app, you'd add an 'X' button here to remove the image from the array */}
                  <img src={img} alt="Preview" className="w-16 h-16 object-cover rounded shadow-md border border-base-300" />
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