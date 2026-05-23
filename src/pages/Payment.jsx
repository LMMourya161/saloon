import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Check, ShieldCheck, Receipt, ArrowLeft, WifiOff, Info } from "lucide-react";
import { getDoc, updateDoc, insertDoc, logSystemAction } from "../mockDb";

const MOCK_SERVICES = [
  { name: "Hair dye", price: 200 },
  { name: "Facial", price: 150 },
  { name: "Skin care", price: 400 },
  { name: "Hair cut", price: 600 }
];

export default function Payment({ triggerToast, isOnline }) {
  const navigate = useNavigate();
  const [appointment, setAppointment] = useState(null);
  const [customer, setCustomer] = useState(null);
  const [stylist, setStylist] = useState(null);
  
  // Payment option: 'full' (Pay Now) or 'advance' (Pay Advance)
  const [payOption, setPayOption] = useState("full");
  const [paymentMethod, setPaymentMethod] = useState("upi"); // upi, card, netbanking
  
  const [processing, setProcessing] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [paymentDetails, setPaymentDetails] = useState(null);

  useEffect(() => {
    const cid = localStorage.getItem("current_customer_id");
    const aid = localStorage.getItem("current_appointment_id");
    const sid = localStorage.getItem("current_stylist_id");

    if (!cid) {
      triggerToast("Session expired. Please log in again.", "warning");
      navigate("/");
      return;
    }

    const custDoc = getDoc("customer", cid, "Customer_id");
    setCustomer(custDoc);

    if (aid) {
      const appDoc = getDoc("appointment", aid, "id");
      setAppointment(appDoc);
    }

    if (sid) {
      const styDoc = getDoc("staffs", sid, "StaffId");
      setStylist(styDoc);
    }
  }, [navigate, triggerToast]);

  // Calculate pricing
  const isChildren = appointment?.["Main category"] === "Children";
  const services = MOCK_SERVICES.slice(0, isChildren ? 2 : 3);
  const totalPrice = services.reduce((acc, curr) => acc + curr.price, 0);
  const advanceAmount = Math.round(totalPrice * 0.2); // 20% advance
  const remainingAmount = totalPrice - advanceAmount;

  const handlePay = () => {
    if (!isOnline) {
      triggerToast("E001: Mobile not connected to internet", "error");
      return;
    }

    setProcessing(true);
    
    // Simulate transaction delay
    setTimeout(() => {
      setProcessing(false);
      setShowSuccess(true);

      const transactionId = "TXN" + Math.floor(10000000 + Math.random() * 90000000);
      const paidAmount = payOption === "full" ? totalPrice : advanceAmount;

      const details = {
        transactionId,
        amountPaid: paidAmount,
        totalAmount: totalPrice,
        remainingAmount: payOption === "full" ? 0 : remainingAmount,
        date: new Date().toLocaleDateString(),
        time: new Date().toLocaleTimeString(),
        status: "Success",
        paymentOption: payOption
      };

      setPaymentDetails(details);

      // Create permanent booking in DB appointments collection
      insertDoc("appointments", {
        appointmentId: appointment?.id || Math.random().toString(36).substring(2, 9),
        Customer_id: customer?.Customer_id,
        Stylist_ID: stylist?.StaffId,
        Clinic_ID: appointment?.ClinicId || "clinic_01",
        Branch_id: localStorage.getItem("current_branch_id") || "branch_01",
        Appoint_date: localStorage.getItem("confirmed_date_time") || new Date().toISOString(),
        Total_amount: totalPrice,
        Paid_amount: paidAmount,
        Remaining_amount: details.remainingAmount,
        Payment_status: payOption === "full" ? "Fully Paid" : "Advance Paid",
        status: "SC" // Scheduled
      });

      // Update customer status to booked
      updateDoc("customer", customer?.Customer_id, {
        status: "AB" // Appointment Booked
      }, "Customer_id");

      // Update active appointment status
      if (appointment?.id) {
        updateDoc("appointment", appointment.id, {
          status: "Paid"
        });
      }

      logSystemAction("PAYMENT_SUCCESS", "appointments", {
        customerId: customer?.Customer_id,
        transactionId,
        amount: paidAmount,
        option: payOption
      });

      triggerToast("Payment successful! Appointment scheduled.", "success");
    }, 2000);
  };

  return (
    <div className="animate-fade-in" style={{ maxWidth: "700px", margin: "0 auto" }}>
      {!showSuccess ? (
        <div className="glass-card">
          <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", marginBottom: "1.5rem" }}>
            <button onClick={() => navigate("/status")} className="btn btn-secondary" style={{ padding: "0.5rem", borderRadius: "50%", width: "36px", height: "36px" }}>
              <ArrowLeft size={16} />
            </button>
            <h2 style={{ fontSize: "1.8rem" }}>Secure Checkout</h2>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem", marginBottom: "2rem" }}>
            {/* Pay Now Button */}
            <div 
              onClick={() => setPayOption("full")}
              style={{
                border: payOption === "full" ? "2px solid var(--accent-color)" : "1.5px solid var(--border-color)",
                background: payOption === "full" ? "var(--accent-soft)" : "rgba(255,255,255,0.01)",
                borderRadius: "12px",
                padding: "1.25rem",
                cursor: "pointer",
                position: "relative",
                transition: "all 0.2s ease"
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.5rem" }}>
                <span style={{ fontWeight: "700", fontSize: "1rem" }}>Pay Now</span>
                <input 
                  type="radio" 
                  checked={payOption === "full"} 
                  onChange={() => setPayOption("full")} 
                  style={{ accentColor: "var(--accent-color)" }}
                />
              </div>
              <p style={{ fontSize: "0.8rem", color: "var(--text-secondary)", marginBottom: "0.75rem" }}>
                Pay full amount online for complete hassle-free check-out.
              </p>
              <div style={{ fontSize: "1.35rem", fontWeight: "800", color: "var(--accent-color)" }}>₹{totalPrice}</div>
            </div>

            {/* Pay Advance Button */}
            <div 
              onClick={() => setPayOption("advance")}
              style={{
                border: payOption === "advance" ? "2px solid var(--accent-color)" : "1.5px solid var(--border-color)",
                background: payOption === "advance" ? "var(--accent-soft)" : "rgba(255,255,255,0.01)",
                borderRadius: "12px",
                padding: "1.25rem",
                cursor: "pointer",
                position: "relative",
                transition: "all 0.2s ease"
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.5rem" }}>
                <span style={{ fontWeight: "700", fontSize: "1rem" }}>Pay Advance</span>
                <input 
                  type="radio" 
                  checked={payOption === "advance"} 
                  onChange={() => setPayOption("advance")} 
                  style={{ accentColor: "var(--accent-color)" }}
                />
              </div>
              <p style={{ fontSize: "0.8rem", color: "var(--text-secondary)", marginBottom: "0.75rem" }}>
                Pay 20% advance now and the remaining balance at the salon.
              </p>
              <div style={{ fontSize: "1.35rem", fontWeight: "800", color: "var(--accent-color)" }}>₹{advanceAmount}</div>
            </div>
          </div>

          {/* Prompt Message for Pay Advance */}
          {payOption === "advance" && (
            <div className="animate-slide-in" style={{
              background: "rgba(245, 158, 11, 0.05)",
              border: "1px solid var(--warning)",
              borderRadius: "10px",
              padding: "1rem",
              marginBottom: "2rem",
              display: "flex",
              alignItems: "flex-start",
              gap: "0.75rem"
            }}>
              <Info size={20} style={{ color: "var(--warning)", flexShrink: 0, marginTop: "0.1rem" }} />
              <div>
                <strong style={{ color: "var(--warning)", fontSize: "0.9rem" }}>Notice</strong>
                <p style={{ fontSize: "0.85rem", color: "var(--text-secondary)", marginTop: "0.2rem" }}>
                  MSG01: Remaining amount of ₹{remainingAmount} must be paid at salon after service completion.
                </p>
              </div>
            </div>
          )}

          {/* Payment breakdown */}
          <div style={{
            background: "rgba(0,0,0,0.15)",
            border: "1px solid var(--border-color)",
            borderRadius: "12px",
            padding: "1.25rem",
            marginBottom: "2rem"
          }}>
            <h4 style={{ fontSize: "0.9rem", color: "var(--text-secondary)", marginBottom: "0.75rem", textTransform: "uppercase" }}>Price Summary</h4>
            <div style={{ display: "flex", flexDirection: "column", gap: "0.6rem" }}>
              {services.map((s, idx) => (
                <div key={idx} style={{ display: "flex", justifyContent: "space-between", fontSize: "0.9rem" }}>
                  <span style={{ color: "var(--text-secondary)" }}>{s.name}</span>
                  <span>₹{s.price}</span>
                </div>
              ))}
              <div style={{ height: "1px", background: "var(--border-color)", margin: "0.5rem 0" }} />
              <div style={{ display: "flex", justifyContent: "space-between", fontWeight: "700" }}>
                <span>Subtotal</span>
                <span>₹{totalPrice}</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.9rem", color: "var(--accent-color)" }}>
                <span>Amount payable now</span>
                <span>₹{payOption === "full" ? totalPrice : advanceAmount}</span>
              </div>
            </div>
          </div>

          {/* Payment Methods */}
          <div style={{ marginBottom: "2rem" }}>
            <h4 style={{ fontSize: "0.95rem", color: "var(--text-secondary)", marginBottom: "0.75rem" }}>Select Payment Mode</h4>
            <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
              <label style={{
                display: "flex",
                alignItems: "center",
                gap: "0.75rem",
                padding: "0.75rem 1rem",
                background: "rgba(255,255,255,0.02)",
                border: "1px solid var(--border-color)",
                borderRadius: "8px",
                cursor: "pointer"
              }}>
                <input 
                  type="radio" 
                  name="paymentMethod" 
                  value="upi" 
                  checked={paymentMethod === "upi"}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                  style={{ accentColor: "var(--accent-color)" }}
                />
                <span>UPI (GPay / PhonePe / Paytm)</span>
              </label>

              <label style={{
                display: "flex",
                alignItems: "center",
                gap: "0.75rem",
                padding: "0.75rem 1rem",
                background: "rgba(255,255,255,0.02)",
                border: "1px solid var(--border-color)",
                borderRadius: "8px",
                cursor: "pointer"
              }}>
                <input 
                  type="radio" 
                  name="paymentMethod" 
                  value="card" 
                  checked={paymentMethod === "card"}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                  style={{ accentColor: "var(--accent-color)" }}
                />
                <span>Credit / Debit Card</span>
              </label>

              <label style={{
                display: "flex",
                alignItems: "center",
                gap: "0.75rem",
                padding: "0.75rem 1rem",
                background: "rgba(255,255,255,0.02)",
                border: "1px solid var(--border-color)",
                borderRadius: "8px",
                cursor: "pointer"
              }}>
                <input 
                  type="radio" 
                  name="paymentMethod" 
                  value="netbanking" 
                  checked={paymentMethod === "netbanking"}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                  style={{ accentColor: "var(--accent-color)" }}
                />
                <span>Net Banking</span>
              </label>
            </div>
          </div>

          {/* Secure details info */}
          <div style={{ display: "flex", alignItems: "center", gap: "0.4rem", justifyContent: "center", color: "var(--text-muted)", fontSize: "0.8rem", marginBottom: "1.5rem" }}>
            <ShieldCheck size={14} style={{ color: "var(--success)" }} /> Secure SSL 256-bit encrypted checkout
          </div>

          {/* Pay Button */}
          <button 
            disabled={processing}
            onClick={handlePay} 
            className="btn btn-primary" 
            style={{ width: "100%", height: "3rem", fontSize: "1rem" }}
          >
            {processing ? (
              <>
                <WifiOff size={18} className="animate-spin-fast" /> Processing Payment...
              </>
            ) : (
              `Agree & Pay ₹${payOption === "full" ? totalPrice : advanceAmount}`
            )}
          </button>
        </div>
      ) : (
        /* Success Receipt Page */
        <div className="glass-card animate-fade-in" style={{ textAlign: "center", padding: "3rem 2rem" }}>
          <div style={{ display: "flex", justifyContent: "center", marginBottom: "1.5rem" }}>
            <div style={{
              background: "rgba(16, 185, 129, 0.15)",
              color: "var(--success)",
              width: "72px",
              height: "72px",
              borderRadius: "50%",
              display: "flex",
              alignItems: "center",
              justifyContent: "center"
            }}>
              <Check size={40} />
            </div>
          </div>

          <h2 style={{ fontSize: "2rem", marginBottom: "0.5rem" }}>Appointment Confirmed!</h2>
          <p style={{ color: "var(--text-secondary)", marginBottom: "2.5rem" }}>
            Your booking at <strong>{localStorage.getItem("current_branch_id") === "branch_02" ? "Bounce Stylist HSR" : "Acne & Style Koramangala"}</strong> was successful.
          </p>

          {/* Receipt Info */}
          {paymentDetails && (
            <div style={{
              background: "rgba(0,0,0,0.2)",
              border: "1px solid var(--border-color)",
              borderRadius: "12px",
              padding: "1.5rem",
              textAlign: "left",
              marginBottom: "2.5rem",
              fontFamily: "monospace"
            }}>
              <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", borderBottom: "1.5px dashed var(--border-color)", paddingBottom: "0.75rem", marginBottom: "1rem" }}>
                <Receipt size={18} style={{ color: "var(--accent-color)" }} />
                <span style={{ fontWeight: "700", fontSize: "0.95rem", letterSpacing: "0.05em" }}>TRANSACTION RECEIPT</span>
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem", fontSize: "0.85rem", color: "var(--text-secondary)" }}>
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                  <span>Transaction ID:</span>
                  <span style={{ color: "var(--text-primary)" }}>{paymentDetails.transactionId}</span>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                  <span>Date/Time:</span>
                  <span style={{ color: "var(--text-primary)" }}>{paymentDetails.date} {paymentDetails.time}</span>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                  <span>Stylist Assigned:</span>
                  <span style={{ color: "var(--text-primary)" }}>{stylist?.name}</span>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                  <span>Scheduled Slot:</span>
                  <span style={{ color: "var(--text-primary)" }}>{localStorage.getItem("confirmed_date_time")}</span>
                </div>
                <div style={{ height: "1px", background: "rgba(255,255,255,0.05)", margin: "0.5rem 0" }} />
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                  <span>Total Bill Amount:</span>
                  <span style={{ color: "var(--text-primary)" }}>₹{paymentDetails.totalAmount}</span>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", color: "var(--success)", fontWeight: "700" }}>
                  <span>Paid Amount:</span>
                  <span>₹{paymentDetails.amountPaid}</span>
                </div>
                {paymentDetails.remainingAmount > 0 && (
                  <div style={{ display: "flex", justifyContent: "space-between", color: "var(--warning)", fontWeight: "700" }}>
                    <span>Payable at Salon:</span>
                    <span>₹{paymentDetails.remainingAmount}</span>
                  </div>
                )}
              </div>
            </div>
          )}

          <div style={{ display: "flex", gap: "1rem" }}>
            <button onClick={() => navigate("/home")} className="btn btn-secondary" style={{ flex: 1 }}>
              Back to Home
            </button>
            <button onClick={() => navigate("/profile")} className="btn btn-primary" style={{ flex: 1 }}>
              View Bookings
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
