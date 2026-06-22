import React from "react";

/**
 * ProtectedRoute renders the given element only if the user is authenticated.
 * It checks for any authentication flag in localStorage.
 * If not authenticated, it renders nothing (null) so the page simply disappears
 * without navigating to the login screen. This matches the requirement of
 * showing the AI Beauty Career Assistant only for authorized customers.
 */
export default function ProtectedRoute({ element }) {
  const isLoggedIn = Boolean(
    localStorage.getItem("staffAuth") ||
    localStorage.getItem("is_authenticated") || // customer login flag
    localStorage.getItem("adminAuth") ||
    localStorage.getItem("current_customer_id")
  );

  return isLoggedIn ? element : null;
}
