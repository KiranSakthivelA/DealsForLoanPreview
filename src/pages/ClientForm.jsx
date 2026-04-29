import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { CheckCircle, UploadCloud, ShieldCheck, User, MapPin } from 'lucide-react';
import { saveSubmission, generateUID, fileToBase64, LOAN_TYPES, REQUIRED_DOCUMENTS } from '../store/db';

export default function ClientForm() {
  const [formData, setFormData] = useState({
    fullName: '', dob: '', age: '', gender: '',
    phone: '', email: '', address: '', city: '', state: '', pincode: '',
    aadharNumber: '', panNumber: '',
    loanType: '', loanAmount: '',
    documents: {}
  });

  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [trackingId, setTrackingId] = useState('');

  const navigate = useNavigate();
  const location = useLocation();
  // Brand Palette
  const themeColor = '#f39e1e'; // Orange/Gold
  const themeGradient = 'linear-gradient(135deg, #f39e1e 0%, #ff8c00 100%)';
  const sidebarGradient = 'linear-gradient(135deg, #2d2e89 0%, #1a1b5d 100%)'; // Deep Blue

  useEffect(() => {
    // Check if a specific service or amount was passed via URL
    const searchParams = new URLSearchParams(location.search);
    const serviceParam = searchParams.get('service');
    const amountParam = searchParams.get('amount');
    
    if (serviceParam || amountParam) {
      setFormData(prev => ({ 
        ...prev, 
        ...(serviceParam && { loanType: serviceParam }),
        ...(amountParam && { loanAmount: amountParam })
      }));
    }
  }, [location]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleDocumentUpload = async (e, docKey) => {
    const file = e.target.files[0];
    if (file) {
      try {
        const base64 = await fileToBase64(file);
        setFormData(prev => ({
          ...prev,
          documents: { ...prev.documents, [docKey]: base64 }
        }));
      } catch (err) {
        console.error("Error converting file", err);
      }
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    // Simulate API delay
    setTimeout(() => {
      const savedData = saveSubmission({ ...formData, uid: generateUID() });
      setTrackingId(savedData.uid);
      setIsSuccess(true);
      setIsSubmitting(false);
    }, 1500);
  };

  const nextStep = () => setCurrentStep(prev => Math.min(prev + 1, 4));
  const prevStep = () => setCurrentStep(prev => Math.max(prev - 1, 1));

  if (isSuccess) {
    return (
      <div style={{ minHeight: '80vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem' }}>
        <div className="card" style={{ maxWidth: '500px', width: '100%', padding: '3rem 2rem', textAlign: 'center', borderTop: '4px solid #10b981' }}>
          <div style={{ width: '80px', height: '80px', background: '#d1fae5', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem' }}>
            <CheckCircle size={40} color="#10b981" />
          </div>
          <h2 style={{ fontSize: '1.75rem', color: 'var(--text-primary)', marginBottom: '1rem' }}>Application Submitted!</h2>
          <p style={{ color: 'var(--text-secondary)', marginBottom: '2rem' }}>
            Your application has been received successfully. Our team will review your documents and contact you shortly.
          </p>
          <div style={{ background: '#f3f4f6', padding: '1rem', borderRadius: '12px', marginBottom: '2rem' }}>
            <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600, marginBottom: '0.25rem' }}>Your Tracking ID</div>
            <div style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--accent-color)', letterSpacing: '1px' }}>{trackingId}</div>
          </div>
          <button className="btn btn-primary" style={{ width: '100%' }} onClick={() => navigate('/')}>
            Return to Home
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={{ 
      position: 'relative',
      minHeight: '100vh', 
      padding: '3rem 1rem',
      background: '#0f172a', /* Dark Navy Background */
      overflow: 'hidden'
    }}>
      {/* Decorative Blur Blobs for Glass Effect */}
      <div style={{ position: 'absolute', top: '-10%', left: '-5%', width: '50vw', height: '50vw', background: '#2d2e89', opacity: 0.3, filter: 'blur(120px)', borderRadius: '50%', zIndex: 0 }}></div>
      <div style={{ position: 'absolute', bottom: '-10%', right: '-5%', width: '40vw', height: '40vw', background: '#f39e1e', opacity: 0.15, filter: 'blur(120px)', borderRadius: '50%', zIndex: 0 }}></div>

      <div className="container" style={{ maxWidth: '1000px', position: 'relative', zIndex: 1 }}>
        
        <div className="split-layout" style={{ 
          background: 'rgba(30, 41, 59, 0.4)', /* Dark Glass */
          backdropFilter: 'blur(24px)',
          WebkitBackdropFilter: 'blur(24px)',
          border: '1px solid rgba(255,255,255,0.1)',
          borderRadius: '24px', 
          overflow: 'hidden', 
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)', 
          fontFamily: "'Inter', sans-serif" 
        }}>
          
          {/* Left Sidebar - Information Panel */}
          <div style={{ flex: '1 1 300px', background: sidebarGradient, color: 'white', padding: '2.5rem', display: 'flex', flexDirection: 'column', position: 'relative', overflow: 'hidden' }}>
            <div style={{ position: 'absolute', top: '-10%', right: '-20%', width: '300px', height: '300px', background: 'radial-gradient(circle, rgba(255,255,255,0.1) 0%, transparent 70%)', borderRadius: '50%' }}></div>
            <div style={{ position: 'relative', zIndex: 1 }}>
              <div style={{ display: 'inline-block', backgroundColor: 'rgba(255,255,255,0.1)', backdropFilter: 'blur(10px)', padding: '0.25rem 1rem', borderRadius: '99px', fontSize: '0.8rem', fontWeight: 600, marginBottom: '1rem', border: '1px solid rgba(255,255,255,0.2)', color: 'white' }}>
                {formData.loanType || 'Application Process'}
              </div>
              <h2 style={{ fontFamily: "'Montserrat', sans-serif", fontSize: '2.2rem', fontWeight: 800, marginBottom: '1.25rem', lineHeight: 1.1, color: 'white' }}>Secure Your Future Today.</h2>
              <p style={{ fontSize: '1rem', color: '#e2e8f0', marginBottom: '2.5rem', fontWeight: 400 }}>
                Join over 1 million happy customers who have trusted us with their financial journey.
              </p>

              <h3 style={{ fontFamily: "'Montserrat', sans-serif", fontSize: '1.2rem', fontWeight: 700, marginBottom: '1.5rem', color: 'white' }}>Why Choose Us?</h3>
              <ul style={{ listStyle: 'none', padding: 0, display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                {[
                  "100% Secure & Encrypted",
                  "Quick Approval Process",
                  "No Hidden Charges",
                  "Dedicated Support Agent",
                  "Flexible Repayment Options"
                ].map((item, idx) => (
                  <li key={idx} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', fontSize: '1.05rem', fontWeight: 500, color: 'white' }}>
                    <div style={{ backgroundColor: 'rgba(255,255,255,0.15)', borderRadius: '50%', padding: '4px' }}>
                      <CheckCircle size={16} color={themeColor} />
                    </div>
                    {item}
                  </li>
                ))}
              </ul>
            </div>
            
            <div style={{ marginTop: 'auto', paddingTop: '3rem', display: 'flex', alignItems: 'center', gap: '1rem', color: '#e2e8f0' }}>
              <ShieldCheck size={32} opacity={0.8} color={themeColor} />
              <div style={{ fontSize: '0.85rem', opacity: 0.9, fontWeight: 500 }}>
                Your data is protected by bank-level 256-bit encryption.
              </div>
            </div>
          </div>

          {/* Right Area - Multi-step Form */}
          <div style={{ flex: '2 1 500px', padding: '2.5rem', background: 'rgba(30, 41, 59, 0.6)' }}>
            
            {/* Progress Bar */}
            <div style={{ marginBottom: '3rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem', position: 'relative' }}>
                <div style={{ position: 'absolute', top: '15px', left: '0', right: '0', height: '4px', backgroundColor: 'rgba(255,255,255,0.1)', zIndex: 0, borderRadius: '2px' }}></div>
                <div style={{ position: 'absolute', top: '15px', left: '0', width: `${((currentStep - 1) / 3) * 100}%`, height: '4px', backgroundColor: themeColor, zIndex: 1, borderRadius: '2px', transition: 'all 0.5s ease' }}></div>
                
                {['Personal', 'Contact', 'Details', 'Documents'].map((step, idx) => {
                  const stepNum = idx + 1;
                  const isActive = stepNum <= currentStep;
                  return (
                    <div key={step} style={{ position: 'relative', zIndex: 2, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem' }}>
                      <div style={{ 
                        width: '32px', height: '32px', borderRadius: '50%', 
                        display: 'flex', alignItems: 'center', justifyContent: 'center', 
                        backgroundColor: isActive ? themeColor : '#1e293b', 
                        color: isActive ? 'white' : '#64748b',
                        border: `2px solid ${isActive ? themeColor : 'rgba(255,255,255,0.2)'}`,
                        fontWeight: 700, fontSize: '0.85rem', transition: 'all 0.3s',
                        fontFamily: "'Montserrat', sans-serif"
                      }}>
                        {stepNum < currentStep ? <CheckCircle size={16} /> : stepNum}
                      </div>
                      <span style={{ fontSize: '0.75rem', fontWeight: isActive ? 700 : 600, color: isActive ? 'white' : '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.5px' }}>{step}</span>
                    </div>
                  );
                })}
              </div>
            </div>

            <style>{`
              .everyday-input {
                height: 48px;
                border-radius: 10px;
                background-color: rgba(255, 255, 255, 0.05);
                border: 1px solid rgba(255,255,255,0.1);
                padding: 0 16px;
                font-family: 'Inter', sans-serif;
                font-size: 0.95rem;
                font-weight: 500;
                width: 100%;
                color: white;
                transition: all 0.3s ease;
                backdrop-filter: blur(5px);
              }
              .everyday-input::placeholder {
                color: rgba(255,255,255,0.3);
              }
              .everyday-input option {
                background-color: #1e293b;
                color: white;
              }
              .everyday-input:focus {
                outline: none;
                border-color: ${themeColor};
                background-color: rgba(255, 255, 255, 0.1);
                box-shadow: 0 0 0 4px rgba(243, 158, 30, 0.2);
              }
              .everyday-label {
                display: block;
                font-family: 'Montserrat', sans-serif;
                font-size: 12px;
                font-weight: 800;
                color: #e2e8f0;
                text-transform: uppercase;
                letter-spacing: 0.5px;
                margin-bottom: 8px;
              }
            `}</style>

            <form onSubmit={handleSubmit}>
              
              {/* Step 1: Personal Details */}
              {currentStep === 1 && (
                <div style={{ animation: 'fadeIn 0.3s ease-out' }}>
                  <h3 style={{ fontFamily: "'Montserrat', sans-serif", fontSize: '1.5rem', color: 'white', marginBottom: '0.5rem', fontWeight: 800 }}>Personal Information</h3>
                  <p style={{ color: '#94a3b8', marginBottom: '2rem', fontFamily: "'Inter', sans-serif" }}>Please provide your legal name exactly as it appears on your ID.</p>
                  
                  <div className="form-group">
                    <label className="everyday-label">Full Legal Name *</label>
                    <input type="text" className="everyday-input" name="fullName" value={formData.fullName} onChange={handleInputChange} required placeholder="e.g. Rahul Sharma" />
                  </div>
                  <div className="form-row" style={{ marginBottom: '1.5rem' }}>
                    <div>
                      <label className="everyday-label">Date of Birth *</label>
                      <input type="date" className="everyday-input" name="dob" value={formData.dob} onChange={handleInputChange} required />
                    </div>
                    <div>
                      <label className="everyday-label">Age *</label>
                      <input type="number" className="everyday-input" name="age" value={formData.age} onChange={handleInputChange} required placeholder="e.g. 32" />
                    </div>
                  </div>
                  <div className="form-group">
                    <label className="everyday-label">Gender *</label>
                    <select className="everyday-input" name="gender" value={formData.gender} onChange={handleInputChange} required>
                      <option value="" disabled>Select Gender</option>
                      <option value="Male">Male</option>
                      <option value="Female">Female</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>
                </div>
              )}

              {/* Step 2: Contact Details */}
              {currentStep === 2 && (
                <div style={{ animation: 'fadeIn 0.3s ease-out' }}>
                  <h3 style={{ fontFamily: "'Montserrat', sans-serif", fontSize: '1.5rem', color: 'white', marginBottom: '0.5rem', fontWeight: 800 }}>Contact Details</h3>
                  <p style={{ color: '#94a3b8', marginBottom: '2rem', fontFamily: "'Inter', sans-serif" }}>We will use this to send you updates regarding your application.</p>
                  
                  <div className="form-row" style={{ marginBottom: '1.5rem' }}>
                    <div>
                      <label className="everyday-label">Phone Number *</label>
                      <input type="tel" className="everyday-input" name="phone" value={formData.phone} onChange={handleInputChange} required placeholder="+91" />
                    </div>
                    <div>
                      <label className="everyday-label">Email Address *</label>
                      <input type="email" className="everyday-input" name="email" value={formData.email} onChange={handleInputChange} required placeholder="name@example.com" />
                    </div>
                  </div>
                  <div className="form-group">
                    <label className="everyday-label">Current Address *</label>
                    <textarea className="everyday-input" name="address" value={formData.address} onChange={handleInputChange} required rows="3" placeholder="House/Flat No., Street, Landmark" style={{ height: 'auto', paddingTop: '12px', resize: 'vertical' }}></textarea>
                  </div>
                  <div className="form-row" style={{ marginBottom: '1.5rem' }}>
                    <div>
                      <label className="everyday-label">City *</label>
                      <input type="text" className="everyday-input" name="city" value={formData.city} onChange={handleInputChange} required />
                    </div>
                    <div>
                      <label className="everyday-label">State *</label>
                      <input type="text" className="everyday-input" name="state" value={formData.state} onChange={handleInputChange} required />
                    </div>
                    <div>
                      <label className="everyday-label">Pincode *</label>
                      <input type="text" className="everyday-input" name="pincode" value={formData.pincode} onChange={handleInputChange} required />
                    </div>
                  </div>
                </div>
              )}

              {/* Step 3: Loan Details & KYC */}
              {currentStep === 3 && (
                <div style={{ animation: 'fadeIn 0.3s ease-out' }}>
                  <h3 style={{ fontFamily: "'Montserrat', sans-serif", fontSize: '1.5rem', color: 'white', marginBottom: '0.5rem', fontWeight: 800 }}>Requirements</h3>
                  <p style={{ color: '#94a3b8', marginBottom: '2rem', fontFamily: "'Inter', sans-serif" }}>Tell us what you need and provide your identity numbers.</p>
                  
                  <div className="form-row">
                  <div className="form-group">
                    <label className="everyday-label">Select Service Type *</label>
                    <select className="everyday-input" name="loanType" value={formData.loanType} onChange={handleInputChange} required>
                      <option value="" disabled>Choose a service</option>
                      {LOAN_TYPES.map(type => (
                        <option key={type} value={type}>{type}</option>
                      ))}
                      <option value="Credit Card">Credit Card</option>
                      <option value="Health Insurance">Health Insurance</option>
                      <option value="Life Insurance">Life Insurance</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label className="everyday-label">Required Amount / Cover (₹) *</label>
                    <input type="number" className="everyday-input" name="loanAmount" value={formData.loanAmount} onChange={handleInputChange} required placeholder="e.g. 500000" />
                  </div>
                </div>

                {/* Dynamic Fields Based on Selection */}
                {formData.loanType && formData.loanType.includes('Loan') && (
                  <div className="form-row" style={{ animation: 'fadeIn 0.3s ease-out' }}>
                    <div className="form-group">
                      <label className="everyday-label">Monthly Income (₹) *</label>
                      <input type="number" className="everyday-input" required placeholder="e.g. 50000" />
                    </div>
                    <div className="form-group">
                      <label className="everyday-label">Employment Type *</label>
                      <select className="everyday-input" required>
                        <option value="" disabled selected>Select...</option>
                        <option value="Salaried">Salaried</option>
                        <option value="Self-Employed">Self-Employed</option>
                        <option value="Business">Business Owner</option>
                      </select>
                    </div>
                  </div>
                )}

                {formData.loanType === 'Home Loan' && (
                  <div className="form-group" style={{ animation: 'fadeIn 0.3s ease-out' }}>
                    <label className="everyday-label">Property Value Estimate (₹)</label>
                    <input type="number" className="everyday-input" placeholder="e.g. 5000000" />
                  </div>
                )}

                {formData.loanType === 'Credit Card' && (
                  <div className="form-row" style={{ animation: 'fadeIn 0.3s ease-out' }}>
                    <div className="form-group">
                      <label className="everyday-label">Existing Credit Card Bank</label>
                      <input type="text" className="everyday-input" placeholder="e.g. HDFC (Leave blank if none)" />
                    </div>
                    <div className="form-group">
                      <label className="everyday-label">Existing Credit Limit (₹)</label>
                      <input type="number" className="everyday-input" placeholder="e.g. 100000" />
                    </div>
                  </div>
                )}

                {formData.loanType && formData.loanType.includes('Insurance') && (
                  <div className="form-row" style={{ animation: 'fadeIn 0.3s ease-out' }}>
                    <div className="form-group">
                      <label className="everyday-label">Any pre-existing diseases?</label>
                      <select className="everyday-input" required>
                        <option value="No">No</option>
                        <option value="Yes">Yes</option>
                      </select>
                    </div>
                    <div className="form-group">
                      <label className="everyday-label">Smoking/Tobacco Habit?</label>
                      <select className="everyday-input" required>
                        <option value="No">No</option>
                        <option value="Yes">Yes</option>
                      </select>
                    </div>
                  </div>
                )}
                  
                  <div style={{ backgroundColor: 'rgba(255,255,255,0.05)', padding: '1.5rem', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.1)', marginTop: '2rem' }}>
                    <h4 style={{ fontFamily: "'Montserrat', sans-serif", fontSize: '1.1rem', marginBottom: '1rem', color: 'white', fontWeight: 700 }}>Identity Verification</h4>
                    <div className="form-row">
                      <div>
                        <label className="everyday-label">Aadhar Number *</label>
                        <input type="text" className="everyday-input" name="aadharNumber" value={formData.aadharNumber} onChange={handleInputChange} required placeholder="12-digit number" style={{ letterSpacing: '2px' }} />
                      </div>
                      <div>
                        <label className="everyday-label">PAN Number *</label>
                        <input type="text" className="everyday-input" name="panNumber" value={formData.panNumber} onChange={handleInputChange} required placeholder="ABCDE1234F" style={{ textTransform: 'uppercase', letterSpacing: '1px' }} />
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Step 4: Documents Upload */}
              {currentStep === 4 && (
                <div style={{ animation: 'fadeIn 0.3s ease-out' }}>
                  <h3 style={{ fontFamily: "'Montserrat', sans-serif", fontSize: '1.5rem', color: 'white', marginBottom: '0.5rem', fontWeight: 800 }}>Upload Documents</h3>
                  <p style={{ color: '#94a3b8', marginBottom: '2rem', fontFamily: "'Inter', sans-serif" }}>Please provide clear photos or scanned copies of the following documents.</p>
                  
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.5rem' }}>
                    {REQUIRED_DOCUMENTS.map(doc => {
                      const isUploaded = !!formData.documents[doc.key];
                      return (
                        <div key={doc.key} style={{ 
                          border: `2px dashed ${isUploaded ? themeColor : 'rgba(255,255,255,0.2)'}`, 
                          borderRadius: '12px', padding: '1.5rem', textAlign: 'center', 
                          backgroundColor: isUploaded ? 'rgba(243, 158, 30, 0.1)' : 'rgba(255,255,255,0.05)',
                          position: 'relative', cursor: 'pointer', transition: 'all 0.2s',
                          backdropFilter: 'blur(5px)'
                        }}>
                          <input 
                            type="file" 
                            accept="image/*,.pdf"
                            onChange={(e) => handleDocumentUpload(e, doc.key)}
                            style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', opacity: 0, cursor: 'pointer' }}
                            required={!isUploaded}
                          />
                          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem' }}>
                            {isUploaded ? <CheckCircle size={32} color={themeColor} /> : <UploadCloud size={32} color="rgba(255,255,255,0.5)" />}
                            <span style={{ fontSize: '0.85rem', fontWeight: 600, color: isUploaded ? themeColor : 'white' }}>
                              {doc.label}
                            </span>
                            <span style={{ fontSize: '0.7rem', color: '#94a3b8' }}>
                              {isUploaded ? 'Uploaded Successfully' : 'Click or drag file here'}
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Form Navigation Buttons */}
              <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '3rem', paddingTop: '1.5rem', borderTop: '1px solid rgba(255,255,255,0.1)' }}>
                {currentStep > 1 ? (
                  <button type="button" className="btn" onClick={prevStep} style={{ borderRadius: '12px', padding: '0.85rem 2rem', backgroundColor: 'transparent', color: 'white', border: '1px solid rgba(255,255,255,0.3)' }}>
                    Back
                  </button>
                ) : <div></div>}
                
                {currentStep < 4 ? (
                  <button type="button" className="btn btn-primary" onClick={nextStep} style={{ borderRadius: '12px', height: '52px', padding: '0 2rem', background: themeGradient, fontFamily: "'Montserrat', sans-serif", fontSize: '0.95rem', fontWeight: 800, transition: 'all 0.3s', boxShadow: `0 8px 20px rgba(243, 158, 30, 0.4)`, color: 'white', border: 'none' }}>
                    Next Step
                  </button>
                ) : (
                  <button type="submit" className="btn btn-primary" disabled={isSubmitting} style={{ borderRadius: '12px', height: '52px', padding: '0 2rem', background: themeGradient, fontFamily: "'Montserrat', sans-serif", fontSize: '0.95rem', fontWeight: 800, transition: 'all 0.3s', boxShadow: `0 8px 20px rgba(243, 158, 30, 0.4)`, color: 'white', border: 'none' }}>
                    {isSubmitting ? 'Processing...' : 'Submit Application'}
                  </button>
                )}
              </div>

            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
