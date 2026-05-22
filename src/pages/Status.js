import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Clock, CheckCircle2, XCircle, AlertCircle, ArrowRight, RefreshCw, Scissors, MapPin, Calendar } from "lucide-react";
import { getDoc, updateDoc, logSystemAction } from "../mockDb";

export default function Status({ triggerToast, isOnline }) {
  const navigate = useNavigate();
  const [appointment, setAppointment] = useState(null);
  const [customer, setCustomer] = useState(null);
  const [stylist, setStylist] = useState(null);
  const [branch, setBranch] = useState(null);
  const [statusState, setStatusState] = useState("pending"); // pending, approved, declined
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const cid = localStorage.getItem("current_customer_id");
    const aid = localStorage.getItem("current_appointment_id");
    const sid = localStorage.getItem("current_stylist_id");
    const bid = localStorage.getItem("current_branch_id") || "branch_01";

    if (!cid) {
      triggerToast("Session expired. Please log in again.", "warning");
      navigate("/");
      return;
    }

    const custDoc = getDoc("customer", cid, "Customer_id");
    setCustomer(custDoc);

    const branchDoc = getDoc("branches", bid, "branchId");
    setBranch(branchDoc);

    if (aid) {
      const appDoc = getDoc("appointment", aid, "id");
      setAppointment(appDoc);
      
      // Sync with DB status if exists
      if (appDoc && appDoc.status) {
        if (appDoc.status === "Approved") setStatusState("approved");
        else if (appDoc.status === "Declined") setStatusState("declined");
        else setStatusState("pending");
      }
    }

    if (sid) {
      const styDoc = getDoc("staffs", sid, "StaffId");
      setStylist(styDoc);
    }
  }, [navigate, triggerToast]);

  const handleSimulateApproval = () => {
    if (!isOnline) {
      triggerToast("E001: Mobile not connected to internet", "error");
      return;
    }

    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setStatusState("approved");
      
      const aid = localStorage.getItem("current_appointment_id");
      if (aid) {
        updateDoc("appointment", aid, { status: "Approved" });
      }

      logSystemAction("STATUS_UPDATE", "appointment", {
        appointmentId: aid,
        status: "Approved",
        approvedBy: "Bounce Stylist League"
      });

      triggerToast("Simulated: Request APPROVED by Bounce Stylist League!", "success");
    }, 800);
  };

  const handleSimulateDecline = () => {
    if (!isOnline) {
      triggerToast("E001: Mobile not connected to internet", "error");
      return;
    }

    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setStatusState("declined");
      
      const aid = localStorage.getItem("current_appointment_id");
      if (aid) {
        updateDoc("appointment", aid, { status: "Declined" });
      }

      logSystemAction("STATUS_UPDATE", "appointment", {
        appointmentId: aid,
        status: "Declined",
        declinedBy: "Trends salon"
      });

      triggerToast("Simulated: Request DECLINED by Trends salon.", "error");
    }, 800);
  };

  const handleProceedToPayment = () => {
    if (!isOnline) {
      triggerToast("E001: Mobile not connected to internet", "error");
      return;
    }
    navigate("/payment");
  };

  const handleReselectStylist = () => {
    navigate("/stylists");
  };

  const formattedTime = localStorage.getItem("confirmed_date_time") || "Scheduled time";

  return (
    <div className="animate-fade-in" style={{ maxWidth: "650px", margin: "0 auto" }}>
      <div className="glass-card" style={{ padding: "2.5rem 2rem", textAlign: "center" }}>
        
        {/* Dynamic Status Icon */}
        <div style={{ display: "flex", justifyContent: "center", marginBottom: "1.5rem" }}>
          {statusState === "pending" && (
            <div style={{
              background: "rgba(245, 158, 11, 0.1)",
              padding: "1.5rem",
              borderRadius: "50%",
              color: "var(--warning)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              animation: "pulseBorder 2s infinite"
            }}>
              <Clock size={48} />
            </div>
          )}
          {statusState === "approved" && (
            <div style={{
              background: "rgba(16, 185, 129, 0.1)",
              padding: "1.5rem",
              borderRadius: "50%",
              color: "var(--success)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center"
            }}>
              <CheckCircle2 size={48} />
            </div>
          )}
          {statusState === "declined" && (
            <div style={{
              background: "rgba(239, 68, 68, 0.1)",
              padding: "1.5rem",
              borderRadius: "50%",
              color: "var(--error)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center"
            }}>
              <XCircle size={48} />
            </div>
          )}
        </div>

        <h2 style={{ fontSize: "1.8rem", marginBottom: "0.5rem" }}>
          {statusState === "pending" && "Checking Appointment Status..."}
          {statusState === "approved" && "Request Approved!"}
          {statusState === "declined" && "Request Declined"}
        </h2>

        <p style={{ color: "var(--text-secondary)", marginBottom: "2rem", fontSize: "0.95rem" }}>
          {statusState === "pending" && "Waiting for the salon to confirm your appointment slot."}
          {statusState === "approved" && "Your appointment request has been confirmed. Please proceed to payment."}
          {statusState === "declined" && "Sorry, the stylist is currently unavailable at this time slot."}
        </p>

        {/* Appointment Information Card */}
        <div style={{
          background: "rgba(255, 255, 255, 0.02)",
          border: "1px solid var(--border-color)",
          borderRadius: "12px",
          padding: "1.25rem",
          textAlign: "left",
          marginBottom: "2rem"
        }}>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "1rem", borderBottom: "1px solid rgba(255,255,255,0.05)", paddingBottom: "0.75rem" }}>
            <span style={{ color: "var(--text-muted)", fontSize: "0.85rem", fontWeight: "600" }}>APPOINTMENT SUMMARY</span>
            <span className={`badge ${statusState === "approved" ? "badge-success" : statusState === "declined" ? "badge-danger" : "badge-warning"}`}>
              {statusState === "approved" ? "Approved" : statusState === "declined" ? "Declined" : "Pending Approval"}
            </span>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
              <Scissors size={16} style={{ color: "var(--accent-color)" }} />
              <div>
                <span style={{ fontSize: "0.85rem", color: "var(--text-muted)" }}>Stylist/Professional: </span>
                <strong style={{ fontSize: "0.95rem" }}>{stylist?.name || "Assigning..."}</strong>
              </div>
            </div>

            <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
              <MapPin size={16} style={{ color: "var(--accent-color)" }} />
              <div>
                <span style={{ fontSize: "0.85rem", color: "var(--text-muted)" }}>Salon Branch: </span>
                <strong style={{ fontSize: "0.95rem" }}>{branch?.name || "Salon Clinic"}</strong>
              </div>
            </div>

            <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
              <Calendar size={16} style={{ color: "var(--accent-color)" }} />
              <div>
                <span style={{ fontSize: "0.85rem", color: "var(--text-muted)" }}>Date & Time: </span>
                <strong style={{ fontSize: "0.95rem" }}>{formattedTime}</strong>
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons based on Status */}
        {loading ? (
          <div style={{ display: "flex", justifyContent: "center", alignItems: "center", gap: "0.5rem", padding: "1rem" }}>
            <RefreshCw size={20} className="animate-spin-fast" style={{ color: "var(--accent-color)" }} />
            <span style={{ color: "var(--text-secondary)" }}>Updating status...</span>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
            {statusState === "approved" && (
              <button onClick={handleProceedToPayment} className="btn btn-primary" style={{ width: "100%", height: "3rem", fontSize: "1rem" }}>
                Proceed to Payment <ArrowRight size={18} />
              </button>
            )}

            {statusState === "declined" && (
              <button onClick={handleReselectStylist} className="btn btn-primary" style={{ width: "100%", height: "3rem", fontSize: "1rem", background: "var(--info)", boxShadow: "0 4px 14px 0 rgba(14, 165, 233, 0.3)" }}>
                Select Another Stylist
              </button>
            )}

            {/* Simulation Controls for testing */}
            <div style={{
              marginTop: "1.5rem",
              padding: "1rem",
              background: "rgba(255,255,255,0.02)",
              border: "1px dashed var(--border-color)",
              borderRadius: "12px"
            }}>
              <div style={{ fontSize: "0.8rem", color: "var(--text-muted)", fontWeight: "600", marginBottom: "0.75rem", textTransform: "uppercase" }}>
                🧪 Simulation Panel (Admin Mode)
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.75rem" }}>
                <button
                  onClick={handleSimulateApproval}
                  className="btn btn-secondary"
                  style={{ borderColor: "var(--success)", color: "var(--success)", fontSize: "0.85rem", padding: "0.5rem" }}
                >
                  Approve Request
                </button>
                <button
                  onClick={handleSimulateDecline}
                  className="btn btn-secondary"
                  style={{ borderColor: "var(--error)", color: "var(--error)", fontSize: "0.85rem", padding: "0.5rem" }}
                >
                  Decline Request
                </button>
              </div>
              <p style={{ fontSize: "0.75rem", color: "var(--text-muted)", marginTop: "0.5rem" }}>
                Simulate status response from <strong>Bounce Stylist League</strong> or <strong>Trends salon</strong>.
              </p>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
