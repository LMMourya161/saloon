import React, { useState, useCallback } from "react";
import { Routes, Route, Navigate, useLocation } from "react-router-dom";
import Navbar from "./components/Navbar";

// LoginNavbar removed; login pages have their own UI
import ProtectedRoute from "./components/ProtectedRoute"

import PhoneAuth from "./pages/PhoneAuth";
import Register from "./pages/Register";
import Home from "./pages/Home";
import Stylists from "./pages/Stylists";
import Cart from "./pages/Cart";
import Payment from "./pages/Payment";
import Status from "./pages/Status";
import Profile from "./pages/Profile";
import Reschedule from "./pages/Reschedule";
import CustomerLogin from "./pages/CustomerLogin";
import AdminLogin from "./pages/AdminLogin";
import AdminPanel from "./pages/AdminPanel";
import LoginPage from "./pages/LoginPage";
import StaffLogin from "./pages/StaffLogin";
import StaffDashboard from "./pages/StaffDashboard";
import AICareerAssistant from "./pages/AICareerAssistant";
import AIPersonalityDNA from "./pages/AIPersonalityDNA";
import AppointmentConfirm from "./pages/AppointmentConfirm";
import SalonSelection from "./pages/SalonSelection";

function App() {
  const [toast, setToast] = useState(null);
  const location = useLocation();

  const triggerToast = useCallback((message, type = "info") => {
    setToast({ message, type });
    setTimeout(() => {
      setToast(null);
    }, 5000);
  }, []);

  return (
    <>
      <div className="app-container">
        {toast && (
          <div style={{
            position: "fixed",
            top: "20px",
            right: "20px",
            background: toast.type === "error" ? "var(--error)" : toast.type === "warning" ? "var(--warning)" : toast.type === "success" ? "var(--success)" : "var(--accent-color)",
            color: "#fff",
            padding: "1rem 1.5rem",
            borderRadius: "8px",
            boxShadow: "0 4px 12px rgba(0,0,0,0.3)",
            zIndex: 9999,
            fontWeight: "bold",
            maxWidth: "350px",
            wordWrap: "break-word"
          }}>
            {toast.message}
          </div>
        )}
        {/* Render navbar on all pages except AI Career Assistant */}
        {(() => {
  const hideNavbar = location.pathname.startsWith('/ai-career');
  return hideNavbar ? null : <Navbar />;
})()}
        <main className="main-content">
          <Routes>
            <Route path="/cart" element={<Cart triggerToast={triggerToast} isOnline={true} />} />
            <Route path="/appointment-confirm" element={<AppointmentConfirm triggerToast={triggerToast} isOnline={true} />} />
            <Route path="/salons" element={<SalonSelection triggerToast={triggerToast} isOnline={true} />} />
            <Route path="/payment" element={<Payment triggerToast={triggerToast} isOnline={true} />} />
            <Route path="/status" element={<Status triggerToast={triggerToast} isOnline={true} />} />
            <Route path="/profile" element={<Profile triggerToast={triggerToast} isOnline={true} />} />
            <Route path="/reschedule" element={<Reschedule triggerToast={triggerToast} isOnline={true} />} />
            <Route path="/admin-login" element={<AdminLogin triggerToast={triggerToast} />} />
            <Route path="/admin-panel" element={<AdminPanel triggerToast={triggerToast} />} />
            <Route path="/staff-login" element={<StaffLogin triggerToast={triggerToast} />} />
            <Route path="/staff-dashboard" element={<StaffDashboard triggerToast={triggerToast} />} />
            <Route path="/customer-login" element={<CustomerLogin triggerToast={triggerToast} isOnline={true} />} />
            <Route path="/phoneauth" element={<PhoneAuth triggerToast={triggerToast} isOnline={true} />} />
            <Route path="/login" element={<LoginPage triggerToast={triggerToast} isOnline={true} />} />
            <Route path="/" element={<Home triggerToast={triggerToast} isOnline={true} />} />
            <Route path="/stylists" element={<Stylists triggerToast={triggerToast} isOnline={true} />} />
            <Route path="/ai-career" element={<ProtectedRoute element={<AICareerAssistant triggerToast={triggerToast} isOnline={true} />} />} />
            <Route path="/ai-personality" element={<AIPersonalityDNA triggerToast={triggerToast} isOnline={true} />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>
      </div>
    </>
  );
}

export default App;
