// src/pages/Cart.jsx
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Calendar, Clock, Send, MessageSquare, PhoneCall, Star, Tag, Check } from "lucide-react";
import * as db from "../mockDb";

export default function Cart({ triggerToast, isOnline }) {
  const navigate = useNavigate();
  const [stylist, setStylist] = useState(null);
  const [appointment, setAppointment] = useState(null);
  const [dateTime, setDateTime] = useState("");
  const [customerId, setCustomerId] = useState("");
  const [appointmentId, setAppointmentId] = useState("");
  const [selectedServices, setSelectedServices] = useState([]);
  const [allServices, setAllServices] = useState([]);

  // Load initial data synchronously from mockDb / localStorage
  useEffect(() => {
    let cid = localStorage.getItem("current_customer_id");
    const aid = localStorage.getItem("current_appointment_id");
    const sid = localStorage.getItem("current_stylist_id");

    if (!cid) {
      cid = "temp_" + Math.random().toString(36).substring(2, 11);
      localStorage.setItem("current_customer_id", cid);
    }
    if (!aid || !sid) {
      triggerToast("Booking details missing. Redirecting...", "warning");
      setTimeout(() => navigate("/"), 1500);
      return;
    }
    setCustomerId(cid);
    setAppointmentId(aid);

    // Fetch stylist and appointment from mockDb (synchronous)
    const staffCollection = db.getCollection("staffs");
    const appointmentCollection = db.getCollection("appointments");
    const sDoc = staffCollection.find((s) => s.StaffId === sid);
    const aDoc = db.getDoc("appointments", aid);
    setStylist(sDoc);
    setAppointment(aDoc);

    // Load services from mockDb
    const services = db.getCollection("services");
    setAllServices(services.length > 0 ? services : [
      { id: "s1", name: "Hair dye", duration: "1 hour", price: 200 },
      { id: "s2", name: "Facial", duration: "50 min", price: 150 },
      { id: "s3", name: "Skin care", duration: "45 min", price: 400 },
      { id: "s4", name: "Hair cut", duration: "1 hour", price: 600 }
    ]);

    // Default datetime (tomorrow 10:00 AM)
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(10, 0, 0, 0);
    const iso = tomorrow.toISOString().slice(0, 16);
    setDateTime(iso);
  }, [navigate]);

  const toggleService = (serviceName) => {
    setSelectedServices(prev => {
      if (prev.includes(serviceName)) {
        return prev.filter(s => s !== serviceName);
      } else {
        return [...prev, serviceName];
      }
    });
  };
  const totalPrice = allServices
    .filter(s => selectedServices.includes(s.name))
    .reduce((sum, s) => sum + (s.price || 0), 0);

  const handleConfirm = () => {
    if (!isOnline) {
      triggerToast("E001: Mobile not connected to internet", "error");
      return;
    }
    if (!dateTime) {
      triggerToast("Please select date and time", "error");
      return;
    }
    if (selectedServices.length === 0) {
      triggerToast("Select at least one service before confirming.", "warning");
      return;
    }
    // Update customer and appointment records in mockDb synchronously
    const cust = db.getDoc("customer", customerId, "Customer_id");
    if (cust) {
      db.updateDoc(
        "customer",
        customerId,
        {
          Stylist_id: stylist?.StaffId,
          Appointment_Id: appointmentId,
          "Date and Time": dateTime,
          Services: selectedServices,
          CityId: appointment?.CityId,
          areaId: appointment?.areaId,
          StateId: appointment?.StateId,
          status: "AA"
        },
        "Customer_id"
      );
    }
    db.updateDoc(
      "appointment",
      appointmentId,
      { status: "AA", Services: selectedServices, DateTime: dateTime },
      "appointmentId"
    );
    triggerToast("MSG03: You have successfully sent a request to Stylist.", "success");
    db.logSystemAction && db.logSystemAction("REQUEST", "appointments", {
      customerId,
      stylistId: stylist?.StaffId,
      dateTime,
      services: selectedServices,
      message: "Customer sent appointment confirmation request."
    });
    localStorage.setItem("confirmed_date_time", dateTime);
    
    const isAuthenticated = localStorage.getItem("is_authenticated") === "true";
    if (!isAuthenticated) {
      localStorage.setItem("redirect_after_auth", "/appointment-confirm");
      setTimeout(() => navigate("/phoneauth"), 1200);
    } else {
      setTimeout(() => navigate("/appointment-confirm"), 1200);
    }
  };

  return (
    <div className="cart-page animate-fade-in" style={{ padding: "2rem" }}>
      {/* Selected Stylist Card */}
      {stylist && (
        <div className="glass-card" style={{ display: "flex", gap: "1.5rem", alignItems: "center", marginBottom: "2rem" }}>
          <img
            src={stylist.photo}
            alt={stylist.name}
            style={{ width: "120px", height: "120px", borderRadius: "12px", objectFit: "cover", border: "1.5px solid var(--border-color)" }}
          />
          <div style={{ flex: 1 }}>
            <h2 className="text-gradient" style={{ margin: 0 }}>{stylist.name}</h2>
            <p style={{ color: "var(--text-secondary)", margin: "0.25rem 0" }}>{stylist.qualification}</p>
            <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", color: "var(--warning)" }}>
              <Star size={16} fill="currentColor" />
              <span>{stylist.rating} ★</span>
            </div>
          </div>
        </div>
      )}

      {/* Appointment Details */}
      {appointment && (
        <div className="glass-card" style={{ padding: "1.5rem", marginBottom: "2rem" }}>
          <h3 style={{ marginBottom: "0.5rem" }}>Appointment Details</h3>
          <p><strong>Branch:</strong> {appointment.branchId || "-"}</p>
          <p><strong>City:</strong> {appointment.CityId || "-"}</p>
        </div>
      )}

      {/* Date & Time Picker */}
      <div className="glass-card" style={{ padding: "1.5rem", marginBottom: "2rem" }}>
        <label className="form-label" htmlFor="datetime">Select Date & Time</label>
        <input
          id="datetime"
          type="datetime-local"
          className="form-control"
          value={dateTime}
          onChange={(e) => setDateTime(e.target.value)}
        />
      </div>

      {/* Service Selection */}
      <div className="glass-card" style={{ padding: "1.5rem", marginBottom: "2rem" }}>
        <h3 style={{ marginBottom: "1rem" }}>Choose Services</h3>
        <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
          {allServices.map((svc) => {
            const isSelected = selectedServices.includes(svc.name);
            return (
              <div
                key={svc.name}
                onClick={() => toggleService(svc.name)}
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  padding: "0.9rem 1rem",
                  borderRadius: "10px",
                  border: isSelected ? "1px solid var(--accent-color)" : "1px solid var(--border-color)",
                  background: isSelected ? "rgba(255,92,0,0.06)" : "rgba(255,255,255,0.02)",
                  cursor: "pointer",
                  transition: "all 0.15s ease"
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
                  <div style={{
                    width: "22px", height: "22px", borderRadius: "5px",
                    border: "1.5px solid",
                    borderColor: isSelected ? "var(--accent-color)" : "var(--text-muted)",
                    background: isSelected ? "var(--accent-color)" : "transparent",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    color: "#fff", flexShrink: 0
                  }}>
                    {isSelected && <Check size={13} />}
                  </div>
                  <div>
                    <p style={{ fontWeight: "600", fontSize: "0.92rem" }}>{svc.name}</p>
                    <p style={{ fontSize: "0.78rem", color: "var(--text-muted)", display: "flex", alignItems: "center", gap: "0.3rem" }}>
                      <Clock size={11} /> {svc.duration}
                    </p>
                  </div>
                </div>
                <span style={{ fontWeight: "700", color: isSelected ? "var(--accent-color)" : "var(--text-secondary)" }}>
                  ₹{svc.price}
                </span>
              </div>
            );
          })}
        </div>

        {/* Selected Services Summary */}
        {selectedServices.length > 0 && (
          <div style={{ marginTop: "1rem" }}>
            <p style={{ margin: 0, fontWeight: "600" }}>Selected Services:</p>
            <ul style={{ margin: "0.5rem 0", paddingLeft: "1.2rem" }}>
              {selectedServices.map(svcName => (
                <li key={svcName} style={{ color: "var(--text-secondary)" }}>{svcName}</li>
              ))}
            </ul>
          </div>
        )}
        {selectedServices.length > 0 && (
          <div style={{
            display: "flex",
            justifyContent: "space-between",
            borderTop: "1px solid var(--border-color)",
            fontWeight: "700",
            fontSize: "1rem",
            marginTop: "0.5rem",
            paddingTop: "0.5rem"
          }}>
            <span>Total</span>
            <span style={{ color: "var(--accent-color)" }}>₹{totalPrice}</span>
          </div>
        )}
      </div>

      {/* Confirm Button */}
      <div style={{ textAlign: "center" }}>
        <button className="btn btn-primary" onClick={handleConfirm}
          style={{ padding: "0.8rem 2.5rem", fontSize: "1rem" }}>
          Confirm Booking
        </button>
      </div>
    </div>
  );
}
