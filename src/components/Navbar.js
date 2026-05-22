import React from "react";
import { NavLink } from "react-router-dom";
import { Home as HomeIcon, Users as StylistsIcon, ShoppingCart as CartIcon, CreditCard as PaymentIcon, CheckCircle as StatusIcon, User as ProfileIcon, Calendar as RescheduleIcon } from "lucide-react";

export default function Navbar() {
  const links = [
    { to: "/", label: "Home", icon: <HomeIcon size={18} /> },
    { to: "/stylists", label: "Stylists", icon: <StylistsIcon size={18} /> },
    { to: "/cart", label: "Cart", icon: <CartIcon size={18} /> },
    { to: "/payment", label: "Payment", icon: <PaymentIcon size={18} /> },
    { to: "/status", label: "Status", icon: <StatusIcon size={18} /> },
    { to: "/profile", label: "Profile", icon: <ProfileIcon size={18} /> },
    { to: "/reschedule", label: "Reschedule", icon: <RescheduleIcon size={18} /> },
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
      </div>
    </nav>
  );
}
