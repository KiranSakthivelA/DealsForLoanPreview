import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { saveSubmission, generateUID, getLoggedInUser, SALES_PERSONS } from '../store/db';
import { Home, Building, User, Briefcase, Landmark, Car, CreditCard, Shield, Send, CheckCircle2 } from 'lucide-react';

const REQUIREMENTS_DATA = {
  "Home Loan": { sub: ["Purchase", "Construction", "Land Purchase", "BT + Top-up"], icon: Home, color: "#3b82f6" },
  "Mortgage Loan": { sub: ["Residential Building", "Commercial Building", "Loan Mortgage", "BT + Top-up"], icon: Building, color: "#8b5cf6" },
  "Personal Loan": { sub: ["Salaried", "BT + Top-up"], icon: User, color: "#10b981" },
  "Business Loan (Secured)": { sub: ["Term Loan, OD,CC", "BT + Top-up"], icon: Briefcase, color: "#f59e0b" },
  "Business Loan (Unsecured)": { sub: ["Self Employed", "BT + Top-up"], icon: Briefcase, color: "#ea580c" },
  "Agri Loan": { sub: ["Purchase", "Term Loan, OD,CC", "BT + Top-up"], icon: Landmark, color: "#65a30d" },
  "Vehicle Loan (Commercial)": { sub: ["New Purchase", "Used Purchase", "Refinance", "BT + Top-up"], icon: Car, color: "#64748b" },
  "Vehicle Loan (Individual)": { sub: ["New Purchase", "Used Purchase", "Refinance", "BT + Top-up"], icon: Car, color: "#94a3b8" },
  "Credit Card": { sub: [], icon: CreditCard, color: "#06b6d4" },
  "Insurance": { sub: ["General", "Health", "Life"], icon: Shield, color: "#ec4899" }
};

const REQUIREMENT_KEYS = Object.keys(REQUIREMENTS_DATA);

export default function WorkerCRM() {
  const [activeTab, setActiveTab] = useState(REQUIREMENT_KEYS[0]);
  const user = getLoggedInUser();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    clientName: '',
    dateOfApproach: new Date().toISOString().slice(0, 10),
    mobileNumber: '',
    mailId: '',
    employmentType: 'Salaried',
    subRequirement: REQUIREMENTS_DATA[REQUIREMENT_KEYS[0]].sub[0] || '',
    salesPerson: SALES_PERSONS[0],
    status: 'New',
    remark: '',
    followUpDate: ''
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    setFormData(prev => ({
      ...prev,
      subRequirement: REQUIREMENTS_DATA[tab].sub[0] || ''
    }));
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    setTimeout(() => {
      const submissionData = {
        uid: generateUID(),
        fullName: formData.clientName,
        phone: formData.mobileNumber,
        email: formData.mailId,
        dateOfApproach: formData.dateOfApproach,
        employmentType: formData.employmentType,
        requirement: activeTab,
        subRequirement: formData.subRequirement,
        status: formData.status,
        remark: formData.remark,
        assignedTo: user?.id || 'unassigned',
        salesPerson: formData.salesPerson,
        loanType: activeTab,
        source: 'Manager CRM',
        followUpDate: formData.followUpDate
      };

      saveSubmission(submissionData);
      
      setIsSubmitting(false);
      setShowSuccess(true);
      
      // Redirect to dashboard after short delay
      setTimeout(() => {
        setShowSuccess(false);
        navigate('/crm');
      }, 1500);
      
      // Reset form
      setFormData({
        clientName: '',
        dateOfApproach: new Date().toISOString().slice(0, 10),
        mobileNumber: '',
        mailId: '',
        employmentType: 'Salaried',
        subRequirement: REQUIREMENTS_DATA[activeTab].sub[0] || '',
        salesPerson: SALES_PERSONS[0],
        status: 'New',
        remark: '',
        followUpDate: ''
      });
    }, 600);
  };

  const ActiveIcon = REQUIREMENTS_DATA[activeTab].icon;
  const activeColor = REQUIREMENTS_DATA[activeTab].color;

  return (
    <div className="worker-crm-container" style={{ padding: '1rem', display: 'flex', flexDirection: 'column', height: '100%', maxWidth: '1400px', margin: '0 auto' }}>
      
      {/* Header Area */}
      <div style={{ 
        marginBottom: '1rem', 
        display: 'flex', 
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '0.75rem',
        background: 'linear-gradient(135deg, var(--surface-color) 0%, rgba(255,255,255,0.4) 100%)',
        padding: '1rem 1.25rem',
        borderRadius: '12px',
        boxShadow: '0 4px 20px rgba(0,0,0,0.02)',
        border: '1px solid rgba(255,255,255,0.8)'
      }}>
        <div>
          <h1 style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.02em', margin: 0 }}>Lead Acquisition</h1>
          <p style={{ color: 'var(--text-secondary)', marginTop: '0.15rem', fontSize: '0.85rem' }}>Streamlined entry for new client requirements.</p>
        </div>
        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
          <div style={{ padding: '0.4rem 0.875rem', background: 'var(--primary-lighter)', borderRadius: '99px', color: 'var(--primary-color)', fontWeight: 600, fontSize: '0.8rem' }}>
            {user?.name || 'Manager'}
          </div>
        </div>
      </div>

      <div className="crm-layout" style={{ display: 'flex', gap: '1.5rem', flex: 1, alignItems: 'flex-start' }}>
        
        {/* Modern Sidebar Tabs */}
        <div className="crm-sidebar" style={{ 
          width: '300px', 
          backgroundColor: 'transparent',
          display: 'flex',
          flexDirection: 'column',
          gap: '0.5rem'
        }}>
          {REQUIREMENT_KEYS.map((req) => {
            const ItemIcon = REQUIREMENTS_DATA[req].icon;
            const isActive = activeTab === req;
            const itemColor = REQUIREMENTS_DATA[req].color;
            
            return (
              <button
                key={req}
                onClick={() => handleTabChange(req)}
                style={{
                  textAlign: 'left',
                  padding: '1rem 1.25rem',
                  borderRadius: '12px',
                  border: '1px solid',
                  borderColor: isActive ? 'transparent' : 'var(--border-color)',
                  backgroundColor: isActive ? 'var(--surface-color)' : 'transparent',
                  color: isActive ? 'var(--text-primary)' : 'var(--text-secondary)',
                  fontWeight: isActive ? 700 : 500,
                  cursor: 'pointer',
                  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '1rem',
                  boxShadow: isActive ? '0 10px 25px -5px rgba(0, 0, 0, 0.05), 0 8px 10px -6px rgba(0, 0, 0, 0.01)' : 'none',
                  transform: isActive ? 'translateX(5px)' : 'none'
                }}
                onMouseEnter={(e) => { if (!isActive) e.currentTarget.style.backgroundColor = 'var(--surface-color)'; }}
                onMouseLeave={(e) => { if (!isActive) e.currentTarget.style.backgroundColor = 'transparent'; }}
              >
                <div style={{ 
                  width: '32px', height: '32px', 
                  borderRadius: '8px', 
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  backgroundColor: isActive ? `${itemColor}15` : '#f3f4f6',
                  color: isActive ? itemColor : 'var(--text-muted)',
                  transition: 'all 0.3s'
                }}>
                  <ItemIcon size={18} strokeWidth={isActive ? 2.5 : 2} />
                </div>
                {req}
              </button>
            )
          })}
        </div>

        {/* Premium Form Container */}
        <div className="crm-form-container" style={{ 
          flex: 1, 
          backgroundColor: 'var(--surface-color)', 
          borderRadius: '20px', 
          boxShadow: '0 10px 40px -10px rgba(0,0,0,0.05)',
          border: '1px solid rgba(255,255,255,0.5)',
          overflow: 'hidden',
          position: 'relative'
        }}>
          {/* Form Header with Dynamic Color */}
          <div style={{ 
            padding: '2rem 2.5rem', 
            borderBottom: '1px solid var(--border-color)',
            display: 'flex',
            alignItems: 'center',
            gap: '1rem',
            background: `linear-gradient(to right, ${activeColor}08, transparent)`
          }}>
            <div style={{ 
              width: '48px', height: '48px', 
              borderRadius: '12px', 
              backgroundColor: `${activeColor}15`,
              color: activeColor,
              display: 'flex', alignItems: 'center', justifyContent: 'center'
            }}>
              <ActiveIcon size={24} />
            </div>
            <div>
              <h2 style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>
                {activeTab} Application
              </h2>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginTop: '0.25rem' }}>
                Fill in the details below to log a new {activeTab.toLowerCase()} lead.
              </p>
            </div>
          </div>

          <form onSubmit={handleSubmit} style={{ padding: '2.5rem', display: 'flex', flexDirection: 'column', gap: '2rem' }}>
            
            {/* Section 1: Client Details */}
            <div>
              <h3 style={{ fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-muted)', fontWeight: 700, marginBottom: '1rem' }}>Client Details</h3>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.5rem' }}>
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label" style={{ fontSize: '0.8rem' }}>Client Full Name</label>
                  <input 
                    type="text" 
                    name="clientName" 
                    value={formData.clientName} 
                    onChange={handleInputChange} 
                    className="form-control" 
                    required 
                    placeholder="Full name of the client"
                    style={{ backgroundColor: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '10px' }}
                  />
                </div>

                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label" style={{ fontSize: '0.8rem' }}>Approached Date</label>
                  <input 
                    type="date" 
                    name="dateOfApproach" 
                    value={formData.dateOfApproach} 
                    onChange={handleInputChange} 
                    className="form-control" 
                    required 
                    max={new Date().toISOString().slice(0, 10)}
                    style={{ backgroundColor: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '10px' }}
                  />
                </div>

                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label" style={{ fontSize: '0.8rem' }}>Mobile Number</label>
                  <input 
                    type="tel" 
                    name="mobileNumber" 
                    value={formData.mobileNumber} 
                    onChange={handleInputChange} 
                    className="form-control" 
                    required 
                    placeholder="10-digit mobile number"
                    style={{ backgroundColor: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '10px' }}
                  />
                </div>

                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label" style={{ fontSize: '0.8rem' }}>Email Address</label>
                  <input 
                    type="email" 
                    name="mailId" 
                    value={formData.mailId} 
                    onChange={handleInputChange} 
                    className="form-control" 
                    placeholder="Client's email address"
                    style={{ backgroundColor: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '10px' }}
                  />
                </div>
              </div>
            </div>

            <div style={{ height: '1px', backgroundColor: 'var(--border-color)' }}></div>

            {/* Section 2: Requirement Specifics */}
            <div>
              <h3 style={{ fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-muted)', fontWeight: 700, marginBottom: '1rem' }}>Requirement Specifics</h3>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.5rem' }}>
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label" style={{ fontSize: '0.8rem' }}>Employment Type</label>
                  <select 
                    name="employmentType" 
                    value={formData.employmentType} 
                    onChange={handleInputChange} 
                    className="form-control"
                    style={{ backgroundColor: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '10px', appearance: 'auto' }}
                  >
                    <option value="Salaried">Salaried</option>
                    <option value="Self Employed">Self Employed</option>
                  </select>
                </div>

                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label" style={{ fontSize: '0.8rem' }}>Specific Type</label>
                  {REQUIREMENTS_DATA[activeTab].sub.length > 0 ? (
                    <select 
                      name="subRequirement" 
                      value={formData.subRequirement} 
                      onChange={handleInputChange} 
                      className="form-control"
                      style={{ backgroundColor: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '10px', appearance: 'auto' }}
                    >
                      {REQUIREMENTS_DATA[activeTab].sub.map(sub => (
                        <option key={sub} value={sub}>{sub}</option>
                      ))}
                    </select>
                  ) : (
                    <input 
                      type="text" 
                      className="form-control" 
                      value="N/A" 
                      disabled 
                      style={{ backgroundColor: '#f1f5f9', border: '1px solid #e2e8f0', borderRadius: '10px', color: '#94a3b8' }}
                    />
                  )}
                </div>
              </div>
            </div>

            <div style={{ height: '1px', backgroundColor: 'var(--border-color)' }}></div>

            {/* Section 3: CRM Details */}
            <div>
              <h3 style={{ fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-muted)', fontWeight: 700, marginBottom: '1rem' }}>Processing Details</h3>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.5rem' }}>
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label" style={{ fontSize: '0.8rem' }}>Initial Status</label>
                  <select 
                    name="status" 
                    value={formData.status} 
                    onChange={handleInputChange} 
                    className="form-control"
                    style={{ backgroundColor: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '10px', appearance: 'auto', fontWeight: 600, color: activeColor }}
                  >
                    <option value="New">New</option>
                    <option value="Interested">Interested</option>
                    <option value="Converted">Converted</option>
                    <option value="Not Converted">Not Converted</option>
                  </select>
                </div>

                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label" style={{ fontSize: '0.8rem' }}>Assigned Sales Person</label>
                  <select 
                    name="salesPerson" 
                    value={formData.salesPerson} 
                    onChange={handleInputChange} 
                    className="form-control"
                    style={{ backgroundColor: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '10px', appearance: 'auto' }}
                  >
                    {SALES_PERSONS.map(sp => (
                      <option key={sp} value={sp}>{sp}</option>
                    ))}
                  </select>
                </div>

                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label" style={{ fontSize: '0.8rem' }}>Follow Up Date</label>
                  <input 
                    type="date" 
                    name="followUpDate" 
                    value={formData.followUpDate} 
                    onChange={handleInputChange} 
                    className="form-control"
                    style={{ backgroundColor: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '10px' }}
                  />
                </div>
              </div>
            </div>

            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label" style={{ fontSize: '0.8rem' }}>Additional Remarks</label>
              <textarea 
                name="remark" 
                value={formData.remark} 
                onChange={handleInputChange} 
                className="form-control" 
                rows="3" 
                placeholder="Enter any notes, specific client requests, or context..."
                style={{ backgroundColor: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '10px', resize: 'vertical' }}
              ></textarea>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '1rem' }}>
              <button 
                type="submit" 
                disabled={isSubmitting}
                style={{ 
                  padding: '1rem 2.5rem', 
                  fontWeight: 700, 
                  fontSize: '1rem',
                  borderRadius: '12px',
                  background: isSubmitting ? '#9ca3af' : `linear-gradient(135deg, ${activeColor} 0%, ${activeColor}dd 100%)`,
                  color: 'white',
                  border: 'none',
                  cursor: isSubmitting ? 'not-allowed' : 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.75rem',
                  transition: 'all 0.3s',
                  boxShadow: `0 8px 20px ${activeColor}40`
                }}
              >
                {isSubmitting ? (
                  <>Processing...</>
                ) : showSuccess ? (
                  <><CheckCircle2 size={20} /> Success!</>
                ) : (
                  <><Send size={18} /> Submit Application</>
                )}
              </button>
            </div>

          </form>
        </div>
      </div>
    </div>
  );
}
