import React, { useState } from "react";

export default function AIPersonalityDNA({ triggerToast, isOnline }) {
  const [showResult, setShowResult] = useState(false);

  const handleStart = () => {
    if (!isOnline) {
      triggerToast("E001: Mobile not connected to internet", "error");
      return;
    }
    // Simulate a brief chat delay
    setTimeout(() => setShowResult(true), 500);
  };

  const percentages = {
    Creative: 78,
    Minimalist: 64,
    Bold: 21,
  };

  return (
    <div className="animate-fade-in" style={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "80vh" }}>
      <div className="glass-card" style={{ padding: "2rem", maxWidth: "600px", width: "100%" }}>
        <h2 style={{ marginBottom: "1rem", color: "var(--accent-color)" }}>Beauty Personality DNA</h2>
        {!showResult ? (
          <button onClick={handleStart} className="btn btn-primary" style={{ width: "100%" }}>
            Start 2‑minute chat (simulated)
          </button>
        ) : (
          <>
            <p style={{ marginBottom: "1rem" }}><strong>Style Personality:</strong></p>
            <ul style={{ listStyle: "none", padding: 0, marginBottom: "1.5rem" }}>
              {Object.entries(percentages).map(([key, val]) => (
                <li key={key} style={{ marginBottom: "0.5rem", color: "var(--text-primary)" }}>
                  {key}: {val}%
                </li>
              ))}
            </ul>
            <p style={{ marginBottom: "0.5rem" }}>Recommended salons & services:</p>
            <ul style={{ listStyle: "disc", paddingLeft: "1.5rem" }}>
              <li>Creative Studio – bold colour treatments</li>
              <li>Minimalist Lounge – sleek trims & natural tones</li>
            </ul>
          </>
        )}
      </div>
    </div>
  );
}
