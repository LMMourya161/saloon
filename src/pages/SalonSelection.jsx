import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  MapPin, Phone, Clock, Check, ChevronRight, Building2,
  Navigation, ArrowLeft, Store
} from "lucide-react";
import { getCollection, logSystemAction } from "../mockDb";

// Mock distances for each branch
const BRANCH_DISTANCES = {
  branch_01: "1.2 km",
  branch_02: "3.7 km"
};

export default function SalonSelection({ triggerToast, isOnline }) {
  const navigate = useNavigate();
  const [branches, setBranches] = useState([]);
  const [selectedBranchId, setSelectedBranchId] = useState(
    localStorage.getItem("current_branch_id") || ""
  );

  useEffect(() => {
    const activeBranches = getCollection("branches").filter(b => b.Status === "AA");
    setBranches(activeBranches);
  }, []);

  const handleSelect = (branch) => {
    if (!isOnline) {
      triggerToast("E001: Mobile not connected to internet", "error");
      return;
    }
    setSelectedBranchId(branch.branchId);
    localStorage.setItem("current_branch_id", branch.branchId);

    logSystemAction("SELECT_BRANCH", "branches", {
      branchId: branch.branchId,
      name: branch.name,
      message: "Customer selected salon branch."
    });

    triggerToast(`Selected: ${branch.name}`, "success");

    setTimeout(() => navigate("/stylists"), 900);
  };

  const formatArea = (areaId = "") =>
    areaId.replace("area_", "").replace(/_/g, " ").replace(/\b\w/g, l => l.toUpperCase());

  const formatCity = (cityId = "") =>
    cityId.replace("city_", "").replace(/\b\w/g, l => l.toUpperCase());

  return (
    <div className="animate-fade-in">
      {/* Header */}
      <div style={{ textAlign: "center", marginBottom: "3rem" }}>
        <div style={{
          display: "inline-flex",
          background: "rgba(255,92,0,0.10)",
          color: "var(--accent-color)",
          padding: "1.25rem",
          borderRadius: "50%",
          marginBottom: "1rem"
        }}>
          <Store size={40} />
        </div>
        <h1 style={{ fontSize: "2.2rem", marginBottom: "0.5rem" }}>
          Choose a <span className="text-gradient">Salon</span>
        </h1>
        <p style={{ color: "var(--text-secondary)", fontSize: "1rem" }}>
          Select a nearby branch to find your stylist.
        </p>
      </div>

      {/* Branch Cards */}
      <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem", maxWidth: "720px", margin: "0 auto" }}>
        {branches.length === 0 ? (
          <div className="glass-card" style={{ textAlign: "center", padding: "3rem" }}>
            <p style={{ color: "var(--text-secondary)" }}>No active salons found.</p>
          </div>
        ) : (
          branches.map((branch) => {
            const isSelected = selectedBranchId === branch.branchId;
            const distance = BRANCH_DISTANCES[branch.branchId] || "Nearby";

            return (
              <div
                key={branch.branchId}
                className="glass-card"
                style={{
                  border: isSelected ? "2px solid var(--accent-color)" : "1px solid var(--border-color)",
                  background: isSelected ? "rgba(255,92,0,0.04)" : "rgba(18,22,31,0.65)",
                  transition: "all 0.2s ease",
                  cursor: "pointer"
                }}
                onClick={() => handleSelect(branch)}
              >
                <div style={{ display: "flex", gap: "1rem", alignItems: "flex-start" }}>
                  {/* Icon */}
                  <div style={{
                    background: isSelected ? "rgba(255,92,0,0.12)" : "rgba(255,255,255,0.04)",
                    border: "1px solid var(--border-color)",
                    borderRadius: "12px",
                    width: "56px",
                    height: "56px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    flexShrink: 0,
                    color: isSelected ? "var(--accent-color)" : "var(--text-secondary)"
                  }}>
                    <Building2 size={24} />
                  </div>

                  {/* Info */}
                  <div style={{ flex: 1 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "0.5rem" }}>
                      <h3 style={{ fontSize: "1.1rem", marginBottom: "0.3rem" }}>{branch.name}</h3>
                      {isSelected && (
                        <span style={{
                          background: "var(--accent-color)",
                          color: "#fff",
                          fontSize: "0.72rem",
                          fontWeight: "700",
                          padding: "0.2rem 0.6rem",
                          borderRadius: "20px",
                          flexShrink: 0
                        }}>Selected</span>
                      )}
                    </div>

                    <p style={{ fontSize: "0.85rem", color: "var(--text-secondary)", marginBottom: "0.75rem", lineHeight: "1.5" }}>
                      {branch.About_branch}
                    </p>

                    {/* Meta row */}
                    <div style={{ display: "flex", flexWrap: "wrap", gap: "1rem", fontSize: "0.82rem", color: "var(--text-muted)" }}>
                      <span style={{ display: "flex", alignItems: "center", gap: "0.35rem" }}>
                        <MapPin size={13} style={{ color: "var(--accent-color)" }} />
                        {formatArea(branch.areaId)}, {formatCity(branch.cityId)}
                      </span>
                      <span style={{ display: "flex", alignItems: "center", gap: "0.35rem" }}>
                        <Phone size={13} style={{ color: "var(--accent-color)" }} />
                        {branch.Mobile_Number}
                      </span>
                      <span style={{ display: "flex", alignItems: "center", gap: "0.35rem" }}>
                        <Clock size={13} style={{ color: "var(--accent-color)" }} />
                        {branch.Timings_from} – {branch.Timings_to}
                      </span>
                      <span style={{ display: "flex", alignItems: "center", gap: "0.35rem" }}>
                        <Navigation size={13} style={{ color: "var(--success)" }} />
                        {distance} away
                      </span>
                    </div>
                  </div>

                  {/* Arrow / Check */}
                  <div style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    width: "36px",
                    height: "36px",
                    borderRadius: "50%",
                    flexShrink: 0,
                    marginTop: "0.5rem",
                    background: isSelected ? "var(--accent-color)" : "rgba(255,255,255,0.04)",
                    border: "1px solid var(--border-color)",
                    color: isSelected ? "#fff" : "var(--text-secondary)"
                  }}>
                    {isSelected ? <Check size={18} /> : <ChevronRight size={18} />}
                  </div>
                </div>

                {/* Select Button */}
                <div style={{ marginTop: "1.25rem", display: "flex", justifyContent: "flex-end" }}>
                  <button
                    onClick={(e) => { e.stopPropagation(); handleSelect(branch); }}
                    className={isSelected ? "btn btn-secondary" : "btn btn-primary"}
                    style={{ padding: "0.55rem 1.5rem", fontSize: "0.88rem", display: "flex", alignItems: "center", gap: "0.4rem" }}
                  >
                    {isSelected ? <><Check size={15} /> Selected</> : <>Select Salon <ChevronRight size={15} /></>}
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Back button */}
      <div style={{ display: "flex", justifyContent: "center", marginTop: "2.5rem" }}>
        <button onClick={() => navigate(-1)} className="btn btn-secondary" style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
          <ArrowLeft size={16} /> Go Back
        </button>
      </div>
    </div>
  );
}
