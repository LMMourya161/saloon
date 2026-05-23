import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Save, UserCheck, CalendarDays, X, Scissors, RefreshCw } from "lucide-react";
import { getCollection, getDoc, updateDoc, logSystemAction } from "../mockDb";

export default function Profile({ triggerToast, isOnline }) {
  const navigate = useNavigate();
  const [customerId, setCustomerId] = useState("");
  
  // Profile fields state
  const [name, setName] = useState("");
  const [age, setAge] = useState("");
  const [gender, setGender] = useState("");
  const [location, setLocation] = useState("");

  // Booking history state
  const [bookings, setBookings] = useState([]);
  const [refreshToggle, setRefreshToggle] = useState(false);

  useEffect(() => {
    const cid = localStorage.getItem("current_customer_id");
    if (!cid) {
      triggerToast("Session expired. Please log in again.", "warning");
      navigate("/");
      return;
    }

    setCustomerId(cid);
    
    // Fetch profile details
    const customer = getDoc("customer", cid, "Customer_id");
    if (customer) {
      setName(customer.Name || "");
      setAge(customer.Age ? customer.Age.toString() : "");
      setGender(customer.Gender || "");
      setLocation(customer.Location || "");
    }

    // Fetch booking details
    const allBookings = getCollection("appointments");
    const myBookings = allBookings.filter(b => b.Customer_id === cid);
    setBookings(myBookings);
  }, [navigate, refreshToggle, triggerToast]);

  const handleSaveProfile = () => {
    if (!isOnline) {
      triggerToast("E001: Mobile not connected to internet", "error");
      return;
    }

    // 1. Name validation (3 to 40 characters limit)
    const nameTrimmed = name.trim();
    if (nameTrimmed.length < 3 || nameTrimmed.length > 40) {
      triggerToast("Name must be between 3 and 40 characters limit.", "error");
      return;
    }
    const nameRegex = /^[a-zA-Z\s]+$/;
    if (!nameRegex.test(nameTrimmed)) {
      triggerToast("Name can only contain alphabetic characters.", "error");
      return;
    }

    // 2. Age validation (1 to 3 digits limit)
    const ageTrimmed = age.trim();
    if (!ageTrimmed || isNaN(ageTrimmed)) {
      triggerToast("Please enter a valid age.", "error");
      return;
    }
    const ageNum = parseInt(ageTrimmed, 10);
    if (ageTrimmed.length < 1 || ageTrimmed.length > 3 || ageNum < 1 || ageNum > 120) {
      triggerToast("Age must be between 1 and 3 digits (1 to 120).", "error");
      return;
    }

    // 3. Gender selection validation
    if (!gender) {
      triggerToast("Please select a gender.", "error");
      return;
    }

    // 4. Location validation (50 to 100 characters limit)
    const locationTrimmed = location.trim();
    if (locationTrimmed.length < 50 || locationTrimmed.length > 100) {
      triggerToast(`Location details must be between 50 and 100 characters. Currently: ${locationTrimmed.length} characters.`, "error");
      return;
    }

    // Save in customer collection
    updateDoc("customer", customerId, {
      Name: nameTrimmed,
      Age: ageNum,
      Gender: gender,
      Location: locationTrimmed
    }, "Customer_id");

    triggerToast("MSG01: Profile updated successfully!", "success");
    setRefreshToggle(prev => !prev);
  };

  const handleCancelBooking = (bookingId) => {
    if (!isOnline) {
      triggerToast("E001: Mobile not connected to internet", "error");
      return;
    }

    if (window.confirm("Are you sure you want to cancel this booking?")) {
      updateDoc("appointments", bookingId, {
        status: "CN" // Cancelled
      }, "appointmentId");

      logSystemAction("BOOKING_CANCEL", "appointments", {
        customerId,
        bookingId,
        status: "Cancelled"
      });

      triggerToast("Booking cancelled successfully.", "info");
      setRefreshToggle(prev => !prev);
    }
  };

  // Helper selectors
  const getStylistName = (sid) => {
    const s = getDoc("staffs", sid, "StaffId");
    return s ? s.name : "Professional Stylist";
  };

  const getBranchName = (bid) => {
    const b = getDoc("branches", bid, "branchId");
    return b ? b.name : "Salon & Clinic Center";
  };

  return (
    <div className="animate-fade-in" style={{ display: "grid", gridTemplateColumns: "1fr", gap: "2rem" }}>
      
      {/* Upper Grid - Profile editor and active details */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "2rem", flexWrap: "wrap" }}>
        
        {/* Profile Card Form */}
        <div className="glass-card">
          <h2 style={{ fontSize: "1.5rem", marginBottom: "1.5rem", display: "flex", alignItems: "center", gap: "0.5rem" }}>
            <UserCheck style={{ color: "var(--accent-color)" }} /> Edit Account Profile
          </h2>

          <div className="form-group">
            <label className="form-label">Full Name</label>
            <input
              type="text"
              className="form-control"
              placeholder="Enter name (3-40 chars)"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
            <span style={{ fontSize: "0.725rem", color: "var(--text-muted)" }}>
              Between 3 and 40 letters limit.
            </span>
          </div>

          <div className="form-group">
            <label className="form-label">Age</label>
            <input
              type="number"
              className="form-control"
              placeholder="Enter age (1-3 digits)"
              value={age}
              onChange={(e) => setAge(e.target.value)}
            />
            <span style={{ fontSize: "0.725rem", color: "var(--text-muted)" }}>
              Must be 1 to 3 digits (e.g. 25).
            </span>
          </div>

          {/* RadioListTile Gender Selection */}
          <div className="form-group">
            <label className="form-label">Gender</label>
            <div style={{ display: "flex", gap: "1rem", marginTop: "0.25rem" }}>
              {["Male", "Female", "Other"].map((g) => (
                <label 
                  key={g} 
                  style={{
                    flex: 1,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: "0.5rem",
                    padding: "0.75rem",
                    border: gender === g ? "2px solid var(--accent-color)" : "1px solid var(--border-color)",
                    background: gender === g ? "var(--accent-soft)" : "rgba(255, 255, 255, 0.01)",
                    borderRadius: "8px",
                    cursor: "pointer",
                    fontSize: "0.9rem",
                    transition: "all 0.2s ease"
                  }}
                >
                  <input
                    type="radio"
                    name="genderGroup"
                    value={g}
                    checked={gender === g}
                    onChange={() => setGender(g)}
                    style={{ accentColor: "var(--accent-color)", display: "none" }}
                  />
                  <span>{g}</span>
                </label>
              ))}
            </div>
          </div>

          <div className="form-group" style={{ marginBottom: "1.5rem" }}>
            <label className="form-label">Location Address</label>
            <textarea
              className="form-control"
              rows={3}
              placeholder="Enter permanent address (50-100 chars)"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              style={{ resize: "none" }}
            />
            <span style={{ fontSize: "0.725rem", color: location.trim().length >= 50 && location.trim().length <= 100 ? "var(--success)" : "var(--warning)" }}>
              Character count: {location.trim().length} (Limit: 50-100 characters)
            </span>
          </div>

          <button onClick={handleSaveProfile} className="btn btn-primary" style={{ width: "100%", height: "2.8rem" }}>
            <Save size={16} /> Save Profile Settings
          </button>
        </div>

        {/* Account Quick Stats */}
        <div className="glass-card" style={{ display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
          <div>
            <h2 style={{ fontSize: "1.5rem", marginBottom: "1.5rem", display: "flex", alignItems: "center", gap: "0.5rem" }}>
              <CalendarDays style={{ color: "var(--accent-color)" }} /> Membership Summary
            </h2>
            <div style={{
              background: "rgba(255,255,255,0.02)",
              border: "1px solid var(--border-color)",
              borderRadius: "12px",
              padding: "1.5rem",
              marginBottom: "1.5rem"
            }}>
              <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                <div>
                  <div style={{ fontSize: "0.75rem", color: "var(--text-muted)", textTransform: "uppercase" }}>Registered Customer ID</div>
                  <div style={{ fontSize: "0.95rem", fontWeight: "700", fontFamily: "monospace", marginTop: "0.15rem" }}>{customerId || "No session"}</div>
                </div>
                <div>
                  <div style={{ fontSize: "0.75rem", color: "var(--text-muted)", textTransform: "uppercase" }}>Active Mobile Contact</div>
                  <div style={{ fontSize: "0.95rem", fontWeight: "700", marginTop: "0.15rem" }}>
                    {getDoc("customer", customerId, "Customer_id")?.Mobile_number || "+91"}
                  </div>
                </div>
                <div>
                  <div style={{ fontSize: "0.75rem", color: "var(--text-muted)", textTransform: "uppercase" }}>Booking Count</div>
                  <div style={{ fontSize: "1.1rem", fontWeight: "800", color: "var(--accent-color)", marginTop: "0.15rem" }}>
                    {bookings.length} Appointment(s)
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div style={{
            background: "rgba(16, 185, 129, 0.05)",
            border: "1px solid var(--success)",
            borderRadius: "10px",
            padding: "1rem",
            fontSize: "0.85rem",
            color: "var(--text-secondary)"
          }}>
            <strong style={{ color: "var(--success)" }}>Premium Member Badge</strong>
            <p style={{ marginTop: "0.2rem" }}>
              You are signed up as a verified client. Track all your beauty, styling and clinic appointments seamlessly.
            </p>
          </div>
        </div>

      </div>

      {/* Booking History Table / List Section */}
      <div className="glass-card">
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem" }}>
          <h2 style={{ fontSize: "1.5rem" }}>Booking History</h2>
          <button onClick={() => setRefreshToggle(!refreshToggle)} className="btn btn-secondary" style={{ padding: "0.5rem 0.75rem", fontSize: "0.85rem" }}>
            <RefreshCw size={14} /> Refresh Data
          </button>
        </div>

        {bookings.length === 0 ? (
          <div style={{ textAlign: "center", padding: "3rem 1rem", color: "var(--text-secondary)" }}>
            <p style={{ marginBottom: "1rem" }}>You haven't scheduled any appointments yet.</p>
            <button onClick={() => navigate("/home")} className="btn btn-primary">Book Now</button>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
            {bookings.map((booking) => {
              const isCancelled = booking.status === "CN";
              return (
                <div 
                  key={booking.id} 
                  style={{
                    background: "rgba(255,255,255,0.01)",
                    border: "1px solid var(--border-color)",
                    borderRadius: "12px",
                    padding: "1.25rem",
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    flexWrap: "wrap",
                    gap: "1rem"
                  }}
                >
                  <div style={{ display: "flex", flexDirection: "column", gap: "0.25rem" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                      <span className={`badge ${isCancelled ? "badge-danger" : booking.Payment_status === "Fully Paid" ? "badge-success" : "badge-warning"}`}>
                        {isCancelled ? "Cancelled" : booking.status === "SC" ? "Scheduled" : booking.status}
                      </span>
                      <span style={{ fontSize: "0.8rem", color: "var(--text-muted)" }}>ID: {booking.appointmentId || booking.id}</span>
                    </div>

                    <div style={{ fontWeight: "700", fontSize: "1.1rem", marginTop: "0.25rem" }}>
                      {getBranchName(booking.Branch_id)}
                    </div>
                    
                    <div style={{ fontSize: "0.9rem", color: "var(--text-secondary)", display: "flex", alignItems: "center", gap: "0.4rem" }}>
                      <Scissors size={14} style={{ color: "var(--accent-color)" }} />
                      Stylist: {getStylistName(booking.Stylist_ID)}
                    </div>

                    <div style={{ fontSize: "0.85rem", color: "var(--text-muted)" }}>
                      Slot: {booking.Appoint_date}
                    </div>
                  </div>

                  <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: "0.5rem", textAlign: "right" }}>
                    <div style={{ fontSize: "1.1rem", fontWeight: "800", color: "var(--accent-color)" }}>
                      ₹{booking.Total_amount}
                    </div>
                    <div style={{ fontSize: "0.75rem", color: "var(--text-secondary)" }}>
                      Paid: ₹{booking.Paid_amount} | Bal: ₹{booking.Remaining_amount}
                    </div>
                    
                    {!isCancelled && booking.status !== "Completed" && (
                      <button 
                        onClick={() => handleCancelBooking(booking.appointmentId || booking.id)} 
                        className="btn btn-secondary" 
                        style={{ padding: "0.3rem 0.6rem", fontSize: "0.75rem", color: "var(--error)", borderColor: "rgba(239, 68, 68, 0.2)" }}
                      >
                        <X size={12} /> Cancel Booking
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

    </div>
  );
}
