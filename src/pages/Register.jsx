import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { User, Calendar, Users, ArrowRight } from "lucide-react";
import { updateDoc, getDoc } from "../mockDb";

export default function Register({ triggerToast, isOnline }) {
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [age, setAge] = useState("");
  const [gender, setGender] = useState("");
  const [customerId, setCustomerId] = useState("");

  useEffect(() => {
    const cid = localStorage.getItem("current_customer_id");
    if (!cid) {
      triggerToast("Session expired. Please log in again.", "warning");
      navigate("/");
    } else {
      setCustomerId(cid);
      const customer = getDoc("customer", cid, "Customer_id");
      if (customer) {
        if (customer.Name) setName(customer.Name);
        if (customer.Age) setAge(customer.Age.toString());
        if (customer.Gender) setGender(customer.Gender);
      }
    }
  }, [navigate, triggerToast]);

  const handleContinue = () => {
    if (!isOnline) {
      triggerToast("E001: Mobile not connected to internet", "error");
      return;
    }

    // Form level check
    if (!name.trim() || !age.trim() || !gender) {
      triggerToast("please fill name, age, gender", "error");
      return;
    }

    // Name validation: 3 to 20 letters
    const nameTrimmed = name.trim();
    const nameRegex = /^[a-zA-Z\s]{3,20}$/;
    if (!nameRegex.test(nameTrimmed)) {
      triggerToast("Name should contain only characters and be between 3 and 20 characters limit", "error");
      return;
    }

    // Age validation: 1 to 146
    const parsedAge = parseInt(age, 10);
    if (isNaN(parsedAge) || parsedAge < 1 || parsedAge > 146) {
      triggerToast("E002: Age you entered is invalid. Must be between 1 and 146.", "error");
      return;
    }

    // Save/Update Details in Firestore customer collection
    updateDoc("customer", customerId, {
      Name: nameTrimmed,
      Age: parsedAge,
      Gender: gender,
      status: "AA" // Active Status
    }, "Customer_id");

    triggerToast("MSG01: You have successfully registered in to the app", "success");

    setTimeout(() => {
      const redirect = localStorage.getItem("redirect_after_auth") || "/home";
      navigate(redirect);
    }, 1200);
  };

  return (
    <div className="animate-fade-in" style={{ maxWidth: "500px", margin: "2rem auto" }}>
      <div className="glass-card" style={{ padding: "2.5rem 2rem" }}>
        <h2 style={{ marginBottom: "0.5rem", fontSize: "1.75rem", textAlign: "center" }}>Complete Registration</h2>
        <p style={{ color: "var(--text-secondary)", marginBottom: "2rem", fontSize: "0.95rem", textAlign: "center" }}>
          We just need a few basic details to set up your profile.
        </p>

        <div className="form-group">
          <label className="form-label" style={{ display: "flex", alignItems: "center", gap: "0.4rem" }}>
            <User size={16} /> Full Name
          </label>
          <input
            type="text"
            className="form-control"
            placeholder="e.g. Suryaa"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
          <span style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>
            3-20 letters. No special characters or numbers.
          </span>
        </div>

        <div className="form-group">
          <label className="form-label" style={{ display: "flex", alignItems: "center", gap: "0.4rem" }}>
            <Calendar size={16} /> Age
          </label>
          <input
            type="number"
            className="form-control"
            placeholder="e.g. 24"
            value={age}
            onChange={(e) => setAge(e.target.value)}
          />
          <span style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>
            Valid age limit: 1 to 146 years.
          </span>
        </div>

        <div className="form-group">
          <label className="form-label" style={{ display: "flex", alignItems: "center", gap: "0.4rem" }}>
            <Users size={16} /> Gender
          </label>
          <select
            className="form-control"
            value={gender}
            onChange={(e) => setGender(e.target.value)}
            style={{ appearance: "auto" }}
          >
            <option value="">Select Gender</option>
            <option value="Male">Male</option>
            <option value="Female">Female</option>
            <option value="Other">Other</option>
          </select>
        </div>

        <button
          onClick={handleContinue}
          className="btn btn-primary"
          style={{ width: "100%", marginTop: "1.5rem", height: "3rem" }}
        >
          Register & Continue <ArrowRight size={18} />
        </button>
      </div>
    </div>
  );
}
