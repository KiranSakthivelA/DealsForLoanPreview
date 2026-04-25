import { useState, useEffect } from 'react';
import { 
  Download, Search, FileText, Trash2, MapPin, 
  User, Calendar, Smartphone, CreditCard, 
  ArrowUpRight, Plus, FolderDown
} from 'lucide-react';
import { getAllSubmissions, deleteSubmission, exportToCSV, REQUIRED_DOCUMENTS } from '../store/db';
import ClientForm from './ClientForm';

export default function AdminDashboard() {
  const [submissions, setSubmissions] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedLead, setSelectedLead] = useState(null);
  const [showForm, setShowForm] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = () => {
    setSubmissions(getAllSubmissions());
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

  const handleExport = () => {
    if (submissions.length === 0) {
      alert("No data to export");
      return;
    }
    exportToCSV(submissions);
  };

  const filteredSubmissions = submissions.filter(s => 
    s.uid.toLowerCase().includes(searchTerm.toLowerCase()) ||
    s.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    s.phone.includes(searchTerm)
  );

  const totalCases = submissions.length;
  const totalDisbursements = submissions.reduce((acc, curr) => acc + (parseFloat(curr.loanAmount) || 0), 0);
  const formattedDisbursements = new Intl.NumberFormat('en-IN', { maximumSignificantDigits: 3 }).format(totalDisbursements);

  if (showForm) {
    return (
      <div style={{ padding: '1rem' }}>
        <button 
          onClick={() => { setShowForm(false); loadData(); }} 
          className="btn btn-secondary" 
          style={{ marginBottom: '2rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}
        >
          ← Back to Dashboard
        </button>
        <ClientForm />
      </div>
    );
  }

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <div>
          <h2 style={{ fontSize: '2rem', color: 'var(--text-primary)' }}>Dashboard</h2>
          <p style={{ marginTop: '0.25rem' }}>Plan, prioritize, and accomplish your tasks with ease.</p>
        </div>
        
        <div style={{ display: 'flex', gap: '1rem' }}>
          <button className="btn btn-primary" onClick={() => setShowForm(true)}>
            <Plus size={18} /> Client Form
          </button>
          <button className="btn btn-secondary" onClick={handleExport}>
             Import Data
          </button>
        </div>
      </div>

      {/* Stats Grid matching Donezo */}
      <div className="stats-grid">
        <div className="stat-card solid-primary">
          <div className="stat-icon-top-right">
            <ArrowUpRight size={16} />
          </div>
          <div className="stat-card-title">Total Cases</div>
          <div className="stat-card-value">{totalCases}</div>
          <div className="stat-card-subtitle">
            <span style={{ backgroundColor: 'rgba(255,255,255,0.2)', padding: '2px 6px', borderRadius: '4px' }}>↗</span>
            Increased from last month
          </div>
        </div>
        
        <div className="stat-card">
          <div className="stat-icon-top-right">
            <ArrowUpRight size={16} color="var(--text-secondary)" />
          </div>
          <div className="stat-card-title">Disbursements</div>
          <div className="stat-card-value">{totalCases > 0 ? '12' : '0'}</div>
          <div className="stat-card-subtitle" style={{ color: 'var(--text-muted)' }}>
            <span style={{ backgroundColor: '#f3f4f6', padding: '2px 6px', borderRadius: '4px', color: 'var(--text-secondary)' }}>↗</span>
            Increased from last month
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon-top-right">
            <ArrowUpRight size={16} color="var(--text-secondary)" />
          </div>
          <div className="stat-card-title">Total Volume (₹)</div>
          <div className="stat-card-value">{totalCases > 0 ? '45L' : '0'}</div>
          <div className="stat-card-subtitle" style={{ color: 'var(--text-muted)' }}>
            <span style={{ backgroundColor: '#f3f4f6', padding: '2px 6px', borderRadius: '4px', color: 'var(--text-secondary)' }}>↗</span>
            Increased from last month
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon-top-right">
            <ArrowUpRight size={16} color="var(--text-secondary)" />
          </div>
          <div className="stat-card-title">Pending Cases</div>
          <div className="stat-card-value">{totalCases > 0 ? '2' : '0'}</div>
          <div className="stat-card-subtitle" style={{ color: 'var(--text-muted)' }}>
            On Discuss
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className={selectedLead ? "split-layout" : ""}>
        
        {/* Table Area */}
        <div className={selectedLead ? "split-main" : "card"} style={{ flex: 2 }}>
          <div className="card-header" style={{ borderBottom: 'none', paddingBottom: '0.5rem' }}>
             <h3>Recent Applications</h3>
          </div>
          
          <div className="table-responsive">
            <table className="table">
              <thead>
                <tr>
                  <th>Applicant</th>
                  <th>Contact</th>
                  <th>Loan Type</th>
                  <th>Amount</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {submissions.length === 0 ? (
                  <tr>
                    <td colSpan="5" style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
                      No applications found.
                    </td>
                  </tr>
                ) : (
                  filteredSubmissions.map(sub => (
                    <tr 
                      key={sub.uid}
                      style={{ cursor: 'pointer' }}
                      onClick={() => setSelectedLead(sub)}
                    >
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                           <img src={sub.profilePic || 'https://via.placeholder.com/150'} alt="Profile" style={{ width: '36px', height: '36px', borderRadius: '50%', objectFit: 'cover' }} />
                           <div style={{ fontWeight: 600 }}>{sub.fullName}</div>
                        </div>
                      </td>
                      <td>{sub.phone}</td>
                      <td>{sub.loanType}</td>
                      <td style={{ fontWeight: 600 }}>₹ {new Intl.NumberFormat('en-IN').format(sub.loanAmount)}</td>
                      <td>
                        <span className="badge badge-pending">Pending</span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Detailed View Sidebar */}
        {selectedLead && (
          <div className="split-sidebar card" style={{ padding: '1.5rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.5rem' }}>
              <h3 style={{ fontSize: '1.125rem' }}>Lead Details</h3>
              <button 
                onClick={() => setSelectedLead(null)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}
              >
                Close
              </button>
            </div>
            
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', marginBottom: '1.5rem' }}>
              <img src={selectedLead.profilePic || 'https://via.placeholder.com/150'} alt="Profile" style={{ width: '80px', height: '80px', borderRadius: '50%', objectFit: 'cover', marginBottom: '0.75rem' }} />
              <h4 style={{ fontSize: '1.125rem', marginBottom: '0.25rem' }}>{selectedLead.fullName}</h4>
              <p style={{ fontSize: '0.875rem' }}>{selectedLead.uid}</p>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginBottom: '2rem' }}>
              <div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700, marginBottom: '0.25rem' }}>Contact</div>
                <div style={{ fontSize: '0.9rem', fontWeight: 500 }}>{selectedLead.phone} <br/> {selectedLead.email}</div>
              </div>
              <div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700, marginBottom: '0.25rem' }}>Address</div>
                <div style={{ fontSize: '0.9rem', fontWeight: 500 }}>{selectedLead.address}, {selectedLead.city}, {selectedLead.state}</div>
              </div>
              <div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700, marginBottom: '0.25rem' }}>KYC Docs</div>
                <div style={{ fontSize: '0.9rem', fontWeight: 500 }}>PAN: <span style={{ textTransform: 'uppercase' }}>{selectedLead.panNumber}</span> <br/> Aadhar: {selectedLead.aadharNumber}</div>
              </div>
            </div>

            <h4 style={{ fontSize: '0.9rem', marginBottom: '1rem', color: 'var(--text-secondary)' }}>Documents ({Object.values(selectedLead.documents || {}).filter(Boolean).length}/7)</h4>
            <div className="docs-grid" style={{ gridTemplateColumns: '1fr 1fr' }}>
              {REQUIRED_DOCUMENTS.map(doc => {
                const base64Data = selectedLead.documents[doc.key];
                if (!base64Data) return null;
                return (
                  <div key={doc.key} className="doc-card" style={{ padding: '0.5rem' }}>
                    {base64Data.startsWith('data:image') ? (
                      <img src={base64Data} alt={doc.label} className="doc-preview" style={{ height: '60px', marginBottom: '0.5rem' }} />
                    ) : (
                      <div className="doc-preview" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '60px', marginBottom: '0.5rem' }}>
                        <FileText size={20} color="var(--primary-light)" />
                      </div>
                    )}
                    <a href={base64Data} download={`${selectedLead.uid}_${doc.key}`} style={{ fontSize: '0.7rem', fontWeight: 600, color: 'var(--primary-color)' }}>
                      Download
                    </a>
                  </div>
                );
              })}
            </div>

            <button 
              className="btn" 
              style={{ width: '100%', marginTop: '2rem', backgroundColor: '#fee2e2', color: 'var(--error-color)', border: 'none' }}
              onClick={() => handleDelete(selectedLead.uid)}
            >
              <Trash2 size={16} /> Delete Application
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
