import { useRef, useState, useEffect } from 'react';
import { 
  FiPlay, 
  FiPause, 
  FiVolume2, 
  FiVolumeX, 
  FiRepeat, 
  FiPlus, 
  FiMusic,
  FiChevronDown,
  FiChevronUp,
  FiMoreHorizontal,
  FiMinusCircle,
  FiHeart,
  FiShuffle,
  FiList,
  FiSkipBack,
  FiSkipForward
} from 'react-icons/fi';
import { API_BASE_URL } from '../config';

// Helper to determine gradient theme matching the cover image
const getTheme = (song) => {
  if (!song) return { top: "#1e293b", bottom: "#0f172a", accent: "#1ed760", label: "Acoustic" };
  const title = (song.title || "").toLowerCase();
  const imageUrl = (song.imageUrl || "").toLowerCase();
  
  if (imageUrl.includes("acoustic") || title.includes("acoustic") || title.includes("guitar")) {
    return { top: "#3a4c50", bottom: "#1c2527", accent: "#a3b8cc", label: "Acoustic" };
  }
  if (imageUrl.includes("movie") || title.includes("movie") || title.includes("love")) {
    return { top: "#55382b", bottom: "#251712", accent: "#e2b69d", label: "Movie" };
  }
  if (imageUrl.includes("pop") || title.includes("pop") || title.includes("dance")) {
    return { top: "#283b32", bottom: "#121b16", accent: "#a3cfa2", label: "Pop" };
  }
  
  // Fallback: stable hash assignment
  let hash = 0;
  const str = song.title + song.artist;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }
  const index = Math.abs(hash) % 3;
  if (index === 0) {
    return { top: "#55382b", bottom: "#251712", accent: "#e2b69d", label: "Movie" };
  } else if (index === 1) {
    return { top: "#283b32", bottom: "#121b16", accent: "#a3cfa2", label: "Pop" };
  } else {
    return { top: "#3a4c50", bottom: "#1c2527", accent: "#a3b8cc", label: "Acoustic" };
  }
};

function MusicPlayer({ song, songs = [], setCurrentSong }) {
  const audioRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(0.8);
  const [isMuted, setIsMuted] = useState(false);
  const [isLooping, setIsLooping] = useState(false);

  // New States for the Expanded Player View (matching the screenshot)
  const [isExpanded, setIsExpanded] = useState(false);
  const [isFavorited, setIsFavorited] = useState(false);
  const [isShuffled, setIsShuffled] = useState(false);

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

  const decreaseVolume = () => {
    setVolume(prev => Math.max(0, prev - 0.1));
  };

  const playNextSong = () => {
    if (!songs || songs.length === 0 || !setCurrentSong) return;
    
    if (isShuffled) {
      const randomIndex = Math.floor(Math.random() * songs.length);
      setCurrentSong(songs[randomIndex]);
      return;
    }

    const currentIndex = songs.findIndex(s => s._id === song._id);
    if (currentIndex === -1) return;
    let nextIndex = currentIndex + 1;
    if (nextIndex >= songs.length) {
      nextIndex = 0;
    }
    setCurrentSong(songs[nextIndex]);
  };

  const playPrevSong = () => {
    if (!songs || songs.length === 0 || !setCurrentSong) return;

    const currentIndex = songs.findIndex(s => s._id === song._id);
    if (currentIndex === -1) return;
    let prevIndex = currentIndex - 1;
    if (prevIndex < 0) {
      prevIndex = songs.length - 1;
    }
    setCurrentSong(songs[prevIndex]);
  };

  const formatTime = (timeInSeconds) => {
    if (isNaN(timeInSeconds)) return "0:00";
    const minutes = Math.floor(timeInSeconds / 60);
    const seconds = Math.floor(timeInSeconds % 60);
    return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
  };

  if (!song) return null;

  const theme = getTheme(song);
  const progressPercent = duration ? (currentTime / duration) : 0;
  
  // Math to calculate coordinates of the dot on the circular progress ring
  const circleRadius = 105;
  const circleCenter = 120;
  const angle = (progressPercent * 2 * Math.PI) - (Math.PI / 2);
  const dotX = circleCenter + circleRadius * Math.cos(angle);
  const dotY = circleCenter + circleRadius * Math.sin(angle);

  const artworkUrl = song.imageUrl && song.imageUrl.startsWith("/uploads") 
    ? `${API_BASE_URL}${song.imageUrl}` 
    : (song.imageUrl || "/images/pop.png");

  return (
    <>
      {/* 1. EXPANDED MOBILE PLAYER INTERFACE (Dribbble Layout) */}
      {isExpanded && (
        <div 
          className="expanded-player-backdrop d-md-block"
          onClick={() => setIsExpanded(false)}
        />
      )}
      
      <div 
        className={`expanded-player-overlay ${isExpanded ? "" : "collapsed"}`}
        style={{
          background: `linear-gradient(180deg, ${theme.top} 0%, ${theme.bottom} 100%)`
        }}
      >
        {/* Header Bar */}
        <div className="expanded-player-header">
          <button onClick={() => setIsExpanded(false)}>
            <FiChevronDown size={24} />
          </button>
          <span>{theme.label} Playlist</span>
          <button>
            <FiMoreHorizontal size={24} />
          </button>
        </div>

        {/* Track Details */}
        <div className="expanded-player-track-details">
          <h2>{song.title}</h2>
          <p>{song.artist}</p>
        </div>

        {/* Time Progress Tracker */}
        <div className="expanded-player-time">
          {formatTime(currentTime)} &nbsp;|&nbsp; {formatTime(duration)}
        </div>

        {/* Central Circular Album Art with Progress Ring */}
        <div className="circular-progress-wrapper">
          <svg width="240" height="240" style={{ position: "absolute", zIndex: 1 }}>
            {/* Background ring */}
            <circle
              cx={circleCenter}
              cy={circleCenter}
              r={circleRadius}
              stroke="rgba(255, 255, 255, 0.08)"
              strokeWidth="2"
              fill="transparent"
            />
            {/* Active progress ring */}
            <circle
              cx={circleCenter}
              cy={circleCenter}
              r={circleRadius}
              stroke={theme.accent}
              strokeWidth="2.5"
              fill="transparent"
              strokeDasharray={2 * Math.PI * circleRadius}
              strokeDashoffset={2 * Math.PI * circleRadius * (1 - progressPercent)}
              strokeLinecap="round"
              style={{ transform: "rotate(-90deg)", transformOrigin: "50% 50%" }}
            />
            {/* Dot indicator at the end of progress */}
            {duration > 0 && (
              <circle
                cx={dotX}
                cy={dotY}
                r="5"
                fill="#ffffff"
                style={{ filter: "drop-shadow(0 0 4px rgba(255, 255, 255, 0.8))" }}
              />
            )}
          </svg>
          
          <img
            src={artworkUrl}
            alt={song.title}
            className={`circular-artwork vinyl-spin ${isPlaying ? "" : "vinyl-paused"}`}
          />
        </div>

        {/* Main Controls Row */}
        <div className="expanded-player-controls-main">
          <button onClick={decreaseVolume} title="Decrease Volume">
            <FiMinusCircle size={20} />
          </button>
          
          <button onClick={playPrevSong} disabled={songs.length <= 1} style={{ opacity: songs.length <= 1 ? 0.5 : 1 }}>
            <FiSkipBack size={24} />
          </button>
          
          <button onClick={togglePlay} className="play-btn">
            {isPlaying ? <FiPause size={26} /> : <FiPlay size={26} style={{ marginLeft: "4px" }} />}
          </button>
          
          <button onClick={playNextSong} disabled={songs.length <= 1} style={{ opacity: songs.length <= 1 ? 0.5 : 1 }}>
            <FiSkipForward size={24} />
          </button>
          
          <button onClick={() => setIsFavorited(!isFavorited)} style={{ color: isFavorited ? "#ff4a5a" : "rgba(255,255,255,0.75)" }}>
            <FiHeart size={20} fill={isFavorited ? "#ff4a5a" : "transparent"} />
          </button>
        </div>

        {/* Bottom Utility Row */}
        <div className="expanded-player-controls-bottom">
          <button 
            className={isShuffled ? "active" : ""} 
            onClick={() => setIsShuffled(!isShuffled)}
          >
            <FiShuffle size={18} />
          </button>
          
          <button>
            <FiList size={18} />
          </button>
          
          <button onClick={toggleMute} style={{ color: isMuted ? "rgba(255,255,255,0.4)" : "#ffffff" }}>
            {isMuted ? <FiVolumeX size={18} /> : <FiVolume2 size={18} />}
          </button>
          
          <button 
            className={isLooping ? "active" : ""} 
            onClick={toggleLoop}
          >
            <FiRepeat size={18} />
          </button>
        </div>
      </div>

      {/* 2. PERSISTENT COLLAPSED BOTTOM BAR PLAYER */}
      <div className="player-container">
        <div className="player-main-row">
          {/* Clickable track info area to expand */}
          <div className="player-track-info mini-player-clickable" onClick={() => setIsExpanded(true)}>
            <div style={{ position: "relative", width: "42px", height: "42px", flexShrink: 0 }}>
              <img
                src={artworkUrl}
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
                onClick={playPrevSong}
                className="player-btn-secondary"
                style={{ background: "none", border: "none", color: "var(--text-subdued)", padding: 0, cursor: songs.length <= 1 ? "not-allowed" : "pointer" }}
                disabled={songs.length <= 1}
              >
                <FiSkipBack size={18} />
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
                onClick={playNextSong}
                className="player-btn-secondary"
                style={{ background: "none", border: "none", color: "var(--text-subdued)", padding: 0, cursor: songs.length <= 1 ? "not-allowed" : "pointer" }}
                disabled={songs.length <= 1}
              >
                <FiSkipForward size={18} />
              </button>

              <button 
                onClick={() => setIsExpanded(true)}
                className="player-btn-secondary"
                style={{ background: "none", border: "none", color: "var(--text-subdued)", padding: 0, cursor: "pointer" }}
              >
                <FiChevronUp size={18} />
              </button>
            </div>
          </div>

          {/* Volume Section */}
          <div className="player-volume">
            <button 
              onClick={toggleMute}
              style={{ background: "none", border: "none", color: "var(--text-subdued)", padding: 0, cursor: "pointer" }}
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
      </div>

      {/* Hidden audio element */}
      <audio
        ref={audioRef}
        src={`${API_BASE_URL}${song.fileUrl}`}
        onEnded={playNextSong}
        onTimeUpdate={handleTimeUpdate}
        onLoadedMetadata={handleLoadedMetadata}
        onPause={() => setIsPlaying(false)}
        onPlay={() => setIsPlaying(true)}
      />
    </>
  );
}

export default MusicPlayer;