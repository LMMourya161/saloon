import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Star, Award, Image as ImageIcon, MapPin, Briefcase, Eye, ChevronRight } from "lucide-react";
import { getCollection, getDoc, updateDoc, logSystemAction } from "../mockDb";

export default function Stylists({ triggerToast, isOnline }) {
  const navigate = useNavigate();
  const [stylists, setStylists] = useState([]);
  const [branches, setBranches] = useState([]);
  const [selectedBranchId, setSelectedBranchId] = useState("");
  const [selectedStylist, setSelectedStylist] = useState(null);
  const [activeTab, setActiveTab] = useState("about"); // about, certifications, gallery
  const [customerId, setCustomerId] = useState("");
  const [appointmentId, setAppointmentId] = useState("");

  useEffect(() => {
    let cid = localStorage.getItem("current_customer_id");
    const aid = localStorage.getItem("current_appointment_id");
    if (!cid) {
      // Create a temporary customer ID for the session if not logged in
      cid = "temp_" + Math.random().toString(36).substring(2, 11);
      localStorage.setItem("current_customer_id", cid);
    }
    setCustomerId(cid);
    setAppointmentId(aid);

    // Fetch active branches and staffs
    const activeBranches = getCollection("branches").filter(b => b.Status === "AA");
    setBranches(activeBranches);

    // Default to the first branch if available
    if (activeBranches.length > 0) {
      setSelectedBranchId(activeBranches[0].branchId);
    }
  }, [navigate, triggerToast]);

  // Fetch stylists based on selected branch and active status (AA)
  useEffect(() => {
    if (selectedBranchId) {
      const activeStaff = getCollection("staffs").filter(
        (s) => s.branchId === selectedBranchId && s.status === "AA"
      );
      // Sort stylists by rating (highest first)
      const sortedStaff = activeStaff.sort((a, b) => b.rating - a.rating);
      setStylists(sortedStaff);
      
      logSystemAction("FETCH", "staffs", {
        message: `Fetched stylists list for branch ${selectedBranchId} sorted by rating.`,
        count: sortedStaff.length
      });
    }
  }, [selectedBranchId]);

  const handleSelectStylist = (stylist) => {
    if (!isOnline) {
      triggerToast("E001: Mobile not connected to internet", "error");
      return;
    }

    const branch = getDoc("branches", selectedBranchId, "branchId") || {};
    const customer = getDoc("customer", customerId, "Customer_id") || {};

    // Update appointment collection with selected stylist and branch location master IDs
    if (appointmentId) {
      updateDoc("appointment", appointmentId, {
        Stylist_id: stylist.StaffId,
        CityId: branch.cityId || "city_bangalore",
        areaId: branch.areaId || "area_koramangala",
        StateId: branch.stateId || "state_karnataka",
        Modified_by: customer.Name || "customer",
        status: "AA" // Active
      });
    }

    triggerToast(`Selected Stylist: ${stylist.name} successfully!`, "success");

    localStorage.setItem("current_stylist_id", stylist.StaffId);
    localStorage.setItem("current_branch_id", selectedBranchId);

    setTimeout(() => {
      navigate("/cart");
    }, 1200);
  };

  const openDetails = (stylist) => {
    setSelectedStylist(stylist);
    setActiveTab("about");
  };

  const closeDetails = () => {
    setSelectedStylist(null);
  };

  return (
    <div className="animate-fade-in">
      <div style={{ textAlign: "center", marginBottom: "3rem" }}>
        <h1 style={{ fontSize: "2.5rem", marginBottom: "0.5rem" }}>
          Choose your <span className="text-gradient">Stylist</span>
        </h1>
        <p style={{ color: "var(--text-secondary)", fontSize: "1.1rem" }}>
          Select from our highly rated and certified styling professionals.
        </p>
      </div>

      {/* Branch selector */}
      <div style={{ display: "flex", justifyContent: "center", marginBottom: "2rem" }}>
        <div className="glass-card" style={{ display: "flex", alignItems: "center", gap: "0.75rem", padding: "0.75rem 1.5rem" }}>
          <MapPin size={18} style={{ color: "var(--accent-color)" }} />
          <span style={{ fontWeight: "600", fontSize: "0.95rem" }}>Select Salon Branch:</span>
          <select
            value={selectedBranchId}
            onChange={(e) => setSelectedBranchId(e.target.value)}
            className="form-control"
            style={{ width: "250px", padding: "0.4rem 0.75rem", fontSize: "0.9rem", background: "rgba(0,0,0,0.2)" }}
          >
            {branches.map(b => (
              <option key={b.branchId} value={b.branchId}>{b.name}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Stylist Grid */}
      <div style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))",
        gap: "1.5rem"
      }}>
        {stylists.length === 0 ? (
          <div style={{ gridColumn: "1/-1", textAlign: "center", padding: "3rem" }} className="glass-card">
            <p style={{ color: "var(--text-secondary)" }}>No active stylists found for this branch.</p>
          </div>
        ) : (
          stylists.map((stylist) => (
            <div key={stylist.StaffId} className="glass-card" style={{ padding: "1.5rem", display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
              <div style={{ display: "flex", gap: "1.25rem", alignItems: "flex-start", marginBottom: "1.5rem" }}>
                <img
                  src={stylist.photo}
                  alt={stylist.name}
                  style={{
                    width: "80px",
                    height: "80px",
                    borderRadius: "12px",
                    objectFit: "cover",
                    border: "1.5px solid var(--border-color)"
                  }}
                />
                <div style={{ flex: 1 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <h3 style={{ fontSize: "1.15rem" }}>{stylist.name}</h3>
                    <div style={{ display: "flex", alignItems: "center", gap: "0.2rem", color: "var(--warning)" }}>
                      <Star size={14} fill="currentColor" />
                      <span style={{ fontSize: "0.85rem", fontWeight: "700" }}>{stylist.rating}</span>
                    </div>
                  </div>
                  <p style={{ fontSize: "0.875rem", color: "var(--accent-color)", fontWeight: "500", marginTop: "0.25rem" }}>
                    {stylist.qualification}
                  </p>
                  <p style={{ fontSize: "0.8rem", color: "var(--text-secondary)", marginTop: "0.4rem", display: "flex", alignItems: "center", gap: "0.3rem" }}>
                    <Briefcase size={12} /> {stylist.years_of_experience} Years Experience
                  </p>
                </div>
              </div>

              <div>
                <p style={{ fontSize: "0.85rem", color: "var(--text-secondary)", marginBottom: "1.25rem" }}>
                  <strong>Specialization:</strong> {stylist.specializationId.join(", ")}
                </p>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.75rem" }}>
                  <button
                    onClick={() => openDetails(stylist)}
                    className="btn btn-secondary"
                    style={{ fontSize: "0.85rem", padding: "0.5rem" }}
                  >
                    <Eye size={14} /> View Details
                  </button>
                  <button
                    onClick={() => handleSelectStylist(stylist)}
                    className="btn btn-primary"
                    style={{ fontSize: "0.85rem", padding: "0.5rem" }}
                  >
                    Choose Stylist <ChevronRight size={14} />
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Stylist Details Modal (View more, Certifications, Professional Gallery) */}
      {selectedStylist && (
        <div className="modal-overlay" onClick={closeDetails}>
          <div className="modal-content" style={{ maxWidth: "600px" }} onClick={(e) => e.stopPropagation()}>
            <div style={{ position: "relative" }}>
              <img
                src={selectedStylist.photo}
                alt={selectedStylist.name}
                style={{ width: "100%", height: "250px", objectFit: "cover" }}
              />
              <div style={{
                position: "absolute",
                bottom: 0,
                left: 0,
                right: 0,
                background: "linear-gradient(to top, rgba(18,22,31,1) 0%, rgba(18,22,31,0.4) 60%, rgba(0,0,0,0) 100%)",
                padding: "1.5rem",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "flex-end"
              }}>
                <div>
                  <h2 style={{ fontSize: "1.8rem", marginBottom: "0.25rem" }}>{selectedStylist.name}</h2>
                  <p style={{ color: "var(--accent-color)", fontWeight: "600" }}>{selectedStylist.qualification}</p>
                </div>
                <div style={{
                  background: "rgba(0,0,0,0.6)",
                  padding: "0.4rem 0.8rem",
                  borderRadius: "20px",
                  display: "flex",
                  alignItems: "center",
                  gap: "0.25rem",
                  color: "var(--warning)",
                  border: "1px solid var(--border-color)"
                }}>
                  <Star size={16} fill="currentColor" />
                  <span style={{ fontWeight: "700", fontSize: "0.9rem" }}>{selectedStylist.rating}</span>
                </div>
              </div>
            </div>

            {/* Modal Navigation Tabs */}
            <div style={{
              display: "flex",
              borderBottom: "1px solid var(--border-color)",
              background: "rgba(255,255,255,0.02)"
            }}>
              <button
                onClick={() => setActiveTab("about")}
                style={{
                  flex: 1,
                  padding: "1rem",
                  border: "none",
                  background: "none",
                  color: activeTab === "about" ? "var(--accent-color)" : "var(--text-secondary)",
                  borderBottom: activeTab === "about" ? "2px solid var(--accent-color)" : "none",
                  fontWeight: "600",
                  cursor: "pointer"
                }}
              >
                About
              </button>
              <button
                onClick={() => setActiveTab("certifications")}
                style={{
                  flex: 1,
                  padding: "1rem",
                  border: "none",
                  background: "none",
                  color: activeTab === "certifications" ? "var(--accent-color)" : "var(--text-secondary)",
                  borderBottom: activeTab === "certifications" ? "2px solid var(--accent-color)" : "none",
                  fontWeight: "600",
                  cursor: "pointer"
                }}
              >
                <Award size={14} style={{ marginRight: "0.25rem", display: "inline" }} /> Certifications
              </button>
              <button
                onClick={() => setActiveTab("gallery")}
                style={{
                  flex: 1,
                  padding: "1rem",
                  border: "none",
                  background: "none",
                  color: activeTab === "gallery" ? "var(--accent-color)" : "var(--text-secondary)",
                  borderBottom: activeTab === "gallery" ? "2px solid var(--accent-color)" : "none",
                  fontWeight: "600",
                  cursor: "pointer"
                }}
              >
                <ImageIcon size={14} style={{ marginRight: "0.25rem", display: "inline" }} /> Work Gallery
              </button>
            </div>

            {/* Modal Tab Content */}
            <div style={{ padding: "1.5rem", maxHeight: "300px", overflowY: "auto" }}>
              {activeTab === "about" && (
                <div className="animate-fade-in">
                  <p style={{ color: "var(--text-secondary)", fontSize: "0.95rem", lineHeight: "1.6" }}>
                    {selectedStylist.name} is an expert specialist at our Koramangala branch, boasting {selectedStylist.years_of_experience} years of hands-on experience in high-quality style makeovers and hair care solutions.
                  </p>
                  <div style={{ marginTop: "1rem" }}>
                    <h4 style={{ fontSize: "0.9rem", color: "var(--text-secondary)", marginBottom: "0.5rem" }}>Specialities:</h4>
                    <div style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem" }}>
                      {selectedStylist.specializationId.map((spec, i) => (
                        <span key={i} className="badge badge-accent">{spec}</span>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {activeTab === "certifications" && (
                <div className="animate-fade-in">
                  <ul style={{ listStyle: "none", display: "flex", flexDirection: "column", gap: "0.75rem" }}>
                    {selectedStylist.certifications.map((cert, i) => (
                      <li key={i} style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "0.75rem",
                        padding: "0.75rem",
                        borderRadius: "8px",
                        background: "rgba(255,255,255,0.02)",
                        border: "1px solid var(--border-color)"
                      }}>
                        <Award size={18} style={{ color: "var(--accent-color)" }} />
                        <span style={{ fontSize: "0.9rem", fontWeight: "500" }}>{cert}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {activeTab === "gallery" && (
                <div className="animate-fade-in" style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(3, 1fr)",
                  gap: "0.5rem"
                }}>
                  {selectedStylist.gallery.map((imgUrl, i) => (
                    <img
                      key={i}
                      src={imgUrl}
                      alt="Work sample"
                      style={{
                        width: "100%",
                        height: "100px",
                        objectFit: "cover",
                        borderRadius: "8px",
                        border: "1px solid var(--border-color)"
                      }}
                    />
                  ))}
                </div>
              )}
            </div>

            <div style={{ padding: "1.25rem 1.5rem", borderTop: "1px solid var(--border-color)", display: "flex", justifySelf: "stretch", justifyContent: "space-between", gap: "1rem" }}>
              <button onClick={closeDetails} className="btn btn-secondary" style={{ flex: 1 }}>
                Close
              </button>
              <button
                onClick={() => {
                  handleSelectStylist(selectedStylist);
                  closeDetails();
                }}
                className="btn btn-primary"
                style={{ flex: 1 }}
              >
                Choose Stylist
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
