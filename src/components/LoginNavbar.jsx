import React from "react";
import { useNavigate } from "react-router-dom";
import { LogOut, User, UserCog, Shield } from "lucide-react";

export default function LoginNavbar() {
  const navigate = useNavigate();
  const isAdmin = localStorage.getItem('adminAuth') === 'true';
  const isStaff = !!localStorage.getItem('staffAuth');
  const isCustomer = localStorage.getItem('is_authenticated') === 'true';

  const handleLogout = () => {
    localStorage.removeItem('adminAuth');
    localStorage.removeItem('staffAuth');
    localStorage.removeItem('is_authenticated');
    navigate('/login');
  };

  if (isAdmin || isStaff || isCustomer) {
    return (
      <nav className="login-navbar" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem 2rem', background: 'var(--bg-surface)', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
        <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: 'var(--accent-color)' }}>SalonPro</div>
        <button onClick={handleLogout} className="btn btn-outline" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <LogOut size={18} /> Logout
        </button>
      </nav>
    );
  }

  return (
    <nav className="login-navbar" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '80vh', background: 'var(--bg-surface)' }}>
      <div className="glass-card" style={{ padding: '2rem 1.5rem', maxWidth: '400px', width: '100%', textAlign: 'center' }}>
        <h2 style={{ marginBottom: '1.5rem', fontSize: '1.75rem' }}>Select Login Type</h2>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <button onClick={() => navigate('/customer-login')} className="btn btn-primary" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
            <User size={20} /> Customer Login
          </button>
          <button onClick={() => navigate('/staff-login')} className="btn btn-secondary" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
            <UserCog size={20} /> Staff Login
          </button>
          <button onClick={() => navigate('/admin-login')} className="btn btn-danger" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
            <Shield size={20} /> Admin Login
          </button>
        </div>
      </div>
    </nav>
  );
}
