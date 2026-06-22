import React from "react";

export default function AuthStatus() {
  const staffAuth = localStorage.getItem("staffAuth");
  const isAuth = localStorage.getItem("is_authenticated");
  const adminAuth = localStorage.getItem("adminAuth");
  return (
    <div style={{ padding: "0.5rem", background: "var(--bg-muted)", color: "var(--text-primary)" }}>
      <strong>Auth Debug:</strong>
      <pre style={{ margin: 0 }}>
        {JSON.stringify({ staffAuth, isAuth, adminAuth }, null, 2)}
      </pre>
    </div>
  );
}
