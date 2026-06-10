function RecentCard({ image, title }) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        backgroundColor: "var(--bg-card)",
        borderRadius: "4px",
        overflow: "hidden",
        height: "56px",
        cursor: "pointer",
        transition: "background-color 0.2s"
      }}
      className="recent-card"
    >
      <img
        src={image}
        alt={title}
        style={{ width: "56px", height: "56px", objectFit: "cover" }}
      />
      <div style={{ padding: "0 12px", flex: 1, fontWeight: "600", fontSize: "0.9rem" }}>
        {title}
      </div>
    </div>
  );
}

export default RecentCard;
