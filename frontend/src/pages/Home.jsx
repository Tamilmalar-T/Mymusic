import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { API_BASE_URL } from "../config";
import { 
  FiSearch, 
  FiUpload, 
  FiLogOut, 
  FiHome, 
  FiLayers, 
  FiCompass, 
  FiMusic, 
  FiInfo 
} from "react-icons/fi";

import MusicPlayer from "../components/MusicPlayer";
import RecentCard from "../components/RecentCard";
import AlbumCard from "../components/AlbumCard";
import BottomNav from "../components/BottomNav";
import UploadModal from "../components/UploadModal";

function Home() {
  const navigate = useNavigate();
  const [songs, setSongs] = useState([]);
  const [currentSong, setCurrentSong] = useState(null);
  const [activeFilter, setActiveFilter] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [userName, setUserName] = useState("User");

  useEffect(() => {
    fetchSongs();
  }, []);

  const fetchSongs = async () => {
    try {
      const res = await axios.get(`${API_BASE_URL}/api/songs`);
      setSongs(res.data);
    } catch (error) {
      console.error("Error fetching songs", error);
    }
  };

  const handleUploadSuccess = (newSong) => {
    fetchSongs();
    setCurrentSong(newSong);
  };

  // Assign fallback stock covers if not set in DB
  const images = ["/images/pop.png", "/images/movie.png", "/images/acoustic.png"];
  
  const songsWithImages = songs.map((song, index) => ({
    ...song,
    imageUrl: song.imageUrl || images[index % images.length]
  }));

  // Filtering and Searching
  const filteredSongs = songsWithImages.filter((song) => {
    const matchesSearch = 
      song.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      song.artist.toLowerCase().includes(searchQuery.toLowerCase());
    
    // "All" filter displays all. 
    // Just a placeholder filter logic as DB models do not have genre yet
    if (activeFilter === "All") return matchesSearch;
    if (activeFilter === "Music") return matchesSearch;
    if (activeFilter === "Podcasts") return false; // Podcasts are empty for now
    return matchesSearch;
  });

  const filters = ["All", "Music", "Podcasts"];

  return (
    <div style={{ display: "flex", minHeight: "100vh" }}>
      {/* GLOW DECORATIONS */}
      <div className="glow-blob" style={{ top: "0%", left: "0%" }}></div>
      <div className="glow-blob-purple" style={{ bottom: "0%", right: "0%" }}></div>

      {/* DESKTOP SIDEBAR NAVIGATION */}
      <div
        className="d-none d-lg-flex flex-column justify-content-between p-4"
        style={{
          width: "var(--sidebar-w)",
          background: "rgba(10, 10, 14, 0.7)",
          backdropFilter: "blur(20px)",
          borderRight: "1px solid rgba(255, 255, 255, 0.08)",
          position: "fixed",
          top: 0,
          bottom: 0,
          left: 0,
          zIndex: 100
        }}
      >
        <div>
          {/* Logo */}
          <div className="d-flex align-items-center gap-3 mb-5 px-3">
            <div 
              style={{
                width: "40px",
                height: "40px",
                borderRadius: "10px",
                background: "linear-gradient(135deg, #1ed760 0%, #8b5cf6 100%)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                boxShadow: "0 4px 15px rgba(30, 215, 96, 0.3)"
              }}
            >
              <FiMusic size={20} color="#000000" />
            </div>
            <h4 style={{ margin: 0, fontWeight: 800, letterSpacing: "-0.5px" }}>MyMusic</h4>
          </div>

          {/* Nav Links */}
          <div className="d-flex flex-column gap-2">
            <div className="sidenav-link active">
              <FiHome size={18} /> Home
            </div>
            <div className="sidenav-link">
              <FiCompass size={18} /> Discover
            </div>
            <div className="sidenav-link">
              <FiLayers size={18} /> Your Library
            </div>
            <div 
              className="sidenav-link" 
              onClick={() => setIsUploadOpen(true)}
              style={{ color: "var(--accent)" }}
            >
              <FiUpload size={18} /> Upload Track
            </div>
          </div>
        </div>

        {/* User profile / Logout */}
        <div 
          className="d-flex align-items-center justify-content-between p-3"
          style={{
            background: "rgba(255, 255, 255, 0.03)",
            border: "1px solid rgba(255, 255, 255, 0.06)",
            borderRadius: "14px"
          }}
        >
          <div className="d-flex align-items-center gap-2">
            <div className="avatar-circle">M</div>
            <span style={{ fontSize: "0.85rem", fontWeight: "700" }}>Premium User</span>
          </div>
        </div>
      </div>

      {/* MAIN CONTENT AREA */}
      <div 
        style={{ 
          flex: 1, 
          marginLeft: "0px",
          paddingBottom: "180px", 
          transition: "margin 0.3s ease" 
        }}
        className="main-layout-container"
      >
        {/* CSS to handle shifting for desktop sidebar */}
        <style>{`
          @media (min-width: 992px) {
            .main-layout-container {
              margin-left: var(--sidebar-w) !important;
              padding: 32px 48px 180px 48px !important;
            }
          }
          @media (max-width: 991px) {
            .main-layout-container {
              padding: 16px 16px 180px 16px !important;
            }
          }
        `}</style>

        {/* Top Header Section (Search and Profile info) */}
        <div 
          className="d-flex align-items-center justify-content-between mb-4 flex-wrap gap-3"
          style={{ position: "relative", zIndex: 10 }}
        >
          <div className="d-flex align-items-center gap-2">
            <div className="d-lg-none avatar-circle me-2">M</div>
            <div style={{ display: "flex", overflowX: "auto" }} className="hide-scrollbar">
              {filters.map(f => (
                <button
                  key={f}
                  className={`filter-pill ${activeFilter === f ? "active" : ""}`}
                  onClick={() => setActiveFilter(f)}
                >
                  {f}
                </button>
              ))}
            </div>
          </div>

          {/* Search bar */}
          <div 
            className="d-flex align-items-center"
            style={{
              position: "relative",
              minWidth: "260px",
              flex: "0 0 auto"
            }}
          >
            <FiSearch 
              style={{
                position: "absolute",
                left: "14px",
                color: "var(--text-subdued)",
                pointerEvents: "none"
              }} 
            />
            <input
              type="text"
              placeholder="Search tracks, artists..."
              className="form-control custom-input"
              style={{
                paddingLeft: "42px",
                fontSize: "0.85rem",
                width: "100%",
                height: "38px"
              }}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        {/* MAIN BODY OF CONTENT */}
        {filteredSongs.length === 0 ? (
          /* EMPTY STATE */
          <div 
            className="d-flex flex-column align-items-center justify-content-center text-center p-5 mt-5"
            style={{
              background: "rgba(255, 255, 255, 0.02)",
              border: "1px dashed var(--border-glass)",
              borderRadius: "20px",
              maxWidth: "600px",
              margin: "0 auto"
            }}
          >
            <div 
              style={{
                width: "70px",
                height: "70px",
                borderRadius: "50%",
                backgroundColor: "rgba(255, 255, 255, 0.03)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                marginBottom: "20px",
                color: "var(--text-subdued)"
              }}
            >
              <FiMusic size={32} />
            </div>
            <h4 style={{ fontWeight: 800, marginBottom: "8px" }}>No Tracks Found</h4>
            <p style={{ color: "var(--text-subdued)", fontSize: "0.9rem", maxWidth: "350px", marginBottom: "24px" }}>
              {songs.length === 0 
                ? "Your library database is currently empty. Start uploading your favorite MP3 files to build your stream collection!" 
                : "No tracks match your current search query."}
            </p>
            {songs.length === 0 && (
              <button 
                onClick={() => setIsUploadOpen(true)}
                className="btn btn-glow-primary"
              >
                <FiUpload /> Upload First Song
              </button>
            )}
          </div>
        ) : (
          /* CONTENT GRIDS */
          <>
            {/* Recent Grid */}
            <div 
              style={{ 
                display: "grid", 
                gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))", 
                gap: "12px", 
                marginBottom: "36px" 
              }}
            >
              {filteredSongs.slice(0, 6).map((song) => (
                <div key={song._id} onClick={() => setCurrentSong(song)}>
                  <RecentCard image={song.imageUrl} title={song.title} />
                </div>
              ))}
            </div>

            {/* Albums Section */}
            <h3 style={{ fontSize: "1.25rem", fontWeight: "800", marginBottom: "16px", display: "flex", alignItems: "center", gap: "8px" }}>
              Albums featuring songs you like
            </h3>
            <div 
              style={{ 
                display: "flex", 
                overflowX: "auto", 
                marginBottom: "40px",
                paddingBottom: "12px"
              }} 
              className="hide-scrollbar"
            >
              {filteredSongs.map((song) => (
                <div key={song._id} onClick={() => setCurrentSong(song)}>
                  <AlbumCard image={song.imageUrl} title={song.title} subtitle={song.artist} />
                </div>
              ))}
            </div>

            {/* Recommended Section */}
            <h3 style={{ fontSize: "1.25rem", fontWeight: "800", marginBottom: "16px" }}>
              Recommended for today
            </h3>
            <div 
              style={{ 
                display: "flex", 
                overflowX: "auto", 
                marginBottom: "40px",
                paddingBottom: "12px"
              }} 
              className="hide-scrollbar"
            >
              {[...filteredSongs].reverse().map((song) => (
                <div key={song._id} onClick={() => setCurrentSong(song)}>
                  <AlbumCard image={song.imageUrl} title={song.title} subtitle={song.artist} />
                </div>
              ))}
            </div>
          </>
        )}
      </div>

      {/* Floating player and modals */}
      <MusicPlayer song={currentSong} songs={filteredSongs} setCurrentSong={setCurrentSong} />
      
      {/* Bottom Nav for mobile views */}
      <div className="d-lg-none">
        <BottomNav onCreateClick={() => setIsUploadOpen(true)} />
      </div>

      {/* Upload Dialog Modal */}
      <UploadModal 
        isOpen={isUploadOpen}
        onClose={() => setIsUploadOpen(false)}
        onUploadSuccess={handleUploadSuccess}
      />
    </div>
  );
}

export default Home;