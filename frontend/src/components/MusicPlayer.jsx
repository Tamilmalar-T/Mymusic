import { useRef, useState, useEffect } from 'react';

function MusicPlayer({ song }) {
  const audioRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(false);

  useEffect(() => {
    if (song) {
      setIsPlaying(true);
      if (audioRef.current) {
        audioRef.current.play().catch(e => console.log("Audio play error", e));
      }
    }
  }, [song]);

  const togglePlay = () => {
    if (isPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.play();
    }
    setIsPlaying(!isPlaying);
  };

  if (!song) return null;

  return (
    <div
      style={{
        position: "fixed",
        bottom: "65px", // Above BottomNav
        left: "8px",
        right: "8px",
        backgroundColor: "var(--player-bg)",
        borderRadius: "6px",
        padding: "8px",
        display: "flex",
        alignItems: "center",
        zIndex: 999,
        boxShadow: "0 4px 12px rgba(0,0,0,0.5)",
      }}
    >
      <img
        src={song.imageUrl || "/images/pop.png"}
        alt={song.title}
        style={{ width: "40px", height: "40px", borderRadius: "4px", objectFit: "cover" }}
      />
      
      <div style={{ flex: 1, padding: "0 12px", overflow: "hidden" }}>
        <div style={{ fontWeight: "600", fontSize: "0.9rem", whiteSpace: "nowrap", textOverflow: "ellipsis", overflow: "hidden", color: "white" }}>
          {song.title}
        </div>
        <div style={{ fontSize: "0.8rem", color: "var(--text-subdued)", whiteSpace: "nowrap", textOverflow: "ellipsis", overflow: "hidden" }}>
          {song.artist}
        </div>
      </div>

      <div style={{ display: "flex", alignItems: "center", gap: "16px", paddingRight: "8px" }}>
        <button style={{ background: "none", border: "none", color: "white", padding: 0, fontSize: "20px" }}>
          <span role="img" aria-label="devices">🎧</span>
        </button>
        <button style={{ background: "none", border: "none", color: "white", padding: 0, fontSize: "20px" }}>
          <span role="img" aria-label="add">➕</span>
        </button>
        <button 
          onClick={togglePlay}
          style={{ background: "none", border: "none", color: "white", padding: 0, fontSize: "24px", cursor: "pointer" }}
        >
          {isPlaying ? "⏸" : "▶️"}
        </button>
      </div>

      {/* Hidden audio element */}
      <audio
        ref={audioRef}
        src={`http://localhost:5000${song.fileUrl}`}
        onEnded={() => setIsPlaying(false)}
        onPause={() => setIsPlaying(false)}
        onPlay={() => setIsPlaying(true)}
      />
    </div>
  );
}

export default MusicPlayer;