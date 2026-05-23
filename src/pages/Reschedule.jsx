import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { AlertTriangle, Check, MessageCircle, UserPlus, Search } from "lucide-react";
import { getCollection, getDoc, insertDoc, logSystemAction } from "../mockDb";

const SALUTATIONS = ["Mr.", "Miss.", "Mrs.", "Ms.", "Dr."];

export default function Reschedule({ triggerToast, isOnline }) {
  const navigate = useNavigate();
  const [branch, setBranch] = useState(null);
  const [customer, setCustomer] = useState(null);
  const [confirmedTime, setConfirmedTime] = useState("");
  
  // Reschedule offer state
  const [proposedTime, setProposedTime] = useState("");

  // Clinic patient verification state
  const [clinicMobile, setClinicMobile] = useState("");
  const [isPatientRegistered, setIsPatientRegistered] = useState(null); // null, true, false
  const [patientForm, setPatientForm] = useState({
    salutation: "Mr.",
    name: "",
    dob: "",
    gender: "male",
    symptoms: "",
    doctorId: ""
  });
  const [doctors, setDoctors] = useState([]);

  useEffect(() => {
    const cid = localStorage.getItem("current_customer_id");
    const bid = localStorage.getItem("current_branch_id") || "branch_01";
    const dt = localStorage.getItem("confirmed_date_time") || "Tomorrow 10:00 AM";

    if (!cid) {
      triggerToast("Session expired. Please log in again.", "warning");
      navigate("/");
      return;
    }

    setConfirmedTime(dt);

    // Calculate a proposed reschedule time (e.g. 2 hours later)
    setProposedTime(dt.replace("10:00 AM", "12:00 PM").replace("10:00", "12:00"));

    // Fetch branch info where status is AA
    const bDoc = getDoc("branches", bid, "branchId");
    setBranch(bDoc);

    const cDoc = getDoc("customer", cid, "Customer_id");
    setCustomer(cDoc);

    // Fetch doctors active in the branch
    const staffList = getCollection("staffs");
    const docList = staffList.filter(
      s => s.branchId === bid && s.status === "AA" && s.DesignationId.includes("doctor")
    );
    setDoctors(docList);
    if (docList.length > 0) {
      setPatientForm(prev => ({ ...prev, doctorId: docList[0].StaffId }));
    }
  }, [navigate, triggerToast]);

  const handleConfirmReschedule = () => {
    if (!isOnline) {
      triggerToast("E001: Mobile not connected to internet", "error");
      return;
    }

    // Customer accepts the reschedule offer
    localStorage.setItem("confirmed_date_time", proposedTime);
    
    // Log approval
    logSystemAction("RESCHEDULE_CONFIRM", "appointment", {
      customerId: customer?.Customer_id,
      acceptedTime: proposedTime,
      message: "Customer accepted reschedule offer."
    });

    triggerToast("MSG03: You have successfully placed the order regarding your appointment", "success");

    setTimeout(() => {
      // Go to status screen
      navigate("/status");
    }, 1500);
  };

  const handleCheckPatientMobile = () => {
    if (!clinicMobile.trim() || clinicMobile.length !== 10) {
      triggerToast("Please enter a valid 10-digit mobile number.", "error");
      return;
    }

    // Check if mobile number exists in patients for this branch
    const patientsList = getCollection("patients");
    const match = patientsList.find(
      p => p.mobile_number === clinicMobile && p.branch_id === (branch?.branchId || "branch_01")
    );

    if (match) {
      setIsPatientRegistered(true);
      triggerToast(`Patient record found! Welcome back, ${match.name}.`, "success");
      // Populate patient details
      setPatientForm(prev => ({
        ...prev,
        name: match.name,
        dob: match.dob,
        gender: match.gender
      }));
    } else {
      setIsPatientRegistered(false);
      triggerToast("No patient record found for this branch. Please fill registration details.", "info");
    }
  };

  const handleRegisterPatient = () => {
    if (!isOnline) {
      triggerToast("E001: Mobile not connected to internet", "error");
      return;
    }

    const { salutation, name, dob, gender, symptoms, doctorId } = patientForm;

    if (!name.trim() || !dob || !doctorId) {
      triggerToast("Please fill all required patient registration details.", "error");
      return;
    }

    const patientName = `${salutation} ${name.trim()}`;

    // 1. Insert patient
    const newPatient = insertDoc("patients", {
      clinic_id: branch?.Clinic_id || "clinic_01",
      branch_id: branch?.branchId || "branch_01",
      name: patientName,
      dob,
      gender,
      mobile_number: clinicMobile,
      status: "AA"
    });

    // Generate token number
    const tokenNumber = Math.floor(1 + Math.random() * 100);

    // 2. Insert appointment
    insertDoc("appointments", {
      patient_id: newPatient.patient_id,
      Doctor_ID: doctorId,
      token_number: tokenNumber,
      symptoms,
      Appoint_date: proposedTime,
      status: "SC" // Scheduled
    });

    triggerToast(`Patient registration successful! Token: #${tokenNumber}. MSG03: You have successfully placed the order regarding your appointment`, "success");

    setIsPatientRegistered(true);

    setTimeout(() => {
      navigate("/status");
    }, 2000);
  };

  return (
    <div className="animate-fade-in" style={{ display: "grid", gridTemplateColumns: "1fr", gap: "2rem" }}>
      {/* Reschedule Offer Box */}
      <div className="glass-card" style={{ borderLeft: "4px solid var(--warning)" }}>
        <h2 style={{ fontSize: "1.6rem", marginBottom: "1rem", display: "flex", alignItems: "center", gap: "0.5rem" }}>
          <AlertTriangle style={{ color: "var(--warning)" }} /> Stylist Reschedule Offer
        </h2>
        <p style={{ color: "var(--text-secondary)", marginBottom: "1.5rem", lineHeight: "1.6" }}>
          Your preferred stylist has sent an alternative schedule suggestion because they have another client during your preferred time.
        </p>

        <div style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: "1rem",
          background: "rgba(0,0,0,0.15)",
          border: "1px solid var(--border-color)",
          borderRadius: "10px",
          padding: "1.25rem",
          marginBottom: "1.5rem"
        }}>
          <div>
            <div style={{ fontSize: "0.75rem", textTransform: "uppercase", color: "var(--text-muted)", fontWeight: "600" }}>Your Requested Time</div>
            <div style={{ fontSize: "1rem", fontWeight: "700", marginTop: "0.25rem", textDecoration: "line-through", color: "var(--text-secondary)" }}>
              {confirmedTime}
            </div>
          </div>
          <div>
            <div style={{ fontSize: "0.75rem", textTransform: "uppercase", color: "var(--accent-color)", fontWeight: "600" }}>Stylist Proposing</div>
            <div style={{ fontSize: "1.1rem", fontWeight: "800", marginTop: "0.25rem", color: "var(--accent-color)" }}>
              {proposedTime}
            </div>
          </div>
        </div>

        <div style={{ display: "flex", gap: "0.75rem" }}>
          <button
            onClick={() => navigate("/cart")}
            className="btn btn-secondary"
            style={{ display: "flex", gap: "0.3rem", alignItems: "center" }}
          >
            <MessageCircle size={16} /> Decline & Chat
          </button>
          <button
            onClick={handleConfirmReschedule}
            className="btn btn-primary"
            style={{ flex: 1, display: "flex", gap: "0.3rem", alignItems: "center", justifyContent: "center" }}
          >
            <Check size={18} /> Confirm New Offer
          </button>
        </div>
      </div>

      {/* Patient / Clinic Flow Section */}
      <div className="glass-card">
        <h2 style={{ fontSize: "1.6rem", marginBottom: "0.5rem" }}>Clinic Patient Verification</h2>
        <p style={{ color: "var(--text-secondary)", fontSize: "0.9rem", marginBottom: "1.5rem" }}>
          Verify if you are already registered as a clinical patient at <strong>{branch?.name || "Acne Clinic"}</strong>.
        </p>

        {/* Enter mobile */}
        <div style={{
          display: "flex",
          gap: "0.75rem",
          alignItems: "flex-end",
          marginBottom: "1.5rem"
        }}>
          <div className="form-group" style={{ flex: 1, marginBottom: 0 }}>
            <label className="form-label">Patient Mobile Number</label>
            <input
              type="text"
              maxLength={10}
              className="form-control"
              placeholder="e.g. 9867543456"
              value={clinicMobile}
              onChange={(e) => setClinicMobile(e.target.value.replace(/\D/g, ""))}
            />
          </div>
          <button onClick={handleCheckPatientMobile} className="btn btn-primary" style={{ height: "2.8rem" }}>
            <Search size={16} /> Verify
          </button>
        </div>

        {/* Not registered - Patient form fields */}
        {isPatientRegistered === false && (
          <div className="animate-slide-in" style={{
            borderTop: "1.5px solid var(--border-color)",
            paddingTop: "1.5rem",
            marginTop: "1.5rem"
          }}>
            <h3 style={{ fontSize: "1.1rem", marginBottom: "1rem", color: "var(--warning)", display: "flex", alignItems: "center", gap: "0.3rem" }}>
              <UserPlus size={16} /> Patient Account Registration
            </h3>
            
            <div style={{ display: "grid", gridTemplateColumns: "100px 1fr", gap: "0.75rem", marginBottom: "1rem" }}>
              <div className="form-group">
                <label className="form-label">Title</label>
                <select
                  value={patientForm.salutation}
                  onChange={(e) => setPatientForm(prev => ({ ...prev, salutation: e.target.value }))}
                  className="form-control"
                  style={{ appearance: "auto" }}
                >
                  {SALUTATIONS.map((sal, i) => (
                    <option key={i} value={sal}>{sal}</option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Patient Full Name</label>
                <input
                  type="text"
                  className="form-control"
                  placeholder="e.g. Rachana"
                  value={patientForm.name}
                  onChange={(e) => setPatientForm(prev => ({ ...prev, name: e.target.value }))}
                />
              </div>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem", marginBottom: "1rem" }}>
              <div className="form-group">
                <label className="form-label">Date of Birth</label>
                <input
                  type="date"
                  className="form-control"
                  value={patientForm.dob}
                  onChange={(e) => setPatientForm(prev => ({ ...prev, dob: e.target.value }))}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Gender</label>
                <select
                  value={patientForm.gender}
                  onChange={(e) => setPatientForm(prev => ({ ...prev, gender: e.target.value }))}
                  className="form-control"
                  style={{ appearance: "auto" }}
                >
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                  <option value="other">Other</option>
                </select>
              </div>
            </div>

            <div className="form-group" style={{ marginBottom: "1rem" }}>
              <label className="form-label">Select Doctor</label>
              <select
                value={patientForm.doctorId}
                onChange={(e) => setPatientForm(prev => ({ ...prev, doctorId: e.target.value }))}
                className="form-control"
                style={{ appearance: "auto" }}
              >
                {doctors.map(doc => (
                  <option key={doc.StaffId} value={doc.StaffId}>
                    {doc.name} - {doc.qualification} ({doc.specializationId[0]})
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group" style={{ marginBottom: "1.5rem" }}>
              <label className="form-label">Describe Symptoms</label>
              <textarea
                className="form-control"
                rows={2}
                placeholder="e.g. Skin rashes, hair loss..."
                value={patientForm.symptoms}
                onChange={(e) => setPatientForm(prev => ({ ...prev, symptoms: e.target.value }))}
                style={{ resize: "none" }}
              />
            </div>

            <button onClick={handleRegisterPatient} className="btn btn-primary" style={{ width: "100%" }}>
              Register Patient & Schedule appointment
            </button>
          </div>
        )}

        {isPatientRegistered === true && (
          <div className="animate-slide-in" style={{
            background: "rgba(16, 185, 129, 0.05)",
            border: "1px solid var(--success)",
            borderRadius: "10px",
            padding: "1rem",
            marginTop: "1rem",
            display: "flex",
            alignItems: "center",
            gap: "0.75rem",
            color: "var(--success)"
          }}>
            <Check size={20} />
            <div>
              <div style={{ fontWeight: "700" }}>Verified Patient details</div>
              <div style={{ fontSize: "0.85rem", color: "var(--text-secondary)", marginTop: "0.1rem" }}>
                Patient: {patientForm.name} | Mobile: {clinicMobile}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
