import React, { useState } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import Navbar from "./components/Navbar";
import PhoneAuth from "./pages/PhoneAuth";
import Register from "./pages/Register";
import Home from "./pages/Home";
import Stylists from "./pages/Stylists";
import Cart from "./pages/Cart";
import Payment from "./pages/Payment";
import Status from "./pages/Status";
import Profile from "./pages/Profile";
import Reschedule from "./pages/Reschedule";

function App() {
  const [toast, setToast] = useState(null);

  const triggerToast = (message, type = "info") => {
    setToast({ message, type });
    setTimeout(() => {
      setToast(null);
    }, 5000);
  };

  return (
    <Router>
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
        <Navbar />
        <main className="main-content">
          <Routes>
            <Route path="/" element={<Home triggerToast={triggerToast} isOnline={true} />} />
            <Route path="/phoneauth" element={<PhoneAuth triggerToast={triggerToast} isOnline={true} />} />
            <Route path="/register" element={<Register triggerToast={triggerToast} isOnline={true} />} />
            <Route path="/home" element={<Home triggerToast={triggerToast} isOnline={true} />} />
            <Route path="/stylists" element={<Stylists triggerToast={triggerToast} isOnline={true} />} />
            <Route path="/cart" element={<Cart triggerToast={triggerToast} isOnline={true} />} />
            <Route path="/payment" element={<Payment triggerToast={triggerToast} isOnline={true} />} />
            <Route path="/status" element={<Status triggerToast={triggerToast} isOnline={true} />} />
            <Route path="/profile" element={<Profile triggerToast={triggerToast} isOnline={true} />} />
            <Route path="/reschedule" element={<Reschedule triggerToast={triggerToast} isOnline={true} />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;
