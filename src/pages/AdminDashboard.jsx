import { useState, useEffect } from 'react';
import { 
  Download, Search, Trash2,
  Smartphone, Plus,
  MessageCircle, Users, CheckCircle2, Calendar, ShieldAlert,
  Phone, PhoneCall, ClipboardList, ExternalLink, ChevronDown
} from 'lucide-react';
import { 
  getAllSubmissions, deleteSubmission, exportToCSV, REQUIRED_DOCUMENTS, 
  MOCK_USERS, LEAD_STATUSES, updateLeadStatus, addMeetingNote,
  getAllEstimates, fetchFromCloud, getAllOnboardings,
  grantOnboardingAccess, revokeOnboardingAccess
} from '../store/db';
import ClientForm from './ClientForm';

import { useNavigate } from 'react-router-dom';

export default function AdminDashboard({ user, initialTab = 'leads' }) {
  const [submissions, setSubmissions] = useState([]);
  const [estimates, setEstimates] = useState([]);
  const [onboardings, setOnboardings] = useState([]);
  const [activeTab, setActiveTab] = useState(initialTab);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedLead, setSelectedLead] = useState(null);
  const [noteInput, setNoteInput] = useState('');
  const navigate = useNavigate();

  const isOwner = user?.role === 'owner';
  const userId = user?.id;

  const [showPendingPopup, setShowPendingPopup] = useState(false);
  const [pendingLeadsList, setPendingLeadsList] = useState([]);
  const [showExportMenu, setShowExportMenu] = useState(false);

  useEffect(() => {
    loadData();
    checkAgingLeads();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId]);

  const loadData = async () => {
    // 1. Instantly load local data for fast UI
    let all = getAllSubmissions();
    const ests = getAllEstimates();
    const onbs = getAllOnboardings();
    
    if (isOwner) {
      setSubmissions(all);
    } else {
      setSubmissions(all.filter(s => s.assignedTo === user.id));
    }
    setEstimates(ests);
    setOnboardings(onbs);

    // 2. Fetch latest from Vercel DB in background and update UI
    const cloudData = await fetchFromCloud();
    if (cloudData) {
      all = cloudData;
      if (isOwner) {
        setSubmissions(all);
      } else {
        setSubmissions(all.filter(s => s.assignedTo === user.id));
      }
      checkAgingLeads(all);
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

  const handleExportCSV = () => {
    if (submissions.length === 0) { alert("No data to export"); return; }
    exportToCSV(submissions);
    setShowExportMenu(false);
  };

  const handleExportPDF = () => {
    if (submissions.length === 0) { alert("No data to export"); return; }
    const html = `
      <html>
        <head>
          <title>Leads_Export_${new Date().toISOString().split('T')[0]}</title>
          <style>
            body { font-family: sans-serif; padding: 20px; }
            table { width: 100%; border-collapse: collapse; font-size: 12px; }
            th, td { border: 1px solid #ccc; padding: 8px; text-align: left; }
            th { background: #f4f4f4; }
          </style>
        </head>
        <body>
          <h2 style="margin-top:0;">Deals For Loan - Leads Export</h2>
          <table>
            <thead>
              <tr>
                <th>Date</th><th>Client Name</th><th>Phone</th><th>Loan Type</th><th>Amount</th><th>Status</th><th>Assigned To</th>
              </tr>
            </thead>
            <tbody>
              ${submissions.map(s => `
                <tr>
                  <td>${s.createdAt ? new Date(s.createdAt).toLocaleDateString('en-IN') : ''}</td>
                  <td>${s.fullName || ''}</td>
                  <td>${s.phone || ''}</td>
                  <td>${s.loanType || ''}</td>
                  <td>${s.loanAmount || ''}</td>
                  <td>${s.status || 'New'}</td>
                  <td>${s.assignedTo || 'Unassigned'}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
          <script>setTimeout(() => { window.print(); }, 500);</script>
        </body>
      </html>
    `;
    const tab = window.open('', '_blank');
    if (tab) {
      tab.document.open();
      tab.document.write(html);
      tab.document.close();
    } else {
      alert("Please allow popups to export as PDF.");
    }
    setShowExportMenu(false);
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
                      {/* Mobile number — click to call */}
                      {lead.phone && (
                        <a href={`tel:${lead.phone}`} style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem', marginTop: '0.3rem', color: '#374151', fontWeight: 700, fontSize: '0.82rem', textDecoration: 'none', background: '#f1f5f9', padding: '0.2rem 0.6rem', borderRadius: '99px', border: '1px solid #cbd5e1' }}>
                          📞 {lead.phone}
                        </a>
                      )}
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
            <div style={{ position: 'relative' }}>
              <button 
                className="btn" 
                style={{ backgroundColor: 'white', color: 'var(--accent-color)', border: '1px solid var(--border-color)', boxShadow: 'var(--shadow-sm)', borderRadius: '99px', padding: '0.5rem 0.875rem', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '0.3rem' }} 
                onClick={() => setShowExportMenu(!showExportMenu)}
              >
                 <Download size={14} /> <span className="mobile-hide">Export</span> <ChevronDown size={12} style={{ marginLeft: '0.2rem' }} />
              </button>
              {showExportMenu && (
                <div style={{ position: 'absolute', top: '110%', right: 0, backgroundColor: 'white', border: '1px solid var(--border-color)', borderRadius: '8px', boxShadow: '0 10px 25px rgba(0,0,0,0.1)', padding: '0.5rem', zIndex: 100, minWidth: '180px', display: 'flex', flexDirection: 'column', gap: '0.2rem' }}>
                  <button onClick={handleExportCSV} style={{ padding: '0.6rem 1rem', background: 'transparent', border: 'none', textAlign: 'left', cursor: 'pointer', borderRadius: '4px', fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-primary)' }} onMouseEnter={e => e.currentTarget.style.backgroundColor = '#f1f5f9'} onMouseLeave={e => e.currentTarget.style.backgroundColor = 'transparent'}>
                    Excel (CSV)
                  </button>
                  <button onClick={handleExportPDF} style={{ padding: '0.6rem 1rem', background: 'transparent', border: 'none', textAlign: 'left', cursor: 'pointer', borderRadius: '4px', fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-primary)' }} onMouseEnter={e => e.currentTarget.style.backgroundColor = '#f1f5f9'} onMouseLeave={e => e.currentTarget.style.backgroundColor = 'transparent'}>
                    PDF Document
                  </button>
                </div>
              )}
            </div>
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
             <h3 style={{ color: 'var(--accent-color)', fontWeight: 700 }}>{activeTab === 'leads' ? 'Active Leads' : activeTab === 'estimates' ? 'Quick Estimates' : 'Onboarded Clients'}</h3>
          </div>
          
          <div style={{ overflowX: 'auto' }}>
            {activeTab === 'leads' ? (
              (() => {
                const STATUS_COLS = [
                  { key: 'New',           label: 'New',           color: '#0369a1', bg: '#e0f2fe', border: '#bae6fd', dot: '#3b82f6' },
                  { key: 'Interested',    label: 'Interested',    color: '#b45309', bg: '#fef3c7', border: '#fde68a', dot: '#f59e0b' },
                  { key: 'Converted',     label: 'Converted',     color: '#047857', bg: '#d1fae5', border: '#a7f3d0', dot: '#10b981' },
                  { key: 'Not Converted', label: 'Not Converted', color: '#b91c1c', bg: '#fee2e2', border: '#fecaca', dot: '#ef4444' },
                ];
                return (
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, minmax(190px, 1fr))', gap: '0.75rem', padding: '1rem' }}>
                    {STATUS_COLS.map(col => {
                      const colLeads = filteredSubmissions.filter(s => (s.status || 'New') === col.key);
                      return (
                        <div key={col.key} style={{ display: 'flex', flexDirection: 'column', gap: '0' }}>
                          {/* Column header */}
                          <div style={{
                            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                            padding: '0.55rem 0.75rem',
                            borderRadius: '10px 10px 0 0',
                            background: col.bg,
                            border: `1.5px solid ${col.border}`,
                            borderBottom: 'none',
                          }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                              <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: col.dot, flexShrink: 0 }} />
                              <span style={{ fontWeight: 800, fontSize: '0.75rem', color: col.color, textTransform: 'uppercase', letterSpacing: '0.05em' }}>{col.label}</span>
                            </div>
                            <span style={{ background: col.dot, color: 'white', fontSize: '0.65rem', fontWeight: 800, borderRadius: '99px', padding: '0.1rem 0.45rem', lineHeight: '1.5' }}>
                              {colLeads.length}
                            </span>
                          </div>

                          {/* Cards */}
                          <div style={{
                            display: 'flex', flexDirection: 'column', gap: '0.5rem',
                            padding: '0.625rem',
                            background: '#f8fafc',
                            border: `1.5px solid ${col.border}`,
                            borderTop: 'none',
                            borderRadius: '0 0 10px 10px',
                            minHeight: '120px',
                            maxHeight: '420px',
                            overflowY: 'auto',
                          }}>
                            {colLeads.length === 0 ? (
                              <div style={{ textAlign: 'center', padding: '2rem 0.5rem', color: '#9ca3af', fontSize: '0.75rem' }}>
                                No leads
                              </div>
                            ) : (
                              colLeads.map(sub => {
                                const emp = MOCK_USERS.find(u => u.id === sub.assignedTo);
                                const isSelected = selectedLead?.uid === sub.uid;
                                return (
                                  <div
                                    key={sub.uid}
                                    onClick={() => setSelectedLead(sub)}
                                    style={{
                                      background: isSelected ? col.bg : 'white',
                                      border: `1.5px solid ${isSelected ? col.dot : '#e5e7eb'}`,
                                      borderRadius: '9px',
                                      padding: '0.625rem 0.75rem',
                                      cursor: 'pointer',
                                      transition: 'all 0.15s',
                                      boxShadow: isSelected ? `0 0 0 2px ${col.dot}40` : '0 1px 3px rgba(0,0,0,0.04)',
                                    }}
                                    onMouseEnter={e => { if (!isSelected) e.currentTarget.style.borderColor = col.dot; }}
                                    onMouseLeave={e => { if (!isSelected) e.currentTarget.style.borderColor = '#e5e7eb'; }}
                                  >
                                    {/* Avatar + name */}
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.35rem' }}>
                                      <div style={{ width: '28px', height: '28px', borderRadius: '50%', background: col.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: '0.75rem', color: col.color, flexShrink: 0 }}>
                                        {(sub.fullName || 'U')[0].toUpperCase()}
                                      </div>
                                      <div style={{ minWidth: 0 }}>
                                        <div style={{ fontWeight: 700, fontSize: '0.82rem', color: 'var(--text-primary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{sub.fullName}</div>
                                        <div style={{ fontSize: '0.7rem', color: '#9ca3af' }}>{sub.phone}</div>
                                      </div>
                                    </div>
                                    {/* Loan type */}
                                    <div style={{ fontSize: '0.7rem', color: '#6b7280', fontWeight: 600, marginBottom: isOwner ? '0.3rem' : 0 }}>
                                      {sub.loanType || sub.requirement}
                                    </div>
                                    {/* Assigned to (owner only) */}
                                    {isOwner && emp && (
                                      <div style={{ fontSize: '0.65rem', background: '#f3f4f6', color: '#6b7280', borderRadius: '4px', padding: '0.1rem 0.4rem', display: 'inline-block', fontWeight: 600 }}>
                                        {emp.name}
                                      </div>
                                    )}
                                    {/* Follow-up date if set */}
                                    {sub.followUpDate && (
                                      <div style={{ fontSize: '0.65rem', color: new Date(sub.followUpDate) < new Date() ? '#dc2626' : '#b45309', marginTop: '0.25rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.2rem' }}>
                                        <Calendar size={10} /> {new Date(sub.followUpDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                                      </div>
                                    )}
                                  </div>
                                );
                              })
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                );
              })()
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
                  style={{ padding: '0.25rem 0.5rem', height: '36px', fontSize: '0.85rem' }}
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
                    style={{ padding: '0.25rem 0.5rem', height: '36px', fontSize: '0.85rem' }}
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
                      style={{ padding: '0.25rem 0.5rem', fontSize: '0.85rem', height: '36px' }}
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

            {/* Onboarding Actions — show for any lead */}
            {(() => {
              const plainParams = new URLSearchParams({
                uid: selectedLead.uid,
                loanType: selectedLead.loanType || selectedLead.requirement || '',
                name: selectedLead.fullName || '',
                phone: selectedLead.phone || '',
                email: selectedLead.email || '',
                employmentType: selectedLead.employmentType || '',
                subRequirement: selectedLead.subRequirement || '',
              });
              // Secure share link — encode all fields into one opaque base64 token
              const refPayload = btoa(JSON.stringify({
                uid: selectedLead.uid,
                loanType: selectedLead.loanType || selectedLead.requirement || '',
                name: selectedLead.fullName || '',
                phone: selectedLead.phone || '',
                email: selectedLead.email || '',
                employmentType: selectedLead.employmentType || '',
                subRequirement: selectedLead.subRequirement || '',
              }));
              const shareUrl = `${window.location.origin}/onboarding?ref=${refPayload}`;
              return (
                <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.5rem' }}>
                  {/* Fill in-house — internal nav, plain params fine */}
                  <button
                    className="btn"
                    style={{ flex: 1, backgroundColor: '#f0fdf4', color: '#15803d', border: '1px solid #bbf7d0', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.4rem', fontWeight: 700, fontSize: '0.8rem', padding: '0.55rem' }}
                    onClick={() => navigate(`/onboarding?${plainParams.toString()}`)}
                  >
                    <ClipboardList size={14} /> Fill Form
                  </button>
                  {/* Copy secure shareable link */}
                  <button
                    className="btn"
                    style={{ flex: 1, backgroundColor: '#eff6ff', color: '#2563eb', border: '1px solid #bfdbfe', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.4rem', fontWeight: 700, fontSize: '0.8rem', padding: '0.55rem' }}
                    onClick={() => {
                      navigator.clipboard.writeText(shareUrl).then(() => {
                        const btn = document.getElementById(`share-btn-${selectedLead.uid}`);
                        if (btn) { btn.textContent = '✓ Copied!'; setTimeout(() => { btn.innerHTML = '🔗 Share Link'; }, 2000); }
                      });
                    }}
                    id={`share-btn-${selectedLead.uid}`}
                  >
                    🔗 Share Link
                  </button>
                </div>
              );
            })()}
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
        ) : null}

      </div>

      {/* ── Onboarded Clients Tab ── */}
      {activeTab === 'onboarded' && (
        <div style={{ marginTop: '1.5rem' }}>

          {onboardings.length === 0 ? (
            <div className="card" style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>
              <ClipboardList size={48} style={{ opacity: 0.2, marginBottom: '1rem' }} />
              <p style={{ fontWeight: 600 }}>No clients onboarded yet.</p>
              <p style={{ fontSize: '0.85rem' }}>Use "Fill Form" or "Share Link" from a lead to start an onboarding.</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {(isOwner ? onboardings : onboardings.filter(o => (o.grantedTo || []).includes(userId))).map(onb => {
                const managers = MOCK_USERS.filter(u => u.role === 'manager');
                const allFiles = Object.entries(onb.documents || {}).flatMap(([sec, slots]) =>
                  (slots || []).filter(s => s.uploaded).map(s => ({ ...s, section: sec }))
                );

                const downloadFile = (f) => {
                  if (!f.base64) return;
                  const a = document.createElement('a');
                  a.href = f.base64;
                  a.download = f.displayName || 'document';
                  a.click();
                };

                return (
                  <div key={onb.id} className="card" style={{ overflow: 'hidden', borderLeft: '4px solid #10b981' }}>
                    {/* Client header */}
                    <div style={{ padding: '1rem 1.25rem', display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.5rem', background: '#f8fafc', borderBottom: '1px solid var(--border-color)' }}>
                      <div>
                        <div style={{ fontWeight: 800, fontSize: '1rem', color: 'var(--text-primary)' }}>{onb.applicant?.name || '—'}</div>
                        <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
                          {onb.applicant?.phone} &nbsp;·&nbsp; {onb.loanType} &nbsp;·&nbsp;
                          {new Date(onb.submittedAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                        </div>
                        {onb.coApplicant?.name && (
                          <div style={{ fontSize: '0.75rem', color: '#6b7280', marginTop: '0.15rem' }}>Co-Applicant: <strong>{onb.coApplicant.name}</strong></div>
                        )}
                      </div>
                      <span style={{ fontSize: '0.75rem', background: '#d1fae5', color: '#065f46', padding: '0.25rem 0.75rem', borderRadius: '99px', fontWeight: 700, alignSelf: 'flex-start' }}>
                        {allFiles.length} file{allFiles.length !== 1 ? 's' : ''} uploaded
                      </span>
                    </div>

                    {/* Documents */}
                    <div style={{ padding: '1rem 1.25rem' }}>
                      {Object.entries(onb.documents || {}).map(([section, slots]) => {
                        const uploaded = (slots || []).filter(s => s.uploaded);
                        if (uploaded.length === 0) return null;
                        return (
                          <div key={section} style={{ marginBottom: '0.875rem' }}>
                            <div style={{ fontSize: '0.68rem', fontWeight: 800, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '0.4rem' }}>{section}</div>
                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                              {uploaded.map((f, i) => (
                                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', background: f.base64 ? '#f0fdf4' : '#f8fafc', border: '1px solid', borderColor: f.base64 ? '#bbf7d0' : '#e5e7eb', borderRadius: '8px', padding: '0.4rem 0.75rem', fontSize: '0.78rem' }}>
                                  <CheckCircle2 size={13} color={f.base64 ? '#10b981' : '#9ca3af'} />
                                  <span style={{ color: 'var(--text-primary)', fontWeight: 500, maxWidth: '180px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{f.displayName || 'File'}</span>
                                  {isOwner && f.base64 && (
                                    <button
                                      onClick={() => downloadFile(f)}
                                      style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#2563eb', fontSize: '0.72rem', fontWeight: 700, padding: '0 0.2rem', display: 'flex', alignItems: 'center', gap: '0.2rem' }}
                                    >
                                      ↓ Download
                                    </button>
                                  )}
                                  {/* Manager view: download only if granted */}
                                  {!isOwner && f.base64 && (onb.grantedTo || []).includes(userId) && (
                                    <button
                                      onClick={() => downloadFile(f)}
                                      style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#2563eb', fontSize: '0.72rem', fontWeight: 700, padding: '0 0.2rem' }}
                                    >
                                      ↓ Download
                                    </button>
                                  )}
                                </div>
                              ))}
                            </div>
                          </div>
                        );
                      })}
                    </div>

                    {/* Access control — admin only */}
                    {isOwner && (
                      <div style={{ padding: '0.875rem 1.25rem', borderTop: '1px solid var(--border-color)', background: '#fafafa' }}>
                        <div style={{ fontSize: '0.68rem', fontWeight: 800, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '0.625rem' }}>Branch / Manager Access</div>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                          {managers.map(mgr => {
                            const granted = (onb.grantedTo || []).includes(mgr.id);
                            return (
                              <button
                                key={mgr.id}
                                onClick={() => {
                                  if (granted) revokeOnboardingAccess(onb.id, mgr.id);
                                  else grantOnboardingAccess(onb.id, mgr.id);
                                  setOnboardings(getAllOnboardings());
                                }}
                                style={{
                                  padding: '0.35rem 0.875rem', borderRadius: '99px', cursor: 'pointer',
                                  fontSize: '0.78rem', fontWeight: 700, border: '1.5px solid',
                                  borderColor: granted ? '#10b981' : '#e5e7eb',
                                  background: granted ? '#f0fdf4' : 'white',
                                  color: granted ? '#15803d' : '#6b7280',
                                  transition: 'all 0.15s',
                                }}
                              >
                                {granted ? '✓ ' : ''}{mgr.name}
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
