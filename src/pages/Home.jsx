import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowRight, Scissors, Sparkles, Smile, Check } from "lucide-react";
import { insertDoc, getDoc, queryDocs, updateDoc } from "../mockDb";

const SUB_CATEGORIES_MAP = {
  Men: [
    { id: "hair_care", name: "Hair care", desc: "Styling, cuts & washes" },
    { id: "body_care", name: "Body care", desc: "Spa, grooming & detailing" },
    { id: "beard_care", name: "Beard care", desc: "Trimming, shaving & oils" }
  ],
  Women: [
    { id: "hair_care", name: "Hair care", desc: "Coloring, cuts & treatments" },
    { id: "body_care", name: "Body care", desc: "Massage, waxing & therapy" },
    { id: "makeup", name: "Makeup", desc: "Bridal, party & beauty salon" }
  ],
  Children: [
    { id: "hair_care", name: "Hair care", desc: "Kid-friendly hair trims" },
    { id: "body_care", name: "Body care", desc: "Soothing washes & care" }
  ]
};

export default function Home({ triggerToast, isOnline }) {
  const [selectedProfession, setSelectedProfession] = useState('');
  useEffect(() => {
    if (localStorage.getItem('is_authenticated') === 'true') {
      const cid = localStorage.getItem('current_customer_id') || 'guest';
      const sp = localStorage.getItem(`selectedProfession_${cid}`);
      if (sp) setSelectedProfession(sp);
    }
  }, []);
  const navigate = useNavigate();
  const isCustomer = localStorage.getItem('is_authenticated') === 'true';
  useEffect(() => {
    if (!isCustomer) {
      setSelectedProfession('');
    }
  }, [isCustomer]);
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
      triggerToast("Please select a main category (Men, Women, or Children) first.", "error");
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
    const existingAppointments = queryDocs("appointments", (app) => app.Customer_id === customerId);

    if (existingAppointments.length > 0) {
      const appDoc = existingAppointments[0];
      const appId = appDoc.id || appDoc.appointmentId;
      localStorage.setItem("current_appointment_id", appId);

      // Use updateDoc to write back to the correct collection
      updateDoc("appointments", appId, {
        "Main category": mainCategory,
        "Sub category": subNames,
        status: "AA",
        Modified_by: customer.Name || "customer"
      }, "id");
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

  // State for Personality DNA UI
  const [showPersonality, setShowPersonality] = useState(false);
  const [showChat, setShowChat] = useState(false);
  const [displayedMessages, setDisplayedMessages] = useState([]);
  const [userInput, setUserInput] = useState("");
  const [conversation, setConversation] = useState([]);
  const [stylePersonality, setStylePersonality] = useState({ Creative: 78, Minimalist: 64, Bold: 21 });
  // Track Q&A progress during simulated chat
  const [chatStep, setChatStep] = useState(0);
  const questions = [
    "What kind of colors do you like? (e.g., bold, pastel, natural)",
    "Do you prefer minimal or elaborate styles?",
    "Do you like strong statements in your look?"
  ];

  const handleUserSend = () => {
    if (!userInput.trim()) return;
    const userMsg = `You: ${userInput}`;
    // If we are in the Q&A flow, process answer and move to next question
    if (showChat && chatStep < questions.length) {
      // Update style scores based on answer keywords
      const lowered = userInput.toLowerCase();
      let updated = { ...stylePersonality };
      if (lowered.includes("creative")) {
        updated = { Creative: 100, Minimalist: 0, Bold: 0 };
      } else if (lowered.includes("minimalist")) {
        updated = { Creative: 0, Minimalist: 100, Bold: 0 };
      } else if (lowered.includes("bold")) {
        updated = { Creative: 0, Minimalist: 0, Bold: 100 };
      }
      if (lowered.includes("colorful")) {
        updated.Creative = Math.min(100, updated.Creative + 5);
      }
      if (lowered.includes("natural")) {
        updated.Minimalist = Math.min(100, updated.Minimalist + 5);
      }
      if (lowered.includes("strong")) {
        updated.Bold = Math.min(100, updated.Bold + 5);
      }
      setStylePersonality(updated);

      const nextStep = chatStep + 1;
      // Prepare next bot message
      let botReply = "";
      if (nextStep < questions.length) {
        botReply = questions[nextStep]; // ask next question
      } else {
        // Final recommendation after last answer
        const styles = Object.entries(updated).sort((a, b) => b[1] - a[1]);
        const topStyle = styles[0][0];
        const topScore = styles[0][1];
        botReply = `AI: Based on your style scores (Creative ${updated.Creative}%, Minimalist ${updated.Minimalist}%, Bold ${updated.Bold}%). I recommend ${updated.Creative >= updated.Minimalist && updated.Creative >= updated.Bold ? "Creative Studio – bold colour treatments" : updated.Minimalist >= updated.Bold ? "Minimalist Lounge – sleek trims & natural tones" : "Bold options (currently unavailable)"}.`;
      }
      setDisplayedMessages(prev => [...prev, userMsg, botReply]);
      setChatStep(nextStep);
      setUserInput("");
    } else {
      // Fallback for any other messages
      const lowered = userInput.toLowerCase();
      let updated = { ...stylePersonality };
      if (lowered.includes("creative")) {
        updated = { Creative: 100, Minimalist: 0, Bold: 0 };
      } else if (lowered.includes("minimalist")) {
        updated = { Creative: 0, Minimalist: 100, Bold: 0 };
      } else if (lowered.includes("bold")) {
        updated = { Creative: 0, Minimalist: 0, Bold: 100 };
      }
      if (lowered.includes("colorful")) {
        updated.Creative = Math.min(100, updated.Creative + 5);
      }
      if (lowered.includes("natural")) {
        updated.Minimalist = Math.min(100, updated.Minimalist + 5);
      }
      if (lowered.includes("strong")) {
        updated.Bold = Math.min(100, updated.Bold + 5);
      }
      setStylePersonality(updated);
      const styles = Object.entries(updated).sort((a, b) => b[1] - a[1]);
      const topStyle = styles[0][0];
      const topScore = styles[0][1];
      let botReply = `AI: Based on your style scores (Creative ${updated.Creative}%, Minimalist ${updated.Minimalist}%, Bold ${updated.Bold}%). I recommend ${updated.Creative >= updated.Minimalist && updated.Creative >= updated.Bold ? "Creative Studio – bold colour treatments" : updated.Minimalist >= updated.Bold ? "Minimalist Lounge – sleek trims & natural tones" : "Bold options (currently unavailable)"}.`;
      if (lowered.includes("recommend") || lowered.includes("suggest")) {
        botReply = `AI: Based on your style scores (Creative ${updated.Creative}%, Minimalist ${updated.Minimalist}%, Bold ${updated.Bold}%), your top style is ${topStyle} (${topScore}%). I recommend ${topStyle === "Creative" ? "Creative Studio – bold colour treatments" : "Minimalist Lounge – sleek trims & natural tones"}.`;
      } else if (lowered.includes("option") || lowered.includes("what")) {
        botReply = `AI: Your style breakdown is Creative ${updated.Creative}%, Minimalist ${updated.Minimalist}%, Bold ${updated.Bold}%. You might enjoy:\n- Creative Studio – bold colour treatments\n- Minimalist Lounge – sleek trims & natural tones`;
      }
      setDisplayedMessages(prev => [...prev, userMsg, botReply]);
      setUserInput("");
    }
  };

  // Predefined chat messages for 2‑minute simulation
  // Predefined questions for the simulated chat
  // The chat will ask each question sequentially and adjust scores based on answers.


  const startChat = () => {
    setShowChat(true);
    setChatStep(0);
    // Begin with the first question as AI message
    setDisplayedMessages([questions[0]]);
  };

  return (
    <div className="animate-fade-in">
      <div style={{ textAlign: "center", marginBottom: "3rem" }}>
                     {isCustomer && selectedProfession && (
            <div className="glass-card" style={{ padding: "1rem 1.5rem", marginBottom: "1.5rem", background: "rgba(18, 22, 31, 0.65)" }}>
              <h2 style={{ marginBottom: "0.5rem", color: "var(--accent-color)" }}>Your Selected Profession: {selectedProfession}</h2>
            </div>
          )}

        {/* Personality AI Card */}
          {/* AI Personality DNA Card with interactive chat */}
          <div className="glass-card" style={{ padding: "1rem 1.5rem", marginBottom: "1.5rem", background: "rgba(18, 22, 31, 0.65)", cursor: "pointer" }} onClick={() => setShowPersonality(true)}>
            <h3 style={{ marginBottom: "0.5rem", color: "var(--accent-color)" }}>AI Personality DNA</h3>
  {showPersonality ? (
  <div>

    {showChat ? (
      <>
        {/* Chat messages */}
        <div style={{ marginTop: "0.5rem", maxHeight: "200px", overflowY: "auto", background: "rgba(0,0,0,0.2)", padding: "0.5rem", borderRadius: "8px" }}>
          {displayedMessages.map((msg, idx) => (
            <p key={idx} style={{ color: "var(--text-primary)", margin: "0.2rem 0" }}>{msg}</p>
          ))}
        </div>
        {/* User input area */}
        <div style={{ display: "flex", marginTop: "0.5rem" }}>
          <input
            type="text"
            placeholder="Ask about options..."
            value={userInput}
            onChange={(e) => setUserInput(e.target.value)}
            style={{ flexGrow: 1, padding: "0.4rem", borderRadius: "4px", border: "1px solid var(--border-color)", background: "rgba(255,255,255,0.05)", color: "var(--text-primary)" }}
          />
          <button className="btn btn-primary" style={{ marginLeft: "0.3rem" }} onClick={handleUserSend}>Send</button>
        </div>

      </>
    ) : (
      <button className="btn btn-primary" style={{ marginTop: "0.5rem" }} onClick={startChat}>Start 2‑minute chat (simulated)</button>
    )}
  </div>
) : (
  <p style={{ color: "var(--text-secondary)" }}>Click to view your personalized personality analysis.</p>
)}
          </div>

        <h1 style={{ fontSize: "2.5rem", marginBottom: "0.5rem" }}>
          Select <span className="text-gradient">Categories</span>
        </h1>
        <p style={{ color: "var(--text-secondary)", fontSize: "1.1rem" }}>
          Choose your service targets to browse matching professionals.
        </p>
      </div>
      {/* Login button when not authenticated */}
      {!isCustomer && (
        <div style={{ textAlign: "center", marginBottom: "1rem" }}>
          <button onClick={() => navigate('/login')} className="btn btn-primary" style={{ padding: "0.75rem 2rem" }}>
            Login
          </button>
        </div>
      )}

      {isCustomer && (
        <div className="glass-card"
          style={{
            cursor: "pointer",
            border: "1px solid var(--border-color)",
            background: "rgba(18, 22, 31, 0.65)",
            padding: "2rem",
            marginBottom: "2rem",
            textAlign: "center",
            transition: "all 0.2s ease",
            transform: "scale(1)"
          }}
          onClick={() => navigate('/ai-career')}
        >
          <h3 style={{ marginBottom: "0.5rem", color: "var(--accent-color)" }}>AI Beauty Career Assistant</h3>
          <p style={{ color: "var(--text-secondary)" }}>Choose your profession and get personalized haircut recommendations.</p>
          <button className="btn btn-primary" style={{ marginTop: "1rem" }}>{selectedProfession ? "Change" : "Explore"}</button>
        </div>
      )}

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
