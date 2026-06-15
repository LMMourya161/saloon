import React from "react";
import { useNavigate } from "react-router-dom";
import { User, UserCog, Shield } from "lucide-react";

export default function LoginPage({ triggerToast, isOnline }) {
  console.log('LoginPage rendered');
  const navigate = useNavigate();

  const handleAdmin = () => {
    if (!isOnline) {
      triggerToast("E001: Mobile not connected to internet", "error");
      return;
    }
    navigate("/admin-login");
  };

  const handleStaff = () => {
    if (!isOnline) {
      triggerToast("E001: Mobile not connected to internet", "error");
      return;
    }
    navigate("/staff-login");
  };

  const handleCustomer = () => {
    if (!isOnline) {
      triggerToast("E001: Mobile not connected to internet", "error");
      return;
    }
    navigate("/customer-login");
  };

  return (
    <div className="animate-fade-in" style={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "80vh" }}>
      <div className="glass-card" style={{ padding: "2rem 1.5rem", maxWidth: "400px", width: "100%", textAlign: "center" }}>
        <h1 style={{ marginBottom: "1rem", fontSize: "2rem", color: "var(--accent-color)" }}>Welcome to SalonPro</h1>
        <h2 style={{ marginBottom: "1.5rem", fontSize: "1.75rem" }}>Select Login Type</h2>
        <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
          <button onClick={handleAdmin} className="btn btn-primary" style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "0.5rem", padding: "0.85rem" }}>
            <UserCog size={20} /> Admin Login
          </button>
          <button onClick={handleStaff} className="btn btn-secondary" style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "0.5rem", padding: "0.85rem" }}>
            <User size={20} /> Staff Login
          </button>
          <button onClick={handleCustomer} className="btn btn-success" style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "0.5rem", padding: "0.85rem" }}>
            <User size={20} /> Customer Login
          </button>
        </div>
      </div>
    </div>
  );
}
