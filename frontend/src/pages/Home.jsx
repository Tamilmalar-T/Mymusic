import { useEffect, useState } from "react";
import axios from "axios";

import MusicPlayer from "../components/MusicPlayer";
import RecentCard from "../components/RecentCard";
import AlbumCard from "../components/AlbumCard";
import BottomNav from "../components/BottomNav";

function Home() {
  const [songs, setSongs] = useState([]);
  const [currentSong, setCurrentSong] = useState(null);
  const [activeFilter, setActiveFilter] = useState("All");

  useEffect(() => {
    fetchSongs();
  }, []);

  const fetchSongs = async () => {
    try {
      const res = await axios.get("http://localhost:5000/api/songs");
      setSongs(res.data);
    } catch (error) {
      console.error("Error fetching songs", error);
    }
  };

  // Assign images randomly or sequentially for demonstration
  const images = ["/images/pop.png", "/images/movie.png", "/images/acoustic.png"];
  
  const songsWithImages = songs.map((song, index) => ({
    ...song,
    imageUrl: images[index % images.length]
  }));

  const filters = ["All", "Music", "Podcasts"];

  return (
    <div style={{ padding: "16px", paddingBottom: "150px" }}>
      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", marginBottom: "24px" }}>
        <div className="avatar-circle" style={{ marginRight: "16px" }}>T</div>
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

      {/* Recent Grid */}
      <div 
        style={{ 
          display: "grid", 
          gridTemplateColumns: "1fr 1fr", 
          gap: "8px", 
          marginBottom: "32px" 
        }}
      >
        {songsWithImages.slice(0, 6).map((song) => (
          <div key={song._id} onClick={() => setCurrentSong(song)}>
            <RecentCard image={song.imageUrl} title={song.title} />
          </div>
        ))}
      </div>

      {/* Albums Section */}
      <h3 style={{ fontSize: "1.3rem", marginBottom: "16px" }}>Albums featuring songs you like</h3>
      <div 
        style={{ 
          display: "flex", 
          overflowX: "auto", 
          marginBottom: "32px",
          paddingBottom: "8px"
        }} 
        className="hide-scrollbar"
      >
        {songsWithImages.map((song) => (
          <div key={song._id} onClick={() => setCurrentSong(song)}>
            <AlbumCard image={song.imageUrl} title={song.title} subtitle={song.artist} />
          </div>
        ))}
      </div>

      {/* Recommended Section */}
      <h3 style={{ fontSize: "1.3rem", marginBottom: "16px" }}>Recommended for today</h3>
      <div 
        style={{ 
          display: "flex", 
          overflowX: "auto", 
          marginBottom: "32px",
          paddingBottom: "8px"
        }} 
        className="hide-scrollbar"
      >
        {[...songsWithImages].reverse().map((song) => (
          <div key={song._id} onClick={() => setCurrentSong(song)}>
            <AlbumCard image={song.imageUrl} title={song.title} subtitle={song.artist} />
          </div>
        ))}
      </div>

      <MusicPlayer song={currentSong} />
      <BottomNav />
    </div>
  );
}

export default Home;