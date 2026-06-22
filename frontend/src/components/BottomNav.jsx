import { FiHome, FiSearch, FiLayers, FiAward, FiPlusCircle } from "react-icons/fi";

function BottomNav({ onCreateClick }) {
  return (
    <div
      style={{
        position: "fixed",
        bottom: 0,
        left: 0,
        right: 0,
        backgroundColor: "rgba(10, 10, 14, 0.8)",
        backdropFilter: "blur(24px)",
        WebkitBackdropFilter: "blur(24px)",
        display: "flex",
        justifyContent: "space-around",
        alignItems: "center",
        padding: "12px 0",
        paddingBottom: "calc(12px + env(safe-area-inset-bottom))",
        zIndex: 1000,
        borderTop: "1px solid rgba(255, 255, 255, 0.08)",
        boxShadow: "0 -8px 32px rgba(0, 0, 0, 0.5)"
      }}
    >
      <NavItem icon={<FiHome size={20} />} label="Home" active />
      <NavItem icon={<FiSearch size={20} />} label="Search" />
      <NavItem icon={<FiLayers size={20} />} label="Library" />
      <NavItem icon={<FiAward size={20} />} label="Premium" />
      <NavItem 
        icon={<FiPlusCircle size={20} />} 
        label="Upload" 
        onClick={onCreateClick}
      />
    </div>
  );
}

function NavItem({ icon, label, active, onClick }) {
  return (
    <div
      onClick={onClick}
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        color: active ? "var(--accent)" : "var(--text-subdued)",
        cursor: "pointer",
        flex: 1,
        transition: "all 0.2s ease"
      }}
      onMouseOver={(e) => {
        if (!active) e.currentTarget.style.color = "#ffffff";
      }}
      onMouseOut={(e) => {
        if (!active) e.currentTarget.style.color = "var(--text-subdued)";
      }}
    >
      <div style={{ 
        marginBottom: "4px",
        filter: active ? "drop-shadow(0 0 4px var(--accent-glow))" : "none"
      }}>
        {icon}
      </div>
      <div style={{ fontSize: "10px", fontWeight: active ? "700" : "500" }}>{label}</div>
    </div>
  );
}

export default BottomNav;
