import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Lock, User, ArrowRight, AlertCircle, ArrowLeft } from "lucide-react";
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

          <img
            src="/images/Js Ram Logo.png"
            alt="JS RAM"
            className="admin-login-logo"
            onError={(e) => { e.currentTarget.style.display = "none"; }}
          />

          <h1 className="admin-login-title">Admin Login</h1>
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
            <label htmlFor="admin-username">Username / Email</label>
            <div className="input-wrap">
              <User size={16} className="input-icon" />
              <input
                id="admin-username"
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Username or email"
                required
                autoComplete="username"
              />
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="admin-password">Password</label>
            <div className="input-wrap">
              <Lock size={16} className="input-icon" />
              <input
                id="admin-password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Password"
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
