import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Scissors, LogIn, ArrowRight } from "lucide-react";
import { getCollection } from "../mockDb";

export default function StaffLogin({ triggerToast }) {
  const [staffs, setStaffs] = useState([]);
  const [selectedStaff, setSelectedStaff] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const loadedStaffs = getCollection("staffs");
    setStaffs(loadedStaffs);
    if (loadedStaffs.length > 0) {
      setSelectedStaff(loadedStaffs[0].StaffId);
    }
  }, []);

  const handleLogin = (e) => {
    e.preventDefault();
    if (selectedStaff) {
      const staffInfo = staffs.find(s => s.StaffId === selectedStaff);
      localStorage.setItem("staffAuth", JSON.stringify(staffInfo));
      triggerToast(`Welcome back, ${staffInfo.name}!`, "success");
      navigate("/staff-dashboard");
    } else {
      triggerToast("Please select a staff profile", "error");
    }
  };

  return (
    <div className="animate-fade-in" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
      <div className="glass-card" style={{ maxWidth: '400px', width: '100%' }}>
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <div style={{ 
            background: 'var(--accent-soft)', 
            width: '64px', 
            height: '64px', 
            borderRadius: '50%', 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center',
            margin: '0 auto 1rem auto'
          }}>
            <Scissors size={32} color="var(--accent-color)" />
          </div>
          <h2 style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>Stylist Login</h2>
          <p style={{ color: 'var(--text-secondary)' }}>Access your schedule and appointments.</p>
        </div>

        <form onSubmit={handleLogin}>
          <div className="form-group">
            <label className="form-label">Select Profile</label>
            <select
              className="form-control"
              value={selectedStaff}
              onChange={(e) => setSelectedStaff(e.target.value)}
              style={{ width: '100%', appearance: 'none', backgroundImage: 'url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns=\'http://www.w3.org/2000/svg\' viewBox=\'0 0 24 24\' fill=\'none\' stroke=\'white\' stroke-width=\'2\' stroke-linecap=\'round\' stroke-linejoin=\'round\'%3e%3cpolyline points=\'6 9 12 15 18 9\'%3e%3c/polyline%3e%3c/svg%3e")', backgroundRepeat: 'no-repeat', backgroundPosition: 'right 1rem center', backgroundSize: '1em' }}
              required
            >
              {staffs.length === 0 ? (
                <option value="">No staff profiles found</option>
              ) : (
                staffs.map(staff => (
                  <option key={staff.StaffId} value={staff.StaffId} style={{ background: 'var(--bg-surface)' }}>
                    {staff.name} ({staff.qualification})
                  </option>
                ))
              )}
            </select>
          </div>
          
          <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: '1.5rem', padding: '0.85rem' }} disabled={!selectedStaff}>
            <LogIn size={18} />
            Login as Stylist
          </button>
        </form>
      </div>
    </div>
  );
}
