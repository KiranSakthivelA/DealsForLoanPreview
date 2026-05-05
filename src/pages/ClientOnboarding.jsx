import { useState, useRef, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
  Home, Building, User, Briefcase, Landmark, Car, CreditCard, Shield,
  UploadCloud, CheckCircle2, Plus, X, Send, Users, ArrowLeft
} from 'lucide-react';
import { saveOnboarding } from '../store/db';

// ─── Loan types ───────────────────────────────────────────────
const LOAN_TYPES = [
  { label: 'Home Loan',                 icon: Home,       color: '#3b82f6' },
  { label: 'Mortgage Loan',             icon: Building,   color: '#8b5cf6' },
  { label: 'Personal Loan',            icon: User,       color: '#10b981' },
  { label: 'Business Loan (Secured)',  icon: Briefcase,  color: '#f59e0b' },
  { label: 'Business Loan (Unsecured)',icon: Briefcase,  color: '#ea580c' },
  { label: 'Agri Loan',                icon: Landmark,   color: '#65a30d' },
  { label: 'Vehicle Loan (Commercial)',icon: Car,        color: '#64748b' },
  { label: 'Vehicle Loan (Individual)',icon: Car,        color: '#94a3b8' },
  { label: 'Credit Card',              icon: CreditCard, color: '#06b6d4' },
  { label: 'Insurance',               icon: Shield,     color: '#ec4899' },
];

const LOAN_DOCS = {
  'Home Loan':                 ['ID Proof', 'Address Proof', 'Photo', 'Income Proof', 'Bank Statement', 'Property Documents', 'Other Documents'],
  'Mortgage Loan':             ['ID Proof', 'Address Proof', 'Photo', 'Income Proof', 'Bank Statement', 'Property Documents', 'Other Documents'],
  'Personal Loan':             ['ID Proof', 'Address Proof', 'Photo', 'Income Proof', 'Bank Statement', 'Other Documents'],
  'Business Loan (Secured)':  ['ID Proof', 'Address Proof', 'Photo', 'Business Proof', 'Income Proof', 'Bank Statement', 'Property Documents', 'Other Documents'],
  'Business Loan (Unsecured)':['ID Proof', 'Address Proof', 'Photo', 'Business Proof', 'Income Proof', 'Bank Statement', 'Other Documents'],
  'Agri Loan':                 ['ID Proof', 'Address Proof', 'Photo', 'Income Proof', 'Land Documents', 'Property Documents', 'Other Documents'],
  'Vehicle Loan (Commercial)': ['ID Proof', 'Address Proof', 'Photo', 'Income Proof', 'Bank Statement', 'Vehicle Quotation', 'Other Documents'],
  'Vehicle Loan (Individual)': ['ID Proof', 'Address Proof', 'Photo', 'Income Proof', 'Bank Statement', 'Vehicle Quotation', 'Other Documents'],
  'Credit Card':               ['ID Proof', 'Address Proof', 'Photo', 'Income Proof', 'Bank Statement', 'Other Documents'],
  'Insurance':                 ['ID Proof', 'Address Proof', 'Photo', 'Other Documents'],
};

const sanitize = (s) => (s || '').trim().replace(/\s+/g, '_').replace(/[^a-zA-Z0-9_]/g, '');

function makeFileName(clientName, sectionLabel, index, file) {
  const ext = file.name.includes('.') ? file.name.split('.').pop() : 'file';
  const num = index > 0 ? `_${index + 1}` : '';
  return `${sanitize(clientName) || 'Client'}_${sanitize(sectionLabel)}${num}.${ext}`;
}

const initDocs = (loanType) => {
  const d = {};
  (LOAN_DOCS[loanType] || []).forEach(s => { d[s] = [{ file: null, displayName: '' }]; });
  return d;
};

const EMPTY = { name: '', dob: '', phone: '', email: '', pan: '', aadhar: '' };

// ─── File Slot ────────────────────────────────────────────────
function FileSlot({ slot, onUpload, onClear, onRemove, showRemove }) {
  const ref = useRef();
  const has = !!slot.file;
  const [error, setError] = useState('');

  const handleChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (file.size > 1 * 1024 * 1024) {
      setError(`File too large (${(file.size / 1024 / 1024).toFixed(2)} MB). Max allowed: 1 MB.`);
      e.target.value = ''; // reset input
      return;
    }
    setError('');
    onUpload(file);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.2rem' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
        <input ref={ref} type="file" accept="image/*,.pdf,.doc,.docx,.xlsx"
          style={{ display: 'none' }}
          onChange={handleChange} />

        {/* Upload area */}
        <div onClick={() => !has && ref.current.click()} style={{
          flex: 1, minWidth: 0, display: 'flex', alignItems: 'center', gap: '0.625rem',
          padding: '0.55rem 0.875rem', borderRadius: '9px',
          cursor: has ? 'default' : 'pointer',
          border: `1.5px ${has ? 'solid' : 'dashed'} ${error ? '#fca5a5' : has ? '#10b981' : '#d1d5db'}`,
          background: error ? '#fff1f2' : has ? '#f0fdf4' : '#fafafa',
          transition: 'all 0.2s',
        }}>
          {has
            ? <CheckCircle2 size={15} color="#10b981" style={{ flexShrink: 0 }} />
            : <UploadCloud  size={15} color={error ? '#ef4444' : '#9ca3af'} style={{ flexShrink: 0 }} />
          }
          <span style={{
            fontSize: '0.78rem', fontWeight: has ? 600 : 400,
            color: has ? '#15803d' : error ? '#ef4444' : '#9ca3af',
            overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
          }}>
            {has ? slot.displayName : 'Click to upload'}
          </span>

        </div>

        {/* Cancel uploaded file (clears file, keeps row) */}
        {has && (
          <button type="button" onClick={() => { setError(''); onClear(); }}
            title="Remove uploaded file"
            style={{ width: '26px', height: '26px', borderRadius: '50%', border: 'none', background: '#fef3c7', color: '#d97706', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <X size={13} />
          </button>
        )}

        {/* Remove row entirely */}
        {showRemove && !has && (
          <button type="button" onClick={onRemove}
            title="Remove this row"
            style={{ width: '26px', height: '26px', borderRadius: '50%', border: 'none', background: '#fee2e2', color: '#ef4444', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <X size={13} />
          </button>
        )}
      </div>

      {/* Inline error */}
      {error && (
        <div style={{ fontSize: '0.71rem', color: '#ef4444', fontWeight: 600, paddingLeft: '0.25rem', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
          ⚠️ {error}
        </div>
      )}
    </div>
  );
}

// ─── Document Section ─────────────────────────────────────────
function DocSection({ label, slots, clientName, onUpload, onClear, onAdd, onRemove }) {
  const uploaded = slots.filter(s => s.file).length;
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <span style={{ fontSize: '0.72rem', fontWeight: 800, color: '#374151', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{label}</span>
          {uploaded > 0 && (
            <span style={{ fontSize: '0.64rem', background: '#d1fae5', color: '#065f46', padding: '0.1rem 0.4rem', borderRadius: '99px', fontWeight: 700 }}>
              {uploaded}/{slots.length}
            </span>
          )}
        </div>
        <button type="button" onClick={onAdd} title={`Add another ${label}`}
          style={{ width: '24px', height: '24px', borderRadius: '50%', background: '#f39e1e', border: 'none', color: 'white', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
          <Plus size={14} />
        </button>
      </div>
      {/* All slots rendered vertically below label */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
        {slots.map((slot, idx) => (
          <FileSlot
            key={idx} slot={slot} showRemove={slots.length > 1}
            onUpload={(file) => onUpload(idx, file)}
            onClear={() => onClear(idx)}
            onRemove={() => onRemove(idx)}
          />
        ))}
      </div>
    </div>
  );
}

// ─── Person Fields ────────────────────────────────────────────
function PersonFields({ data, onChange, prefix = 'a' }) {
  const set = (f) => (e) => onChange({ ...data, [f]: e.target.value });
  const inp = { width: '100%', boxSizing: 'border-box', padding: '0.7rem 1rem', border: '1.5px solid #e5e7eb', borderRadius: '10px', fontSize: '0.875rem', fontFamily: 'inherit', outline: 'none', background: '#f8fafc', transition: 'all 0.2s' };
  const lbl = { display: 'block', fontSize: '0.72rem', fontWeight: 700, color: '#6b7280', marginBottom: '0.3rem', textTransform: 'uppercase', letterSpacing: '0.04em' };
  const fo = e => { e.target.style.borderColor = '#f39e1e'; e.target.style.background = '#fff'; };
  const bl = e => { e.target.style.borderColor = '#e5e7eb'; e.target.style.background = '#f8fafc'; };
  const fields = [
    { f: 'name',   l: 'Full Name *',   t: 'text',  ph: 'e.g. Ravi Kumar' },
    { f: 'dob',    l: 'Date of Birth', t: 'date',  ph: '' },
    { f: 'phone',  l: 'Mobile *',      t: 'tel',   ph: '10-digit number' },
    { f: 'email',  l: 'Email',         t: 'email', ph: 'name@example.com' },
    { f: 'pan',    l: 'PAN Number',    t: 'text',  ph: 'ABCDE1234F' },
    { f: 'aadhar', l: 'Aadhar Number', t: 'text',  ph: '12-digit number' },
  ];
  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(190px, 1fr))', gap: '1rem' }}>
      {fields.map(({ f, l, t, ph }) => (
        <div key={`${prefix}-${f}`}>
          <label style={lbl}>{l}</label>
          <input type={t} value={data[f]} placeholder={ph} onChange={set(f)} style={inp} onFocus={fo} onBlur={bl} />
        </div>
      ))}
    </div>
  );
}

// ─── Main ─────────────────────────────────────────────────────
export default function ClientOnboarding() {
  const navigate = useNavigate();
  const [params] = useSearchParams();

  // Pre-fill: shared links use opaque base64 `ref` token; internal nav uses plain state via `uid` etc.
  const refToken = params.get('ref');
  let urlLoanType = LOAN_TYPES[0].label, urlName = '', urlPhone = '', urlEmail = '', urlLeadUid = '';
  if (refToken) {
    try {
      const d = JSON.parse(atob(refToken));
      urlLeadUid  = d.uid       || '';
      urlLoanType = d.loanType  || LOAN_TYPES[0].label;
      urlName     = d.name      || '';
      urlPhone    = d.phone     || '';
      urlEmail    = d.email     || '';
    } catch { /* invalid token — ignore */ }
  } else {
    // internal "Fill Form" direct navigation still works
    urlLeadUid  = params.get('uid')      || '';
    urlLoanType = params.get('loanType') || LOAN_TYPES[0].label;
    urlName     = params.get('name')     || '';
    urlPhone    = params.get('phone')    || '';
    urlEmail    = params.get('email')    || '';
  }

  const [loanType, setLoanType]   = useState(urlLoanType);
  const [tab, setTab]             = useState('applicant');
  const [hasCoApp, setHasCoApp]   = useState(false);
  const [applicant, setApplicant] = useState({ ...EMPTY, name: urlName, phone: urlPhone, email: urlEmail });
  const [coApp, setCoApp]         = useState({ ...EMPTY });
  const [docs, setDocs]           = useState(() => initDocs(urlLoanType));
  const [submitted, setSubmitted] = useState(false);

  const loanMeta = LOAN_TYPES.find(l => l.label === loanType) || LOAN_TYPES[0];
  const LoanIcon = loanMeta.icon;

  // Re-init docs when loan type changes
  useEffect(() => {
    setDocs(initDocs(loanType));
  }, [loanType]);

  const handleUpload = (section, idx, file) => {
    const clientName = applicant.name;
    const reader = new FileReader();
    reader.onload = () => {
      setDocs(prev => {
        const arr = [...(prev[section] || [])];
        arr[idx] = {
          file,
          displayName: makeFileName(clientName, section, idx, file),
          base64: reader.result,
          fileType: file.type,
        };
        return { ...prev, [section]: arr };
      });
    };
    reader.readAsDataURL(file);
  };

  const addSlot = (section) => {
    setDocs(prev => ({
      ...prev,
      [section]: [...(prev[section] || []), { file: null, displayName: '' }],
    }));
  };

  const clearSlot = (section, idx) => {
    setDocs(prev => {
      const arr = [...(prev[section] || [])];
      arr[idx] = { file: null, displayName: '' };
      return { ...prev, [section]: arr };
    });
  };

  const removeSlot = (section, idx) => {
    setDocs(prev => {
      const arr = [...(prev[section] || [])];
      arr.splice(idx, 1);
      return { ...prev, [section]: arr };
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Build storable doc data including base64 for admin file viewing/download
    const docMeta = {};
    Object.entries(docs).forEach(([sec, slots]) => {
      docMeta[sec] = slots.map(s => ({
        displayName: s.displayName,
        uploaded: !!s.file,
        base64: s.base64 || null,
        fileType: s.fileType || null,
      }));
    });
    saveOnboarding({
      leadUid: urlLeadUid,
      loanType,
      applicant,
      coApplicant: hasCoApp ? coApp : null,
      documents: docMeta,
    });
    setSubmitted(true);
  };

  // ── Success ─────────────────────────────────────────────────
  if (submitted) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f4f7fa', padding: '2rem' }}>
        <div style={{ textAlign: 'center', maxWidth: '420px', background: 'white', borderRadius: '20px', padding: '3rem 2rem', boxShadow: '0 20px 40px rgba(0,0,0,0.08)' }}>
          <div style={{ width: '72px', height: '72px', background: '#d1fae5', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.25rem' }}>
            <CheckCircle2 size={36} color="#10b981" />
          </div>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#1f2937', marginBottom: '0.75rem' }}>Submitted!</h2>
          <p style={{ color: '#6b7280', marginBottom: '2rem', fontSize: '0.9rem' }}>
            Onboarding for <strong>{applicant.name || 'Client'}</strong> ({loanType}) submitted successfully.
          </p>
          <div style={{ display: 'flex', gap: '0.75rem', flexDirection: 'column' }}>
            <button className="btn btn-primary" style={{ width: '100%', borderRadius: '12px' }}
              onClick={() => { setSubmitted(false); setApplicant({ ...EMPTY }); setCoApp({ ...EMPTY }); setDocs(initDocs(loanType)); setTab('applicant'); }}>
              Submit Another
            </button>
            {urlLeadUid && (
              <button className="btn" style={{ width: '100%', borderRadius: '12px', border: '1.5px solid #e5e7eb' }}
                onClick={() => navigate('/crm')}>
                Back to Dashboard
              </button>
            )}
          </div>
        </div>
      </div>
    );
  }

  const docSections = LOAN_DOCS[loanType] || [];
  const secTitle = { fontSize: '0.68rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.08em', color: '#9ca3af', marginBottom: '1rem' };

  return (
    <div style={{ minHeight: '100vh', background: '#f4f7fa', display: 'flex', flexDirection: 'column' }}>

      {/* Top bar */}
      <div style={{ background: 'white', borderBottom: '1px solid #e5e7eb', padding: '0.75rem 1.5rem', display: 'flex', alignItems: 'center', gap: '1rem', position: 'sticky', top: 0, zIndex: 50, boxShadow: '0 1px 4px rgba(0,0,0,0.05)' }}>
        {urlLeadUid && !refToken && (
          <button type="button" onClick={() => navigate('/crm')} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#6b7280', display: 'flex', alignItems: 'center', gap: '0.3rem', fontSize: '0.82rem', fontWeight: 600 }}>
            <ArrowLeft size={16} /> Back to CRM
          </button>
        )}
        <img src="/Asset/f.png" alt="Deals For Loan" style={{ height: '26px', objectFit: 'contain' }} />
        <div style={{ width: '1px', height: '18px', background: '#e5e7eb' }} />
        <span style={{ fontWeight: 700, fontSize: '0.875rem', color: '#374151' }}>Client Onboarding Form</span>

      </div>

      <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>

        {/* Loan type sidebar — locked for client share links, switchable for staff */}
        <aside style={{ width: '210px', minWidth: '210px', background: 'white', borderRight: '1px solid #e5e7eb', padding: '0.875rem 0.625rem', display: 'flex', flexDirection: 'column', gap: '0.25rem', overflowY: 'auto', flexShrink: 0 }}>
          <div style={{ fontSize: '0.62rem', fontWeight: 800, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.08em', padding: '0.25rem 0.625rem', marginBottom: '0.25rem' }}>Loan Type</div>
          {(refToken ? LOAN_TYPES.filter(l => l.label === loanType) : LOAN_TYPES).map(({ label, icon: Icon, color }) => {
            const active = loanType === label;
            return (
              <button key={label} type="button" onClick={() => !refToken && setLoanType(label)} style={{
                display: 'flex', alignItems: 'center', gap: '0.625rem', padding: '0.6rem 0.75rem',
                borderRadius: '9px', border: 'none', cursor: refToken ? 'default' : 'pointer', textAlign: 'left',
                fontSize: '0.8rem', fontWeight: active ? 700 : 500,
                color: active ? color : '#6b7280',
                background: active ? `${color}12` : 'transparent',
                borderLeft: active ? `3px solid ${color}` : '3px solid transparent',
                transition: 'all 0.15s', width: '100%',
              }}>
                <Icon size={15} strokeWidth={active ? 2.5 : 2} style={{ flexShrink: 0, color: active ? color : '#9ca3af' }} />
                {label}
              </button>
            );
          })}
        </aside>

        {/* Form */}
        <main style={{ flex: 1, overflowY: 'auto', padding: '1.25rem' }}>
          <form onSubmit={handleSubmit}>

            {/* Header */}
            <div style={{ background: 'white', borderRadius: '14px', padding: '1.125rem 1.375rem', marginBottom: '1rem', boxShadow: '0 2px 10px rgba(0,0,0,0.04)', display: 'flex', alignItems: 'center', gap: '0.875rem', borderLeft: `4px solid ${loanMeta.color}` }}>
              <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: `${loanMeta.color}15`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: loanMeta.color, flexShrink: 0 }}>
                <LoanIcon size={20} />
              </div>
              <div>
                <h2 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#1f2937', margin: 0 }}>{loanType} Application</h2>
                <p style={{ color: '#9ca3af', fontSize: '0.78rem', margin: 0 }}>Fill in the client details and upload required documents.</p>
              </div>
            </div>

            {/* Applicant Panel */}
            <div style={{ background: 'white', borderRadius: '14px', padding: '1.375rem', marginBottom: '1rem', boxShadow: '0 2px 10px rgba(0,0,0,0.04)' }}>

              {/* Tab bar + co-applicant toggle */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.625rem', marginBottom: '1.25rem' }}>
                <div style={{ display: 'flex', background: '#f1f5f9', borderRadius: '99px', padding: '0.2rem', gap: 0 }}>
                  {['applicant', ...(hasCoApp ? ['coapplicant'] : [])].map(key => (
                    <button key={key} type="button" onClick={() => setTab(key)} style={{
                      padding: '0.4rem 0.875rem', borderRadius: '99px', border: 'none', cursor: 'pointer',
                      fontWeight: 700, fontSize: '0.78rem', transition: 'all 0.2s',
                      display: 'flex', alignItems: 'center', gap: '0.3rem',
                      background: tab === key ? 'white' : 'transparent',
                      color: tab === key ? '#1f2937' : '#9ca3af',
                      boxShadow: tab === key ? '0 1px 6px rgba(0,0,0,0.08)' : 'none',
                    }}>
                      {key === 'applicant' ? <User size={12} /> : <Users size={12} />}
                      {key === 'applicant' ? 'Applicant' : 'Co-Applicant'}
                    </button>
                  ))}
                </div>
                <button type="button" onClick={() => { setHasCoApp(v => !v); setTab(hasCoApp ? 'applicant' : 'coapplicant'); }}
                  style={{ padding: '0.35rem 0.875rem', borderRadius: '99px', cursor: 'pointer', fontWeight: 700, fontSize: '0.76rem', border: `1.5px solid ${hasCoApp ? '#ef4444' : loanMeta.color}`, background: hasCoApp ? '#fff1f2' : `${loanMeta.color}12`, color: hasCoApp ? '#ef4444' : loanMeta.color }}>
                  {hasCoApp ? '− Remove Co-Applicant' : '+ Add Co-Applicant'}
                </button>
              </div>

              <div style={secTitle}>Personal Details</div>
              <PersonFields
                data={tab === 'applicant' ? applicant : coApp}
                onChange={tab === 'applicant' ? setApplicant : setCoApp}
                prefix={tab}
              />
            </div>

            {/* Document Upload */}
            <div style={{ background: 'white', borderRadius: '14px', padding: '1.375rem', marginBottom: '1rem', boxShadow: '0 2px 10px rgba(0,0,0,0.04)' }}>
              <div style={secTitle}>Document Upload</div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1.5rem' }}>
                {docSections.map(section => (
                  <DocSection
                    key={section}
                    label={section}
                    slots={docs[section] || [{ file: null, displayName: '' }]}
                    clientName={applicant.name}
                    onUpload={(idx, file) => handleUpload(section, idx, file)}
                    onClear={(idx) => clearSlot(section, idx)}
                    onAdd={() => addSlot(section)}
                    onRemove={(idx) => removeSlot(section, idx)}
                  />
                ))}
              </div>
            </div>

            {/* Submit */}
            <div style={{ display: 'flex', justifyContent: 'flex-end', paddingBottom: '2rem' }}>
              <button type="submit" className="btn btn-primary" style={{
                borderRadius: '12px', padding: '0.875rem 2.5rem', fontSize: '0.92rem', fontWeight: 700,
                display: 'flex', alignItems: 'center', gap: '0.625rem',
                background: `linear-gradient(135deg, ${loanMeta.color} 0%, ${loanMeta.color}bb 100%)`,
                boxShadow: `0 8px 20px ${loanMeta.color}40`,
              }}>
                <Send size={16} /> Submit Application
              </button>
            </div>

          </form>
        </main>
      </div>
    </div>
  );
}
