import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  CheckCircle2, Scissors, MapPin, Calendar, Clock,
  PhoneCall, MessageSquare, ArrowRight, ArrowLeft, Star, Tag
} from "lucide-react";
import { getDoc, getCollection, updateDoc, logSystemAction } from "../mockDb";

export default function AppointmentConfirm({ triggerToast, isOnline }) {
  const navigate = useNavigate();
  const [stylist, setStylist] = useState(null);
  const [branch, setBranch] = useState(null);
  const [appointment, setAppointment] = useState(null);
  const [services, setServices] = useState([]);
  const [showChat, setShowChat] = useState(false);
  const [chatMsg, setChatMsg] = useState("");

  useEffect(() => {
    const cid = localStorage.getItem("current_customer_id");
    const aid = localStorage.getItem("current_appointment_id");
    const sid = localStorage.getItem("current_stylist_id");
    const bid = localStorage.getItem("current_branch_id") || "branch_01";

    if (!cid || !sid) {
      triggerToast("Session expired. Please start again.", "warning");
      navigate("/home");
      return;
    }

    const styDoc = getDoc("staffs", sid, "StaffId");
    const branchDoc = getDoc("branches", bid, "branchId");
    setStylist(styDoc);
    setBranch(branchDoc);

    if (aid) {
      const appDoc = getDoc("appointments", aid);
      setAppointment(appDoc);

      // Load services from appointment record
      const savedServices = appDoc?.Services || [];
      const allServices = getCollection("services");
      const matched = allServices.filter(s => savedServices.includes(s.name));
      setServices(matched);
    }
  }, [navigate, triggerToast]);

  const handleConfirm = () => {
    if (!isOnline) {
      triggerToast("E001: Mobile not connected to internet", "error");
      return;
    }

    const aid = localStorage.getItem("current_appointment_id");
    if (aid) {
      updateDoc("appointments", aid, { status: "Confirmed" }, "id");
      logSystemAction("CONFIRM", "appointments", {
        appointmentId: aid,
        message: "Customer confirmed appointment. Proceeding to payment."
      });
    }

    triggerToast("MSG04: Appointment confirmed! Proceeding to payment.", "success");
    setTimeout(() => navigate("/payment"), 1000);
  };

  const handleCall = () => {
    if (stylist?.mobile_number) {
      window.location.href = `tel:${stylist.mobile_number}`;
    } else {
      triggerToast("Stylist contact not available.", "warning");
    }
  };

  const totalPrice = services.reduce((sum, s) => sum + (s.price || 0), 0);
  const dateTime = localStorage.getItem("confirmed_date_time") || "";

  const formatDateTime = (dt) => {
    if (!dt) return "Not selected";
    try {
      return new Date(dt).toLocaleString("en-IN", {
        weekday: "long", year: "numeric", month: "long",
        day: "numeric", hour: "2-digit", minute: "2-digit"
      });
    } catch { return dt; }
  };

  return (
    <div className="animate-fade-in" style={{ maxWidth: "680px", margin: "0 auto" }}>
      {/* Header */}
      <div style={{ textAlign: "center", marginBottom: "2.5rem" }}>
        <div style={{
          display: "inline-flex",
          background: "rgba(16,185,129,0.12)",
          color: "var(--success)",
          padding: "1.25rem",
          borderRadius: "50%",
          marginBottom: "1rem"
        }}>
          <CheckCircle2 size={42} />
        </div>
        <h1 style={{ fontSize: "2rem", marginBottom: "0.4rem" }}>
          Confirm your <span className="text-gradient">Appointment</span>
        </h1>
        <p style={{ color: "var(--text-secondary)", fontSize: "1rem" }}>
          Review all details before proceeding to payment.
        </p>
      </div>

      {/* Stylist Card */}
      {stylist && (
        <div className="glass-card" style={{ display: "flex", gap: "1.5rem", alignItems: "center", marginBottom: "1.5rem" }}>
          <img
            src={stylist.photo}
            alt={stylist.name}
            style={{ width: "90px", height: "90px", borderRadius: "12px", objectFit: "cover", border: "2px solid var(--accent-color)" }}
          />
          <div style={{ flex: 1 }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "0.5rem" }}>
              <h2 style={{ fontSize: "1.4rem", margin: 0 }}>{stylist.name}</h2>
              <div style={{ display: "flex", alignItems: "center", gap: "0.3rem", color: "var(--warning)" }}>
                <Star size={15} fill="currentColor" />
                <span style={{ fontWeight: "700", fontSize: "0.9rem" }}>{stylist.rating}</span>
              </div>
            </div>
            <p style={{ color: "var(--accent-color)", fontWeight: "500", margin: "0.3rem 0", fontSize: "0.9rem" }}>
              {stylist.qualification}
            </p>
            <p style={{ color: "var(--text-secondary)", fontSize: "0.82rem" }}>
              {stylist.years_of_experience} yrs experience &nbsp;·&nbsp; {stylist.specializationId?.join(", ")}
            </p>
          </div>
        </div>
      )}

      {/* Booking Details */}
      <div className="glass-card" style={{ marginBottom: "1.5rem" }}>
        <h3 style={{ marginBottom: "1.25rem", fontSize: "1rem", color: "var(--text-secondary)", textTransform: "uppercase", letterSpacing: "0.05em" }}>
          Booking Details
        </h3>
        <div style={{ display: "flex", flexDirection: "column", gap: "0.9rem" }}>

          {branch && (
            <div style={{ display: "flex", alignItems: "flex-start", gap: "0.75rem" }}>
              <MapPin size={18} style={{ color: "var(--accent-color)", marginTop: "2px", flexShrink: 0 }} />
              <div>
                <p style={{ fontSize: "0.8rem", color: "var(--text-muted)", marginBottom: "0.1rem" }}>Salon Branch</p>
                <p style={{ fontWeight: "600" }}>{branch.name}</p>
                <p style={{ fontSize: "0.82rem", color: "var(--text-secondary)" }}>
                  {branch.areaId?.replace("area_", "").replace("_", " ")}, {branch.cityId?.replace("city_", "")} &nbsp;·&nbsp; {branch.Timings_from} – {branch.Timings_to}
                </p>
              </div>
            </div>
          )}

          <div style={{ height: "1px", background: "var(--border-color)" }} />

          <div style={{ display: "flex", alignItems: "flex-start", gap: "0.75rem" }}>
            <Calendar size={18} style={{ color: "var(--accent-color)", marginTop: "2px", flexShrink: 0 }} />
            <div>
              <p style={{ fontSize: "0.8rem", color: "var(--text-muted)", marginBottom: "0.1rem" }}>Date & Time</p>
              <p style={{ fontWeight: "600" }}>{formatDateTime(dateTime)}</p>
            </div>
          </div>

          {appointment && (
            <>
              <div style={{ height: "1px", background: "var(--border-color)" }} />
              <div style={{ display: "flex", alignItems: "flex-start", gap: "0.75rem" }}>
                <Scissors size={18} style={{ color: "var(--accent-color)", marginTop: "2px", flexShrink: 0 }} />
                <div>
                  <p style={{ fontSize: "0.8rem", color: "var(--text-muted)", marginBottom: "0.1rem" }}>Category</p>
                  <p style={{ fontWeight: "600" }}>
                    {appointment["Main category"] || "—"} &nbsp;·&nbsp; {appointment["Sub category"] || "—"}
                  </p>
                </div>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Services Summary */}
      {services.length > 0 && (
        <div className="glass-card" style={{ marginBottom: "1.5rem" }}>
          <h3 style={{ marginBottom: "1rem", fontSize: "1rem", color: "var(--text-secondary)", textTransform: "uppercase", letterSpacing: "0.05em" }}>
            Services Selected
          </h3>
          <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
            {services.map((svc, i) => (
              <div key={i} style={{
                display: "flex", alignItems: "center", justifyContent: "space-between",
                padding: "0.75rem 1rem",
                background: "rgba(255,255,255,0.02)",
                border: "1px solid var(--border-color)",
                borderRadius: "10px"
              }}>
                <div style={{ display: "flex", alignItems: "center", gap: "0.6rem" }}>
                  <Tag size={14} style={{ color: "var(--accent-color)" }} />
                  <div>
                    <p style={{ fontWeight: "600", fontSize: "0.9rem" }}>{svc.name}</p>
                    <p style={{ fontSize: "0.78rem", color: "var(--text-muted)", display: "flex", alignItems: "center", gap: "0.3rem" }}>
                      <Clock size={11} /> {svc.duration}
                    </p>
                  </div>
                </div>
                <span style={{ fontWeight: "700", color: "var(--accent-color)" }}>₹{svc.price}</span>
              </div>
            ))}
            <div style={{ display: "flex", justifyContent: "space-between", padding: "0.75rem 0 0", borderTop: "1px solid var(--border-color)", fontWeight: "700" }}>
              <span>Total Amount</span>
              <span style={{ color: "var(--accent-color)", fontSize: "1.1rem" }}>₹{totalPrice}</span>
            </div>
          </div>
        </div>
      )}

      {/* Call / Chat Buttons */}
      <div className="glass-card" style={{ marginBottom: "1.5rem" }}>
        <p style={{ color: "var(--text-secondary)", fontSize: "0.88rem", marginBottom: "1rem" }}>
          Have a question? Contact your stylist directly.
        </p>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.75rem" }}>
          <button onClick={handleCall} className="btn btn-secondary" style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "0.5rem" }}>
            <PhoneCall size={16} /> Call Stylist
          </button>
          <button onClick={() => setShowChat(true)} className="btn btn-secondary" style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "0.5rem" }}>
            <MessageSquare size={16} /> Chat
          </button>
        </div>
      </div>

      {/* Action Buttons */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 2fr", gap: "1rem" }}>
        <button onClick={() => navigate("/cart")} className="btn btn-secondary" style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "0.5rem" }}>
          <ArrowLeft size={16} /> Back
        </button>
        <button onClick={handleConfirm} className="btn btn-primary" style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "0.5rem", fontSize: "1rem" }}>
          Proceed to Payment <ArrowRight size={18} />
        </button>
      </div>

      {/* Chat Modal */}
      {showChat && (
        <div className="modal-overlay" onClick={() => setShowChat(false)}>
          <div className="modal-content" style={{ maxWidth: "420px" }} onClick={e => e.stopPropagation()}>
            <h3 style={{ marginBottom: "1rem" }}>
              <MessageSquare size={18} style={{ display: "inline", marginRight: "0.5rem", color: "var(--accent-color)" }} />
              Chat with {stylist?.name || "Stylist"}
            </h3>
            <div style={{
              minHeight: "150px", background: "rgba(0,0,0,0.15)",
              borderRadius: "10px", padding: "1rem", marginBottom: "1rem",
              border: "1px solid var(--border-color)", color: "var(--text-muted)", fontSize: "0.88rem"
            }}>
              👋 Hi! I'm {stylist?.name}. How can I help you?
            </div>
            <div style={{ display: "flex", gap: "0.5rem" }}>
              <input
                className="form-control"
                placeholder="Type a message…"
                value={chatMsg}
                onChange={e => setChatMsg(e.target.value)}
                style={{ flex: 1 }}
              />
              <button className="btn btn-primary" onClick={() => {
                triggerToast("Message sent! (Demo mode)", "success");
                setChatMsg("");
                setShowChat(false);
              }}>Send</button>
            </div>
            <button onClick={() => setShowChat(false)} className="btn btn-secondary" style={{ width: "100%", marginTop: "0.75rem" }}>
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
