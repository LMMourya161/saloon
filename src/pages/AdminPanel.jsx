import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Users, Calendar, Settings, LogOut, Scissors, Building, Activity } from "lucide-react";
import { getCollection } from "../mockDb";

export default function AdminPanel({ triggerToast }) {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("clinics");
  const [data, setData] = useState({
    clinics: [],
    branches: [],
    staffs: [],
    patients: [],
    appointments: []
  });

  useEffect(() => {
    // Check if logged in
    const isAuth = localStorage.getItem("adminAuth");
    if (!isAuth) {
      navigate("/admin-login");
      return;
    }
    loadData();
  }, [navigate]);

  const loadData = () => {
    setData({
      clinics: getCollection("clinics"),
      branches: getCollection("branches"),
      staffs: getCollection("staffs"),
      patients: getCollection("patients"),
      appointments: getCollection("appointment") // or appointments
    });
  };

  const handleLogout = () => {
    localStorage.removeItem("adminAuth");
    triggerToast("Logged out successfully", "success");
    navigate("/admin-login");
  };

  // Simple Data Table Component
  const DataTable = ({ columns, data, idKey }) => (
    <div style={{ overflowX: 'auto', background: 'rgba(18, 22, 31, 0.4)', borderRadius: '12px', border: '1px solid var(--border-color)' }}>
      <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
        <thead>
          <tr style={{ borderBottom: '1px solid var(--border-color)', background: 'rgba(255,255,255,0.02)' }}>
            {columns.map((col, idx) => (
              <th key={idx} style={{ padding: '1rem', color: 'var(--text-secondary)', fontWeight: '600', fontSize: '0.875rem', textTransform: 'uppercase' }}>
                {col.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.length === 0 ? (
            <tr>
              <td colSpan={columns.length} style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>
                No records found.
              </td>
            </tr>
          ) : (
            data.map((row) => (
              <tr key={row[idKey]} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)', transition: 'background 0.2s' }}>
                {columns.map((col, idx) => (
                  <td key={idx} style={{ padding: '1rem', color: 'var(--text-primary)', fontSize: '0.95rem' }}>
                    {col.render ? col.render(row[col.key], row) : row[col.key]}
                  </td>
                ))}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );

  const tabs = [
    { id: "clinics", label: "Clinics & Branches", icon: <Building size={18} /> },
    { id: "staff", label: "Stylists / Staff", icon: <Scissors size={18} /> },
    { id: "patients", label: "Customers", icon: <Users size={18} /> },
    { id: "appointments", label: "Appointments", icon: <Calendar size={18} /> }
  ];

  return (
    <div className="animate-fade-in">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <div>
          <h1 style={{ fontSize: '2rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Activity color="var(--accent-color)" /> Admin Dashboard
          </h1>
          <p style={{ color: 'var(--text-secondary)' }}>Manage your salon's overall operations.</p>
        </div>
        <button onClick={handleLogout} className="btn btn-secondary">
          <LogOut size={16} /> Logout
        </button>
      </div>

      {/* Stats Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
        <div className="glass-card" style={{ padding: '1.5rem' }}>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', textTransform: 'uppercase', fontWeight: 'bold' }}>Total Branches</p>
          <h2 style={{ fontSize: '2.5rem', color: 'var(--accent-color)' }}>{data.branches.length}</h2>
        </div>
        <div className="glass-card" style={{ padding: '1.5rem' }}>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', textTransform: 'uppercase', fontWeight: 'bold' }}>Active Stylists</p>
          <h2 style={{ fontSize: '2.5rem', color: 'var(--accent-color)' }}>{data.staffs.length}</h2>
        </div>
        <div className="glass-card" style={{ padding: '1.5rem' }}>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', textTransform: 'uppercase', fontWeight: 'bold' }}>Registered Customers</p>
          <h2 style={{ fontSize: '2.5rem', color: 'var(--accent-color)' }}>{data.patients.length}</h2>
        </div>
        <div className="glass-card" style={{ padding: '1.5rem' }}>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', textTransform: 'uppercase', fontWeight: 'bold' }}>Total Appointments</p>
          <h2 style={{ fontSize: '2.5rem', color: 'var(--accent-color)' }}>{data.appointments.length}</h2>
        </div>
      </div>

      <div className="glass-card" style={{ padding: '0', overflow: 'hidden' }}>
        {/* Tab Navigation */}
        <div style={{ display: 'flex', borderBottom: '1px solid var(--border-color)', background: 'rgba(18, 22, 31, 0.4)' }}>
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              style={{
                flex: 1,
                padding: '1.25rem 1rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.5rem',
                background: activeTab === tab.id ? 'var(--bg-surface)' : 'transparent',
                border: 'none',
                borderBottom: activeTab === tab.id ? '2px solid var(--accent-color)' : '2px solid transparent',
                color: activeTab === tab.id ? 'var(--accent-color)' : 'var(--text-secondary)',
                fontWeight: '600',
                cursor: 'pointer',
                transition: 'all 0.2s ease'
              }}
            >
              {tab.icon} {tab.label}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <div style={{ padding: '2rem' }}>
          {activeTab === "clinics" && (
            <div>
              <h3 style={{ marginBottom: '1rem' }}>Branches</h3>
              <DataTable
                idKey="branchId"
                data={data.branches}
                columns={[
                  { key: 'name', label: 'Branch Name' },
                  { key: 'cityId', label: 'City' },
                  { key: 'Mobile_Number', label: 'Phone' },
                  { key: 'Status', label: 'Status', render: (val) => <span className="badge badge-success">{val}</span> }
                ]}
              />
            </div>
          )}

          {activeTab === "staff" && (
            <div>
              <h3 style={{ marginBottom: '1rem' }}>Stylists</h3>
              <DataTable
                idKey="StaffId"
                data={data.staffs}
                columns={[
                  { key: 'photo', label: 'Photo', render: (val) => <img src={val} alt="staff" style={{ width: '40px', height: '40px', borderRadius: '50%', objectFit: 'cover' }} /> },
                  { key: 'name', label: 'Name' },
                  { key: 'qualification', label: 'Qualification' },
                  { key: 'rating', label: 'Rating', render: (val) => <span style={{ color: 'var(--warning)' }}>⭐ {val}</span> },
                  { key: 'status', label: 'Status', render: (val) => <span className="badge badge-success">{val}</span> }
                ]}
              />
            </div>
          )}

          {activeTab === "patients" && (
            <div>
              <h3 style={{ marginBottom: '1rem' }}>Customers</h3>
              <DataTable
                idKey="patient_id"
                data={data.patients}
                columns={[
                  { key: 'name', label: 'Name' },
                  { key: 'gender', label: 'Gender' },
                  { key: 'mobile_number', label: 'Phone' },
                  { key: 'status', label: 'Status', render: (val) => <span className="badge badge-info">{val}</span> }
                ]}
              />
            </div>
          )}

          {activeTab === "appointments" && (
            <div>
              <h3 style={{ marginBottom: '1rem' }}>Appointments</h3>
              <DataTable
                idKey="appointmentId"
                data={data.appointments}
                columns={[
                  { key: 'appointmentId', label: 'ID' },
                  { key: 'Customer_name', label: 'Customer' },
                  { key: 'Staff_name', label: 'Stylist' },
                  { key: 'Date', label: 'Date' },
                  { key: 'Status', label: 'Status', render: (val) => <span className="badge badge-warning">{val || 'Pending'}</span> }
                ]}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
