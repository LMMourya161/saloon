import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Calendar, Clock, Send, MessageSquare, PhoneCall } from "lucide-react";
import { getDoc, updateDoc, logSystemAction } from "../mockDb";

const MOCK_SERVICES = [
  { name: "Hair dye", duration: "1 hour", price: 200 },
  { name: "Facial", duration: "50 min", price: 150 },
  { name: "Skin care", duration: "45 min", price: 400 },
  { name: "Hair cut", duration: "1 hour", price: 600 }
];

export default function Cart({ triggerToast, isOnline }) {
  const navigate = useNavigate();
  const [stylist, setStylist] = useState(null);
  const [appointment, setAppointment] = useState(null);
  const [dateTime, setDateTime] = useState("");
  const [showChat, setShowChat] = useState(false);
  const [showCall, setShowCall] = useState(false);
  const [chatMessages, setChatMessages] = useState([
    { sender: "stylist", text: "Hello! Thank you for selecting me. Please enter your preferred date and time on screen. Let me know if you need to adjust anything!" }
  ]);
  const [newMessage, setNewMessage] = useState("");
  const [customerId, setCustomerId] = useState("");
  const [appointmentId, setAppointmentId] = useState("");

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
      navigate("/home");
      return;
    }

    setCustomerId(cid);
    setAppointmentId(aid);

    const sDoc = getDoc("staffs", sid, "StaffId");
    const aDoc = getDoc("appointment", aid, "id");
    setStylist(sDoc);
    setAppointment(aDoc);

    // Initial default value for date-time
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(10, 0, 0, 0); // 10:00 AM tomorrow
    
    // Format YYYY-MM-DD HH:MM
    const formatted = tomorrow.toISOString().slice(0, 10) + " 10:00 AM";
    setDateTime(formatted);
  }, [navigate, triggerToast]);

  const handleConfirm = () => {
    if (!isOnline) {
      triggerToast("E001: Mobile not connected to internet", "error");
      return;
    }

    if (!dateTime.trim()) {
      triggerToast("please enter the Date and Time to confirm", "error");
      return;
    }

    // Validation for length between 10 and 25 characters per PDF spec
    const dt = dateTime.trim();
    if (dt.length < 10 || dt.length > 25) {
      triggerToast("please enter the valid Date and Time", "error");
      return;
    }

    // Update customer collection as per DB specification
    // Fields: Customer_id, Stylist_id, Appointment_Id, Date and Time, CityId, areaId, StateId, status = AA
    const customer = getDoc("customer", customerId, "Customer_id");
    if (customer) {
      updateDoc("customer", customerId, {
        Stylist_id: stylist?.StaffId,
        Appointment_Id: appointmentId,
        "Date and Time": dt,
        CityId: appointment?.CityId,
        areaId: appointment?.areaId,
        StateId: appointment?.StateId,
        status: "AA" // Active
      }, "Customer_id");
    }

    // Update appointment collection status
    updateDoc("appointment", appointmentId, {
      status: "AA"
    });

    triggerToast("MSG03: You have successfully sent a request to Stylist.", "success");

    // Simulating response from stylist
    logSystemAction("REQUEST", "appointments", {
      customerId,
      stylistId: stylist?.StaffId,
      dateTime: dt,
      message: "Customer sent appointment confirmation request."
    });

    // Save date time context
    localStorage.setItem("confirmed_date_time", dt);

    setTimeout(() => {
      // Check if user has authenticated
      if (localStorage.getItem("is_authenticated") !== "true") {
        // Redirect to PhoneAuth to complete login before rescheduling
        localStorage.setItem("redirect_after_auth", "/reschedule");
        navigate("/phoneauth");
      } else {
        // Navigate to the Reschedule screen where stylist proposes alternate time
        navigate("/reschedule");
      }
    }, 1500);
  };

  const handleSendMessage = () => {
    if (!newMessage.trim()) return;
    const userMsg = { sender: "customer", text: newMessage.trim() };
    setChatMessages(prev => [...prev, userMsg]);
    setNewMessage("");

    // Simulate stylist typing reply
    setTimeout(() => {
      const stylistMsg = {
        sender: "stylist",
        text: `Got it! Looking forward to seeing you at the salon. Please confirm the request on your screen so we can lock it in.`
      };
      setChatMessages(prev => [...prev, stylistMsg]);
    }, 1000);
  };

  // Calculate total pricing and services based on category
  const services = MOCK_SERVICES.slice(0, appointment?.["Main category"] === "Child" ? 2 : 3);
  const totalDuration = "2.5 hours";
  const totalPrice = services.reduce((acc, curr) => acc + curr.price, 0);

  return (
    <div className="animate-fade-in" style={{ maxWidth: "700px", margin: "0 auto" }}>
      <div className="glass-card">
        <h2 style={{ fontSize: "1.8rem", marginBottom: "1.5rem" }}>Confirm Appointment</h2>

        {/* Selected Stylist */}
        {stylist && (
          <div style={{
            display: "flex",
            alignItems: "center",
            gap: "1rem",
            padding: "1rem",
            background: "rgba(255,255,255,0.02)",
            border: "1px solid var(--border-color)",
            borderRadius: "12px",
            marginBottom: "1.5rem"
          }}>
            <img
              src={stylist.photo}
              alt={stylist.name}
              style={{ width: "60px", height: "60px", borderRadius: "50%", objectFit: "cover" }}
            />
            <div style={{ flex: 1 }}>
              <h3 style={{ fontSize: "1.1rem" }}>{stylist.name}</h3>
              <p style={{ fontSize: "0.85rem", color: "var(--accent-color)" }}>{stylist.qualification}</p>
            </div>
            <div style={{ display: "flex", gap: "0.5rem" }}>
              <button 
                onClick={() => setShowCall(true)} 
                className="btn btn-secondary" 
                style={{ padding: "0.5rem", borderRadius: "50%", width: "40px", height: "40px" }}
                title="Call Stylist"
              >
                <PhoneCall size={16} />
              </button>
              <button 
                onClick={() => setShowChat(true)} 
                className="btn btn-secondary" 
                style={{ padding: "0.5rem", borderRadius: "50%", width: "40px", height: "40px" }}
                title="Chat with Stylist"
              >
                <MessageSquare size={16} />
              </button>
            </div>
          </div>
        )}

        {/* Selected Services Display */}
        <div style={{ marginBottom: "1.5rem" }}>
          <h4 style={{ fontSize: "1rem", color: "var(--text-secondary)", marginBottom: "0.75rem" }}>Selected Services</h4>
          <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
            {services.map((service, index) => (
              <div key={index} style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                padding: "0.75rem 1rem",
                background: "rgba(0,0,0,0.15)",
                border: "1px solid var(--border-color)",
                borderRadius: "8px"
              }}>
                <div>
                  <div style={{ fontWeight: "600", fontSize: "0.95rem" }}>{service.name}</div>
                  <div style={{ fontSize: "0.8rem", color: "var(--text-muted)", display: "flex", alignItems: "center", gap: "0.2rem" }}>
                    <Clock size={12} /> {service.duration}
                  </div>
                </div>
                <div style={{ fontWeight: "700", color: "var(--accent-color)" }}>
                  ₹{service.price}
                </div>
              </div>
            ))}
          </div>
          <div style={{
            display: "flex",
            justifyContent: "space-between",
            marginTop: "1.25rem",
            padding: "1rem 0",
            borderTop: "1.5px solid var(--border-color)",
            fontWeight: "700"
          }}>
            <span>Total Estimated Cost ({totalDuration})</span>
            <span style={{ fontSize: "1.2rem", color: "var(--accent-color)" }}>₹{totalPrice}</span>
          </div>
        </div>

        {/* Date and Time Customization Form */}
        <div className="form-group" style={{ marginBottom: "2rem" }}>
          <label className="form-label" style={{ display: "flex", alignItems: "center", gap: "0.4rem" }}>
            <Calendar size={16} /> Appointment Date & Time
          </label>
          <input
            type="text"
            className="form-control"
            placeholder="e.g. 2026-05-23 10:00 AM"
            value={dateTime}
            onChange={(e) => setDateTime(e.target.value)}
          />
          <span style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>
            Format: YYYY-MM-DD HH:MM AM/PM (10 to 25 characters required)
          </span>
        </div>

        {/* Confirm Actions */}
        <div style={{ display: "flex", gap: "1rem" }}>
          <button 
            onClick={() => navigate("/stylists")} 
            className="btn btn-secondary" 
            style={{ flex: 1 }}
          >
            Change Stylist
          </button>
          <button 
            onClick={handleConfirm} 
            className="btn btn-primary" 
            style={{ flex: 2 }}
          >
            Confirm & Send Request
          </button>
        </div>
      </div>

      {/* MOCK CHAT SIMULATION MODAL */}
      {showChat && (
        <div className="modal-overlay" onClick={() => setShowChat(false)}>
          <div className="modal-content" style={{ maxWidth: "450px" }} onClick={(e) => e.stopPropagation()}>
            <div style={{
              background: "var(--bg-surface-elevated)",
              padding: "1rem 1.5rem",
              borderBottom: "1px solid var(--border-color)",
              display: "flex",
              alignItems: "center",
              gap: "0.75rem"
            }}>
              <img
                src={stylist?.photo}
                alt={stylist?.name}
                style={{ width: "40px", height: "40px", borderRadius: "50%", objectFit: "cover" }}
              />
              <div>
                <h3 style={{ fontSize: "1rem" }}>Chatting with {stylist?.name}</h3>
                <span className="badge badge-success" style={{ fontSize: "0.6rem", padding: "0.1rem 0.4rem" }}>Online</span>
              </div>
            </div>
            <div style={{
              height: "280px",
              padding: "1.25rem",
              overflowY: "auto",
              display: "flex",
              flexDirection: "column",
              gap: "0.75rem",
              background: "rgba(0,0,0,0.2)"
            }}>
              {chatMessages.map((msg, i) => {
                const isStylist = msg.sender === "stylist";
                return (
                  <div key={i} style={{
                    alignSelf: isStylist ? "flex-start" : "flex-end",
                    maxWidth: "80%",
                    padding: "0.75rem",
                    borderRadius: "12px",
                    borderTopLeftRadius: isStylist ? "0" : "12px",
                    borderTopRightRadius: isStylist ? "12px" : "0",
                    background: isStylist ? "rgba(255,255,255,0.05)" : "var(--accent-color)",
                    color: "#ffffff",
                    fontSize: "0.9rem",
                    border: isStylist ? "1px solid var(--border-color)" : "none"
                  }}>
                    {msg.text}
                  </div>
                );
              })}
            </div>
            <div style={{
              padding: "0.75rem",
              borderTop: "1px solid var(--border-color)",
              display: "flex",
              gap: "0.5rem"
            }}>
              <input
                type="text"
                className="form-control"
                placeholder="Type your message..."
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSendMessage()}
                style={{ flex: 1 }}
              />
              <button onClick={handleSendMessage} className="btn btn-primary" style={{ padding: "0.75rem" }}>
                <Send size={16} />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MOCK CALL SIMULATION MODAL */}
      {showCall && (
        <div className="modal-overlay" onClick={() => setShowCall(false)}>
          <div className="modal-content animate-slide-in" style={{
            maxWidth: "350px",
            background: "linear-gradient(to bottom, #111827, #030712)",
            textAlign: "center",
            padding: "3rem 2rem"
          }} onClick={(e) => e.stopPropagation()}>
            <div style={{ display: "flex", justifyContent: "center", marginBottom: "2rem" }}>
              <img
                src={stylist?.photo}
                alt={stylist?.name}
                style={{
                  width: "120px",
                  height: "120px",
                  borderRadius: "50%",
                  objectFit: "cover",
                  border: "3px solid var(--accent-color)",
                  boxShadow: "0 0 20px 0 rgba(255, 92, 0, 0.4)"
                }}
              />
            </div>
            <h3 style={{ fontSize: "1.5rem", marginBottom: "0.25rem" }}>{stylist?.name}</h3>
            <p style={{ color: "var(--text-secondary)", marginBottom: "2rem", fontSize: "0.9rem" }}>Calling Stylist...</p>
            <div style={{
              background: "rgba(255,255,255,0.05)",
              border: "1px solid var(--border-color)",
              borderRadius: "10px",
              padding: "0.75rem",
              marginBottom: "3rem",
              fontSize: "0.85rem",
              color: "var(--text-secondary)"
            }}>
              "Hello, thanks for calling! I am currently with another client, but I am totally fine with your requested booking time. Please hit Confirm so I get the alert!"
            </div>
            <button onClick={() => setShowCall(false)} className="btn btn-primary" style={{ background: "var(--error)", width: "100%", height: "3rem" }}>
              End Call
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
