import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowRight, Scissors, Sparkles, Smile, Check } from "lucide-react";
import { insertDoc, getDoc, queryDocs, saveCollection } from "../mockDb";

const SUB_CATEGORIES_MAP = {
  Men: [
    { id: "hair_care", name: "Hair care", desc: "Styling, cuts & washes" },
    { id: "body_care", name: "Body care", desc: "Spa, grooming & detailing" }
  ],
  Women: [
    { id: "hair_care", name: "Hair care", desc: "Coloring, cuts & treatments" },
    { id: "body_care", name: "Body care", desc: "Massage, waxing & therapy" }
  ],
  Child: [
    { id: "hair_care", name: "Hair care", desc: "Kid-friendly hair trims" },
    { id: "body_care", name: "Body care", desc: "Soothing washes & care" }
  ]
};

export default function Home({ triggerToast, isOnline }) {
  const navigate = useNavigate();
  const [mainCategory, setMainCategory] = useState("");
  const [selectedSubcategories, setSelectedSubcategories] = useState([]);
  const [customerId, setCustomerId] = useState("");

  useEffect(() => {
    let cid = localStorage.getItem("current_customer_id");
    if (!cid) {
      // Create a temporary customer ID for the session if not logged in
      cid = "temp_" + Math.random().toString(36).substring(2, 11);
      localStorage.setItem("current_customer_id", cid);
    }
    setCustomerId(cid);
  }, [navigate, triggerToast]);

  const handleSelectMain = (category) => {
    setMainCategory(category);
    setSelectedSubcategories([]); // Reset subcategories
  };

  const handleToggleSubcategory = (subId) => {
    if (selectedSubcategories.includes(subId)) {
      setSelectedSubcategories(selectedSubcategories.filter(id => id !== subId));
    } else {
      setSelectedSubcategories([...selectedSubcategories, subId]);
    }
  };

  const handleContinue = () => {
    if (!isOnline) {
      triggerToast("E001: Mobile not connected to internet", "error");
      return;
    }

    if (!mainCategory) {
      triggerToast("Please select a main category (Men, Women, or Child) first.", "error");
      return;
    }

    if (selectedSubcategories.length === 0) {
      triggerToast("E002: You should select at least one sub category", "error");
      return;
    }

    // Convert list of subcategory IDs to readable names
    const subNames = selectedSubcategories
      .map(id => SUB_CATEGORIES_MAP[mainCategory].find(s => s.id === id).name)
      .join(", ");

    // Get current customer details
    const customer = getDoc("customer", customerId, "Customer_id") || {};

    // Store Category selection in appointment database
    // We check if an appointment document already exists for this customer. If so, update it. If not, insert it.
    const existingAppointments = queryDocs("appointment", (app) => app.Customer_id === customerId);

    if (existingAppointments.length > 0) {
      const appId = existingAppointments[0].id;
      localStorage.setItem("current_appointment_id", appId);
      
      // Update appointment collection
      const list = JSON.parse(localStorage.getItem("db_appointment") || "[]");
      const updatedList = list.map((item) => {
        if (item.id === appId) {
          return {
            ...item,
            "Main category": mainCategory,
            "Sub category": subNames,
            status: "AA",
            Modified_at: new Date().toISOString(),
            Modified_by: customer.Name || "customer"
          };
        }
        return item;
      });
      saveCollection("appointment", updatedList);
    } else {
      const newApp = insertDoc("appointment", {
        Customer_id: customerId,
        "Main category": mainCategory,
        "Sub category": subNames,
        Created_by: customer.Name || "customer",
        status: "AA" // Active
      });
      localStorage.setItem("current_appointment_id", newApp.id);
    }

    triggerToast("MSG01: you have successfully selected the main and sub category.", "success");

    setTimeout(() => {
      navigate("/stylists");
    }, 1200);
  };

  return (
    <div className="animate-fade-in">
      <div style={{ textAlign: "center", marginBottom: "3rem" }}>
        <h1 style={{ fontSize: "2.5rem", marginBottom: "0.5rem" }}>
          Select <span className="text-gradient">Categories</span>
        </h1>
        <p style={{ color: "var(--text-secondary)", fontSize: "1.1rem" }}>
          Choose your service targets to browse matching professionals.
        </p>
      </div>

      <div style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
        gap: "1.5rem",
        marginBottom: "3rem"
      }}>
        {/* Men Category */}
        <div
          onClick={() => handleSelectMain("Men")}
          className="glass-card"
          style={{
            cursor: "pointer",
            borderWidth: mainCategory === "Men" ? "2px" : "1px",
            borderColor: mainCategory === "Men" ? "var(--accent-color)" : "var(--border-color)",
            background: mainCategory === "Men" ? "rgba(255, 92, 0, 0.04)" : "rgba(18, 22, 31, 0.65)",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            padding: "2rem",
            transform: mainCategory === "Men" ? "scale(1.02)" : "scale(1)",
            transition: "all 0.2s ease"
          }}
        >
          <div style={{
            background: "rgba(255, 92, 0, 0.1)",
            padding: "1rem",
            borderRadius: "50%",
            color: "var(--accent-color)",
            marginBottom: "1rem"
          }}>
            <Scissors size={28} />
          </div>
          <h3>Men</h3>
          <p style={{ color: "var(--text-secondary)", fontSize: "0.9rem", marginTop: "0.5rem", textAlign: "center" }}>
            Haircuts, beard styling, and masculine grooming
          </p>
        </div>

        {/* Women Category */}
        <div
          onClick={() => handleSelectMain("Women")}
          className="glass-card"
          style={{
            cursor: "pointer",
            borderWidth: mainCategory === "Women" ? "2px" : "1px",
            borderColor: mainCategory === "Women" ? "var(--accent-color)" : "var(--border-color)",
            background: mainCategory === "Women" ? "rgba(255, 92, 0, 0.04)" : "rgba(18, 22, 31, 0.65)",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            padding: "2rem",
            transform: mainCategory === "Women" ? "scale(1.02)" : "scale(1)",
            transition: "all 0.2s ease"
          }}
        >
          <div style={{
            background: "rgba(255, 92, 0, 0.1)",
            padding: "1rem",
            borderRadius: "50%",
            color: "var(--accent-color)",
            marginBottom: "1rem"
          }}>
            <Sparkles size={28} />
          </div>
          <h3>Women</h3>
          <p style={{ color: "var(--text-secondary)", fontSize: "0.9rem", marginTop: "0.5rem", textAlign: "center" }}>
            Cuts, advanced coloring, styling, and makeup
          </p>
        </div>

        {/* Child Category */}
        <div
          onClick={() => handleSelectMain("Child")}
          className="glass-card"
          style={{
            cursor: "pointer",
            borderWidth: mainCategory === "Child" ? "2px" : "1px",
            borderColor: mainCategory === "Child" ? "var(--accent-color)" : "var(--border-color)",
            background: mainCategory === "Child" ? "rgba(255, 92, 0, 0.04)" : "rgba(18, 22, 31, 0.65)",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            padding: "2rem",
            transform: mainCategory === "Child" ? "scale(1.02)" : "scale(1)",
            transition: "all 0.2s ease"
          }}
        >
          <div style={{
            background: "rgba(255, 92, 0, 0.1)",
            padding: "1rem",
            borderRadius: "50%",
            color: "var(--accent-color)",
            marginBottom: "1rem"
          }}>
            <Smile size={28} />
          </div>
          <h3>Child</h3>
          <p style={{ color: "var(--text-secondary)", fontSize: "0.9rem", marginTop: "0.5rem", textAlign: "center" }}>
            Kid-friendly styles and haircuts in a warm environment
          </p>
        </div>
      </div>

      {mainCategory && (
        <div className="glass-card animate-slide-in" style={{ marginBottom: "2rem" }}>
          <h3 style={{ marginBottom: "1.5rem", display: "flex", alignItems: "center", gap: "0.5rem" }}>
            Select Subcategories for {mainCategory}
          </h3>

          <div style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
            gap: "1rem",
            marginBottom: "2rem"
          }}>
            {SUB_CATEGORIES_MAP[mainCategory].map((sub) => {
              const isSelected = selectedSubcategories.includes(sub.id);
              return (
                <div
                  key={sub.id}
                  onClick={() => handleToggleSubcategory(sub.id)}
                  style={{
                    padding: "1.25rem",
                    borderRadius: "10px",
                    border: isSelected ? "1px solid var(--accent-color)" : "1px solid var(--border-color)",
                    background: isSelected ? "rgba(255, 92, 0, 0.06)" : "rgba(255, 255, 255, 0.02)",
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    transition: "all 0.15s ease"
                  }}
                >
                  <div>
                    <h4 style={{ fontSize: "0.95rem" }}>{sub.name}</h4>
                    <p style={{ fontSize: "0.8rem", color: "var(--text-secondary)", marginTop: "0.25rem" }}>{sub.desc}</p>
                  </div>
                  <div style={{
                    width: "20px",
                    height: "20px",
                    borderRadius: "4px",
                    border: "1px solid var(--border-color)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    background: isSelected ? "var(--accent-color)" : "transparent",
                    borderColor: isSelected ? "var(--accent-color)" : "var(--text-muted)",
                    color: "#ffffff"
                  }}>
                    {isSelected && <Check size={14} />}
                  </div>
                </div>
              );
            })}
          </div>

          <div style={{ display: "flex", justifyContent: "flex-end" }}>
            <button onClick={handleContinue} className="btn btn-primary" style={{ padding: "0.75rem 2rem" }}>
              Continue to Stylists <ArrowRight size={18} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
