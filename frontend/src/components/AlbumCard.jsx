import { useState } from "react";
import { FiPlay } from "react-icons/fi";

function AlbumCard({ image, title, subtitle }) {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div
      className="album-card-container"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      style={{
        width: "160px",
        flexShrink: 0,
        marginRight: "20px",
        cursor: "pointer",
        padding: "12px",
        background: "rgba(255, 255, 255, 0.02)",
        border: "1px solid rgba(255, 255, 255, 0.04)",
        borderRadius: "12px",
        transition: "all 0.3s ease",
      }}
      onMouseOver={(e) => {
        e.currentTarget.style.background = "rgba(255, 255, 255, 0.06)";
        e.currentTarget.style.borderColor = "rgba(255, 255, 255, 0.1)";
        e.currentTarget.style.transform = "translateY(-4px)";
      }}
      onMouseOut={(e) => {
        e.currentTarget.style.background = "rgba(255, 255, 255, 0.02)";
        e.currentTarget.style.borderColor = "rgba(255, 255, 255, 0.04)";
        e.currentTarget.style.transform = "translateY(0)";
      }}
    >
      <div 
        className="album-card-img-wrapper"
        style={{
          position: "relative",
          width: "136px",
          height: "136px",
          borderRadius: "8px",
          overflow: "hidden",
          marginBottom: "12px",
          boxShadow: "0 8px 16px rgba(0,0,0,0.3)"
        }}
      >
        <img
          src={image && image.startsWith("/uploads") ? `http://localhost:5000${image}` : (image || "/images/pop.png")}
          alt={title}
          style={{
            width: "100%",
            height: "100%",
            objectFit: "cover",
            transition: "transform 0.4s ease"
          }}
          className="album-image"
        />
        {/* Floating play button */}
        <div
          style={{
            position: "absolute",
            bottom: "8px",
            right: "8px",
            width: "36px",
            height: "36px",
            borderRadius: "50%",
            backgroundColor: "var(--accent)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            opacity: isHovered ? 1 : 0,
            transform: isHovered ? "translateY(0) scale(1)" : "translateY(10px) scale(0.8)",
            transition: "all 0.25s cubic-bezier(0.4, 0, 0.2, 1)",
            boxShadow: "0 4px 12px rgba(0, 0, 0, 0.5)",
            zIndex: 2
          }}
        >
          <FiPlay size={16} color="#000000" style={{ marginLeft: "2px" }} />
        </div>
      </div>
      
      <div
        style={{
          fontWeight: "700",
          fontSize: "0.9rem",
          whiteSpace: "nowrap",
          overflow: "hidden",
          textOverflow: "ellipsis",
          marginBottom: "4px",
          color: "#ffffff"
        }}
      >
        {title}
      </div>
      <div
        style={{
          fontSize: "0.8rem",
          color: "var(--text-subdued)",
          whiteSpace: "nowrap",
          overflow: "hidden",
          textOverflow: "ellipsis"
        }}
      >
        {subtitle}
      </div>
    </div>
  );
}

export default AlbumCard;
