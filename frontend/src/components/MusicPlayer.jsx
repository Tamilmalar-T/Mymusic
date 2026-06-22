import { useRef, useState, useEffect } from 'react';
import { 
  FiPlay, 
  FiPause, 
  FiVolume2, 
  FiVolumeX, 
  FiRepeat, 
  FiPlus, 
  FiMusic,
  FiChevronsLeft,
  FiChevronsRight
} from 'react-icons/fi';

function MusicPlayer({ song }) {
  const audioRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(0.8);
  const [isMuted, setIsMuted] = useState(false);
  const [isLooping, setIsLooping] = useState(false);

  useEffect(() => {
    if (song) {
      setIsPlaying(true);
      setCurrentTime(0);
      setDuration(0);
      if (audioRef.current) {
        audioRef.current.load();
        const playPromise = audioRef.current.play();
        if (playPromise !== undefined) {
          playPromise.catch(e => console.log("Audio play deferred or interrupted", e));
        }
      }
    }
  }, [song]);

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = isMuted ? 0 : volume;
    }
  }, [volume, isMuted]);

  const togglePlay = () => {
    if (isPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.play().catch(e => console.log("Audio play error", e));
    }
    setIsPlaying(!isPlaying);
  };

  const handleTimeUpdate = () => {
    if (audioRef.current) {
      setCurrentTime(audioRef.current.currentTime);
    }
  };

  const handleLoadedMetadata = () => {
    if (audioRef.current) {
      setDuration(audioRef.current.duration || 0);
    }
  };

  const handleSeekChange = (e) => {
    const newTime = parseFloat(e.target.value);
    setCurrentTime(newTime);
    if (audioRef.current) {
      audioRef.current.currentTime = newTime;
    }
  };

  const handleVolumeChange = (e) => {
    const newVol = parseFloat(e.target.value);
    setVolume(newVol);
    if (newVol > 0) {
      setIsMuted(false);
    }
  };

  const toggleMute = () => {
    setIsMuted(!isMuted);
  };

  const toggleLoop = () => {
    setIsLooping(!isLooping);
    if (audioRef.current) {
      audioRef.current.loop = !isLooping;
    }
  };

  const formatTime = (timeInSeconds) => {
    if (isNaN(timeInSeconds)) return "0:00";
    const minutes = Math.floor(timeInSeconds / 60);
    const seconds = Math.floor(timeInSeconds % 60);
    return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
  };

  if (!song) return null;

  return (
    <div className="player-container">
      <div className="player-main-row">
        
        {/* Track Info Section */}
        <div className="player-track-info">
          <div style={{ position: "relative", width: "42px", height: "42px", flexShrink: 0 }}>
            <img
              src={song.imageUrl && song.imageUrl.startsWith("/uploads") ? `http://localhost:5000${song.imageUrl}` : (song.imageUrl || "/images/pop.png")}
              alt={song.title}
              className={`vinyl-spin ${isPlaying ? "" : "vinyl-paused"}`}
              style={{ 
                width: "100%", 
                height: "100%", 
                borderRadius: "50%", 
                objectFit: "cover",
                border: "2px solid rgba(255, 255, 255, 0.1)"
              }}
            />
            <div 
              style={{
                position: "absolute",
                top: "50%",
                left: "50%",
                transform: "translate(-50%, -50%)",
                width: "8px",
                height: "8px",
                borderRadius: "50%",
                backgroundColor: "var(--bg-darker)",
                border: "1.5px solid #ffffff"
              }}
            />
          </div>
          
          <div style={{ overflow: "hidden" }}>
            <div style={{ fontWeight: "700", fontSize: "0.85rem", whiteSpace: "nowrap", textOverflow: "ellipsis", overflow: "hidden", color: "#ffffff" }}>
              {song.title}
            </div>
            <div style={{ fontSize: "0.75rem", color: "var(--text-subdued)", whiteSpace: "nowrap", textOverflow: "ellipsis", overflow: "hidden" }}>
              {song.artist}
            </div>
          </div>

          <button 
            className="player-btn-secondary"
            style={{ 
              background: "none", 
              border: "none", 
              color: "var(--text-subdued)", 
              padding: 4, 
              display: "flex",
              alignItems: "center",
              cursor: "pointer",
              marginLeft: "4px"
            }}
            onMouseOver={(e) => e.currentTarget.style.color = "#ffffff"}
            onMouseOut={(e) => e.currentTarget.style.color = "var(--text-subdued)"}
          >
            <FiPlus size={16} />
          </button>
        </div>

        {/* Media Controls Section */}
        <div className="player-controls">
          <div className="player-controls-buttons" style={{ display: "flex", alignItems: "center", gap: "20px" }}>
            <button 
              onClick={toggleLoop}
              className="player-btn-secondary"
              style={{ 
                background: "none", 
                border: "none", 
                color: isLooping ? "var(--accent)" : "var(--text-subdued)", 
                padding: 0, 
                cursor: "pointer",
                filter: isLooping ? "drop-shadow(0 0 4px var(--accent-glow))" : "none"
              }}
            >
              <FiRepeat size={16} />
            </button>

            <button 
              className="player-btn-secondary"
              style={{ background: "none", border: "none", color: "var(--text-subdued)", padding: 0, cursor: "not-allowed" }}
            >
              <FiChevronsLeft size={20} />
            </button>

            <button 
              onClick={togglePlay}
              style={{ 
                background: "linear-gradient(135deg, var(--accent) 0%, var(--accent-hover) 100%)", 
                border: "none", 
                color: "#000000", 
                width: "36px",
                height: "36px",
                borderRadius: "50%",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                cursor: "pointer",
                boxShadow: "0 4px 10px var(--accent-glow)",
                transition: "transform 0.15s ease"
              }}
              onMouseDown={(e) => e.currentTarget.style.transform = "scale(0.92)"}
              onMouseUp={(e) => e.currentTarget.style.transform = "scale(1)"}
            >
              {isPlaying ? <FiPause size={18} /> : <FiPlay size={18} style={{ marginLeft: "2px" }} />}
            </button>

            <button 
              className="player-btn-secondary"
              style={{ background: "none", border: "none", color: "var(--text-subdued)", padding: 0, cursor: "not-allowed" }}
            >
              <FiChevronsRight size={20} />
            </button>

            <button 
              className="player-btn-secondary"
              style={{ background: "none", border: "none", color: "var(--text-subdued)", padding: 0, cursor: "not-allowed" }}
            >
              <FiMusic size={14} />
            </button>
          </div>
        </div>

        {/* Volume Section */}
        <div className="player-volume">
          <button 
            onClick={toggleMute}
            style={{ background: "none", border: "none", color: "var(--text-subdued)", padding: 0, cursor: "pointer" }}
            onMouseOver={(e) => e.currentTarget.style.color = "#ffffff"}
            onMouseOut={(e) => e.currentTarget.style.color = "var(--text-subdued)"}
          >
            {isMuted ? <FiVolumeX size={18} /> : <FiVolume2 size={18} />}
          </button>
          <input
            type="range"
            min="0"
            max="1"
            step="0.05"
            value={isMuted ? 0 : volume}
            onChange={handleVolumeChange}
            className="player-progress-bar"
            style={{ width: "65px" }}
          />
        </div>
      </div>

      {/* Progress Bar Section */}
      <div className="player-progress-row">
        <span style={{ fontSize: "0.7rem", color: "var(--text-subdued)", minWidth: "30px", textAlign: "right" }}>
          {formatTime(currentTime)}
        </span>
        <input
          type="range"
          min="0"
          max={duration || 100}
          value={currentTime}
          onChange={handleSeekChange}
          className="player-progress-bar"
        />
        <span style={{ fontSize: "0.7rem", color: "var(--text-subdued)", minWidth: "30px" }}>
          {formatTime(duration)}
        </span>
      </div>

      {/* Hidden audio element */}
      <audio
        ref={audioRef}
        src={`http://localhost:5000${song.fileUrl}`}
        onEnded={() => {
          if (!isLooping) {
            setIsPlaying(false);
          }
        }}
        onTimeUpdate={handleTimeUpdate}
        onLoadedMetadata={handleLoadedMetadata}
        onPause={() => setIsPlaying(false)}
        onPlay={() => setIsPlaying(true)}
      />
    </div>
  );
}

export default MusicPlayer;