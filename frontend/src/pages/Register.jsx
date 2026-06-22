import { useState, useEffect } from "react";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";
import { FiUser, FiMail, FiLock, FiMusic, FiAlertCircle, FiEye, FiEyeOff } from "react-icons/fi";

function Register() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  // Auto-redirect if already logged in
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      navigate("/home");
    }
  }, [navigate]);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
    if (error) setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name || !formData.email || !formData.password) {
      setError("Please fill in all fields.");
      return;
    }

    setIsLoading(true);
    setError("");

    try {
      await axios.post(
        "http://localhost:5000/api/auth/register",
        formData
      );

      navigate("/");
    } catch (err) {
      console.error("Registration failed:", err);
      setError(
        err.response?.data?.message || 
        "Something went wrong. Please check your details and try again."
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div 
      className="d-flex align-items-center justify-content-center" 
      style={{ minHeight: "100vh", position: "relative", overflow: "hidden", padding: "20px" }}
    >
      {/* Glow Backdrops */}
      <div className="glow-blob" style={{ top: "10%", right: "15%" }}></div>
      <div className="glow-blob-purple" style={{ bottom: "15%", left: "10%" }}></div>

      <div 
        className="glass-panel p-5 w-100" 
        style={{ maxWidth: "450px", position: "relative", zIndex: 1 }}
      >
        <div className="text-center mb-4">
          <div 
            className="d-inline-flex align-items-center justify-content-center mb-3"
            style={{
              width: "60px",
              height: "60px",
              borderRadius: "50%",
              background: "linear-gradient(135deg, #1ed760 0%, #8b5cf6 100%)",
              boxShadow: "0 8px 24px rgba(30, 215, 96, 0.3)"
            }}
          >
            <FiMusic size={28} color="#000000" />
          </div>
          <h2 style={{ fontSize: "1.8rem", fontWeight: "800", margin: 0 }}>Join MyMusic</h2>
          <p style={{ color: "var(--text-subdued)", fontSize: "0.9rem", marginTop: "6px" }}>
            Create an account to stream unlimited audio
          </p>
        </div>

        {error && (
          <div 
            className="d-flex align-items-center p-3 mb-4" 
            style={{ 
              backgroundColor: "rgba(239, 68, 68, 0.1)", 
              border: "1px solid rgba(239, 68, 68, 0.2)", 
              borderRadius: "12px",
              color: "#f87171",
              fontSize: "0.85rem"
            }}
          >
            <FiAlertCircle size={18} className="me-2 flex-shrink-0" />
            <div>{error}</div>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="mb-3" style={{ position: "relative" }}>
            <FiUser 
              style={{ 
                position: "absolute", 
                left: "16px", 
                top: "50%", 
                transform: "translateY(-50%)", 
                color: "var(--text-subdued)",
                zIndex: 10
              }} 
            />
            <input
              type="text"
              name="name"
              placeholder="Your full name"
              className="form-control custom-input"
              style={{ paddingLeft: "48px" }}
              onChange={handleChange}
              value={formData.name}
              disabled={isLoading}
            />
          </div>

          <div className="mb-3" style={{ position: "relative" }}>
            <FiMail 
              style={{ 
                position: "absolute", 
                left: "16px", 
                top: "50%", 
                transform: "translateY(-50%)", 
                color: "var(--text-subdued)",
                zIndex: 10
              }} 
            />
            <input
              type="email"
              name="email"
              placeholder="Email address"
              className="form-control custom-input"
              style={{ paddingLeft: "48px" }}
              onChange={handleChange}
              value={formData.email}
              disabled={isLoading}
            />
          </div>

          <div className="mb-4" style={{ position: "relative" }}>
            <FiLock 
              style={{ 
                position: "absolute", 
                left: "16px", 
                top: "50%", 
                transform: "translateY(-50%)", 
                color: "var(--text-subdued)",
                zIndex: 10
              }} 
            />
            <input
              type={showPassword ? "text" : "password"}
              name="password"
              placeholder="Create password"
              className="form-control custom-input"
              style={{ paddingLeft: "48px", paddingRight: "48px" }}
              onChange={handleChange}
              value={formData.password}
              disabled={isLoading}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              style={{
                position: "absolute",
                right: "16px",
                top: "50%",
                transform: "translateY(-50%)",
                background: "none",
                border: "none",
                color: "var(--text-subdued)",
                cursor: "pointer",
                padding: 0,
                display: "flex",
                alignItems: "center",
                zIndex: 10
              }}
            >
              {showPassword ? <FiEyeOff size={18} /> : <FiEye size={18} />}
            </button>
          </div>

          <button 
            type="submit" 
            className="btn btn-glow-primary w-100 mb-4"
            disabled={isLoading}
          >
            {isLoading ? (
              <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
            ) : (
              "Sign Up"
            )}
          </button>
        </form>

        <div className="text-center" style={{ fontSize: "0.9rem" }}>
          <span style={{ color: "var(--text-subdued)" }}>Already have an account? </span>
          <Link to="/" style={{ fontWeight: "600", textDecoration: "none" }}>
            Sign In
          </Link>
        </div>
      </div>
    </div>
  );
}

export default Register;