import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Shield, KeyRound, ArrowRight } from "lucide-react";

export default function AdminLogin({ triggerToast }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const handleLogin = (e) => {
    e.preventDefault();
    // Simple hardcoded check for demo purposes
    if (username === "admin" && password === "admin@Salon2026") {
      localStorage.setItem("adminAuth", "true");
      triggerToast("Admin login successful", "success");
      navigate("/admin-panel");
    } else {
      triggerToast("Invalid admin credentials", "error");
    }
  };

  return (
    <div className="animate-fade-in" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
      <div className="glass-card" style={{ maxWidth: '400px', width: '100%' }}>
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <div style={{ 
            background: 'var(--accent-soft)', 
            width: '64px', 
            height: '64px', 
            borderRadius: '50%', 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center',
            margin: '0 auto 1rem auto'
          }}>
            <Shield size={32} color="var(--accent-color)" />
          </div>
          <h2 style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>Admin Portal</h2>
          <p style={{ color: 'var(--text-secondary)' }}>Sign in to manage the salon platform.</p>
        </div>

        <form onSubmit={handleLogin}>
          <div className="form-group">
            <label className="form-label">Username</label>
            <input
              type="text"
              className="form-control"
              placeholder="Enter admin username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />
          </div>
          <div className="form-group">
            <label className="form-label">Password</label>
            <div style={{ position: 'relative' }}>
              <input
                type="password"
                className="form-control"
                placeholder="Enter admin password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                style={{ width: '100%' }}
                required
              />
              <KeyRound size={18} style={{ position: 'absolute', right: '12px', top: '14px', color: 'var(--text-muted)' }} />
            </div>
          </div>
          
          <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: '1rem', padding: '0.85rem' }}>
            Access Portal
            <ArrowRight size={18} />
          </button>
        </form>
        
        <div style={{ marginTop: '1.5rem', textAlign: 'center', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
          <p>Demo Credentials: <b>admin</b> / <b>admin@Salon2026</b></p>
        </div>
      </div>
    </div>
  );
}
