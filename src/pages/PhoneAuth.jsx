import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Smartphone, AlertCircle, RefreshCw } from "lucide-react";
import { insertDoc, queryDocs, updateDoc, logSystemAction } from "../mockDb";

export default function PhoneAuth({ triggerToast, isOnline }) {
  const navigate = useNavigate();
  const [mobileNumber, setMobileNumber] = useState("+91");
  const [otp, setOtp] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [generatedOtp, setGeneratedOtp] = useState("");
  const [timer, setTimer] = useState(300); // 5 minutes code expiry
  const [resendCount, setResendCount] = useState(0);
  const [customerId, setCustomerId] = useState("");

  // Handle countdown timer for OTP
  useEffect(() => {
    let interval;
    if (otpSent && timer > 0) {
      interval = setInterval(() => {
        setTimer((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [otpSent, timer]);

  const validateMobile = (phone) => {
    // Starts with +91 country code, followed by starting number 9,8,7,6 and 10 digits
    const regex = /^\+91[6-9]\d{9}$/;
    return regex.test(phone);
  };

  const handleSendOtp = () => {
    if (!isOnline) {
      triggerToast("E001: Mobile not connected to internet", "error");
      return;
    }

    if (mobileNumber === "" || mobileNumber === "+91") {
      triggerToast("please enter the mobile number to continue", "error");
      return;
    }

    if (!validateMobile(mobileNumber)) {
      triggerToast("E002: Mobile number you entered is invalid. Must start with +91 followed by 10 digits starting with 9, 8, 7, or 6.", "error");
      return;
    }

    // Generate 6-digit OTP
    const mockOtp = Math.floor(100000 + Math.random() * 900000).toString();
    setGeneratedOtp(mockOtp);
    setOtpSent(true);
    setTimer(300); // Reset timer

    // Simulate SMS Mantra API delivery
    logSystemAction("SMS_API", "SMS Mantra", {
      api: "SMS Mantra Delivery",
      to: mobileNumber,
      message: `Your Salon appointment verification code is: ${mockOtp}. Code expires in 5:00 minutes.`
    });

    // Check if customer already exists in DB
    const existing = queryDocs("customer", (c) => c.Mobile_number === mobileNumber);
    let cid = "";

    if (existing.length > 0) {
      cid = existing[0].Customer_id;
      updateDoc("customer", cid, {
        OTP_Number: mockOtp,
        status: "OS", // OTP Sent
        Resend_count: resendCount
      }, "Customer_id");
    } else {
      const newCustomer = insertDoc("customer", {
        Mobile_number: mobileNumber,
        OTP_Number: mockOtp,
        Resend_count: 0,
        status: "OS" // OTP Sent
      });
      cid = newCustomer.Customer_id;
    }

    const prevCid = localStorage.getItem("current_customer_id");
    setCustomerId(cid);
    localStorage.setItem("current_customer_id", cid);

    if (prevCid && prevCid.startsWith("temp_")) {
      const aid = localStorage.getItem("current_appointment_id");
      if (aid) {
        updateDoc("appointment", aid, { Customer_id: cid });
      }
    }

    triggerToast(`OTP Sent successfully via SMS Mantra! Code: ${mockOtp}`, "success");
  };

  const handleResendOtp = () => {
    if (resendCount >= 4) {
      triggerToast("Maximum resend attempts reached (max 4).", "error");
      return;
    }
    const newCount = resendCount + 1;
    setResendCount(newCount);
    handleSendOtp();
  };

  const handleVerifyOtp = () => {
    if (!isOnline) {
      triggerToast("E001: Mobile not connected to internet", "error");
      return;
    }

    if (otp === "") {
      triggerToast("please enter the otp", "error");
      return;
    }

    if (otp.length !== 6 || !/^\d{6}$/.test(otp)) {
      triggerToast("please enter the valid otp number", "error");
      return;
    }

    if (otp !== generatedOtp) {
      triggerToast("please enter the valid otp number", "error");
      // Increment failure logs
      logSystemAction("AUTH_FAIL", "customer", { customerId, message: "Invalid OTP submitted." });
      return;
    }

    // Update customer status to OV (OTP Verified)
    updateDoc("customer", customerId, {
      status: "OV" // OTP Verified
    }, "Customer_id");

    triggerToast("MSG01: You have completed phone authentication successfully", "success");

    localStorage.setItem("is_authenticated", "true");

    // Check if customer has already filled profile details
    const currentCustomer = queryDocs("customer", (c) => c.Customer_id === customerId)[0];
    
    setTimeout(() => {
      const redirect = localStorage.getItem("redirect_after_auth") || "/home";
      if (currentCustomer && currentCustomer.Name && currentCustomer.Age) {
        navigate(redirect);
      } else {
        navigate("/register");
      }
    }, 1200);
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? "0" : ""}${secs}s`;
  };

  return (
    <div className="animate-fade-in" style={{ maxWidth: "450px", margin: "2rem auto" }}>
      <div className="glass-card" style={{ padding: "2.5rem 2rem", textAlign: "center" }}>
        <div style={{ display: "flex", justifyContent: "center", marginBottom: "1.5rem" }}>
          <div style={{
            background: "var(--accent-soft)",
            padding: "1rem",
            borderRadius: "50%",
            color: "var(--accent-color)"
          }}>
            <Smartphone size={36} />
          </div>
        </div>

        <h2 style={{ marginBottom: "0.5rem", fontSize: "1.75rem" }}>Phone Verification</h2>
        <p style={{ color: "var(--text-secondary)", marginBottom: "2rem", fontSize: "0.95rem" }}>
          Enter your mobile number to receive a verification OTP.
        </p>

        {!otpSent ? (
          <div>
            <div className="form-group" style={{ textAlign: "left" }}>
              <label className="form-label">Mobile Number</label>
              <input
                type="text"
                className="form-control"
                placeholder="+919876543210"
                value={mobileNumber}
                onChange={(e) => setMobileNumber(e.target.value)}
                style={{ fontSize: "1.1rem", letterSpacing: "0.05em" }}
              />
              <span style={{ fontSize: "0.75rem", color: "var(--text-muted)", marginTop: "0.25rem" }}>
                Format: +91 followed by 10 digits starting with 9, 8, 7, 6
              </span>
            </div>

            <button
              onClick={handleSendOtp}
              className="btn btn-primary"
              style={{ width: "100%", marginTop: "1rem", height: "3rem" }}
            >
              Send Verification OTP
            </button>
          </div>
        ) : (
          <div className="animate-slide-in">
            <div style={{
              background: "rgba(255, 255, 255, 0.03)",
              border: "1px solid var(--border-color)",
              borderRadius: "10px",
              padding: "0.75rem",
              marginBottom: "1.5rem",
              fontSize: "0.9rem",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center"
            }}>
              <span style={{ color: "var(--text-secondary)" }}>Sending to {mobileNumber}</span>
              <button 
                onClick={() => setOtpSent(false)} 
                className="btn btn-secondary" 
                style={{ padding: "0.25rem 0.5rem", fontSize: "0.8rem" }}
              >
                Change
              </button>
            </div>

            <div className="form-group" style={{ textAlign: "left" }}>
              <label className="form-label">Enter 6-Digit OTP</label>
              <input
                type="text"
                maxLength={6}
                className="form-control"
                placeholder="------"
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                style={{
                  fontSize: "1.5rem",
                  textAlign: "center",
                  letterSpacing: "0.5em",
                  fontWeight: "bold"
                }}
              />
              <div style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginTop: "0.5rem",
                fontSize: "0.8rem"
              }}>
                <span style={{ color: timer > 0 ? "var(--warning)" : "var(--error)", display: "flex", alignItems: "center", gap: "0.25rem" }}>
                  <AlertCircle size={14} /> Code expires in {formatTime(timer)}
                </span>
                <button
                  disabled={timer > 0 || resendCount >= 4}
                  onClick={handleResendOtp}
                  style={{
                    background: "none",
                    border: "none",
                    color: (timer > 0 || resendCount >= 4) ? "var(--text-muted)" : "var(--accent-color)",
                    cursor: (timer > 0 || resendCount >= 4) ? "not-allowed" : "pointer",
                    fontWeight: "600",
                    display: "flex",
                    alignItems: "center",
                    gap: "0.25rem"
                  }}
                >
                  <RefreshCw size={12} /> Resend OTP {resendCount > 0 && `(${resendCount}/4)`}
                </button>
              </div>
            </div>

            <button
              onClick={handleVerifyOtp}
              className="btn btn-primary"
              style={{ width: "100%", marginTop: "1rem", height: "3rem" }}
            >
              Verify Code & Log In
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
