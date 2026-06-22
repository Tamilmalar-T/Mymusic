import { useState, useRef, useEffect } from "react";
import axios from "axios";
import { FiX, FiUploadCloud, FiMusic, FiCheckCircle, FiAlertCircle, FiImage, FiSettings } from "react-icons/fi";

function UploadModal({ isOpen, onClose, onUploadSuccess }) {
  const [title, setTitle] = useState("");
  const [artist, setArtist] = useState("");
  const [songFile, setSongFile] = useState(null);
  
  // Custom cover variables
  const [coverType, setCoverType] = useState("auto"); // "auto" or "custom"
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);

  const [dragActiveSong, setDragActiveSong] = useState(false);
  const [dragActiveImage, setDragActiveImage] = useState(false);
  
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  
  const songInputRef = useRef(null);
  const imageInputRef = useRef(null);

  // Clear preview URL on unmount or reset
  useEffect(() => {
    return () => {
      if (imagePreview) URL.revokeObjectURL(imagePreview);
    };
  }, [imagePreview]);

  if (!isOpen) return null;

  const handleDragSong = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActiveSong(true);
    } else if (e.type === "dragleave") {
      setDragActiveSong(false);
    }
  };

  const handleDropSong = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActiveSong(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const droppedFile = e.dataTransfer.files[0];
      if (droppedFile.type.startsWith("audio/") || droppedFile.name.endsWith(".mp3")) {
        setSongFile(droppedFile);
        setError("");
      } else {
        setError("Please drop a valid audio file (.mp3).");
      }
    }
  };

  const handleSongChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setSongFile(e.target.files[0]);
      setError("");
    }
  };

  // Image Drag handlers
  const handleDragImage = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActiveImage(true);
    } else if (e.type === "dragleave") {
      setDragActiveImage(false);
    }
  };

  const handleDropImage = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActiveImage(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const droppedFile = e.dataTransfer.files[0];
      if (droppedFile.type.startsWith("image/")) {
        setImageFile(droppedFile);
        if (imagePreview) URL.revokeObjectURL(imagePreview);
        setImagePreview(URL.createObjectURL(droppedFile));
        setError("");
      } else {
        setError("Please drop a valid image file (.png, .jpg, .jpeg).");
      }
    }
  };

  const handleImageChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      const selectedImage = e.target.files[0];
      if (selectedImage.type.startsWith("image/")) {
        setImageFile(selectedImage);
        if (imagePreview) URL.revokeObjectURL(imagePreview);
        setImagePreview(URL.createObjectURL(selectedImage));
        setError("");
      } else {
        setError("Please choose a valid image file.");
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!title || !artist || !songFile) {
      setError("Please fill in song details and select an audio file.");
      return;
    }

    if (coverType === "custom" && !imageFile) {
      setError("Please select or drop a cover art image, or switch to Auto-Assign.");
      return;
    }

    setError("");
    setIsUploading(true);
    setUploadProgress(0);

    const formData = new FormData();
    formData.append("title", title);
    formData.append("artist", artist);
    formData.append("song", songFile);
    
    if (coverType === "custom" && imageFile) {
      formData.append("image", imageFile);
    }

    try {
      const res = await axios.post("http://localhost:5000/api/songs/upload", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
        onUploadProgress: (progressEvent) => {
          const percentCompleted = Math.round(
            (progressEvent.loaded * 100) / progressEvent.total
          );
          setUploadProgress(percentCompleted);
        },
      });

      setSuccess(true);
      setTimeout(() => {
        // Reset states
        setTitle("");
        setArtist("");
        setSongFile(null);
        setImageFile(null);
        if (imagePreview) {
          URL.revokeObjectURL(imagePreview);
          setImagePreview(null);
        }
        setCoverType("auto");
        setSuccess(false);
        setIsUploading(false);
        onUploadSuccess(res.data);
        onClose();
      }, 1500);

    } catch (err) {
      console.error("Upload error", err);
      setError(
        err.response?.data?.message || "Failed to upload song. Please check your network and try again."
      );
      setIsUploading(false);
    }
  };

  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: "rgba(0, 0, 0, 0.8)",
        backdropFilter: "blur(12px)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 2000,
        padding: "20px",
      }}
      onClick={onClose}
    >
      <div
        className="glass-panel p-4 w-100 hide-scrollbar"
        style={{
          maxWidth: "520px",
          maxHeight: "90vh",
          overflowY: "auto",
          position: "relative",
          animation: "fadeInUp 0.3s ease",
          cursor: "default"
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          style={{
            position: "absolute",
            top: "16px",
            right: "16px",
            background: "none",
            border: "none",
            color: "var(--text-subdued)",
            cursor: "pointer",
            transition: "color 0.2s"
          }}
          onMouseOver={(e) => e.currentTarget.style.color = "#ffffff"}
          onMouseOut={(e) => e.currentTarget.style.color = "var(--text-subdued)"}
        >
          <FiX size={24} />
        </button>

        <h3 className="mb-2" style={{ fontSize: "1.4rem", fontWeight: "800", display: "flex", alignItems: "center", gap: "10px" }}>
          <FiMusic className="text-success" /> Add New Track
        </h3>
        <p style={{ color: "var(--text-subdued)", fontSize: "0.85rem", marginBottom: "20px" }}>
          Add your MP3 tracks with optional customized album cover art.
        </p>

        {error && (
          <div
            className="d-flex align-items-center p-3 mb-3"
            style={{
              backgroundColor: "rgba(239, 68, 68, 0.1)",
              border: "1px solid rgba(239, 68, 68, 0.2)",
              borderRadius: "10px",
              color: "#f87171",
              fontSize: "0.85rem"
            }}
          >
            <FiAlertCircle size={18} className="me-2 flex-shrink-0" />
            <div>{error}</div>
          </div>
        )}

        {success ? (
          <div
            className="text-center p-4"
            style={{
              backgroundColor: "rgba(30, 215, 96, 0.1)",
              border: "1px solid rgba(30, 215, 96, 0.2)",
              borderRadius: "14px",
              color: "var(--accent)"
            }}
          >
            <FiCheckCircle size={48} className="mb-2" />
            <h4 className="mb-1" style={{ color: "var(--accent) !important" }}>Publish Successful!</h4>
            <p style={{ fontSize: "0.85rem", color: "var(--text-base)", margin: 0 }}>
              "{title}" is now added to the streaming queue.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            
            {/* Metadata Fields */}
            <div className="row g-2 mb-3">
              <div className="col-6">
                <label style={{ fontSize: "0.8rem", color: "var(--text-subdued)", marginBottom: "6px", display: "block", fontWeight: "700" }}>
                  Song Title
                </label>
                <input
                  type="text"
                  placeholder="e.g. Starboy"
                  className="form-control custom-input"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  disabled={isUploading}
                />
              </div>
              <div className="col-6">
                <label style={{ fontSize: "0.8rem", color: "var(--text-subdued)", marginBottom: "6px", display: "block", fontWeight: "700" }}>
                  Artist Name
                </label>
                <input
                  type="text"
                  placeholder="e.g. The Weeknd"
                  className="form-control custom-input"
                  value={artist}
                  onChange={(e) => setArtist(e.target.value)}
                  disabled={isUploading}
                />
              </div>
            </div>

            {/* Audio Drop Area */}
            <div className="mb-3">
              <label style={{ fontSize: "0.8rem", color: "var(--text-subdued)", marginBottom: "6px", display: "block", fontWeight: "700" }}>
                Audio File (.mp3)
              </label>
              <div
                onDragEnter={handleDragSong}
                onDragOver={handleDragSong}
                onDragLeave={handleDragSong}
                onDrop={handleDropSong}
                onClick={() => !isUploading && songInputRef.current.click()}
                style={{
                  border: dragActiveSong 
                    ? "2px dashed var(--accent)" 
                    : "1px dashed var(--border-glass)",
                  borderRadius: "12px",
                  padding: "18px",
                  textAlign: "center",
                  backgroundColor: dragActiveSong ? "rgba(30, 215, 96, 0.05)" : "rgba(255, 255, 255, 0.01)",
                  cursor: isUploading ? "not-allowed" : "pointer",
                  transition: "all 0.2s ease"
                }}
              >
                <input
                  ref={songInputRef}
                  type="file"
                  accept="audio/mp3,audio/*"
                  style={{ display: "none" }}
                  onChange={handleSongChange}
                  disabled={isUploading}
                />
                
                <FiUploadCloud size={28} style={{ color: songFile ? "var(--accent)" : "var(--text-subdued)", marginBottom: "6px" }} />
                
                {songFile ? (
                  <div style={{ fontSize: "0.85rem", fontWeight: "600", color: "#ffffff", wordBreak: "break-all" }}>
                    {songFile.name} ({(songFile.size / (1024 * 1024)).toFixed(2)} MB)
                  </div>
                ) : (
                  <div style={{ fontSize: "0.8rem", color: "var(--text-subdued)" }}>
                    Drag & drop song file or <span className="text-success">browse</span>
                  </div>
                )}
              </div>
            </div>

            {/* Cover Art Toggle */}
            <div className="mb-3">
              <label style={{ fontSize: "0.8rem", color: "var(--text-subdued)", marginBottom: "8px", display: "block", fontWeight: "700" }}>
                Cover Art Preference
              </label>
              
              <div 
                className="d-flex p-1" 
                style={{ 
                  background: "rgba(255, 255, 255, 0.03)", 
                  borderRadius: "10px",
                  border: "1px solid var(--border-glass)" 
                }}
              >
                <button
                  type="button"
                  onClick={() => setCoverType("auto")}
                  style={{
                    flex: 1,
                    background: coverType === "auto" ? "var(--accent)" : "none",
                    border: "none",
                    borderRadius: "8px",
                    color: coverType === "auto" ? "#000000" : "var(--text-subdued)",
                    padding: "8px",
                    fontSize: "0.8rem",
                    fontWeight: "700",
                    transition: "all 0.2s ease"
                  }}
                >
                  Auto Stock Cover
                </button>
                <button
                  type="button"
                  onClick={() => setCoverType("custom")}
                  style={{
                    flex: 1,
                    background: coverType === "custom" ? "var(--accent)" : "none",
                    border: "none",
                    borderRadius: "8px",
                    color: coverType === "custom" ? "#000000" : "var(--text-subdued)",
                    padding: "8px",
                    fontSize: "0.8rem",
                    fontWeight: "700",
                    transition: "all 0.2s ease"
                  }}
                >
                  Upload Custom Cover
                </button>
              </div>
            </div>

            {/* Auto Image Preview Section */}
            {coverType === "auto" && (
              <div 
                className="mb-4 p-3" 
                style={{ 
                  background: "rgba(255, 255, 255, 0.02)", 
                  borderRadius: "12px", 
                  border: "1px solid rgba(255,255,255,0.04)",
                  display: "flex",
                  alignItems: "center",
                  gap: "12px"
                }}
              >
                <div style={{ display: "flex", gap: "-6px" }}>
                  <img src="/images/pop.png" style={{ width: "32px", height: "32px", borderRadius: "6px", objectFit: "cover", border: "1px solid rgba(0,0,0,0.3)" }} alt="pop" />
                  <img src="/images/movie.png" style={{ width: "32px", height: "32px", borderRadius: "6px", objectFit: "cover", border: "1px solid rgba(0,0,0,0.3)", marginLeft: "-10px" }} alt="movie" />
                  <img src="/images/acoustic.png" style={{ width: "32px", height: "32px", borderRadius: "6px", objectFit: "cover", border: "1px solid rgba(0,0,0,0.3)", marginLeft: "-10px" }} alt="acoustic" />
                </div>
                <div style={{ fontSize: "0.75rem", color: "var(--text-subdued)", lineHeight: "1.3" }}>
                  <span style={{ fontWeight: "700", color: "#ffffff" }}>Auto-Assignment Enabled:</span><br/>
                  A beautiful thematic cover art (Pop, Movie, or Acoustic) will be selected automatically.
                </div>
              </div>
            )}

            {/* Custom Cover Art Select Section */}
            {coverType === "custom" && (
              <div className="mb-4">
                <div 
                  className="d-flex gap-3 align-items-center p-3"
                  style={{
                    background: "rgba(255, 255, 255, 0.02)",
                    borderRadius: "12px",
                    border: "1px solid rgba(255,255,255,0.04)"
                  }}
                >
                  {/* Image Preview Thumbnail */}
                  <div 
                    style={{ 
                      width: "70px", 
                      height: "70px", 
                      borderRadius: "8px", 
                      background: "rgba(255,255,255,0.02)",
                      border: "1px solid var(--border-glass)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      overflow: "hidden",
                      flexShrink: 0
                    }}
                  >
                    {imagePreview ? (
                      <img src={imagePreview} style={{ width: "100%", height: "100%", objectFit: "cover" }} alt="Preview" />
                    ) : (
                      <FiImage size={24} style={{ color: "var(--text-subdued)" }} />
                    )}
                  </div>

                  {/* Image Dropzone */}
                  <div
                    onDragEnter={handleDragImage}
                    onDragOver={handleDragImage}
                    onDragLeave={handleDragImage}
                    onDrop={handleDropImage}
                    onClick={() => !isUploading && imageInputRef.current.click()}
                    style={{
                      flex: 1,
                      border: dragActiveImage 
                        ? "1.5px dashed var(--accent)" 
                        : "1px dashed var(--border-glass)",
                      borderRadius: "8px",
                      padding: "12px",
                      textAlign: "center",
                      cursor: isUploading ? "not-allowed" : "pointer",
                      fontSize: "0.75rem",
                      color: "var(--text-subdued)",
                      backgroundColor: dragActiveImage ? "rgba(30, 215, 96, 0.05)" : "transparent"
                    }}
                  >
                    <input
                      ref={imageInputRef}
                      type="file"
                      accept="image/*"
                      style={{ display: "none" }}
                      onChange={handleImageChange}
                      disabled={isUploading}
                    />
                    {imageFile ? (
                      <span style={{ color: "#ffffff", fontWeight: "700" }}>{imageFile.name}</span>
                    ) : (
                      <span>Drag cover image here or <span className="text-success">browse</span></span>
                    )}
                  </div>
                </div>
              </div>
            )}

            {isUploading && (
              <div className="mb-4">
                <div className="d-flex justify-content-between mb-1" style={{ fontSize: "0.8rem", color: "var(--text-subdued)" }}>
                  <span>Publishing tracks...</span>
                  <span>{uploadProgress}%</span>
                </div>
                <div style={{ height: "6px", width: "100%", backgroundColor: "rgba(255,255,255,0.1)", borderRadius: "3px", overflow: "hidden" }}>
                  <div
                    style={{
                      height: "100%",
                      width: `${uploadProgress}%`,
                      backgroundColor: "var(--accent)",
                      transition: "width 0.1s ease",
                      borderRadius: "3px"
                    }}
                  />
                </div>
              </div>
            )}

            <button
              type="submit"
              className="btn btn-glow-primary w-100"
              disabled={isUploading}
            >
              {isUploading ? "Uploading..." : "Publish Track"}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}

export default UploadModal;
