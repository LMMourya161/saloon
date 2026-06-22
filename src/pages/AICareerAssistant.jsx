import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import professionKB from "../data/professionKB.json";
import { applyRules } from "../utils/ruleEngine";
import { getRecommendation } from "../utils/llmStub";

export default function AICareerAssistant({ triggerToast, isOnline }) {
  const navigate = useNavigate();
  const categories = Object.keys(professionKB);
  const [category, setCategory] = useState(categories[0]);
  const [recommendations, setRecommendations] = useState([]);
  const [avoid, setAvoid] = useState([]);
const [showResult, setShowResult] = useState(false);

  useEffect(() => {
    const kb = professionKB[category];
    // Apply simple rule engine (tag not used in stub, but kept for future)
    const tag = applyRules(category);
    // Get recommendation (stubbed LLM)
    const rec = getRecommendation(category, tag);
    setRecommendations(kb.preferred || rec);
    setAvoid(kb.avoid || []);
  }, [category]);

  return (
    <div className="animate-fade-in" style={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "80vh" }}>
      <div className="glass-card" style={{ padding: "2rem 1.5rem", maxWidth: "500px", width: "100%" }}>
        <h2 style={{ marginBottom: "1rem", color: "var(--accent-color)" }}>AI Beauty Career Assistant</h2>
        <label style={{ display: "block", marginBottom: "1rem" }}>
          Select Profession Category:
          <select value={category} onChange={(e) => setCategory(e.target.value)} style={{ marginLeft: "10px", padding: "5px" }}>
            {categories.map((cat) => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
        </label>
        <h3 style={{ marginTop: "1rem", marginBottom: "0.5rem" }}>Recommended</h3>
        <ul>
          {recommendations.map((item, i) => (
            <li key={i} style={{ color: "var(--success)", marginBottom: "0.25rem" }}>{item}</li>
          ))}
        </ul>
        <h3 style={{ marginTop: "1rem", marginBottom: "0.5rem" }}>Avoid</h3>
        <ul>
          {avoid.map((item, i) => (
            <li key={i} style={{ color: "var(--error)", marginBottom: "0.25rem" }}>{item}</li>
          ))}
        </ul>
        <p style={{ marginTop: "1rem", fontSize: "0.9rem", color: "var(--text-secondary)" }}>
          AI balances: Career • Personality • Maintenance • Budget
        </p>
                <button className="btn btn-primary" style={{ marginTop: "1rem", width: "100%" }} onClick={() => { const cid = localStorage.getItem('current_customer_id') || 'guest'; localStorage.setItem(`selectedProfession_${cid}`, category); navigate('/'); }}>Select</button>
{showResult && (
  <h3 style={{ marginTop: "1rem", color: "var(--accent-color)" }}>You selected: {category}</h3>
)}
      </div>
    </div>
  );
}

