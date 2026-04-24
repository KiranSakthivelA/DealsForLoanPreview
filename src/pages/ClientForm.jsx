import { useState, useEffect } from 'react';
import { 
  CheckCircle2, UploadCloud, ChevronRight, User, Mail, Phone, 
  Calendar, MapPin, CreditCard, Building, Map, Hash, FileCheck, ShieldCheck
} from 'lucide-react';
import { 
  generateUID, 
  saveSubmission, 
  fileToBase64, 
  LOAN_TYPES, 
  REQUIRED_DOCUMENTS 
} from '../store/db';

const MAX_FILE_SIZE = 1 * 1024 * 1024; // 1 MB

export default function ClientForm() {
  const [formData, setFormData] = useState({
    fullName: '',
    dob: '',
    age: '',
    phone: '',
    email: '',
    address: '',
    city: '',
    state: '',
    pincode: '',
    aadharNumber: '',
    panNumber: '',
    loanType: LOAN_TYPES[0],
    loanAmount: '',
  });

  const [documents, setDocuments] = useState({});
  const [profilePic, setProfilePic] = useState(null);
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submittedUid, setSubmittedUid] = useState(null);
  const [error, setError] = useState('');

  // Auto-calculate age from DOB
  useEffect(() => {
    if (formData.dob) {
      const birthDate = new Date(formData.dob);
      const today = new Date();
      let age = today.getFullYear() - birthDate.getFullYear();
      const m = today.getMonth() - birthDate.getMonth();
      if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
        age--;
      }
      setFormData(prev => ({ ...prev, age: age.toString() }));
    }
  }, [formData.dob]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleFileUpload = async (e, key, isProfile = false) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.size > MAX_FILE_SIZE) {
      setError(`File ${file.name} exceeds 1MB limit.`);
      e.target.value = ''; // Reset input
      return;
    }
    setError('');

    try {
      const base64 = await fileToBase64(file);
      if (isProfile) {
        setProfilePic(base64);
      } else {
        setDocuments(prev => ({ ...prev, [key]: base64 }));
      }
    } catch (err) {
      setError('Error reading file. Please try again.');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError('');

    try {
      if (formData.aadharNumber.length !== 12) {
        throw new Error('Aadhar Number must be exactly 12 digits');
      }
      const panRegex = /[A-Z]{5}[0-9]{4}[A-Z]{1}/;
      if (!panRegex.test(formData.panNumber.toUpperCase())) {
        throw new Error('Invalid PAN Number format (e.g., ABCDE1234F)');
      }
      if (!profilePic) {
        throw new Error('Please upload a Profile Picture');
      }
      const missingDocs = REQUIRED_DOCUMENTS.filter(doc => !documents[doc.key]);
      if (missingDocs.length > 0) {
        throw new Error(`Missing documents: ${missingDocs.map(d => d.label).join(', ')}`);
      }

      const newSubmission = {
        uid: generateUID(),
        ...formData,
        panNumber: formData.panNumber.toUpperCase(),
        profilePic,
        documents,
        status: 'Pending'
      };

      saveSubmission(newSubmission);
      setSubmittedUid(newSubmission.uid);
      window.scrollTo(0, 0);

    } catch (err) {
      setError(err.message);
      window.scrollTo(0, 0);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (submittedUid) {
    return (
      <div style={{ maxWidth: '600px', margin: '4rem auto', textAlign: 'center', padding: '4rem 3rem', backgroundColor: 'var(--surface-color)', borderRadius: '24px', boxShadow: '0 20px 40px rgba(0,0,0,0.08)', border: '1px solid rgba(0,0,0,0.05)' }}>
        <div style={{ width: '96px', height: '96px', background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 2rem', boxShadow: '0 10px 20px rgba(16, 185, 129, 0.3)' }}>
          <CheckCircle2 size={48} color="white" />
        </div>
        <h2 style={{ fontSize: '2.25rem', marginBottom: '1rem', color: 'var(--text-primary)' }}>Application Secured</h2>
        <p style={{ color: 'var(--text-secondary)', marginBottom: '2.5rem', fontSize: '1.1rem', lineHeight: '1.6' }}>
          Thank you for choosing Deals For Loan. Your application has been encrypted and securely transmitted to our processing team.
        </p>
        
        <div style={{ backgroundColor: '#f8fafc', padding: '2rem', borderRadius: '16px', border: '2px dashed var(--border-color)', marginBottom: '2.5rem', position: 'relative', overflow: 'hidden' }}>
          <div style={{ position: 'absolute', top: '-10px', left: '-10px', width: '40px', height: '40px', backgroundColor: 'var(--primary-lighter)', borderRadius: '50%' }}></div>
          <div style={{ position: 'absolute', bottom: '-10px', right: '-10px', width: '60px', height: '60px', backgroundColor: 'var(--primary-lighter)', borderRadius: '50%' }}></div>
          
          <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 800, letterSpacing: '1px', marginBottom: '0.75rem', position: 'relative', zIndex: 1 }}>Reference ID</div>
          <div style={{ fontSize: '2rem', fontWeight: 900, color: 'var(--primary-color)', letterSpacing: '3px', fontFamily: 'monospace', position: 'relative', zIndex: 1 }}>{submittedUid}</div>
        </div>
        
        <button 
          className="btn btn-primary" 
          style={{ width: '100%', padding: '1.25rem', fontSize: '1.1rem', borderRadius: '99px', display: 'flex', justifyContent: 'center', gap: '0.75rem', alignItems: 'center' }}
          onClick={() => window.location.reload()}
        >
          Submit Another Application <ChevronRight size={20} />
        </button>
      </div>
    );
  }

  // Helper component for input fields with icons
  const InputWithIcon = ({ icon: Icon, label, ...props }) => (
    <div className="form-group" style={{ marginBottom: 0 }}>
      <label className="form-label" style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '0.5rem', display: 'block', fontWeight: 600 }}>{label}</label>
      <div style={{ position: 'relative' }}>
        <div style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)', display: 'flex', alignItems: 'center' }}>
          <Icon size={18} />
        </div>
        <input 
          className="form-control" 
          style={{ paddingLeft: '44px', height: '52px', backgroundColor: '#f9fafb', border: '1px solid #e5e7eb', borderRadius: '12px', fontSize: '0.95rem', width: '100%', transition: 'all 0.2s', outline: 'none' }}
          onFocus={(e) => { e.target.style.borderColor = 'var(--primary-light)'; e.target.style.boxShadow = '0 0 0 4px var(--primary-lighter)'; e.target.previousSibling.style.color = 'var(--primary-light)'; }}
          onBlur={(e) => { e.target.style.borderColor = '#e5e7eb'; e.target.style.boxShadow = 'none'; e.target.previousSibling.style.color = 'var(--text-muted)'; }}
          {...props} 
        />
      </div>
    </div>
  );

  return (
    <div style={{ maxWidth: '840px', margin: '0 auto', paddingBottom: '3rem' }}>
      
      {/* Premium Header */}
      <div style={{ marginBottom: '2.5rem', textAlign: 'center', padding: '2rem 0' }}>
        <h2 style={{ fontSize: '2.5rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '0.5rem', letterSpacing: '-0.03em' }}>
          Client Application Form
        </h2>
        <p style={{ fontSize: '1.1rem', color: 'var(--text-secondary)', maxWidth: '500px', margin: '0 auto' }}>
          Please complete your profile to proceed with the loan approval process.
        </p>
      </div>

      <form onSubmit={handleSubmit}>
        
        {error && (
          <div style={{ backgroundColor: 'var(--error-bg)', color: 'var(--error-color)', padding: '1.25rem 1.5rem', borderRadius: '16px', marginBottom: '2rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.75rem', border: '1px solid #fecaca', boxShadow: '0 4px 12px rgba(239, 68, 68, 0.1)' }}>
            <div style={{ backgroundColor: 'var(--error-color)', color: 'white', borderRadius: '50%', width: '24px', height: '24px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>!</div>
            {error}
          </div>
        )}

        {/* Section 1: Profile */}
        <div className="card" style={{ padding: '3rem', borderRadius: '24px', marginBottom: '2rem', border: 'none', boxShadow: '0 10px 30px rgba(0,0,0,0.03)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '2rem' }}>
            <div style={{ width: '40px', height: '40px', borderRadius: '12px', backgroundColor: 'var(--primary-color)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: '1.2rem' }}>1</div>
            <h3 style={{ fontSize: '1.5rem', margin: 0 }}>Applicant Identity</h3>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '2.5rem', backgroundColor: '#f8fafc', padding: '2rem', borderRadius: '20px', border: '1px solid var(--border-color)' }}>
            <div style={{ position: 'relative' }}>
              <img 
                src={profilePic || 'https://images.unsplash.com/photo-1511367461989-f85a21fda167?ixlib=rb-1.2.1&auto=format&fit=crop&w=200&q=80'} 
                alt="Profile" 
                style={{ width: '120px', height: '120px', borderRadius: '50%', objectFit: 'cover', border: '4px solid white', boxShadow: '0 8px 16px rgba(0,0,0,0.1)', filter: profilePic ? 'none' : 'grayscale(100%) opacity(0.5)' }}
              />
              {profilePic && (
                <div style={{ position: 'absolute', bottom: '0', right: '0', backgroundColor: 'var(--success-color)', color: 'white', borderRadius: '50%', width: '32px', height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '3px solid white' }}>
                  <CheckCircle2 size={16} />
                </div>
              )}
            </div>
            <div style={{ flex: 1 }}>
              <h4 style={{ fontSize: '1.1rem', marginBottom: '0.5rem', color: 'var(--text-primary)' }}>Profile Photograph</h4>
              <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginBottom: '1.25rem', lineHeight: '1.5' }}>Upload a clear, passport-sized photograph showing your full face. Maximum file size is 1MB.</p>
              <div style={{ position: 'relative', display: 'inline-block' }}>
                <input 
                  type="file" 
                  accept="image/*" 
                  onChange={(e) => handleFileUpload(e, null, true)}
                  style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', opacity: 0, cursor: 'pointer' }}
                />
                <span className="btn" style={{ backgroundColor: 'white', color: 'var(--text-primary)', border: '1px solid var(--border-color)', borderRadius: '99px', padding: '0.6rem 1.5rem', fontSize: '0.9rem', fontWeight: 600, boxShadow: '0 2px 4px rgba(0,0,0,0.02)' }}>
                  {profilePic ? 'Change Photo' : 'Upload Photo'}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Section 2: Personal Details */}
        <div className="card" style={{ padding: '3rem', borderRadius: '24px', marginBottom: '2rem', border: 'none', boxShadow: '0 10px 30px rgba(0,0,0,0.03)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '2rem' }}>
            <div style={{ width: '40px', height: '40px', borderRadius: '12px', backgroundColor: 'var(--primary-color)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: '1.2rem' }}>2</div>
            <h3 style={{ fontSize: '1.5rem', margin: 0 }}>Personal Details</h3>
          </div>

          <div className="form-row" style={{ marginBottom: '1.5rem' }}>
            <InputWithIcon icon={User} label="Full Legal Name" required type="text" name="fullName" placeholder="As per government ID" value={formData.fullName} onChange={handleInputChange} />
            <InputWithIcon icon={Mail} label="Email Address" required type="email" name="email" placeholder="name@example.com" value={formData.email} onChange={handleInputChange} />
          </div>

          <div className="form-row-3" style={{ marginBottom: '2.5rem' }}>
            <InputWithIcon icon={Phone} label="Phone Number" required type="tel" name="phone" placeholder="+91 00000 00000" value={formData.phone} onChange={handleInputChange} />
            <InputWithIcon icon={Calendar} label="Date of Birth" required type="date" name="dob" value={formData.dob} onChange={handleInputChange} />
            
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label" style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '0.5rem', display: 'block', fontWeight: 600 }}>Age</label>
              <input 
                readOnly 
                type="text" 
                value={formData.age} 
                placeholder="Auto-calculated"
                style={{ padding: '0 1.25rem', height: '52px', backgroundColor: '#f1f5f9', border: '1px solid transparent', borderRadius: '12px', fontSize: '0.95rem', width: '100%', color: 'var(--text-muted)', fontWeight: 600, outline: 'none' }}
              />
            </div>
          </div>

          <div style={{ height: '1px', backgroundColor: 'var(--border-color)', margin: '2.5rem 0' }}></div>
          
          <h4 style={{ fontSize: '1.1rem', marginBottom: '1.5rem', color: 'var(--text-primary)' }}>Address & KYC</h4>

          <div className="form-group" style={{ marginBottom: '1.5rem' }}>
            <label className="form-label" style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '0.5rem', display: 'block', fontWeight: 600 }}>Current Residential Address</label>
            <div style={{ position: 'relative' }}>
              <div style={{ position: 'absolute', left: '16px', top: '16px', color: 'var(--text-muted)' }}><MapPin size={18} /></div>
              <textarea 
                required 
                name="address" 
                placeholder="Building, Street, Area..." 
                rows="2" 
                value={formData.address} 
                onChange={handleInputChange}
                style={{ padding: '16px 16px 16px 44px', backgroundColor: '#f9fafb', border: '1px solid #e5e7eb', borderRadius: '12px', fontSize: '0.95rem', width: '100%', transition: 'all 0.2s', outline: 'none', resize: 'none', fontFamily: 'inherit' }}
                onFocus={(e) => { e.target.style.borderColor = 'var(--primary-light)'; e.target.style.boxShadow = '0 0 0 4px var(--primary-lighter)'; e.target.previousSibling.style.color = 'var(--primary-light)'; }}
                onBlur={(e) => { e.target.style.borderColor = '#e5e7eb'; e.target.style.boxShadow = 'none'; e.target.previousSibling.style.color = 'var(--text-muted)'; }}
              ></textarea>
            </div>
          </div>
          
          <div className="form-row-3" style={{ marginBottom: '2.5rem' }}>
            <InputWithIcon icon={Building} label="City" required type="text" name="city" placeholder="City" value={formData.city} onChange={handleInputChange} />
            <InputWithIcon icon={Map} label="State" required type="text" name="state" placeholder="State" value={formData.state} onChange={handleInputChange} />
            <InputWithIcon icon={Hash} label="Pincode" required type="text" name="pincode" placeholder="000000" value={formData.pincode} onChange={handleInputChange} />
          </div>

          <div className="form-row">
            <InputWithIcon icon={CreditCard} label="Aadhar Number" required type="text" name="aadharNumber" maxLength="12" placeholder="12-digit format" value={formData.aadharNumber} onChange={handleInputChange} />
            <InputWithIcon icon={CreditCard} label="PAN Number" required type="text" name="panNumber" maxLength="10" placeholder="ABCDE1234F" value={formData.panNumber} onChange={handleInputChange} style={{ textTransform: 'uppercase' }} />
          </div>
        </div>

        {/* Section 3: Loan Requirement */}
        <div className="card" style={{ padding: '3rem', borderRadius: '24px', marginBottom: '2rem', border: 'none', boxShadow: '0 10px 30px rgba(0,0,0,0.03)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '2rem' }}>
            <div style={{ width: '40px', height: '40px', borderRadius: '12px', backgroundColor: 'var(--primary-color)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: '1.2rem' }}>3</div>
            <h3 style={{ fontSize: '1.5rem', margin: 0 }}>Loan Requirements</h3>
          </div>

          <div className="form-row" style={{ backgroundColor: '#f8fafc', padding: '2rem', borderRadius: '20px', border: '1px solid var(--border-color)' }}>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label" style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '0.5rem', display: 'block', fontWeight: 600 }}>Select Loan Type</label>
              <select 
                name="loanType" 
                value={formData.loanType} 
                onChange={handleInputChange} 
                style={{ padding: '0 1.25rem', height: '52px', backgroundColor: 'white', border: '1px solid #e5e7eb', borderRadius: '12px', fontSize: '0.95rem', width: '100%', cursor: 'pointer', outline: 'none', appearance: 'none', backgroundImage: 'url("data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' width=\'24\' height=\'24\' viewBox=\'0 0 24 24\' fill=\'none\' stroke=\'%236b7280\' stroke-width=\'2\' stroke-linecap=\'round\' stroke-linejoin=\'round\'%3E%3Cpolyline points=\'6 9 12 15 18 9\'%3E%3C/polyline%3E%3C/svg%3E")', backgroundRepeat: 'no-repeat', backgroundPosition: 'right 1rem center', backgroundSize: '1em' }}
              >
                {LOAN_TYPES.map(type => <option key={type} value={type}>{type}</option>)}
              </select>
            </div>
            
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label" style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '0.5rem', display: 'block', fontWeight: 600 }}>Required Amount (₹)</label>
              <div style={{ position: 'relative' }}>
                <div style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-primary)', fontWeight: 700 }}>₹</div>
                <input 
                  required 
                  type="number" 
                  name="loanAmount" 
                  placeholder="e.g. 500000" 
                  value={formData.loanAmount} 
                  onChange={handleInputChange}
                  style={{ paddingLeft: '40px', height: '52px', backgroundColor: 'white', border: '1px solid #e5e7eb', borderRadius: '12px', fontSize: '1.1rem', fontWeight: 600, width: '100%', transition: 'all 0.2s', outline: 'none' }}
                  onFocus={(e) => { e.target.style.borderColor = 'var(--primary-light)'; e.target.style.boxShadow = '0 0 0 4px var(--primary-lighter)'; }}
                  onBlur={(e) => { e.target.style.borderColor = '#e5e7eb'; e.target.style.boxShadow = 'none'; }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Section 4: Documents Upload */}
        <div className="card" style={{ padding: '3rem', borderRadius: '24px', marginBottom: '3rem', border: 'none', boxShadow: '0 10px 30px rgba(0,0,0,0.03)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <div style={{ width: '40px', height: '40px', borderRadius: '12px', backgroundColor: 'var(--primary-color)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: '1.2rem' }}>4</div>
              <div>
                <h3 style={{ fontSize: '1.5rem', margin: 0 }}>Required Documents</h3>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>Only PDF or Image formats under 1MB allowed.</p>
              </div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', backgroundColor: Object.values(documents).filter(Boolean).length === REQUIRED_DOCUMENTS.length ? 'var(--success-bg)' : '#f1f5f9', color: Object.values(documents).filter(Boolean).length === REQUIRED_DOCUMENTS.length ? 'var(--success-color)' : 'var(--text-secondary)', padding: '0.5rem 1rem', borderRadius: '99px', fontSize: '0.85rem', fontWeight: 700 }}>
              <FileCheck size={16} /> 
              {Object.values(documents).filter(Boolean).length} / {REQUIRED_DOCUMENTS.length} Completed
            </div>
          </div>
          
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: '1.5rem' }}>
            {REQUIRED_DOCUMENTS.map((doc) => {
              const isUploaded = !!documents[doc.key];
              return (
                <div key={doc.key} style={{ position: 'relative', overflow: 'hidden', borderRadius: '16px', border: isUploaded ? '2px solid var(--primary-light)' : '2px dashed var(--border-color)', backgroundColor: isUploaded ? 'var(--primary-lighter)' : '#fafafa', padding: '1.5rem', display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', transition: 'all 0.2s', height: '100%', minHeight: '160px' }}>
                  
                  {isUploaded && (
                    <div style={{ position: 'absolute', top: '12px', right: '12px', color: 'var(--success-color)' }}>
                      <CheckCircle2 size={20} fill="currentColor" color="white" />
                    </div>
                  )}

                  <input 
                    type="file" 
                    accept="image/*,application/pdf"
                    onChange={(e) => handleFileUpload(e, doc.key)}
                    style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', opacity: 0, cursor: 'pointer', zIndex: 10 }}
                  />
                  
                  <div style={{ width: '48px', height: '48px', borderRadius: '50%', backgroundColor: isUploaded ? 'white' : '#f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1rem', color: isUploaded ? 'var(--primary-light)' : 'var(--text-muted)', boxShadow: isUploaded ? '0 4px 10px rgba(0,0,0,0.05)' : 'none' }}>
                    {isUploaded ? <FileCheck size={24} /> : <UploadCloud size={24} />}
                  </div>
                  
                  <div style={{ fontSize: '0.9rem', fontWeight: 600, color: isUploaded ? 'var(--primary-dark)' : 'var(--text-primary)', marginBottom: '0.25rem', padding: '0 10px' }}>
                    {doc.label}
                  </div>
                  <div style={{ fontSize: '0.75rem', color: isUploaded ? 'var(--primary-light)' : 'var(--text-muted)', marginTop: 'auto' }}>
                    {isUploaded ? 'Click to replace' : 'Tap to upload'}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Submit Action */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <button 
            type="submit" 
            disabled={isSubmitting} 
            style={{ 
              backgroundColor: isSubmitting ? 'var(--text-muted)' : 'var(--primary-color)', 
              color: 'white', 
              border: 'none', 
              borderRadius: '99px', 
              padding: '1.25rem 4rem', 
              fontSize: '1.1rem', 
              fontWeight: 700, 
              cursor: isSubmitting ? 'not-allowed' : 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '0.75rem',
              boxShadow: '0 10px 25px rgba(19, 99, 59, 0.3)',
              transition: 'all 0.2s',
              transform: isSubmitting ? 'scale(0.98)' : 'scale(1)'
            }}
            onMouseOver={(e) => { if(!isSubmitting) e.currentTarget.style.backgroundColor = 'var(--primary-dark)'; }}
            onMouseOut={(e) => { if(!isSubmitting) e.currentTarget.style.backgroundColor = 'var(--primary-color)'; }}
          >
            {isSubmitting ? 'Processing Encryption...' : 'Submit Application'} 
            {!isSubmitting && <ChevronRight size={20} />}
          </button>
          <p style={{ marginTop: '1rem', fontSize: '0.85rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <ShieldCheck size={14} /> By submitting, you agree to our terms and data policy.
          </p>
        </div>

      </form>
    </div>
  );
}
