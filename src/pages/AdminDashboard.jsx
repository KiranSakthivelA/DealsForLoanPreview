import { useState, useEffect } from 'react';
import { 
  Download, Search, FileText, Trash2, MapPin, 
  Smartphone, CreditCard, Plus, FolderDown, 
  MessageCircle, TrendingUp, Users, CheckCircle2, Clock, Calendar, ShieldAlert
} from 'lucide-react';
import { 
  getAllSubmissions, deleteSubmission, exportToCSV, REQUIRED_DOCUMENTS, 
  MOCK_USERS, LEAD_STATUSES, updateLeadStatus, addMeetingNote,
  getAllEstimates
} from '../store/db';
import ClientForm from './ClientForm';

export default function AdminDashboard({ user }) {
  const [submissions, setSubmissions] = useState([]);
  const [estimates, setEstimates] = useState([]);
  const [activeTab, setActiveTab] = useState('leads'); // 'leads' or 'estimates'
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedLead, setSelectedLead] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [noteInput, setNoteInput] = useState('');

  const isOwner = user?.role === 'owner';

  useEffect(() => {
    loadData();
    // Check for aging leads daily popup (Simulated)
    if (!isOwner) {
      checkAgingLeads();
    }
  }, [user]);

  const loadData = () => {
    const all = getAllSubmissions();
    const ests = getAllEstimates();
    if (isOwner) {
      setSubmissions(all);
    } else {
      // Employee sees only their assigned leads
      setSubmissions(all.filter(s => s.assignedTo === user.id));
    }
    setEstimates(ests);
  };

  const checkAgingLeads = () => {
    const all = getAllSubmissions().filter(s => s.assignedTo === user.id);
    const aging = all.filter(s => {
      if (s.status === 'Approved' || s.status === 'Disbursed' || s.status === 'Not Converted') return false;
      const lastContact = new Date(s.lastContacted || s.createdAt).getTime();
      const now = new Date().getTime();
      return (now - lastContact) > (24 * 60 * 60 * 1000); // More than 24h
    });

    if (aging.length > 0) {
      alert(`Reminder: You have ${aging.length} leads that haven't been updated in over 24 hours. Please log a meeting note or update their status to avoid losing them!`);
    }
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

  const totalCases = submissions.length;
  const totalDisbursements = submissions.reduce((acc, curr) => {
    if (curr.status === 'Disbursed') {
      return acc + (parseFloat(curr.loanAmount) || 0);
    }
    return acc;
  }, 0);

  // Top employees logic (For owner view)
  const employeeStats = MOCK_USERS.filter(u => u.role === 'employee').map(emp => {
    const empLeads = submissions.filter(s => s.assignedTo === emp.id);
    return {
      name: emp.name,
      closed: empLeads.filter(s => s.status === 'Disbursed').length,
      target: 15
    };
  }).sort((a, b) => b.closed - a.closed).slice(0, 3);

  if (showForm) {
    return (
      <div style={{ padding: '1rem' }}>
        <button 
          onClick={() => { setShowForm(false); loadData(); }} 
          className="btn btn-secondary" 
          style={{ marginBottom: '2rem', display: 'flex', alignItems: 'center', gap: '0.5rem', borderRadius: '99px' }}
        >
          ← Back to CRM
        </button>
        <ClientForm />
      </div>
    );
  }

  return (
    <div style={{ animation: 'fadeIn 0.5s ease-out' }}>
      {/* Header Actions */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h2 style={{ fontSize: '2rem', color: 'var(--accent-color)', fontWeight: 800, letterSpacing: '-0.03em' }}>
            {isOwner ? 'CRM Overview' : 'My Daily Dashboard'}
          </h2>
          <p style={{ marginTop: '0.25rem', color: 'var(--text-secondary)' }}>
            {isOwner ? 'Manage your 10 employees and track global leads.' : `Welcome back, ${user?.name}. Log your client meetings below.`}
          </p>
        </div>
        
        <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', backgroundColor: '#f1f5f9', padding: '0.25rem', borderRadius: '99px', marginRight: '1rem' }}>
            <button 
              onClick={() => setActiveTab('leads')}
              style={{ padding: '0.5rem 1.25rem', borderRadius: '99px', border: 'none', fontWeight: 600, fontSize: '0.9rem', cursor: 'pointer', transition: 'all 0.2s', backgroundColor: activeTab === 'leads' ? 'white' : 'transparent', color: activeTab === 'leads' ? 'var(--accent-color)' : 'var(--text-secondary)', boxShadow: activeTab === 'leads' ? '0 2px 10px rgba(0,0,0,0.05)' : 'none' }}
            >
              Pipeline
            </button>
            <button 
              onClick={() => setActiveTab('estimates')}
              style={{ padding: '0.5rem 1.25rem', borderRadius: '99px', border: 'none', fontWeight: 600, fontSize: '0.9rem', cursor: 'pointer', transition: 'all 0.2s', backgroundColor: activeTab === 'estimates' ? 'white' : 'transparent', color: activeTab === 'estimates' ? 'var(--accent-color)' : 'var(--text-secondary)', boxShadow: activeTab === 'estimates' ? '0 2px 10px rgba(0,0,0,0.05)' : 'none' }}
            >
              Estimates ({estimates.length})
            </button>
          </div>
          <div className="header-search mobile-hide" style={{ width: '250px' }}>
            <Search size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
            <input 
              type="text" 
              placeholder="Search..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{ backgroundColor: 'white', border: '1px solid var(--border-color)' }}
            />
          </div>
          {isOwner && (
            <button className="btn" style={{ backgroundColor: 'white', color: 'var(--accent-color)', border: '1px solid var(--border-color)', boxShadow: 'var(--shadow-sm)', borderRadius: '99px' }} onClick={handleExport}>
               <Download size={16} /> Export
            </button>
          )}
          <button className="btn" style={{ backgroundColor: 'var(--accent-color)', color: 'white', borderRadius: '99px', boxShadow: '0 4px 15px rgba(45, 46, 137, 0.2)' }} onClick={() => setShowForm(true)}>
            <Plus size={18} /> New Lead
          </button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="stats-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))' }}>
        <div className="stat-card" style={{ background: 'linear-gradient(135deg, var(--accent-color) 0%, #1a1b5d 100%)', color: 'white', border: 'none' }}>
          <div className="stat-icon-top-right" style={{ borderColor: 'rgba(255,255,255,0.2)', color: 'white' }}>
            <Users size={16} />
          </div>
          <div className="stat-card-title" style={{ color: 'rgba(255,255,255,0.8)' }}>
            {isOwner ? 'Total Active Leads' : 'My Active Leads'}
          </div>
          <div className="stat-card-value" style={{ color: 'white' }}>{totalCases}</div>
          <div className="stat-card-subtitle" style={{ color: 'rgba(255,255,255,0.7)' }}>
            {isOwner ? 'Across 10 employees' : 'Currently assigned to you'}
          </div>
        </div>
        
        <div className="stat-card">
          <div className="stat-icon-top-right">
            <TrendingUp size={16} color="var(--primary-color)" />
          </div>
          <div className="stat-card-title">Disbursed Volume</div>
          <div className="stat-card-value">₹ {totalDisbursements > 0 ? new Intl.NumberFormat('en-IN').format(totalDisbursements) : '0'}</div>
          <div className="stat-card-subtitle" style={{ color: 'var(--text-muted)' }}>
            Successful conversions
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon-top-right">
            <ShieldAlert size={16} color="#e11d48" />
          </div>
          <div className="stat-card-title">Pending / Aging</div>
          <div className="stat-card-value">
            {submissions.filter(s => s.status !== 'Approved' && s.status !== 'Disbursed' && s.status !== 'Not Converted').length}
          </div>
          <div className="stat-card-subtitle" style={{ color: 'var(--text-muted)' }}>
            Require attention today
          </div>
        </div>
      </div>

      {/* 3-Column Layout for CRM */}
      <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'flex-start', flexWrap: 'wrap' }}>
        
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
             <h3 style={{ color: 'var(--accent-color)', fontWeight: 700 }}>{activeTab === 'leads' ? 'Lead Pipeline' : 'Quick Estimates'}</h3>
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
                        'Approved': { bg: '#dcfce7', text: '#15803d', border: '#bbf7d0' },
                        'Disbursed': { bg: '#d1fae5', text: '#047857', border: '#a7f3d0' },
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

        {/* Right Column: Detailed View & CRM Actions */}
        {selectedLead ? (
          <div className="card" style={{ flex: '1.5 1 300px', padding: '1.5rem', position: 'sticky', top: '100px', marginBottom: 0, borderTop: '4px solid var(--primary-color)' }}>
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
                    <option value="" disabled>Select Employee</option>
                    {MOCK_USERS.filter(u => u.role === 'employee').map(emp => (
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

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginBottom: '2rem' }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem' }}>
                <Smartphone size={16} color="var(--primary-color)" style={{ marginTop: '2px' }} />
                <div>
                  <div style={{ fontSize: '0.9rem', fontWeight: 600 }}>{selectedLead.phone}</div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{selectedLead.email}</div>
                </div>
              </div>
            </div>

            {/* Log Meeting / Notes Form */}
            <div style={{ marginBottom: '2rem' }}>
              <h4 style={{ fontSize: '0.9rem', color: 'var(--text-primary)', fontWeight: 700, marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Calendar size={16} /> Daily Log / Notes
              </h4>
              <div style={{ backgroundColor: '#fff', border: '1px solid var(--border-color)', borderRadius: '8px', padding: '0.75rem', maxHeight: '150px', overflowY: 'auto', marginBottom: '1rem' }}>
                {(!selectedLead.meetingNotes || selectedLead.meetingNotes.length === 0) ? (
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textAlign: 'center' }}>No notes logged yet.</div>
                ) : (
                  selectedLead.meetingNotes.map((note, idx) => (
                    <div key={idx} style={{ fontSize: '0.8rem', paddingBottom: '0.5rem', marginBottom: '0.5rem', borderBottom: '1px solid #f1f5f9' }}>
                      <div style={{ color: 'var(--text-muted)', fontSize: '0.7rem', marginBottom: '0.2rem' }}>
                        {new Date(note.date).toLocaleString()} {note.isWhatsApp && <span style={{ color: '#22c55e', fontWeight: 600 }}>(WhatsApp)</span>}
                      </div>
                      <div style={{ color: 'var(--text-primary)' }}>{note.note}</div>
                    </div>
                  ))
                )}
              </div>
              <form onSubmit={handleAddNote} style={{ display: 'flex', gap: '0.5rem' }}>
                <input 
                  type="text" 
                  value={noteInput} 
                  onChange={(e) => setNoteInput(e.target.value)} 
                  placeholder="Met client, collected docs..." 
                  className="form-control" 
                  style={{ fontSize: '0.85rem', flex: 1 }}
                />
                <button type="submit" className="btn btn-primary" style={{ padding: '0.5rem 1rem', fontSize: '0.85rem' }}>Add</button>
              </form>
              <button 
                type="button" 
                onClick={handleSendWhatsApp} 
                className="btn" 
                style={{ width: '100%', marginTop: '0.5rem', backgroundColor: '#dcfce7', color: '#166534', border: '1px solid #bbf7d0', fontSize: '0.85rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}
              >
                <MessageCircle size={16} /> Trigger WhatsApp Update
              </button>
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
