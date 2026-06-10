function AlbumCard({ image, title, subtitle }) {
  return (
    <div
      style={{
        width: "140px",
        flexShrink: 0,
        marginRight: "16px",
        cursor: "pointer"
      }}
    >
      <img
        src={image}
        alt={title}
        style={{
          width: "140px",
          height: "140px",
          objectFit: "cover",
          borderRadius: "4px",
          marginBottom: "8px"
        }}
      />
      <div
        style={{
          fontWeight: "600",
          fontSize: "0.9rem",
          whiteSpace: "nowrap",
          overflow: "hidden",
          textOverflow: "ellipsis",
          marginBottom: "4px"
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
