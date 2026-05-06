import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Trash2, CheckCircle, ChevronRight, User, Users, FileText, UploadCloud, X } from 'lucide-react';

// ─── Loan types (matching CRM) ───────────────────────────────
const LOAN_TYPES = [
  { label: 'Home Loan',                  icon: '🏠', color: '#3b82f6', bg: '#eff6ff', sub: ["Purchase", "Construction", "Land Purchase", "BT + Top-up"], empTypes: ["Salaried", "Self Employed"] },
  { label: 'Mortgage Loan',              icon: '🏢', color: '#8b5cf6', bg: '#f5f3ff', sub: ["Residential Building", "Commercial Building", "Loan Mortgage", "BT + Top-up"], empTypes: ["Salaried", "Self Employed"] },
  { label: 'Personal Loan',             icon: '👤', color: '#10b981', bg: '#ecfdf5', sub: ["Salaried", "BT + Top-up"], empTypes: ["Salaried"] },
  { label: 'Business Loan (Secured)',    icon: '🏭', color: '#f59e0b', bg: '#fffbeb', sub: ["Term Loans", "Working Capital", "Equipment Finance/Machinery Loan", "Overdraft Facility", "BT + Topup"], empTypes: ["Salaried", "Self Employed"] },
  { label: 'Business Loan (Unsecured)', icon: '💼', color: '#ea580c', bg: '#fff7ed', sub: ["Term Loans", "Overdraft Facility", "BT + Topup"], empTypes: ["Salaried", "Self Employed"] },
  { label: 'Agri Loan',                 icon: '🌾', color: '#65a30d', bg: '#f7fee7', sub: ["Purchase", "Term Loan, OD,CC", "BT + Top-up"], empTypes: ["Salaried", "Self Employed"] },
  { label: 'Vehicle Loan (Commercial)', icon: '🚛', color: '#64748b', bg: '#f8fafc', sub: ["New Purchase", "Used Purchase", "Refinance", "BT + Top-up"], empTypes: ["Salaried", "Self Employed"] },
  { label: 'Vehicle Loan (Individual)', icon: '🚗', color: '#94a3b8', bg: '#f8fafc', sub: ["New Purchase", "Used Purchase", "Refinance", "BT + Top-up"], empTypes: ["Salaried", "Self Employed"] },
  { label: 'BT Topup',                  icon: '🔄', color: '#7c3aed', bg: '#f5f3ff', sub: ["Personal Loan BT+Topup", "Business Loan BT+Topup", "Home Loan BT+Topup", "Mortgage BT+Topup", "Vehicle Loan BT+Topup"], empTypes: ["Salaried", "Self Employed"] },
  { label: 'Credit Card',               icon: '💳', color: '#06b6d4', bg: '#ecfeff', sub: [], empTypes: ["Salaried", "Self Employed"] },
  { label: 'Insurance',                 icon: '🛡️', color: '#ec4899', bg: '#fdf2f8', sub: ["General", "Health", "Life"], empTypes: ["Salaried", "Self Employed"] },
];

// ─── Document sections per loan type ─────────────────────────
export const LOAN_DOCS = {
  'Home Loan':                  ['ID Proof', 'Address Proof', 'Photo', 'Income Proof', 'Bank Statement', 'Property Documents', 'Other Documents'],
  'Mortgage Loan':              ['ID Proof', 'Address Proof', 'Photo', 'Income Proof', 'Bank Statement', 'Property Documents', 'Other Documents'],
  'Personal Loan':              ['ID Proof', 'Address Proof', 'Photo', 'Income Proof', 'Bank Statement', 'Other Documents'],
  'Business Loan (Secured)':   ['ID Proof', 'Address Proof', 'Photo', 'Business Proof', 'Income Proof', 'Bank Statement', 'Property Documents', 'Other Documents'],
  'Business Loan (Unsecured)': ['ID Proof', 'Address Proof', 'Photo', 'Business Proof', 'Income Proof', 'Bank Statement', 'Other Documents'],
  'Agri Loan':                  ['ID Proof', 'Address Proof', 'Photo', 'Income Proof', 'Land Documents', 'Property Documents', 'Other Documents'],
  'Vehicle Loan (Commercial)':  ['ID Proof', 'Address Proof', 'Photo', 'Income Proof', 'Bank Statement', 'Vehicle Quotation', 'Other Documents'],
  'Vehicle Loan (Individual)':  ['ID Proof', 'Address Proof', 'Photo', 'Income Proof', 'Bank Statement', 'Vehicle Quotation', 'Other Documents'],
  'BT Topup':                   ['ID Proof', 'Address Proof', 'Photo', 'Income Proof', 'Bank Statement', 'Existing Loan Statement', 'Sanction Letter', 'Other Documents'],
  'Credit Card':                ['ID Proof', 'Address Proof', 'Photo', 'Income Proof', 'Bank Statement', 'Other Documents'],
  'Insurance':                  ['ID Proof', 'Address Proof', 'Photo', 'Other Documents'],
};

// ─── Helpers ─────────────────────────────────────────────────
const sanitize = (str) => str.trim().replace(/\s+/g, '_').replace(/[^a-zA-Z0-9_]/g, '');

function makeDisplayName(clientName, sectionLabel, index, file) {
  const ext = file.name.includes('.') ? file.name.split('.').pop() : 'file';
  const name = sanitize(clientName) || 'Client';
  const label = sanitize(sectionLabel);
  const num = index > 0 ? `_${index + 1}` : '';
  return `${name}_${label}${num}.${ext}`;
}

// ─── Shared styles ────────────────────────────────────────────
const inputCss = {
  width: '100%', boxSizing: 'border-box',
  padding: '0.75rem 1rem',
  border: '1.5px solid #e5e7eb',
  borderRadius: '10px',
  fontSize: '0.875rem',
  fontFamily: 'inherit',
  outline: 'none',
  background: '#fafafa',
  transition: 'border-color 0.2s, box-shadow 0.2s',
};
const labelCss = {
  display: 'block', fontSize: '0.72rem', fontWeight: 700,
  color: '#6b7280', marginBottom: '0.3rem',
  textTransform: 'uppercase', letterSpacing: '0.05em',
};

// ─── Sub-components ───────────────────────────────────────────

function ApplicantFields({ data, onChange, isPrimary = false, loanMeta = null }) {
  const set = (f) => (e) => onChange({ ...data, [f]: e.target.value });
  const fo = e => { e.target.style.borderColor = '#f39e1e'; e.target.style.boxShadow = '0 0 0 3px rgba(243,158,30,0.12)'; };
  const bl = e => { e.target.style.borderColor = '#e5e7eb'; e.target.style.boxShadow = 'none'; };
  const req = { color: '#ef4444', marginLeft: '2px' };

  const textFields = [
    { f: 'name',       label: 'Full Name',    type: 'text',  placeholder: 'e.g. Ravi Kumar' },
    { f: 'phone',      label: 'Mobile Number', type: 'tel',   placeholder: '10-digit number' },
    { f: 'email',      label: 'Email Address', type: 'email', placeholder: 'name@example.com' },
    { f: 'dob',        label: 'Date of Birth', type: 'date',  placeholder: '' },
    { f: 'occupation', label: 'Occupation',    type: 'text',  placeholder: 'e.g. Business / Service' },
  ];

  const empTypes = loanMeta?.empTypes || ["Salaried", "Self Employed"];
  const subReqs = loanMeta?.sub || [];

  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '1rem' }}>
      {textFields.map(({ f, label, type, placeholder }) => (
        <div key={f}>
          <label style={labelCss}>{label}<span style={req}>*</span></label>
          <input
            required type={type} value={data[f] || ''} placeholder={placeholder}
            onChange={set(f)} style={inputCss}
            onFocus={fo} onBlur={bl}
          />
        </div>
      ))}
      
      <div>
        <label style={labelCss}>Employment Type<span style={req}>*</span></label>
        <select required value={data.employmentType || ''} onChange={set('employmentType')} style={{ ...inputCss, appearance: 'auto' }} onFocus={fo} onBlur={bl}>
          <option value="" disabled>Select Type</option>
          {empTypes.map(et => <option key={et} value={et}>{et}</option>)}
        </select>
      </div>

      {isPrimary && subReqs.length > 0 && (
        <div>
          <label style={labelCss}>Specific Requirement<span style={req}>*</span></label>
          <select required value={data.subRequirement || ''} onChange={set('subRequirement')} style={{ ...inputCss, appearance: 'auto' }} onFocus={fo} onBlur={bl}>
            <option value="" disabled>Select Specific Type</option>
            {subReqs.map(sub => <option key={sub} value={sub}>{sub}</option>)}
          </select>
        </div>
      )}

      {/* Address — full width */}
      <div style={{ gridColumn: '1 / -1' }}>
        <label style={labelCss}>Address<span style={req}>*</span></label>
        <input
          required type="text" value={data.address || ''} placeholder="Door No, Street, Area"
          onChange={set('address')} style={inputCss}
          onFocus={fo} onBlur={bl}
        />
      </div>

      {/* City */}
      <div>
        <label style={labelCss}>City / Town<span style={req}>*</span></label>
        <input required type="text" value={data.city || ''} placeholder="Enter city or town" onChange={set('city')} style={inputCss} onFocus={fo} onBlur={bl} />
      </div>

      {/* Pin Code */}
      <div>
        <label style={labelCss}>Pin Code<span style={req}>*</span></label>
        <input required type="text" value={data.pincode || ''} placeholder="6-digit pincode" onChange={set('pincode')} style={inputCss} onFocus={fo} onBlur={bl} />
      </div>
    </div>
  );
}

function FileSlot({ slot, onUpload, onRemove, showRemove }) {
  const ref = useRef();
  const has = !!slot.file;
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
      <input ref={ref} type="file" accept="image/*,.pdf,.doc,.docx" style={{ display: 'none' }}
        onChange={e => e.target.files[0] && onUpload(e.target.files[0])} />

      <div
        onClick={() => ref.current.click()}
        style={{
          flex: 1, display: 'flex', alignItems: 'center', gap: '0.75rem',
          padding: '0.6rem 0.875rem', borderRadius: '10px',
          border: `1.5px dashed ${has ? '#10b981' : '#d1d5db'}`,
          background: has ? '#f0fdf4' : '#fafafa',
          cursor: 'pointer', transition: 'all 0.2s',
          minWidth: 0,
        }}
      >
        {has
          ? <CheckCircle size={16} color="#10b981" style={{ flexShrink: 0 }} />
          : <UploadCloud size={16} color="#9ca3af" style={{ flexShrink: 0 }} />
        }
        <span style={{
          fontSize: '0.8rem', fontWeight: has ? 600 : 400,
          color: has ? '#15803d' : '#9ca3af',
          overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
        }}>
          {has ? slot.displayName : 'Click to upload file'}
        </span>
      </div>

      {showRemove && (
        <button onClick={onRemove}
          style={{ width: '28px', height: '28px', borderRadius: '50%', border: 'none', background: '#fee2e2', color: '#ef4444', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
          <X size={14} />
        </button>
      )}
    </div>
  );
}

function DocSection({ label, slots, clientName, onUpload, onAdd, onRemove }) {
  const uploadedCount = slots.filter(s => s.file).length;
  return (
    <div style={{ background: 'white', borderRadius: '14px', padding: '1.125rem 1.375rem', boxShadow: '0 2px 10px rgba(0,0,0,0.04)', border: '1px solid #f1f5f9' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <FileText size={15} color="#f39e1e" />
          <span style={{ fontWeight: 700, fontSize: '0.85rem', color: '#1f2937', textTransform: 'uppercase', letterSpacing: '0.04em' }}>{label}</span>
          {uploadedCount > 0 && (
            <span style={{ fontSize: '0.68rem', background: '#d1fae5', color: '#065f46', padding: '0.1rem 0.45rem', borderRadius: '99px', fontWeight: 700 }}>
              {uploadedCount}/{slots.length} uploaded
            </span>
          )}
        </div>
        <button
          onClick={onAdd}
          title={`Add another ${label}`}
          style={{ width: '28px', height: '28px', borderRadius: '50%', background: '#f39e1e', border: 'none', color: 'white', fontSize: '1.2rem', fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', lineHeight: 1, flexShrink: 0 }}>
          <Plus size={16} />
        </button>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
        {slots.map((slot, idx) => (
          <FileSlot
            key={idx}
            slot={slot}
            showRemove={slots.length > 1}
            onUpload={(file) => onUpload(idx, file)}
            onRemove={() => onRemove(idx)}
          />
        ))}
      </div>
    </div>
  );
}

// ─── Step indicator ───────────────────────────────────────────
function StepBar({ step }) {
  const steps = ['Loan Type', 'Applicant', 'Documents'];
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 0, marginTop: '1.25rem' }}>
      {steps.map((s, i) => {
        const n = i + 1, done = step > n, active = step === n;
        return (
          <div key={s} style={{ display: 'flex', alignItems: 'center' }}>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.25rem' }}>
              <div style={{
                width: '30px', height: '30px', borderRadius: '50%',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontWeight: 700, fontSize: '0.8rem',
                background: done ? '#10b981' : active ? '#f39e1e' : '#e5e7eb',
                color: done || active ? 'white' : '#9ca3af',
                transition: 'all 0.3s',
              }}>
                {done ? '✓' : n}
              </div>
              <span style={{ fontSize: '0.65rem', fontWeight: 600, color: active ? '#f39e1e' : done ? '#10b981' : '#9ca3af', whiteSpace: 'nowrap' }}>{s}</span>
            </div>
            {i < 2 && <div style={{ width: '56px', height: '2px', background: step > n ? '#10b981' : '#e5e7eb', margin: '0 0.2rem', marginBottom: '1.1rem', transition: 'all 0.3s' }} />}
          </div>
        );
      })}
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────
const EMPTY_PERSON = { name: '', phone: '', email: '', dob: '', occupation: '', address: '', pincode: '', city: '', employmentType: '', subRequirement: '' };

export default function ClientForm() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [loanType, setLoanType] = useState('');
  const [applicant, setApplicant] = useState({ ...EMPTY_PERSON });
  const [hasCoApplicant, setHasCoApplicant] = useState(false);
  const [coApplicant, setCoApplicant] = useState({ ...EMPTY_PERSON });
  const [docs, setDocs] = useState({});   // { sectionLabel: [{ file, displayName }] }
  const [submitted, setSubmitted] = useState(false);

  const loanStyle = LOAN_TYPES.find(l => l.label === loanType);

  // Initialize doc slots when entering step 3 — validate all fields first
  const REQUIRED_FIELDS = ['name', 'phone', 'email', 'dob', 'occupation', 'address', 'city', 'pincode', 'employmentType'];
  
  const goToDocs = () => {
    const requiredAppFields = [...REQUIRED_FIELDS];
    if (loanStyle?.sub?.length > 0) requiredAppFields.push('subRequirement');
    
    const missing = requiredAppFields.filter(f => !applicant[f]?.trim());
    if (missing.length > 0) {
      alert(`Please fill in all required fields for the Applicant:\n\u2022 ${missing.map(f => f.charAt(0).toUpperCase() + f.slice(1)).join('\n\u2022 ')}`);
      return;
    }
    if (hasCoApplicant) {
      const coMissing = REQUIRED_FIELDS.filter(f => !coApplicant[f]?.trim());
      if (coMissing.length > 0) {
        alert(`Please fill in all required fields for the Co-Applicant:\n\u2022 ${coMissing.map(f => f.charAt(0).toUpperCase() + f.slice(1)).join('\n\u2022 ')}`);
        return;
      }
    }
    const init = {};
    (LOAN_DOCS[loanType] || []).forEach(sec => { init[sec] = [{ file: null, displayName: '' }]; });
    setDocs(init);
    setStep(3);
  };

  const handleUpload = (section, idx, file) => {
    setDocs(prev => {
      const arr = [...(prev[section] || [])];
      arr[idx] = { file, displayName: makeDisplayName(applicant.name, section, idx, file) };
      return { ...prev, [section]: arr };
    });
  };

  const addSlot = (section) => {
    setDocs(prev => ({ ...prev, [section]: [...(prev[section] || []), { file: null, displayName: '' }] }));
  };

  const removeSlot = (section, idx) => {
    setDocs(prev => {
      const arr = [...(prev[section] || [])];
      arr.splice(idx, 1);
      return { ...prev, [section]: arr };
    });
  };

  // ── Submitted ──────────────────────────────────────────────
  if (submitted) {
    return (
      <div style={{ minHeight: '80vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem' }}>
        <div style={{ textAlign: 'center', maxWidth: '440px' }}>
          <div style={{ width: '80px', height: '80px', background: '#d1fae5', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem' }}>
            <CheckCircle size={40} color="#10b981" />
          </div>
          <h2 style={{ fontSize: '1.75rem', marginBottom: '0.75rem' }}>Onboarding Submitted!</h2>
          <p style={{ color: '#6b7280', marginBottom: '2rem' }}>Documents for <strong>{applicant.name}</strong> ({loanType}) have been submitted successfully.</p>
          <button className="btn btn-primary" style={{ borderRadius: '12px', width: '100%' }} onClick={() => navigate('/')}>Return to Home</button>
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', background: '#f4f7fa', padding: '1.5rem 1rem' }}>
      <div style={{ maxWidth: '860px', margin: '0 auto' }}>

        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <img src="/Asset/f.png" alt="Deals For Loan" style={{ height: '36px', marginBottom: '0.875rem', objectFit: 'contain' }} />
          <h1 style={{ fontSize: '1.6rem', fontWeight: 800, color: '#1f2937', margin: 0 }}>Client Onboarding Form</h1>
          <p style={{ color: '#6b7280', marginTop: '0.3rem', fontSize: '0.875rem' }}>Fill in the details and upload required documents</p>
          <StepBar step={step} />
        </div>

        {/* ── STEP 1: Loan Type ─────────────────────────────── */}
        {step === 1 && (
          <div style={{ background: 'white', borderRadius: '20px', padding: '2rem', boxShadow: '0 4px 20px rgba(0,0,0,0.06)' }}>
            <h2 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#1f2937', marginBottom: '0.4rem' }}>Select Loan Type</h2>
            <p style={{ color: '#6b7280', fontSize: '0.85rem', marginBottom: '1.5rem' }}>Choose the product the client is applying for.</p>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))', gap: '0.75rem' }} className="client-form-loan-grid">
              {LOAN_TYPES.map(({ label, icon, color, bg }) => {
                const sel = loanType === label;
                return (
                  <button key={label} onClick={() => setLoanType(label)} style={{
                    padding: '1rem 0.75rem', borderRadius: '12px',
                    border: `2px solid ${sel ? color : '#e5e7eb'}`,
                    background: sel ? bg : 'white', cursor: 'pointer',
                    textAlign: 'center', transition: 'all 0.2s',
                    boxShadow: sel ? `0 4px 14px ${color}30` : 'none',
                  }}>
                    <div style={{ fontSize: '1.6rem', marginBottom: '0.4rem' }}>{icon}</div>
                    <div style={{ fontSize: '0.75rem', fontWeight: 700, color: sel ? color : '#374151', lineHeight: 1.3 }}>{label}</div>
                  </button>
                );
              })}
            </div>
            <div style={{ marginTop: '2rem', display: 'flex', justifyContent: 'flex-end' }}>
              <button disabled={!loanType} onClick={() => setStep(2)} className="btn btn-primary"
                style={{ borderRadius: '12px', opacity: loanType ? 1 : 0.45, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                Next: Applicant Details <ChevronRight size={16} />
              </button>
            </div>
          </div>
        )}

        {/* ── STEP 2: Applicant Details ──────────────────────── */}
        {step === 2 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {/* Loan badge */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <span style={{ fontSize: '1.2rem' }}>{loanStyle?.icon}</span>
              <span style={{ fontWeight: 700, fontSize: '0.85rem', color: loanStyle?.color, background: loanStyle?.bg, padding: '0.25rem 0.75rem', borderRadius: '99px' }}>{loanType}</span>
            </div>

            {/* Applicant */}
            <div style={{ background: 'white', borderRadius: '18px', padding: '1.5rem', boxShadow: '0 4px 20px rgba(0,0,0,0.05)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem', marginBottom: '1.25rem' }}>
                <div style={{ width: '34px', height: '34px', background: '#fef5e8', borderRadius: '9px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <User size={18} color="#f39e1e" />
                </div>
                <div>
                  <div style={{ fontWeight: 800, fontSize: '0.95rem', color: '#1f2937' }}>Applicant</div>
                  <div style={{ fontSize: '0.75rem', color: '#9ca3af' }}>Primary applicant information</div>
                </div>
              </div>
              <ApplicantFields data={applicant} onChange={setApplicant} isPrimary={true} loanMeta={loanStyle} />
            </div>

            {/* Co-applicant */}
            <div style={{ background: 'white', borderRadius: '18px', padding: '1.25rem 1.5rem', boxShadow: '0 4px 20px rgba(0,0,0,0.05)' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.5rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem' }}>
                  <div style={{ width: '34px', height: '34px', background: '#f1f5f9', borderRadius: '9px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Users size={18} color="#6b7280" />
                  </div>
                  <div>
                    <div style={{ fontWeight: 800, fontSize: '0.95rem', color: '#1f2937' }}>Co-Applicant</div>
                    <div style={{ fontSize: '0.75rem', color: '#9ca3af' }}>Optional — add if applicable</div>
                  </div>
                </div>
                <button onClick={() => setHasCoApplicant(v => !v)} style={{
                  padding: '0.4rem 1rem', borderRadius: '99px', cursor: 'pointer', fontWeight: 700, fontSize: '0.8rem',
                  border: `1.5px solid ${hasCoApplicant ? '#ef4444' : '#f39e1e'}`,
                  background: hasCoApplicant ? '#fff1f2' : '#fef5e8',
                  color: hasCoApplicant ? '#ef4444' : '#f39e1e',
                }}>
                  {hasCoApplicant ? '− Remove' : '+ Add Co-Applicant'}
                </button>
              </div>
              {hasCoApplicant && (
                <div style={{ marginTop: '1.25rem', paddingTop: '1.25rem', borderTop: '1px solid #f1f5f9' }}>
                  <ApplicantFields data={coApplicant} onChange={setCoApplicant} isPrimary={false} loanMeta={loanStyle} />
                </div>
              )}
            </div>

            {/* Nav */}
            <div style={{ display: 'flex', justifyContent: 'space-between' }} className="client-form-nav">
              <button onClick={() => setStep(1)} className="btn" style={{ borderRadius: '12px', background: 'white', border: '1.5px solid #e5e7eb', color: '#374151' }}>← Back</button>
              <button
                onClick={goToDocs}
                className="btn btn-primary"
                style={{ borderRadius: '12px', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                Next: Documents <ChevronRight size={16} />
              </button>
            </div>
          </div>
        )}

        {/* ── STEP 3: Documents ─────────────────────────────── */}
        {step === 3 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {/* Info header */}
            <div style={{ background: 'white', borderRadius: '14px', padding: '1rem 1.5rem', boxShadow: '0 2px 10px rgba(0,0,0,0.05)', display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
              <span style={{ fontSize: '1.5rem' }}>{loanStyle?.icon}</span>
              <div>
                <div style={{ fontWeight: 800, fontSize: '0.95rem', color: '#1f2937' }}>{loanType}</div>
                <div style={{ fontSize: '0.8rem', color: '#6b7280' }}>Client: <strong>{applicant.name}</strong>{hasCoApplicant && coApplicant.name ? ` & ${coApplicant.name}` : ''}</div>
              </div>
              <div style={{ marginLeft: 'auto', fontSize: '0.75rem', color: '#9ca3af', fontStyle: 'italic' }}>
                Files auto-named as <code style={{ background: '#f3f4f6', padding: '0.1rem 0.35rem', borderRadius: '4px' }}>ClientName_SectionLabel</code>
              </div>
            </div>

            {/* Document sections */}
            {(LOAN_DOCS[loanType] || []).map(section => (
              <DocSection
                key={section}
                label={section}
                slots={docs[section] || [{ file: null, displayName: '' }]}
                clientName={applicant.name}
                onUpload={(idx, file) => handleUpload(section, idx, file)}
                onAdd={() => addSlot(section)}
                onRemove={(idx) => removeSlot(section, idx)}
              />
            ))}

            {/* Nav */}
            <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '2rem' }}>
              <button onClick={() => setStep(2)} className="btn" style={{ borderRadius: '12px', background: 'white', border: '1.5px solid #e5e7eb', color: '#374151' }}>← Back</button>
              <button onClick={() => setSubmitted(true)} className="btn btn-primary" style={{ borderRadius: '12px', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <CheckCircle size={16} /> Submit Onboarding
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
