import { useState, useEffect } from 'react';
import { 
  Download, Search, Trash2,
  Smartphone, Plus, FolderDown, 
  MessageCircle, TrendingUp, Users, CheckCircle2, Calendar, ShieldAlert,
  Phone, PhoneCall
} from 'lucide-react';
import { 
  getAllSubmissions, deleteSubmission, exportToCSV, REQUIRED_DOCUMENTS, 
  MOCK_USERS, LEAD_STATUSES, updateLeadStatus, addMeetingNote,
  getAllEstimates, fetchFromCloud
} from '../store/db';
import ClientForm from './ClientForm';

import { useNavigate } from 'react-router-dom';

export default function AdminDashboard({ user }) {
  const [submissions, setSubmissions] = useState([]);
  const [estimates, setEstimates] = useState([]);
  const [activeTab, setActiveTab] = useState('leads'); // 'leads' or 'estimates'
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedLead, setSelectedLead] = useState(null);
  const [noteInput, setNoteInput] = useState('');
  const navigate = useNavigate();

  const isOwner = user?.role === 'owner';
  const userId = user?.id;

  const [showPendingPopup, setShowPendingPopup] = useState(false);
  const [pendingLeadsList, setPendingLeadsList] = useState([]);

  useEffect(() => {
    loadData();
    checkAgingLeads();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId]);

  const loadData = async () => {
    // 1. Instantly load local data for fast UI
    let all = getAllSubmissions();
    const ests = getAllEstimates();
    
    if (isOwner) {
      setSubmissions(all);
    } else {
      setSubmissions(all.filter(s => s.assignedTo === user.id));
    }
    setEstimates(ests);

    // 2. Fetch latest from Vercel DB in background and update UI
    const cloudData = await fetchFromCloud();
    if (cloudData) {
      all = cloudData;
      if (isOwner) {
        setSubmissions(all);
      } else {
        setSubmissions(all.filter(s => s.assignedTo === user.id));
      }
      checkAgingLeads(all); // refresh popup logic with new data
    }
  };

  const checkAgingLeads = (dataOverride = null) => {
    const all = dataOverride || getAllSubmissions();
    const relevant = isOwner ? all : all.filter(s => s.assignedTo === user.id);
    // Show pending popup for leads that are New or Interested
    const pending = relevant.filter(s => s.status === 'New' || s.status === 'Interested');
    setPendingLeadsList(pending);
    setShowPendingPopup(true); // Always show popup on login
  };

  const handleDelete = (uid) => {
    if (window.confirm(`Are you sure you want to delete lead ${uid}?`)) {
      deleteSubmission(uid);
      loadData();
      if (selectedLead?.uid === uid) {
        setSelectedLead(null);
      }
    }
  };

  const handleStatusChange = (uid, newStatus) => {
    updateLeadStatus(uid, newStatus, null);
    loadData();
    if (selectedLead?.uid === uid) {
      setSelectedLead(prev => ({ ...prev, status: newStatus }));
    }
  };

  const handleAssignEmployee = (uid, empId) => {
    updateLeadStatus(uid, null, empId);
    loadData();
    if (selectedLead?.uid === uid) {
      setSelectedLead(prev => ({ ...prev, assignedTo: empId }));
    }
  };

  const handleAddNote = (e) => {
    e.preventDefault();
    if (!noteInput.trim()) return;
    
    addMeetingNote(selectedLead.uid, noteInput, false);
    setNoteInput('');
    loadData();
    
    // Refresh selected lead local state
    const updatedAll = getAllSubmissions();
    setSelectedLead(updatedAll.find(s => s.uid === selectedLead.uid));
  };

  const handleSendWhatsApp = () => {
    const msg = `Hi ${selectedLead.fullName}, this is regarding your ${selectedLead.loanType} application with Deals For Loan. Please share an update.`;
    addMeetingNote(selectedLead.uid, `Automated WhatsApp Sent: "${msg}"`, true);
    loadData();
    const updatedAll = getAllSubmissions();
    setSelectedLead(updatedAll.find(s => s.uid === selectedLead.uid));
    alert("WhatsApp message simulated & logged successfully!");
  };

  const handleExport = () => {
    if (submissions.length === 0) {
      alert("No data to export");
      return;
    }
    exportToCSV(submissions);
  };

  const filteredSubmissions = submissions.filter(s => 
    (s.uid || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (s.fullName || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (s.phone || '').includes(searchTerm)
  );


  // Top employees logic (For owner view)
  const employeeStats = MOCK_USERS.filter(u => u.role === 'manager').map(emp => {
    const empLeads = submissions.filter(s => s.assignedTo === emp.id);
    return {
      name: emp.name,
      closed: empLeads.filter(s => s.status === 'Converted').length,
      target: 15
    };
  }).sort((a, b) => b.closed - a.closed).slice(0, 3);

  // Render logic

  return (
    <div style={{ padding: '1rem', animation: 'fadeIn 0.5s ease-out' }}>
      
      {/* Pending Leads Popup */}
      {showPendingPopup && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', animation: 'fadeIn 0.2s', padding: '1rem' }}>
          <div style={{ backgroundColor: 'white', borderRadius: '16px', padding: '1.5rem', maxWidth: '500px', width: '100%', boxSizing: 'border-box', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem', color: '#e11d48', flexWrap: 'wrap' }}>
              <ShieldAlert size={28} style={{ flexShrink: 0 }} />
              <h2 style={{ fontSize: '1.25rem', margin: 0, fontWeight: 700, flex: 1, minWidth: '200px' }}>Pending Leads Reminder</h2>
            </div>
            <p style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem' }}>
              You have <strong>{pendingLeadsList.length}</strong> active leads that require follow-ups or status updates. Please review them today to ensure quick conversion!
            </p>
            <div style={{ maxHeight: '300px', overflowY: 'auto', marginBottom: '1.5rem', border: '1px solid var(--border-color)', borderRadius: '8px' }}>
              {[...pendingLeadsList]
                .sort((a, b) => {
                  if (a.followUpDate && b.followUpDate) return new Date(a.followUpDate) - new Date(b.followUpDate);
                  if (a.followUpDate) return -1; // has date → higher priority
                  if (b.followUpDate) return 1;
                  return 0;
                })
                .map((lead, idx) => {
                  const isOverdue = lead.followUpDate && new Date(lead.followUpDate) < new Date();
                  const dateColor = isOverdue ? '#dc2626' : '#b45309';
                  return (
                    <div key={lead.uid} style={{ padding: '0.75rem 1rem', borderBottom: '1px solid var(--border-color)', fontSize: '0.9rem', backgroundColor: idx === 0 ? '#fff7ed' : 'white' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.25rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                          {idx === 0 && <span style={{ fontSize: '0.65rem', fontWeight: 800, backgroundColor: '#f39e1e', color: 'white', padding: '0.1rem 0.4rem', borderRadius: '4px' }}>FIRST</span>}
                          <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{lead.fullName}</span>
                        </div>
                        <span style={{ fontSize: '0.75rem', padding: '0.2rem 0.6rem', borderRadius: '99px', backgroundColor: lead.status === 'New' ? '#e0f2fe' : '#fef3c7', color: lead.status === 'New' ? '#0369a1' : '#b45309', fontWeight: 600 }}>{lead.status}</span>
                      </div>
                      {lead.followUpDate ? (
                        <div style={{ marginTop: '0.25rem', display: 'flex', alignItems: 'center', gap: '0.4rem', color: dateColor, fontSize: '0.78rem', fontWeight: 600 }}>
                          <Calendar size={12} /> {isOverdue ? '⚠️ Overdue — ' : 'Follow-up: '}{new Date(lead.followUpDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                        </div>
                      ) : (
                        <div style={{ marginTop: '0.25rem', fontSize: '0.75rem', color: 'var(--text-muted)' }}>No follow-up date set</div>
                      )}
                    </div>
                  );
                })
              }
            </div>
            <button 
              onClick={() => setShowPendingPopup(false)}
              className="btn"
              style={{ width: '100%', backgroundColor: 'var(--primary-color)', color: 'white', padding: '0.75rem', borderRadius: '8px', fontWeight: 600, border: 'none', cursor: 'pointer' }}
            >
              I'll check them now
            </button>
          </div>
        </div>
      )}      {/* Header Actions */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.25rem', flexWrap: 'wrap', gap: '0.75rem' }}>
        <div style={{ minWidth: 0 }}>
          <h2 style={{ fontSize: '1.5rem', color: 'var(--accent-color)', fontWeight: 800, letterSpacing: '-0.03em', margin: 0 }}>
            {isOwner ? 'CRM Overview' : 'My Dashboard'}
          </h2>
          <p style={{ marginTop: '0.25rem', color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
            {isOwner ? 'Manage employees and track leads.' : `Welcome, ${user?.name}.`}
          </p>
        </div>
        
        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', alignItems: 'center' }}>
          <div style={{ display: 'flex', backgroundColor: '#f1f5f9', padding: '0.2rem', borderRadius: '99px' }}>
            <button 
              onClick={() => setActiveTab('leads')}
              style={{ padding: '0.4rem 0.875rem', borderRadius: '99px', border: 'none', fontWeight: 600, fontSize: '0.8rem', cursor: 'pointer', transition: 'all 0.2s', backgroundColor: activeTab === 'leads' ? 'white' : 'transparent', color: activeTab === 'leads' ? 'var(--accent-color)' : 'var(--text-secondary)', boxShadow: activeTab === 'leads' ? '0 2px 10px rgba(0,0,0,0.05)' : 'none' }}
            >
              Leads
            </button>
            <button 
              onClick={() => setActiveTab('estimates')}
              style={{ padding: '0.4rem 0.875rem', borderRadius: '99px', border: 'none', fontWeight: 600, fontSize: '0.8rem', cursor: 'pointer', transition: 'all 0.2s', backgroundColor: activeTab === 'estimates' ? 'white' : 'transparent', color: activeTab === 'estimates' ? 'var(--accent-color)' : 'var(--text-secondary)', boxShadow: activeTab === 'estimates' ? '0 2px 10px rgba(0,0,0,0.05)' : 'none' }}
            >
              Estimates ({estimates.length})
            </button>
          </div>
          <div className="header-search mobile-hide" style={{ width: '200px' }}>
            <Search size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
            <input 
              type="text" 
              placeholder="Search..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{ backgroundColor: 'white', border: '1px solid var(--border-color)' }}
            />
          </div>
          {isOwner && (
            <button className="btn" style={{ backgroundColor: 'white', color: 'var(--accent-color)', border: '1px solid var(--border-color)', boxShadow: 'var(--shadow-sm)', borderRadius: '99px', padding: '0.5rem 0.875rem', fontSize: '0.8rem' }} onClick={handleExport}>
               <Download size={14} /> <span className="mobile-hide">Export</span>
            </button>
          )}
          <button className="btn" style={{ backgroundColor: 'var(--accent-color)', color: 'white', borderRadius: '99px', boxShadow: '0 4px 15px rgba(45, 46, 137, 0.2)', padding: '0.5rem 0.875rem', fontSize: '0.8rem' }} onClick={() => navigate('/worker-crm')}>
            <Plus size={16} /> New Lead
          </button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="stats-grid">
        <div className="stat-card" style={{ background: 'linear-gradient(135deg, var(--accent-color) 0%, #1a1b5d 100%)', color: 'white', border: 'none' }}>
          <div className="stat-icon-top-right" style={{ borderColor: 'rgba(255,255,255,0.2)', color: 'white' }}>
            <CheckCircle2 size={16} />
          </div>
          <div className="stat-card-title" style={{ color: 'rgba(255,255,255,0.8)' }}>
            Active Clients
          </div>
          <div className="stat-card-value" style={{ color: 'white' }}>
            {submissions.filter(s => s.status === 'Converted').length}
          </div>
          <div className="stat-card-subtitle" style={{ color: 'rgba(255,255,255,0.7)' }}>
            Successfully converted leads
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon-top-right">
            <ShieldAlert size={16} color="#e11d48" />
          </div>
          <div className="stat-card-title">Pending Leads</div>
          <div className="stat-card-value">
            {submissions.filter(s => s.status === 'New' || s.status === 'Interested').length}
          </div>
          <div className="stat-card-subtitle" style={{ color: 'var(--text-muted)' }}>
            New and Interested leads
          </div>
        </div>
      </div>

      {/* 3-Column Layout for CRM */}
      <div className="crm-layout" style={{ display: 'flex', gap: '1.5rem', alignItems: 'flex-start', flexWrap: 'wrap' }}>
        
        {/* Left Column: Team & Automation (Owner only) */}
        {isOwner && (
          <div style={{ flex: '1 1 250px', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            
            <div className="card" style={{ padding: '1.5rem', marginBottom: 0 }}>
              <h3 style={{ fontSize: '1.1rem', marginBottom: '1.25rem', color: 'var(--accent-color)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Users size={18} /> Team Leaderboard
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {employeeStats.map((emp, idx) => (
                  <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <div style={{ width: '32px', height: '32px', borderRadius: '50%', backgroundColor: idx === 0 ? 'var(--primary-lighter)' : '#f3f4f6', color: idx === 0 ? 'var(--primary-color)' : 'var(--text-secondary)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: '0.85rem' }}>
                      {idx + 1}
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: '0.9rem', fontWeight: 600 }}>{emp.name}</div>
                      <div style={{ width: '100%', height: '4px', backgroundColor: '#f3f4f6', borderRadius: '2px', marginTop: '0.25rem', overflow: 'hidden' }}>
                        <div style={{ width: `${(emp.closed / emp.target) * 100}%`, height: '100%', backgroundColor: idx === 0 ? 'var(--primary-color)' : 'var(--accent-color)' }}></div>
                      </div>
                    </div>
                    <div style={{ fontSize: '0.85rem', fontWeight: 700 }}>{emp.closed}</div>
                  </div>
                ))}
              </div>
            </div>

            <div className="card" style={{ padding: '1.5rem', marginBottom: 0 }}>
              <h3 style={{ fontSize: '1.1rem', marginBottom: '1.25rem', color: 'var(--accent-color)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <MessageCircle size={18} color="#22c55e" /> Global WhatsApp Log
              </h3>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '1rem' }}>Recent automated messages:</p>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {submissions.flatMap(s => (s.meetingNotes || []).filter(n => n.isWhatsApp)).slice(-3).map((note, idx) => (
                  <div key={idx} style={{ display: 'flex', alignItems: 'flex-start', gap: '0.5rem', fontSize: '0.8rem', padding: '0.5rem', backgroundColor: '#f0fdf4', borderRadius: '8px', border: '1px solid #dcfce7' }}>
                    <CheckCircle2 size={14} color="#22c55e" style={{ marginTop: '2px' }} />
                    <div style={{ flex: 1, color: '#166534' }}>
                      {note.note}
                    </div>
                  </div>
                ))}
                {submissions.flatMap(s => (s.meetingNotes || []).filter(n => n.isWhatsApp)).length === 0 && (
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>No messages sent yet.</div>
                )}
              </div>
            </div>

          </div>
        )}

        {/* Middle Column: Lead Pipeline or Estimates */}
        <div className="card" style={{ flex: '2 1 500px', marginBottom: 0, overflow: 'hidden' }}>
          <div className="card-header" style={{ borderBottom: '1px solid var(--border-color)', backgroundColor: '#fafafa', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
             <h3 style={{ color: 'var(--accent-color)', fontWeight: 700 }}>{activeTab === 'leads' ? 'Active Leads' : 'Quick Estimates'}</h3>
          </div>
          
          <div className="table-responsive">
            {activeTab === 'leads' ? (
              <table className="table">
                <thead>
                  <tr>
                    <th>Applicant</th>
                    <th>Loan Type</th>
                    {isOwner && <th>Assigned To</th>}
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {submissions.length === 0 ? (
                    <tr>
                      <td colSpan={isOwner ? "4" : "3"} style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
                        No applications found.
                      </td>
                    </tr>
                  ) : (
                    filteredSubmissions.map((sub) => {
                      const emp = MOCK_USERS.find(u => u.id === sub.assignedTo);
                      const statusColors = {
                        'New': { bg: '#e0f2fe', text: '#0369a1', border: '#bae6fd' },
                        'Interested': { bg: '#fef3c7', text: '#b45309', border: '#fde68a' },
                        'Converted': { bg: '#d1fae5', text: '#047857', border: '#a7f3d0' },
                        'Not Converted': { bg: '#fee2e2', text: '#b91c1c', border: '#fecaca' }
                      };
                      const colorScheme = statusColors[sub.status] || { bg: '#fff7ed', text: '#ea580c', border: '#ffedd5' };

                      return (
                        <tr 
                          key={sub.uid}
                          style={{ 
                            cursor: 'pointer', 
                            backgroundColor: selectedLead?.uid === sub.uid ? 'var(--primary-lighter)' : 'transparent',
                            borderLeft: selectedLead?.uid === sub.uid ? '3px solid var(--primary-color)' : '3px solid transparent'
                          }}
                          onClick={() => setSelectedLead(sub)}
                        >
                          <td>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                              <div style={{ width: '36px', height: '36px', borderRadius: '50%', backgroundColor: '#e2e8f0', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, color: '#64748b' }}>
                                {(sub.fullName || 'U')[0].toUpperCase()}
                              </div>
                              <div>
                                <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{sub.fullName}</div>
                                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{sub.phone}</div>
                              </div>
                            </div>
                          </td>
                          <td style={{ fontSize: '0.85rem', fontWeight: 500 }}>{sub.loanType}</td>
                          {isOwner && (
                            <td>
                              <span style={{ fontSize: '0.75rem', padding: '0.25rem 0.5rem', backgroundColor: '#f3f4f6', borderRadius: '4px', color: 'var(--text-secondary)' }}>
                                {emp ? emp.name : 'Unassigned'}
                              </span>
                            </td>
                          )}
                          <td>
                            <span className="badge" style={{ backgroundColor: colorScheme.bg, color: colorScheme.text, border: `1px solid ${colorScheme.border}` }}>
                              {sub.status || 'New'}
                            </span>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            ) : (
              <table className="table">
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>Name</th>
                    <th>Phone</th>
                    <th>Product & Amount</th>
                  </tr>
                </thead>
                <tbody>
                  {estimates.length === 0 ? (
                    <tr>
                      <td colSpan="4" style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
                        No quick estimates found.
                      </td>
                    </tr>
                  ) : (
                    estimates.filter(est => 
                      (est.name || '').toLowerCase().includes(searchTerm.toLowerCase()) || 
                      (est.phone || '').includes(searchTerm)
                    ).map((est) => (
                      <tr key={est.id}>
                        <td style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                          {new Date(est.createdAt).toLocaleDateString()}
                        </td>
                        <td style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{est.name}</td>
                        <td style={{ fontSize: '0.85rem' }}>{est.phone}</td>
                        <td>
                          <div style={{ fontSize: '0.85rem', fontWeight: 600 }}>{est.service}</div>
                          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>₹ {est.amount}</div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            )}
          </div>
        </div>

        {/* Right Column: Lead Detail Panel */}
        {selectedLead ? (
          <div className="card" style={{ flex: '1.5 1 300px', padding: '1.25rem', position: 'sticky', top: '80px', marginBottom: 0, borderTop: '4px solid var(--primary-color)', minWidth: 0 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.5rem' }}>
              <h3 style={{ fontSize: '1.125rem', color: 'var(--accent-color)', fontWeight: 800 }}>Lead Details</h3>
              <button 
                onClick={() => setSelectedLead(null)}
                style={{ background: 'var(--background-color)', border: 'none', cursor: 'pointer', color: 'var(--text-secondary)', padding: '0.25rem 0.75rem', borderRadius: '99px', fontSize: '0.8rem', fontWeight: 600 }}
              >
                Close
              </button>
            </div>

            {/* Status & Assignment controls */}
            <div style={{ marginBottom: '1.5rem', padding: '1rem', backgroundColor: '#f8fafc', borderRadius: '12px' }}>
              <div style={{ marginBottom: '1rem' }}>
                <label style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-muted)', display: 'block', marginBottom: '0.25rem' }}>Current Status</label>
                <select 
                  className="form-control" 
                  value={selectedLead.status || 'New'} 
                  onChange={(e) => handleStatusChange(selectedLead.uid, e.target.value)}
                  style={{ height: '36px', fontSize: '0.85rem' }}
                >
                  {LEAD_STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>

              {isOwner && (
                <div>
                  <label style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-muted)', display: 'block', marginBottom: '0.25rem' }}>Assign To</label>
                  <select 
                    className="form-control" 
                    value={selectedLead.assignedTo || ''} 
                    onChange={(e) => handleAssignEmployee(selectedLead.uid, e.target.value)}
                    style={{ height: '36px', fontSize: '0.85rem' }}
                  >
                    <option value="" disabled>— Select Manager —</option>
                    {MOCK_USERS.filter(u => u.role === 'manager').map(emp => (
                      <option key={emp.id} value={emp.id}>{emp.name}</option>
                    ))}
                  </select>
                </div>
              )}
            </div>
            
            <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', marginBottom: '1.5rem', paddingBottom: '1.5rem', borderBottom: '1px dashed var(--border-color)' }}>
              <div>
                <h4 style={{ fontSize: '1.1rem', marginBottom: '0.15rem' }}>{selectedLead.fullName}</h4>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>ID: {selectedLead.uid}</p>
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginBottom: '1.5rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <Smartphone size={16} color="var(--primary-color)" />
                <div>
                  <div style={{ fontSize: '0.9rem', fontWeight: 600 }}>{selectedLead.phone}</div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{selectedLead.email}</div>
                </div>
              </div>
              {/* Call & WhatsApp Action Buttons */}
              <div style={{ display: 'flex', gap: '0.75rem' }}>
                <a
                  href={`tel:${selectedLead.phone}`}
                  style={{
                    flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem',
                    padding: '0.6rem 1rem', borderRadius: '10px', textDecoration: 'none', fontWeight: 600,
                    fontSize: '0.85rem', backgroundColor: '#dbeafe', color: '#1d4ed8', border: '1px solid #bfdbfe'
                  }}
                >
                  <PhoneCall size={15} /> Call
                </a>
                <a
                  href={`https://wa.me/91${selectedLead.phone?.replace(/\D/g, '')}`}
                  target="_blank"
                  rel="noreferrer"
                  style={{
                    flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem',
                    padding: '0.6rem 1rem', borderRadius: '10px', textDecoration: 'none', fontWeight: 600,
                    fontSize: '0.85rem', backgroundColor: '#dcfce7', color: '#15803d', border: '1px solid #bbf7d0'
                  }}
                >
                  <MessageCircle size={15} /> WhatsApp
                </a>
              </div>
            </div>

            {/* Activity Log & Follow-Up */}
            <div style={{ marginBottom: '1.5rem' }}>
              <h4 style={{ fontSize: '0.9rem', color: 'var(--text-primary)', fontWeight: 700, marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Calendar size={16} /> Activity Log
              </h4>

              {/* Notes list - newest first */}
              <div style={{ backgroundColor: '#fff', border: '1px solid var(--border-color)', borderRadius: '8px', padding: '0.75rem', maxHeight: '160px', overflowY: 'auto', marginBottom: '0.75rem' }}>
                {(!selectedLead.meetingNotes || selectedLead.meetingNotes.length === 0) ? (
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textAlign: 'center' }}>No activity logged yet.</div>
                ) : (
                  [...selectedLead.meetingNotes].reverse().map((note, idx) => (
                    <div key={idx} style={{ fontSize: '0.8rem', paddingBottom: '0.5rem', marginBottom: '0.5rem', borderBottom: '1px solid #f1f5f9' }}>
                      <div style={{ color: 'var(--text-muted)', fontSize: '0.7rem', marginBottom: '0.2rem' }}>
                        {new Date(note.date).toLocaleString('en-IN')}
                        {note.isWhatsApp && <span style={{ color: '#22c55e', fontWeight: 600 }}> (WhatsApp)</span>}
                      </div>
                      <div style={{ color: 'var(--text-primary)' }}>{note.note}</div>
                    </div>
                  ))
                )}
              </div>

              {/* Combined update form */}
              <div style={{ backgroundColor: '#f8fafc', border: '1px solid var(--border-color)', borderRadius: '10px', padding: '0.875rem', display: 'flex', flexDirection: 'column', gap: '0.625rem' }}>
                <div style={{ fontSize: '0.7rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-muted)', letterSpacing: '0.05em' }}>Log Update</div>
                <input
                  type="text"
                  value={noteInput}
                  onChange={(e) => setNoteInput(e.target.value)}
                  placeholder="Add remark or update..."
                  className="form-control"
                  style={{ fontSize: '0.85rem' }}
                />
                <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'flex-end', flexWrap: 'wrap' }}>
                  <div style={{ flex: 1, minWidth: '140px' }}>
                    <label style={{ fontSize: '0.7rem', fontWeight: 600, color: 'var(--text-muted)', display: 'block', marginBottom: '0.2rem' }}>Next Follow-up Date</label>
                    <input
                      type="date"
                      key={selectedLead.uid}
                      defaultValue={selectedLead.followUpDate || ''}
                      id={`followup-${selectedLead.uid}`}
                      className="form-control"
                      style={{ fontSize: '0.85rem', height: '36px' }}
                    />
                  </div>
                  <button
                    onClick={() => {
                      const dateInput = document.getElementById(`followup-${selectedLead.uid}`);
                      const newDate = dateInput?.value || '';
                      if (!noteInput.trim() && !newDate) return;
                      if (noteInput.trim()) addMeetingNote(selectedLead.uid, noteInput, false);
                      if (newDate) {
                        updateLeadStatus(selectedLead.uid, null, null, newDate);
                        addMeetingNote(selectedLead.uid, `Follow-up scheduled: ${new Date(newDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}`, false);
                      }
                      setNoteInput('');
                      loadData();
                      setSelectedLead(getAllSubmissions().find(s => s.uid === selectedLead.uid));
                    }}
                    className="btn btn-primary"
                    style={{ padding: '0.5rem 1rem', fontSize: '0.82rem', flexShrink: 0 }}
                  >
                    Save
                  </button>
                </div>

                {/* Mark follow-up done */}
                {selectedLead.followUpDate && (
                  <button
                    onClick={() => {
                      addMeetingNote(selectedLead.uid, `✅ Follow-up completed (was due: ${new Date(selectedLead.followUpDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })})`, false);
                      updateLeadStatus(selectedLead.uid, null, null, '');
                      loadData();
                      setSelectedLead(getAllSubmissions().find(s => s.uid === selectedLead.uid));
                    }}
                    style={{ width: '100%', background: '#f0fdf4', color: '#15803d', border: '1px solid #bbf7d0', borderRadius: '8px', padding: '0.5rem', fontSize: '0.82rem', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.4rem' }}
                  >
                    <CheckCircle2 size={14} /> Mark Follow-up Done
                  </button>
                )}
              </div>
            </div>

            {isOwner && (
              <button 
                className="btn" 
                style={{ width: '100%', backgroundColor: '#fff1f2', color: '#e11d48', border: '1px solid #ffe4e6', borderRadius: '8px' }}
                onClick={() => handleDelete(selectedLead.uid)}
              >
                <Trash2 size={16} /> Delete Lead
              </button>
            )}
          </div>
        ) : (
          <div style={{ flex: '1.5 1 300px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '4rem 2rem', backgroundColor: 'transparent', border: '2px dashed var(--border-color)', borderRadius: '16px', color: 'var(--text-muted)' }}>
             <FolderDown size={48} style={{ marginBottom: '1rem', opacity: 0.5 }} />
             <p style={{ textAlign: 'center', fontSize: '0.9rem' }}>Select a lead from the pipeline<br/>to update status or log meetings.</p>
          </div>
        )}

      </div>
    </div>
  );
}
