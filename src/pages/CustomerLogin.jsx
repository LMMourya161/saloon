import React, { useState, useEffect } from "react";
import { Mail, Lock, User, ArrowRight, Eye, EyeOff } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { insertDoc, queryDocs } from "../mockDb";

export default function CustomerLogin({ triggerToast, isOnline }) {
  const navigate = useNavigate();
  const [emailMode, setEmailMode] = useState("login"); // "login" or "signup"

  // Form state
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  // Auto‑redirect if already authenticated
  useEffect(() => {
    const isAuth = localStorage.getItem('is_authenticated') === 'true';
    if (isAuth) {
      navigate('/');
    }
  }, [navigate]);

  const handleEmailLogin = (e) => {
    e.preventDefault();
    if (!isOnline) {
      triggerToast("E001: Mobile not connected to internet", "error");
      return;
    }
    if (!email.trim() || !password) {
      triggerToast("Please enter both email and password.", "error");
      return;
    }
    const lowerEmail = email.trim().toLowerCase();
    const user = queryDocs("users", (u) => u.email === lowerEmail)[0];
    if (!user || user.password !== password) {
      triggerToast("E004: Invalid email or password", "error");
      return;
    }
    localStorage.setItem("is_authenticated", "true");
    const customerId = user.customerId || user.id;
    localStorage.setItem("current_customer_id", customerId);
    const existingCust = queryDocs("customer", (c) => c.Customer_id === customerId || c.Email === lowerEmail);
    if (existingCust.length === 0) {
      insertDoc("customer", {
        Customer_id: customerId,
        customerId: customerId,
        Name: user.name,
        name: user.name,
        Email: lowerEmail,
        email: lowerEmail,
        Age: 18,
        Gender: "Other",
        status: "AA"
      });
    }
    triggerToast("MSG01: Logged in successfully!", "success");
    setTimeout(() => {
      const redirect = localStorage.getItem("redirect_after_auth") || "/";
      navigate(redirect);
    }, 1200);
  };

  const handleEmailRegister = (e) => {
    e.preventDefault();
    if (!isOnline) {
      triggerToast("E001: Mobile not connected to internet", "error");
      return;
    }
    const nameTrimmed = name.trim();
    const emailTrimmed = email.trim().toLowerCase();
    if (!nameTrimmed || !emailTrimmed || !password || !confirmPassword) {
      triggerToast("Please fill in all fields.", "error");
      return;
    }
    const nameRegex = /^[a-zA-Z\s]{3,20}$/;
    if (!nameRegex.test(nameTrimmed)) {
      triggerToast("Name must contain only characters and be between 3 and 20 characters.", "error");
      return;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(emailTrimmed)) {
      triggerToast("Please enter a valid email address.", "error");
      return;
    }
    if (password.length < 6) {
      triggerToast("Password must be at least 6 characters long.", "error");
      return;
    }
    if (password !== confirmPassword) {
      triggerToast("Passwords do not match.", "error");
      return;
    }
    const existingUser = queryDocs("users", (u) => u.email === emailTrimmed);
    if (existingUser.length > 0) {
      triggerToast("Email is already registered. Please sign in instead.", "error");
      return;
    }
    const customerId = "cust_" + Math.random().toString(36).substring(2, 11);
    insertDoc("users", { id: customerId, customerId, name: nameTrimmed, email: emailTrimmed, password });
    insertDoc("customer", {
      Customer_id: customerId,
      customerId,
      Name: nameTrimmed,
      name: nameTrimmed,
      Email: emailTrimmed,
      email: emailTrimmed,
      Password: password,
      password,
      Age: 18,
      Gender: "Other",
      status: "AA"
    });
    localStorage.setItem("is_authenticated", "true");
    localStorage.setItem("current_customer_id", customerId);
    triggerToast("MSG02: Registered successfully!", "success");
    setTimeout(() => {
      localStorage.removeItem("redirect_after_auth");
      navigate('/phoneauth');
    }, 1200);
  };

  return (
    <div style={{ maxWidth: "500px", margin: "2rem auto" }}>
      <div className="glass-card animate-fade-in" style={{ padding: "2.5rem 2rem" }}>
        <div style={{ textAlign: "center", marginBottom: "2rem" }}>
          <div style={{ background: "var(--accent-soft)", width: "64px", height: "64px", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 1rem auto" }}>
            <Mail size={32} color="var(--accent-color)" />
          </div>
          <h2 style={{ fontSize: "1.75rem", marginBottom: "0.5rem" }}>{emailMode === "login" ? "Customer Log In" : "Customer Sign Up"}</h2>
          <p style={{ color: "var(--text-secondary)" }}>{emailMode === "login" ? "Sign in with your email and password." : "Register a new profile to track salon bookings."}</p>
        </div>
        {emailMode === "login" ? (
          <form onSubmit={handleEmailLogin}>
            <div className="form-group">
              <label className="form-label" style={{ display: "flex", alignItems: "center", gap: "0.4rem" }}><Mail size={16} /> Email Address</label>
              <input type="email" className="form-control" placeholder="Enter email" value={email} onChange={(e) => setEmail(e.target.value)} required />
            </div>
            <div className="form-group">
              <label className="form-label" style={{ display: "flex", alignItems: "center", gap: "0.4rem" }}><Lock size={16} /> Password</label>
              <div style={{ position: "relative" }}>
                <input type={showPassword ? "text" : "password"} className="form-control" placeholder="Enter password" value={password} onChange={(e) => setPassword(e.target.value)} style={{ width: "100%", paddingRight: "2.5rem" }} required />
                <button type="button" onClick={() => setShowPassword(!showPassword)} style={{ position: "absolute", right: "12px", top: "12px", background: "none", border: "none", color: "var(--text-muted)", cursor: "pointer" }}>
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>
            <button type="submit" className="btn btn-primary" style={{ width: "100%", marginTop: "1.5rem", height: "3rem" }}>Sign In <ArrowRight size={18} /></button>
            <div style={{ marginTop: "1.5rem", textAlign: "center", fontSize: "0.9rem" }}>
              <span style={{ color: "var(--text-secondary)" }}>Don't have an account? </span>
              <button type="button" onClick={() => { setEmailMode("signup"); setName(""); setEmail(""); setPassword(""); setConfirmPassword(""); }} style={{ background: "none", border: "none", color: "var(--accent-color)", cursor: "pointer", fontWeight: "bold", textDecoration: "underline" }}>Sign Up</button>
            </div>
          </form>
        ) : (
          <form onSubmit={handleEmailRegister}>
            <div className="form-group">
              <label className="form-label" style={{ display: "flex", alignItems: "center", gap: "0.4rem" }}><User size={16} /> Full Name</label>
              <input type="text" className="form-control" placeholder="e.g. Suryaa" value={name} onChange={(e) => setName(e.target.value)} required />
              <span style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>3-20 letters. No special characters or numbers.</span>
            </div>
            <div className="form-group">
              <label className="form-label" style={{ display: "flex", alignItems: "center", gap: "0.4rem" }}><Mail size={16} /> Email Address</label>
              <input type="email" className="form-control" placeholder="Enter email" value={email} onChange={(e) => setEmail(e.target.value)} required />
            </div>
            <div className="form-group">
              <label className="form-label" style={{ display: "flex", alignItems: "center", gap: "0.4rem" }}><Lock size={16} /> Password</label>
              <input type="password" className="form-control" placeholder="At least 6 characters" value={password} onChange={(e) => setPassword(e.target.value)} required />
            </div>
            <div className="form-group">
              <label className="form-label" style={{ display: "flex", alignItems: "center", gap: "0.4rem" }}><Lock size={16} /> Confirm Password</label>
              <input type="password" className="form-control" placeholder="Re-enter password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} required />
            </div>
            <button type="submit" className="btn btn-primary" style={{ width: "100%", marginTop: "1.5rem", height: "3rem" }}>Create Account <ArrowRight size={18} /></button>
            <div style={{ marginTop: "1.5rem", textAlign: "center", fontSize: "0.9rem" }}>
              <span style={{ color: "var(--text-secondary)" }}>Already have an account? </span>
              <button type="button" onClick={() => { setEmailMode("login"); setEmail(""); setPassword(""); }} style={{ background: "none", border: "none", color: "var(--accent-color)", cursor: "pointer", fontWeight: "bold", textDecoration: "underline" }}>Log In</button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
