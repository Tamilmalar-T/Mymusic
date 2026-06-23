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
  FiSkipForward,
  FiSliders,
  FiAirplay,
  FiShare2
} from 'react-icons/fi';
import { API_BASE_URL } from '../config';

// Beautiful dynamic wavy progress bar with interactive seeking and ripple effect when playing
function WaveformProgress({ currentTime, duration, onSeek, accentColor, isPlaying }) {
  const containerRef = useRef(null);
  const [isDragging, setIsDragging] = useState(false);
  const [phase, setPhase] = useState(0);

  // Smoothly ripple the wave when music is playing
  useEffect(() => {
    let animFrame;
    if (isPlaying) {
      const update = () => {
        setPhase(p => (p + 0.04) % (2 * Math.PI));
        animFrame = requestAnimationFrame(update);
      };
      animFrame = requestAnimationFrame(update);
    }
    return () => cancelAnimationFrame(animFrame);
  }, [isPlaying]);

  const handleSeek = (clientX) => {
    if (!containerRef.current || duration === 0) return;
    const rect = containerRef.current.getBoundingClientRect();
    const clickX = clientX - rect.left;
    const percentage = Math.max(0, Math.min(1, clickX / rect.width));
    onSeek(percentage * duration);
  };

  const handleMouseDown = (e) => {
    setIsDragging(true);
    handleSeek(e.clientX);
  };

  const handleTouchStart = (e) => {
    setIsDragging(true);
    if (e.touches && e.touches[0]) {
      handleSeek(e.touches[0].clientX);
    }
  };

  useEffect(() => {
    const handleMouseMove = (e) => {
      if (isDragging) {
        handleSeek(e.clientX);
      }
    };
    const handleTouchMove = (e) => {
      if (isDragging && e.touches && e.touches[0]) {
        handleSeek(e.touches[0].clientX);
      }
    };
    const handleMouseUp = () => {
      setIsDragging(false);
    };

    if (isDragging) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
      window.addEventListener('touchmove', handleTouchMove, { passive: false });
      window.addEventListener('touchend', handleMouseUp);
    }
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
      window.removeEventListener('touchmove', handleTouchMove);
      window.removeEventListener('touchend', handleMouseUp);
    };
  }, [isDragging]);

  const progressPercent = duration ? (currentTime / duration) : 0;
  const width = 320;
  const height = 45;
  const barsCount = 38;

  // Static bars heights representing a pseudo audio waveform
  const barHeights = [
    12, 16, 22, 28, 14, 10, 18, 25, 36, 42, 
    30, 24, 16, 20, 28, 38, 45, 32, 22, 18, 
    26, 32, 38, 24, 14, 10, 16, 22, 34, 40, 
    28, 18, 12, 16, 24, 20, 14, 8
  ];

  return (
    <div 
      ref={containerRef}
      onMouseDown={handleMouseDown}
      onTouchStart={handleTouchStart}
      style={{
        position: 'relative',
        width: '100%',
        height: `${height}px`,
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        userSelect: 'none',
        padding: '0 4px'
      }}
    >
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        width: '100%',
        height: '100%',
        gap: '4px'
      }}>
        {barHeights.map((h, i) => {
          const barProgress = i / barsCount;
          const isActive = barProgress <= progressPercent;
          
          // When playing, add a dynamic wiggle factor based on phase
          const phaseOffset = (i / barsCount) * Math.PI * 4;
          const waveWiggle = isPlaying ? Math.sin(phase + phaseOffset) * 4 : 0;
          const displayHeight = Math.max(4, Math.min(height, h + waveWiggle));
          
          return (
            <div
              key={i}
              style={{
                flex: 1,
                height: `${displayHeight}px`,
                backgroundColor: isActive ? accentColor : 'rgba(255, 255, 255, 0.16)',
                borderRadius: '4px',
                transition: isDragging ? 'none' : 'height 0.1s ease, background-color 0.2s ease',
                boxShadow: isActive ? `0 0 8px ${accentColor}60` : 'none'
              }}
            />
          );
        })}
      </div>

      {/* Floating Indicator Needle Bar matching the screenshot */}
      {duration > 0 && (
        <div
          style={{
            position: 'absolute',
            left: `${progressPercent * 100}%`,
            top: '-2px',
            bottom: '-2px',
            width: '3px',
            backgroundColor: '#ffffff',
            borderRadius: '2px',
            boxShadow: `0 0 10px ${accentColor}, 0 0 4px #ffffff`,
            pointerEvents: 'none',
            transform: 'translateX(-50%)',
            transition: isDragging ? 'none' : 'left 0.1s linear',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}
        >
          {/* Knob dot in the center of needle */}
          <div style={{
            width: '7px',
            height: '7px',
            borderRadius: '50%',
            backgroundColor: accentColor,
            border: '1.5px solid #ffffff',
            boxShadow: `0 0 6px ${accentColor}`
          }} />
        </div>
      )}
    </div>
  );
}

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

  const handleSeek = (newTime) => {
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
          className="expanded-player-backdrop"
          onClick={() => setIsExpanded(false)}
        />
      )}
      
      <div 
        className={`expanded-player-overlay ${isExpanded ? "" : "collapsed"}`}
      >
        {/* Full-screen Background Album Art (No rotation) */}
        <div className="expanded-player-bg-artwork">
          <img
            src={artworkUrl}
            alt={song.title}
            className="expanded-bg-img"
          />
          <div className="expanded-bg-gradient-mask" />
        </div>

        {/* Header Bar */}
        <div className="expanded-player-header">
          <button onClick={() => setIsExpanded(false)}>
            <FiChevronDown size={24} />
          </button>
          <span>Now Playing</span>
          <button>
            <FiShare2 size={22} />
          </button>
        </div>

        {/* Floating Actions Sidebar on the middle-right overlaying the background */}
        <div className="floating-actions-container-sidebar">
          <button className="floating-action-btn" title="Equalizer Settings">
            <FiSliders size={20} />
          </button>
          <button className="floating-action-btn" title="Queue">
            <FiList size={20} />
          </button>
          <button className="floating-action-btn active" title="Cast to Device" style={{ backgroundColor: theme.accent, color: '#000000', borderColor: theme.accent }}>
            <FiAirplay size={20} />
          </button>
        </div>

        {/* Vertical Spacer to allow artwork to be main focus */}
        <div style={{ flex: 1 }} />

        {/* Track Title and Artist Details */}
        <div className="expanded-track-info-row">
          <div className="expanded-track-details">
            <h2>{song.title}</h2>
            <p>{song.artist}</p>
          </div>
          
          {/* Favorite button next to track title */}
          <button 
            onClick={() => setIsFavorited(!isFavorited)} 
            className="expand-favorite-btn"
            style={{ color: isFavorited ? theme.accent : "rgba(255,255,255,0.4)" }}
          >
            <FiHeart size={24} fill={isFavorited ? theme.accent : "transparent"} />
          </button>
        </div>

        {/* Time Progress Tracker Row */}
        <div className="expanded-progress-wrapper">
          {/* Left / Right Time Labels */}
          <div className="expanded-waveform-row">
            <span className="expanded-time-label">{formatTime(currentTime)}</span>
            <div style={{ flex: 1, margin: '0 12px' }}>
              <WaveformProgress 
                currentTime={currentTime} 
                duration={duration} 
                onSeek={handleSeek} 
                accentColor={theme.accent} 
                isPlaying={isPlaying} 
              />
            </div>
            <span className="expanded-time-label">{formatTime(duration)}</span>
          </div>
        </div>

        {/* Main Controls Row: The Three Large Circular Playback Buttons */}
        <div className="expanded-player-controls-trio">
          <button 
            onClick={playPrevSong} 
            disabled={songs.length <= 1} 
            className="expanded-circle-btn secondary-btn"
            style={{ opacity: songs.length <= 1 ? 0.3 : 1 }}
          >
            <FiSkipBack size={26} />
          </button>
          
          <button 
            onClick={togglePlay} 
            className="expanded-circle-btn primary-play-btn"
            style={{
              backgroundColor: theme.accent,
              color: '#000000',
              boxShadow: `0 12px 30px ${theme.accent}50`
            }}
          >
            {isPlaying ? <FiPause size={30} /> : <FiPlay size={30} style={{ marginLeft: "4px" }} />}
          </button>
          
          <button 
            onClick={playNextSong} 
            disabled={songs.length <= 1} 
            className="expanded-circle-btn secondary-btn"
            style={{ opacity: songs.length <= 1 ? 0.3 : 1 }}
          >
            <FiSkipForward size={26} />
          </button>
        </div>

        {/* Bottom Supplementary Row */}
        <div className="expanded-player-controls-bottom">
          <button 
            className={isShuffled ? "active" : ""} 
            onClick={() => setIsShuffled(!isShuffled)}
            style={{ color: isShuffled ? theme.accent : "rgba(255,255,255,0.5)" }}
          >
            <FiShuffle size={18} />
          </button>
          
          <div className="volume-slider-compact">
            <button onClick={toggleMute} style={{ color: isMuted ? "rgba(255,255,255,0.3)" : "rgba(255,255,255,0.6)" }}>
              {isMuted ? <FiVolumeX size={18} /> : <FiVolume2 size={18} />}
            </button>
            <input
              type="range"
              min="0"
              max="1"
              step="0.05"
              value={isMuted ? 0 : volume}
              onChange={handleVolumeChange}
              className="player-progress-bar compact-vol"
              style={{ width: "80px" }}
            />
          </div>
          
          <button 
            className={isLooping ? "active" : ""} 
            onClick={toggleLoop}
            style={{ color: isLooping ? theme.accent : "rgba(255,255,255,0.5)" }}
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