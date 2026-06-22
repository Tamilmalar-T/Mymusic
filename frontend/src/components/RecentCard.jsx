import { useState } from "react";
import { FiPlay } from "react-icons/fi";
import { API_BASE_URL } from "../config";

function RecentCard({ image, title }) {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      style={{
        display: "flex",
        alignItems: "center",
        background: "rgba(255, 255, 255, 0.03)",
        backdropFilter: "blur(10px)",
        WebkitBackdropFilter: "blur(10px)",
        border: "1px solid rgba(255, 255, 255, 0.05)",
        borderRadius: "8px",
        overflow: "hidden",
        height: "64px",
        cursor: "pointer",
        position: "relative"
      }}
      className="recent-card"
    >
      <div style={{ position: "relative", width: "64px", height: "64px", flexShrink: 0 }}>
        <img
          src={image && image.startsWith("/uploads") ? `${API_BASE_URL}${image}` : (image || "/images/pop.png")}
          alt={title}
          style={{ width: "100%", height: "100%", objectFit: "cover" }}
        />
        {/* Play overlay on card hover */}
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            backgroundColor: "rgba(0,0,0,0.4)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            opacity: isHovered ? 1 : 0,
            transition: "opacity 0.25s ease",
          }}
        >
          <div
            style={{
              width: "32px",
              height: "32px",
              borderRadius: "50%",
              backgroundColor: "var(--accent)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              transform: isHovered ? "scale(1)" : "scale(0.8)",
              transition: "transform 0.25s ease",
              boxShadow: "0 4px 10px rgba(30, 215, 96, 0.4)"
            }}
          >
            <FiPlay size={14} color="#000000" style={{ marginLeft: "2px" }} />
          </div>
        </div>
      </div>
      
      <div 
        style={{ 
          padding: "0 16px", 
          flex: 1, 
          fontWeight: "600", 
          fontSize: "0.95rem",
          whiteSpace: "nowrap",
          overflow: "hidden",
          textOverflow: "ellipsis",
          color: "#ffffff"
        }}
      >
        {title}
      </div>
    </div>
  );
}

export default RecentCard;
