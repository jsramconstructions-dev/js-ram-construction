import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Shield, Lock, User, ArrowRight, AlertCircle, ArrowLeft } from "lucide-react";
import { loginAdmin, isUserAuthenticated } from "../../services/dataStorage";
import "./AdminLogin.css";

function AdminLogin() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  // If already authenticated, redirect to homepage image management
  useEffect(() => {
    if (isUserAuthenticated()) {
      navigate("/admin/homepage", { replace: true });
    }
  }, [navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      const result = await loginAdmin(username, password);
      setIsLoading(false);

      if (result.success) {
        navigate("/admin/homepage");
      } else {
        setError(result.message || "Invalid administrator credentials.");
      }
    } catch (err) {
      setIsLoading(false);
      setError(err.message || "An authentication error occurred.");
    }
  };

  return (
    <div className="admin-login-page">
      <div className="admin-login-backdrop-radial" />

      <div className="admin-login-card">
        {/* TOP BRANDING */}
        <div className="admin-login-header">
          <Link to="/" className="admin-login-back-link">
            <ArrowLeft size={14} />
            <span>Back to Public Website</span>
          </Link>

          <div className="admin-login-icon-wrap">
            <Shield size={28} />
          </div>

          <h1 className="admin-login-title">JS RAM Admin Portal</h1>
         
        </div>

        {/* ERROR NOTIFICATION */}
        {error && (
          <div className="admin-login-error" role="alert">
            <AlertCircle size={16} />
            <span>{error}</span>
          </div>
        )}

        {/* LOGIN FORM */}
        <form onSubmit={handleSubmit} className="admin-login-form">
          <div className="form-group">
            <label htmlFor="admin-username">Administrator Username / Email</label>
            <div className="input-wrap">
              <User size={16} className="input-icon" />
              <input
                id="admin-username"
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Enter username (admin)"
                required
                autoComplete="username"
              />
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="admin-password">Secure Password</label>
            <div className="input-wrap">
              <Lock size={16} className="input-icon" />
              <input
                id="admin-password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter password (JSRam@2026)"
                required
                autoComplete="current-password"
              />
            </div>
          </div>

         

          <button
            type="submit"
            className="admin-login-submit-btn"
            disabled={isLoading}
          >
            <span>{isLoading ? "Authenticating..." : "Sign In to Admin Panel"}</span>
            <ArrowRight size={16} />
          </button>
        </form>

        
      </div>
    </div>
  );
}

export default AdminLogin;
