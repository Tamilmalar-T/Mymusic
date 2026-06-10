function BottomNav() {
  return (
    <div
      style={{
        position: "fixed",
        bottom: 0,
        left: 0,
        right: 0,
        backgroundColor: "rgba(18, 18, 18, 0.95)",
        display: "flex",
        justifyContent: "space-around",
        alignItems: "center",
        padding: "10px 0",
        paddingBottom: "calc(10px + env(safe-area-inset-bottom))", // for mobile safe area
        zIndex: 1000,
        borderTop: "1px solid #282828"
      }}
    >
      <NavItem icon="🏠" label="Home" active />
      <NavItem icon="🔍" label="Search" />
      <NavItem icon="📚" label="Your Library" />
      <NavItem icon="⭐" label="Premium" />
      <NavItem icon="➕" label="Create" />
    </div>
  );
}

function NavItem({ icon, label, active }) {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        color: active ? "white" : "var(--text-subdued)",
        cursor: "pointer",
        flex: 1
      }}
    >
      <div style={{ fontSize: "20px", marginBottom: "4px" }}>{icon}</div>
      <div style={{ fontSize: "10px" }}>{label}</div>
    </div>
  );
}

export default BottomNav;
