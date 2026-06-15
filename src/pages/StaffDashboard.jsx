import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { LogOut, Calendar, Clock, User, CheckCircle } from "lucide-react";
import { getCollection, updateDoc } from "../mockDb";

export default function StaffDashboard({ triggerToast }) {
  const navigate = useNavigate();
  const [staffInfo, setStaffInfo] = useState(null);
  const [appointments, setAppointments] = useState([]);

  useEffect(() => {
    const authData = localStorage.getItem("staffAuth");
    if (!authData) {
      navigate("/staff-login");
      return;
    }
    const staff = JSON.parse(authData);
    setStaffInfo(staff);
    
    // Load appointments for this specific staff
    const allAppointments = getCollection("appointment");
    const staffApps = allAppointments.filter(
      app => app.StaffId === staff.StaffId || app.Stylist_id === staff.StaffId || app.Stylist_ID === staff.StaffId
    );
    setAppointments(staffApps);
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem("staffAuth");
    triggerToast("Logged out successfully", "success");
    navigate("/staff-login");
  };

  const markCompleted = (appId) => {
    const updated = updateDoc("appointment", appId, { Status: "Completed" }, "appointmentId");
    if (updated) {
      triggerToast("Appointment marked as completed", "success");
      setAppointments(prev => prev.map(app => (app.appointmentId === appId || app.id === appId) ? { ...app, Status: "Completed" } : app));
    }
  };

  const getCustomerName = (cid) => {
    if (!cid) return "Client Walk-in";
    const customerCollection = getCollection("customer");
    const cust = customerCollection.find(c => c.Customer_id === cid);
    return cust?.Name || "Client Walk-in";
  };

  const formatAppDate = (app) => {
    const dt = app.Appoint_date || app.DateTime || app.Date;
    if (!dt) return "Not specified";
    try {
      return new Date(dt).toLocaleDateString("en-IN", {
        weekday: "short", day: "numeric", month: "short", year: "numeric"
      });
    } catch {
      return dt;
    }
  };

  const formatAppTime = (app) => {
    const dt = app.Appoint_date || app.DateTime || app.Time;
    if (!dt) return "Not specified";
    try {
      return new Date(dt).toLocaleTimeString("en-IN", {
        hour: "2-digit", minute: "2-digit"
      });
    } catch {
      return dt;
    }
  };

  if (!staffInfo) return null;

  return (
    <div className="animate-fade-in">
      {/* Header Profile Section */}
      <div className="glass-card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
          <img src={staffInfo.photo} alt={staffInfo.name} style={{ width: '80px', height: '80px', borderRadius: '50%', objectFit: 'cover', border: '3px solid var(--accent-color)' }} />
          <div>
            <h1 style={{ fontSize: '1.8rem', margin: '0' }}>Welcome, {staffInfo.name}</h1>
            <p style={{ color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <User size={14} /> {staffInfo.qualification}
            </p>
          </div>
        </div>
        <button onClick={handleLogout} className="btn btn-secondary">
          <LogOut size={16} /> Logout
        </button>
      </div>

      <h2 style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
        <Calendar color="var(--accent-color)" /> My Schedule
      </h2>

      {appointments.length === 0 ? (
        <div className="glass-card" style={{ textAlign: 'center', padding: '3rem' }}>
          <Calendar size={48} color="var(--text-muted)" style={{ marginBottom: '1rem', opacity: 0.5 }} />
          <h3>No Appointments Yet</h3>
          <p style={{ color: 'var(--text-secondary)' }}>You don't have any upcoming appointments scheduled.</p>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1.5rem' }}>
          {appointments.map(app => {
            const appId = app.appointmentId || app.id;
            return (
              <div key={appId} className="glass-card" style={{ position: 'relative', overflow: 'hidden' }}>
                {(app.Status === "Completed" || app.status === "Completed" || app.status === "SC") && (
                  <div style={{ position: 'absolute', top: '10px', right: '10px' }}>
                    <span className="badge badge-success">Scheduled</span>
                  </div>
                )}
                
                <h3 style={{ fontSize: '1.25rem', marginBottom: '0.5rem' }}>
                  {getCustomerName(app.Customer_id)}
                </h3>
                
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginBottom: '1.5rem' }}>
                  <p style={{ color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.9rem' }}>
                    <Calendar size={14} /> Date: {formatAppDate(app)}
                  </p>
                  <p style={{ color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.9rem' }}>
                    <Clock size={14} /> Time: {formatAppTime(app)}
                  </p>
                </div>

                {app.Status !== "Completed" && app.status !== "Completed" && (
                  <button 
                    onClick={() => markCompleted(appId)}
                    className="btn btn-secondary" 
                    style={{ width: '100%', borderColor: 'var(--success)', color: 'var(--success)' }}
                  >
                    <CheckCircle size={16} /> Mark as Completed
                  </button>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
