import React from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { Home as HomeIcon, Users as StylistsIcon, ShoppingCart as CartIcon, CreditCard as PaymentIcon, CheckCircle as StatusIcon, User as ProfileIcon, Calendar as RescheduleIcon, Shield, Scissors, Store as StoreIcon, LogIn, LogOut, UserCheck } from "lucide-react";

export default function Navbar() {
  const navigate = useNavigate();

  // Determine auth roles from localStorage
  const isAdmin = localStorage.getItem('adminAuth') === 'true';
  const isStaff = !!localStorage.getItem('staffAuth');
  const isCustomer = localStorage.getItem('is_authenticated') === 'true';
  const isLoggedIn = isAdmin || isStaff || isCustomer;

  const handleLogout = () => {
    localStorage.removeItem('adminAuth');
    localStorage.removeItem('staffAuth');
    localStorage.removeItem('is_authenticated');
    localStorage.removeItem('current_customer_id');
    localStorage.removeItem('current_appointment_id');
    localStorage.removeItem('current_stylist_id');
    navigate('/login');
  };

  const handleLogin = () => {
    navigate('/login');
  };

    const links = [
      {to: "/", label: "Home", icon: <HomeIcon size={18} /> },
      {to: "/salons", label: "Salons", icon: <StoreIcon size={18} /> },
      {to: "/stylists", label: "Stylists", icon: <StylistsIcon size={18} /> },
      {to: "/cart", label: "Cart", icon: <CartIcon size={18} /> },
      {to: "/payment", label: "Payment", icon: <PaymentIcon size={18} /> },
      {to: "/status", label: "Status", icon: <StatusIcon size={18} /> },
      {to: "/profile", label: "Profile", icon: <ProfileIcon size={18} /> },
      {to: "/reschedule", label: "Reschedule", icon: <RescheduleIcon size={18} /> },
      // AI feature links (visible to all customers)

      // {to: "/ai-personality", label: "Personality AI", icon: <UserCheck size={18} /> },
      // Staff and admin links visible only to authenticated staff/admin
      ...(isStaff ? [{ to: "/staff-dashboard", label: "Staff", icon: <Scissors size={18} /> }] : []),
      ...(isAdmin ? [{ to: "/admin-panel", label: "Admin", icon: <Shield size={18} /> }] : [])
    ];

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <NavLink to="/" className="navbar-logo">
          <span style={{ color: "var(--accent-color)" }}>💈</span>
          <span>SalonPro</span>
        </NavLink>
        <ul className="navbar-menu">
          {links.map((link) => (
            <li key={link.to}>
              <NavLink
                to={link.to}
                className={({ isActive }) =>
                  `navbar-link ${isActive ? "active" : ""}`
                }
              >
                {link.icon}
                {link.label}
              </NavLink>
            </li>
          ))}
        </ul>
        <div className="navbar-auth">
          {isLoggedIn ? (
            <button onClick={handleLogout} className="btn btn-secondary auth-btn">
              <LogOut size={16} /> Logout
            </button>
          ) : (
            <button onClick={handleLogin} className="btn btn-primary auth-btn">
              <LogIn size={16} /> Login
            </button>
          )}
        </div>
      </div>
    </nav>
  );
}

