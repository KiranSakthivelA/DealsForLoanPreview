import { useState, useEffect, useRef } from 'react';
import {
  ClipboardList, CheckCircle2, Phone, Mail, Calendar,
  Download, Shield, ChevronDown, Gift, BadgeCheck, Trash2, Upload, Users, Eye, Plus, X
} from 'lucide-react';
import { LOAN_DOCS } from './ClientForm';
import {
  getAllOnboardings, updateOnboardingStatus, closeDeal,
  grantOnboardingAccess, revokeOnboardingAccess, MOCK_USERS, updateOnboardingDoc, addDocumentSlot, updateOnboardingCoApplicant
} from '../store/db';

// ─── Deal Done Modal ───────────────────────────────────────────
function DealModal({ onb, onClose, onDone }) {
  const isBT = (onb.loanType || '').toLowerCase().includes('bt');
  const sixMonths = new Date();
  sixMonths.setMonth(sixMonths.getMonth() + 6);
  const defaultFollow = isBT ? sixMonths.toISOString().slice(0, 10) : '';

  const [amount, setAmount]   = useState('');
  const [followUp, setFollowUp] = useState(defaultFollow);
  const [err, setErr]         = useState('');

  const submit = () => {
    const num = parseFloat(amount);
    if (!amount || isNaN(num) || num <= 0) { setErr('Enter a valid amount greater than 0'); return; }
    closeDeal(onb.id, num, followUp || null);
    onDone();
    onClose();
  };

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.45)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}>
      <div style={{ background: 'white', borderRadius: '18px', padding: '1.75rem', maxWidth: '420px', width: '100%', boxShadow: '0 20px 40px rgba(0,0,0,0.15)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem', marginBottom: '0.5rem' }}>
          <BadgeCheck size={26} color="#10b981" />
          <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 800, color: '#1f2937' }}>Mark Deal as Closed</h3>
        </div>
        <p style={{ color: '#6b7280', fontSize: '0.83rem', marginBottom: '1.25rem' }}>
          Enter the final sanctioned / disbursed amount for <strong>{onb.applicant?.name}</strong> ({onb.loanType}).
        </p>

        <label style={{ fontSize: '0.72rem', fontWeight: 700, color: '#374151', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Deal Amount (₹) *</label>
        <input
          type="number" min="1" placeholder="e.g. 500000"
          value={amount} onChange={e => { setAmount(e.target.value); setErr(''); }}
          style={{ width: '100%', boxSizing: 'border-box', marginTop: '0.3rem', marginBottom: err ? '0.25rem' : '1rem', padding: '0.7rem 1rem', border: `1.5px solid ${err ? '#ef4444' : '#e5e7eb'}`, borderRadius: '10px', fontSize: '0.95rem', outline: 'none' }}
        />
        {err && <p style={{ color: '#ef4444', fontSize: '0.76rem', marginBottom: '0.875rem', fontWeight: 600 }}>{err}</p>}

        <label style={{ fontSize: '0.72rem', fontWeight: 700, color: '#374151', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Follow-up Date {isBT && <span style={{ color: '#7c3aed', fontWeight: 600 }}>(BT+Topup — auto 6 months)</span>}</label>
        <input
          type="date" value={followUp} onChange={e => setFollowUp(e.target.value)}
          style={{ width: '100%', boxSizing: 'border-box', marginTop: '0.3rem', marginBottom: '1.25rem', padding: '0.7rem 1rem', border: '1.5px solid #e5e7eb', borderRadius: '10px', fontSize: '0.875rem', outline: 'none' }}
        />

        <div style={{ display: 'flex', gap: '0.625rem' }}>
          <button onClick={onClose} style={{ flex: 1, padding: '0.7rem', borderRadius: '10px', border: '1.5px solid #e5e7eb', background: 'white', fontWeight: 700, cursor: 'pointer', color: '#6b7280' }}>Cancel</button>
          <button onClick={submit} style={{ flex: 2, padding: '0.7rem', borderRadius: '10px', border: 'none', background: 'linear-gradient(135deg,#10b981,#059669)', color: 'white', fontWeight: 700, cursor: 'pointer', fontSize: '0.92rem' }}>✓ Confirm Deal Closed</button>
        </div>
      </div>
    </div>
  );
}

// ─── Add Co-Applicant Modal ────────────────────────────────────
function AddCoAppModal({ onb, onClose, onRefresh }) {
  const [data, setData] = useState({ name: '', phone: '', email: '', dob: '', occupation: '', address: '', city: '', pincode: '' });
  const set = (f) => (e) => setData({ ...data, [f]: e.target.value });
  
  const submit = () => {
    if (!data.name.trim()) { alert('Co-Applicant Name is required'); return; }
    
    // Initialize empty document slots for the specific loan type
    const initDocs = {};
    (LOAN_DOCS[onb.loanType] || []).forEach(sec => {
       initDocs[sec] = [{ displayName: '', uploaded: false, base64: null, fileType: null }];
    });
    
    updateOnboardingCoApplicant(onb.id, data, initDocs);
    onRefresh();
    onClose();
  };

  const inputCss = { width: '100%', boxSizing: 'border-box', padding: '0.6rem 0.8rem', border: '1.5px solid #e5e7eb', borderRadius: '8px', marginBottom: '0.75rem', fontSize: '0.8rem', outline: 'none' };

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.45)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}>
      <div style={{ background: 'white', borderRadius: '18px', padding: '1.75rem', width: '420px', maxWidth: '100%', boxShadow: '0 20px 40px rgba(0,0,0,0.15)' }}>
        <h3 style={{ marginTop: 0, marginBottom: '0.5rem', fontSize: '1.1rem', fontWeight: 800, color: '#1f2937' }}>Add Co-Applicant</h3>
        <p style={{ color: '#6b7280', fontSize: '0.8rem', marginBottom: '1.25rem' }}>Enter details to unlock co-applicant document uploads.</p>
        
        <input placeholder="Full Name *" value={data.name} onChange={set('name')} style={inputCss} />
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <input placeholder="Phone" value={data.phone} onChange={set('phone')} style={inputCss} />
          <input placeholder="Email" value={data.email} onChange={set('email')} style={inputCss} />
        </div>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <input type="date" title="DOB" value={data.dob} onChange={set('dob')} style={inputCss} />
          <input placeholder="Occupation" value={data.occupation} onChange={set('occupation')} style={inputCss} />
        </div>
        <input placeholder="Address" value={data.address} onChange={set('address')} style={inputCss} />
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <input placeholder="City" value={data.city} onChange={set('city')} style={inputCss} />
          <input placeholder="Pincode" value={data.pincode} onChange={set('pincode')} style={inputCss} />
        </div>

        <div style={{ display: 'flex', gap: '0.625rem', marginTop: '0.5rem' }}>
          <button onClick={onClose} style={{ flex: 1, padding: '0.7rem', border: '1.5px solid #e5e7eb', background: 'white', color: '#6b7280', borderRadius: '10px', cursor: 'pointer', fontWeight: 700 }}>Cancel</button>
          <button onClick={submit} style={{ flex: 2, padding: '0.7rem', border: 'none', background: '#3b82f6', color: 'white', borderRadius: '10px', cursor: 'pointer', fontWeight: 700 }}>+ Add Co-Applicant</button>
        </div>
      </div>
    </div>
  );
}

// ─── WhatsApp Helper ───────────────────────────────────────────
function sendWhatsApp(phone, message) {
  const clean = (phone || '').replace(/\D/g, '');
  const num = clean.startsWith('91') ? clean : `91${clean}`;
  window.open(`https://wa.me/${num}?text=${encodeURIComponent(message)}`, '_blank');
}

const STATUS_OPTIONS = [
  { value: 'In Progress', color: '#f59e0b', bg: '#fef3c7' },
  { value: 'Completed',   color: '#10b981', bg: '#d1fae5' },
];

// ─── Birthday check ────────────────────────────────────────────
function isBirthdayToday(dob) {
  if (!dob) return false;
  const today = new Date();
  const d = new Date(dob);
  return d.getDate() === today.getDate() && d.getMonth() === today.getMonth();
}

// ─── Admin Doc Row ─────────────────────────────────────────────
// Shows one uploaded file slot. Admin gets Replace + Delete buttons.
function AdminDocRow({ file, slotIndex, onbId, docKey, section, canEdit, onRefresh }) {
  const fileRef = useRef();

  const downloadFile = () => {
    if (!file.base64) return;
    const a = document.createElement('a');
    a.href = file.base64;
    a.download = file.displayName || 'document';
    a.click();
  };

  const viewFile = () => {
    if (!file.base64) return;
    const w = window.open('');
    if (w) {
      if (file.base64.startsWith('data:image/')) {
        w.document.write(`<title>${file.displayName || 'Document'}</title><body style="margin:0;display:flex;align-items:center;justify-content:center;background:#0e1111;"><img src="${file.base64}" style="max-width:100%;max-height:100vh;object-fit:contain;" /></body>`);
      } else {
        w.document.write(`<title>${file.displayName || 'Document'}</title><body style="margin:0;"><iframe src="${file.base64}" style="width:100vw; height:100vh; border:none; margin:0; padding:0;"></iframe></body>`);
      }
    } else {
      alert("Please allow popups to view files in a new tab.");
    }
  };

  const handleReplace = (e) => {
    const f = e.target.files[0];
    if (!f) return;
    if (f.size > 1 * 1024 * 1024) { alert('File too large. Max 1 MB.'); return; }
    const reader = new FileReader();
    reader.onload = () => {
      updateOnboardingDoc(onbId, docKey, section, slotIndex, {
        displayName: f.name,
        uploaded: true,
        base64: reader.result,
        fileType: f.type,
      });
      onRefresh();
    };
    reader.readAsDataURL(f);
  };

  const handleDelete = () => {
    if (!window.confirm(`Delete "${file.displayName || 'this file'}"?`)) return;
    updateOnboardingDoc(onbId, docKey, section, slotIndex, null);
    onRefresh();
  };

  const handleCancel = () => {
    updateOnboardingDoc(onbId, docKey, section, slotIndex, null);
    onRefresh();
  };

  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: '0.375rem',
      background: file.base64 ? '#f0fdf4' : '#f8fafc',
      border: `1px solid ${file.base64 ? '#bbf7d0' : '#e5e7eb'}`,
      borderRadius: '8px', padding: '0.35rem 0.7rem', fontSize: '0.75rem',
    }}>
      <CheckCircle2 size={12} color={file.base64 ? '#10b981' : '#9ca3af'} />
      <span style={{ maxWidth: '160px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', fontWeight: 500, flex: 1 }}>
        {file.displayName || 'File'}
      </span>
      {/* Download / View */}
      {file.base64 && (
        <>
          <button onClick={viewFile} title="View"
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#059669', display: 'flex', alignItems: 'center', gap: '0.1rem', fontSize: '0.7rem', fontWeight: 700, padding: '0 0.1rem', marginRight: '0.2rem' }}>
            <Eye size={11} /> View
          </button>
          <button onClick={downloadFile} title="Download"
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#2563eb', display: 'flex', alignItems: 'center', gap: '0.1rem', fontSize: '0.7rem', fontWeight: 700, padding: '0 0.1rem' }}>
            <Download size={11} /> DL
          </button>
        </>
      )}
      {/* Admin-only: Replace / Upload */}
      {canEdit && (
        <>
          <input ref={fileRef} type="file" accept="image/*,.pdf,.doc,.docx" style={{ display: 'none' }} onChange={handleReplace} />
          <button onClick={() => fileRef.current.click()} title={file.base64 ? "Replace file" : "Upload file"}
            style={{ background: '#eff6ff', border: '1px solid #bfdbfe', borderRadius: '6px', cursor: 'pointer', color: '#1d4ed8', display: 'flex', alignItems: 'center', gap: '0.2rem', fontSize: '0.68rem', fontWeight: 700, padding: '0.15rem 0.45rem' }}>
            <Upload size={10} /> {file.base64 ? 'Replace' : 'Upload'}
          </button>
          {file.base64 ? (
            <button onClick={handleDelete} title="Delete file"
              style={{ background: '#fff1f2', border: '1px solid #fecaca', borderRadius: '6px', cursor: 'pointer', color: '#dc2626', display: 'flex', alignItems: 'center', gap: '0.2rem', fontSize: '0.68rem', fontWeight: 700, padding: '0.15rem 0.45rem' }}>
              <Trash2 size={10} /> Delete
            </button>
          ) : (
            slotIndex > 0 && (
              <button onClick={handleCancel} title="Cancel / Remove slot"
                style={{ background: '#f8fafc', border: '1px solid #cbd5e1', borderRadius: '6px', cursor: 'pointer', color: '#64748b', display: 'flex', alignItems: 'center', gap: '0.2rem', fontSize: '0.68rem', fontWeight: 700, padding: '0.15rem 0.45rem' }}>
                <X size={10} /> Cancel
              </button>
            )
          )}
        </>
      )}
    </div>
  );
}

// ─── Client Card ───────────────────────────────────────────────
function ClientCard({ onb, isOwner, userId, onRefresh }) {
  const [expanded, setExpanded]     = useState(false);
  const [showDeal, setShowDeal]     = useState(false);
  const [showCoAppModal, setShowCoAppModal] = useState(false);
  const status = onb.status || 'In Progress';
  const statusMeta = STATUS_OPTIONS.find(s => s.value === status) || STATUS_OPTIONS[0];
  const managers = MOCK_USERS.filter(u => u.role === 'manager');
  const birthday = isBirthdayToday(onb.applicant?.dob);
  const allFiles = Object.entries(onb.documents || {}).flatMap(([sec, slots]) =>
    (slots || []).filter(s => s.uploaded).map(s => ({ ...s, section: sec }))
  );

  const handleStatusChange = (newStatus) => {
    updateOnboardingStatus(onb.id, newStatus);
    const phone = onb.applicant?.phone || '';
    const name  = onb.applicant?.name  || 'Client';
    const msg =
      newStatus === 'Completed'
        ? `🎉 Dear ${name}, your ${onb.loanType} application has been *Completed* successfully! Thank you for choosing Deals For Loan. Our team will reach you shortly. 🙏`
        : `📋 Dear ${name}, your ${onb.loanType} application is currently *In Progress*. We will keep you updated. – Deals For Loan`;
    sendWhatsApp(phone, msg);
    onRefresh();
  };

  const handleBirthdayWish = () => {
    const phone = onb.applicant?.phone || '';
    const name  = onb.applicant?.name  || 'Client';
    sendWhatsApp(phone,
      `🎂 Many Happy Returns of the Day, *${name}*! 🎉\n\nWishing you a wonderful birthday filled with joy and happiness. Thank you for being a valued client of Deals For Loan. 🙏`
    );
  };

  const canAccess = isOwner || (onb.grantedTo || []).includes(userId);

  // ── Print / PDF front page ──────────────────────────────────
  const printClientPDF = () => {
    const a  = onb.applicant || {};
    const co = onb.coApplicant;
    const photoB64   = (onb.documents?.['Photo'] || []).find(s => s.base64)?.base64 || '';
    const coPhotoB64 = co
      ? (onb.documents?.['Photo'] || []).filter(s => s.base64).slice(1)[0]?.base64 || ''
      : '';
    const printedOn  = new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' });
    // Use absolute URL so logo loads correctly from Blob origin
    const logoUrl    = `${window.location.origin}/Asset/f.png`;

    const field = (label, value) => value ? `
      <div style="margin-bottom:10px">
        <div style="font-size:10px;font-weight:700;color:#9ca3af;text-transform:uppercase;letter-spacing:0.06em;margin-bottom:2px">${label}</div>
        <div style="font-size:13px;color:#111827;font-weight:500;border-bottom:1px solid #f3f4f6;padding-bottom:4px">${value}</div>
      </div>` : '';

    const photoBox = (b64, name) => b64
      ? `<img src="${b64}" style="width:100px;height:120px;object-fit:cover;border-radius:8px;border:2px solid #e5e7eb;box-shadow:0 2px 8px rgba(0,0,0,0.12)" />`
      : `<div style="width:100px;height:120px;border-radius:8px;border:2px dashed #d1d5db;display:flex;align-items:center;justify-content:center;font-size:32px;font-weight:800;color:#d1d5db;background:#f9fafb">${(name||'?')[0].toUpperCase()}</div>`;

    const personSection = (label, p, photo) => `
      <div style="background:#fff;border:1px solid #e5e7eb;border-radius:12px;padding:20px;margin-bottom:18px;page-break-inside:avoid">
        <div style="display:flex;align-items:center;gap:8px;margin-bottom:16px">
          <div style="width:4px;height:20px;background:#f59e0b;border-radius:2px"></div>
          <span style="font-size:12px;font-weight:800;color:#f59e0b;text-transform:uppercase;letter-spacing:0.07em">${label}</span>
        </div>
        <div style="display:flex;gap:20px;align-items:flex-start">
          <div style="flex-shrink:0">${photoBox(photo, p.name)}</div>
          <div style="flex:1;display:grid;grid-template-columns:1fr 1fr;gap:0 24px">
            ${field('Full Name', p.name)}
            ${field('Mobile Number', p.phone)}
            ${field('Email Address', p.email)}
            ${field('Date of Birth', p.dob ? new Date(p.dob).toLocaleDateString('en-IN',{day:'numeric',month:'long',year:'numeric'}) : '')}
            ${field('Occupation', p.occupation)}
            ${field('City', p.city)}
            ${field('Pin Code', p.pincode)}
            ${p.address ? `<div style="grid-column:1/-1;margin-bottom:10px"><div style="font-size:10px;font-weight:700;color:#9ca3af;text-transform:uppercase;letter-spacing:0.06em;margin-bottom:2px">Address</div><div style="font-size:13px;color:#111827;font-weight:500;border-bottom:1px solid #f3f4f6;padding-bottom:4px">${p.address}</div></div>` : ''}
          </div>
        </div>
      </div>`;

    const html = `<!DOCTYPE html>
<html lang="en"><head><meta charset="utf-8"/>
<title>${(a.name || 'client').trim().replace(/\\s+/g, '_').toLowerCase()}_cover_page</title>
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap" rel="stylesheet"/>
<style>
  @page { size: A4 portrait; margin: 0; }
  * { box-sizing: border-box; }
  html, body { margin:0; padding:0; font-family:'Inter',Arial,sans-serif; color:#111827; background:#f8fafc; }
  .page { width:210mm; min-height:297mm; margin:0 auto; background:white; display:flex; flex-direction:column; position:relative; overflow:hidden; }
  .accent-bar { height:6px; background:linear-gradient(90deg,#f59e0b,#fbbf24,#fde68a); -webkit-print-color-adjust:exact; print-color-adjust:exact; }
  .header { padding:20px 32px 16px; display:flex; align-items:center; justify-content:space-between; border-bottom:1px solid #f3f4f6; }
  .body { padding:20px 32px; flex:1; display:flex; flex-direction:column; }
  .persons { flex:1; }
  .remarks-wrap { margin-top:auto; padding-top:16px; }
  .footer { padding:12px 32px; border-top:1px solid #f3f4f6; display:flex; justify-content:space-between; align-items:center; background:#fafafa; }
  .watermark { position:absolute; top:50%; left:50%; transform:translate(-50%,-50%) rotate(-30deg); font-size:72px; font-weight:900; color:rgba(245,158,11,0.04); white-space:nowrap; pointer-events:none; letter-spacing:-2px; }
  .remarks-box { border:1.5px solid #e5e7eb; border-radius:10px; height:130px; width:100%; margin-top:6px; background:#fafafa; }
  @media print {
    html, body { background:white; }
    .page { width:100%; min-height:100vh; box-shadow:none; }
    .no-print { display:none !important; }
    .accent-bar { -webkit-print-color-adjust:exact; print-color-adjust:exact; }
  }
</style>
</head><body>
<div class="page">
  <div class="watermark">DEALS FOR LOAN</div>
  <div class="accent-bar"></div>

  <!-- Header: logo + loan type only -->
  <div class="header">
    <img src="${logoUrl}" alt="Deals For Loan" style="height:40px;object-fit:contain" onerror="this.style.display='none'" />
    <div style="display:inline-block;background:#fef3c7;color:#b45309;font-size:12px;font-weight:700;padding:5px 16px;border-radius:99px;border:1.5px solid #fde68a;letter-spacing:0.03em">${onb.loanType}</div>
  </div>

  <!-- Body -->
  <div class="body">
    <div class="persons">
      ${personSection('Applicant', a, photoB64)}
      ${co?.name ? personSection('Co-Applicant', co, coPhotoB64) : ''}
    </div>

    <!-- Remarks pinned to bottom of body -->
    <div class="remarks-wrap">
      <div style="font-size:10px;font-weight:700;color:#9ca3af;text-transform:uppercase;letter-spacing:0.06em;margin-bottom:6px">Remarks / Notes</div>
      <div class="remarks-box"></div>
    </div>
  </div>

  <!-- Footer -->
  <div class="footer">
    <div style="font-size:10px;color:#9ca3af">Generated: ${printedOn}</div>
    <div style="font-size:10px;color:#9ca3af">Deals For Loan &mdash; Confidential</div>
  </div>
</div>

<!-- Print bar (hidden in print) -->
<div class="no-print" style="position:fixed;bottom:0;left:0;right:0;background:rgba(17,24,39,0.95);padding:12px;display:flex;justify-content:center;gap:12px;backdrop-filter:blur(4px)">
  <button onclick="window.print()" style="padding:10px 32px;background:linear-gradient(135deg,#f59e0b,#d97706);color:white;border:none;border-radius:8px;font-size:14px;font-weight:700;cursor:pointer;font-family:inherit">
    🖨&nbsp; Save / Print as PDF
  </button>
  <button onclick="window.close()" style="padding:10px 20px;background:transparent;color:#9ca3af;border:1px solid #374151;border-radius:8px;font-size:13px;font-weight:600;cursor:pointer;font-family:inherit">
    Close
  </button>
</div>
</body></html>`;

    const tab = window.open('', '_blank');
    if (tab) {
      tab.document.open();
      tab.document.write(html);
      tab.document.close();
    } else {
      alert("Please allow popups for this site to print the document.");
    }
  };


  return (
    <div style={{
      background: 'white', borderRadius: '14px', overflow: 'hidden',
      boxShadow: '0 2px 12px rgba(0,0,0,0.06)',
      borderLeft: `4px solid ${statusMeta.color}`,
      transition: 'box-shadow 0.2s',
    }}>
      {/* Card header */}
      <div style={{ padding: '1rem 1.25rem', display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.75rem', alignItems: 'flex-start' }}>
        <div style={{ display: 'flex', gap: '0.875rem', alignItems: 'flex-start', flex: 1, minWidth: 0 }}>
          {/* Avatar — show uploaded Photo if available, else initial */}
          {(() => {
            const photoSlot = (onb.documents?.['Photo'] || []).find(s => s.base64);
            return photoSlot ? (
              <img src={photoSlot.base64} alt="client" style={{ width: '42px', height: '42px', borderRadius: '50%', objectFit: 'cover', flexShrink: 0, border: `2px solid ${statusMeta.color}` }} />
            ) : (
              <div style={{ width: '42px', height: '42px', borderRadius: '50%', background: `${statusMeta.color}20`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, fontSize: '1.1rem', fontWeight: 800, color: statusMeta.color }}>
                {(onb.applicant?.name || '?')[0].toUpperCase()}
              </div>
            );
          })()}
          <div style={{ minWidth: 0 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
              <span style={{ fontWeight: 800, fontSize: '1rem', color: '#1f2937' }}>{onb.applicant?.name || '—'}</span>
              {birthday && (
                <span title="Birthday today!" style={{ background: '#fef3c7', color: '#d97706', fontSize: '0.7rem', fontWeight: 700, padding: '0.1rem 0.5rem', borderRadius: '99px', display: 'flex', alignItems: 'center', gap: '0.25rem', cursor: 'pointer' }}
                  onClick={handleBirthdayWish}>
                  <Gift size={11} /> Birthday! 🎂
                </span>
              )}
            </div>
            <div style={{ fontSize: '0.78rem', color: '#6b7280', marginTop: '0.15rem', display: 'flex', flexWrap: 'wrap', gap: '0.625rem' }}>
              {onb.applicant?.phone && <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}><Phone size={11} />{onb.applicant.phone}</span>}
              {onb.applicant?.email && <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}><Mail size={11} />{onb.applicant.email}</span>}
              {onb.applicant?.dob   && <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}><Calendar size={11} />{new Date(onb.applicant.dob).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</span>}
            </div>
            <div style={{ fontSize: '0.75rem', color: '#9ca3af', marginTop: '0.25rem' }}>
              {onb.loanType} &nbsp;·&nbsp; Submitted {new Date(onb.submittedAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
            </div>
            {onb.coApplicant?.name && (
              <div style={{ fontSize: '0.72rem', color: '#6b7280', marginTop: '0.15rem' }}>Co-Applicant: <strong>{onb.coApplicant.name}</strong></div>
            )}
          </div>
        </div>

        {/* Right side: status + file count */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '0.5rem', flexShrink: 0 }}>
          {/* Status dropdown */}
          <div style={{ position: 'relative' }}>
            <select
              value={status}
              onChange={e => handleStatusChange(e.target.value)}
              style={{
                appearance: 'none', WebkitAppearance: 'none',
                padding: '0.35rem 2rem 0.35rem 0.75rem', borderRadius: '99px', cursor: 'pointer',
                fontSize: '0.78rem', fontWeight: 700, border: `1.5px solid ${statusMeta.color}`,
                background: statusMeta.bg, color: statusMeta.color, outline: 'none',
              }}
            >
              {STATUS_OPTIONS.map(s => (
                <option key={s.value} value={s.value}>{s.value}</option>
              ))}
            </select>
            <ChevronDown size={13} style={{ position: 'absolute', right: '0.5rem', top: '50%', transform: 'translateY(-50%)', color: statusMeta.color, pointerEvents: 'none' }} />
          </div>
          <span style={{ fontSize: '0.72rem', background: '#f3f4f6', color: '#6b7280', padding: '0.2rem 0.6rem', borderRadius: '99px', fontWeight: 600 }}>
            {allFiles.length} doc{allFiles.length !== 1 ? 's' : ''} uploaded
          </span>
          {/* Deal Done button — only if not yet completed */}
          {status !== 'Completed' && (
            <button onClick={() => setShowDeal(true)} style={{ marginTop: '0.15rem', padding: '0.3rem 0.75rem', borderRadius: '99px', border: 'none', background: 'linear-gradient(135deg,#10b981,#059669)', color: 'white', fontWeight: 700, fontSize: '0.72rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
              <BadgeCheck size={12} /> Deal Done
            </button>
          )}
          {/* Show closed amount if completed */}
          {status === 'Completed' && onb.dealAmount && (
            <span style={{ fontSize: '0.72rem', background: '#d1fae5', color: '#065f46', padding: '0.2rem 0.6rem', borderRadius: '99px', fontWeight: 700 }}>
              ₹{Number(onb.dealAmount).toLocaleString('en-IN')}
            </span>
          )}
          {/* Download PDF button */}
          <button onClick={printClientPDF} style={{ marginTop: '0.15rem', padding: '0.3rem 0.75rem', borderRadius: '99px', border: '1.5px solid #e5e7eb', background: 'white', color: '#374151', fontWeight: 700, fontSize: '0.72rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
            <Download size={11} /> PDF
          </button>
        </div>
        {/* Deal Modal */}
        {showDeal && <DealModal onb={onb} onClose={() => setShowDeal(false)} onDone={onRefresh} />}
        {/* Co-App Modal */}
        {showCoAppModal && <AddCoAppModal onb={onb} onClose={() => setShowCoAppModal(false)} onRefresh={onRefresh} />}
      </div>

      {/* Expand toggle */}
      <button
        onClick={() => setExpanded(v => !v)}
        style={{ width: '100%', padding: '0.45rem', border: 'none', borderTop: '1px solid #f1f5f9', background: '#fafafa', cursor: 'pointer', fontSize: '0.72rem', fontWeight: 700, color: '#6b7280', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.3rem' }}
      >
        {expanded ? '▲ Hide Details' : '▼ View Documents & Access'}
      </button>

      {/* Expanded: documents + access control */}
      {expanded && (
        <div style={{ padding: '1rem 1.25rem', borderTop: '1px solid #f1f5f9' }}>

          {/* Documents */}
          {canAccess ? (
            <div style={{ marginBottom: '1rem' }}>
              {/* ── Applicant Documents ── */}
              <div style={{ fontSize: '0.68rem', fontWeight: 800, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '0.625rem' }}>
                Applicant Documents
                {canAccess && <span style={{ marginLeft: '0.5rem', fontSize: '0.6rem', background: '#fee2e2', color: '#dc2626', padding: '0.1rem 0.4rem', borderRadius: '99px', fontWeight: 700 }}>Can Edit / Delete</span>}
              </div>
              {Object.entries(onb.documents || {}).map(([section, slots]) => {
                const uploaded = (slots || []).filter(s => s.uploaded);
                const slotsToRender = canAccess ? (slots || []) : uploaded;
                if (!slotsToRender.length) return null;
                return (
                  <div key={section} style={{ marginBottom: '0.625rem' }}>
                    <div style={{ fontSize: '0.68rem', color: '#9ca3af', fontWeight: 700, marginBottom: '0.3rem', textTransform: 'uppercase' }}>{section}</div>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem' }}>
                      {slotsToRender.map((f, i) => (
                        <AdminDocRow
                          key={i}
                          file={f}
                          slotIndex={i}
                          onbId={onb.id}
                          docKey="documents"
                          section={section}
                          canEdit={canAccess}
                          onRefresh={onRefresh}
                        />
                      ))}
                      {canAccess && (
                        <button onClick={() => { addDocumentSlot(onb.id, 'documents', section); onRefresh(); }} title="Add another file slot"
                          style={{ background: 'transparent', border: '1px dashed #cbd5e1', borderRadius: '8px', cursor: 'pointer', color: '#64748b', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '0 0.5rem', minWidth: '40px' }}>
                          <Plus size={14} />
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}

              {/* ── Co-Applicant Documents ── */}
              {onb.coApplicant?.name && onb.coDocuments ? (
                (canAccess || Object.values(onb.coDocuments).some(s => s.some(f => f.uploaded))) && (
                  <>
                    <div style={{ fontSize: '0.68rem', fontWeight: 800, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.06em', marginTop: '1.5rem', marginBottom: '0.625rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                      <Users size={11} /> Co-Applicant Documents
                      {canAccess && <span style={{ fontSize: '0.6rem', background: '#fee2e2', color: '#dc2626', padding: '0.1rem 0.4rem', borderRadius: '99px', fontWeight: 700 }}>Can Edit / Delete</span>}
                    </div>
                    {Object.entries(onb.coDocuments || {}).map(([section, slots]) => {
                      const uploaded = (slots || []).filter(s => s.uploaded);
                      const slotsToRender = canAccess ? (slots || []) : uploaded;
                      if (!slotsToRender.length) return null;
                      return (
                        <div key={`co-${section}`} style={{ marginBottom: '0.625rem' }}>
                          <div style={{ fontSize: '0.68rem', color: '#9ca3af', fontWeight: 700, marginBottom: '0.3rem', textTransform: 'uppercase' }}>{section}</div>
                          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem' }}>
                            {slotsToRender.map((f, i) => (
                              <AdminDocRow
                                key={i}
                                file={f}
                                slotIndex={i}
                                onbId={onb.id}
                                docKey="coDocuments"
                                section={section}
                                canEdit={canAccess}
                                onRefresh={onRefresh}
                              />
                            ))}
                            {canAccess && (
                              <button onClick={() => { addDocumentSlot(onb.id, 'coDocuments', section); onRefresh(); }} title="Add another file slot"
                                style={{ background: 'transparent', border: '1px dashed #cbd5e1', borderRadius: '8px', cursor: 'pointer', color: '#64748b', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '0 0.5rem', minWidth: '40px' }}>
                                <Plus size={14} />
                              </button>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </>
                )
              ) : canAccess && (
                <div style={{ marginTop: '1rem', borderTop: '1px dashed #e2e8f0', paddingTop: '1rem' }}>
                  <button onClick={() => setShowCoAppModal(true)} style={{ background: '#f8fafc', color: '#475569', border: '1px solid #cbd5e1', padding: '0.4rem 0.8rem', borderRadius: '8px', fontSize: '0.75rem', fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.4rem', transition: 'all 0.2s' }}>
                    <Users size={13} /> + Add Optional Co-Applicant
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div style={{ textAlign: 'center', padding: '1rem', color: '#9ca3af', fontSize: '0.82rem', marginBottom: '1rem' }}>
              <Shield size={24} style={{ opacity: 0.3, marginBottom: '0.4rem' }} /><br />
              Access not granted by admin.
            </div>
          )}

          {/* Access control — admin only */}
          {isOwner && (
            <div style={{ borderTop: '1px solid #f1f5f9', paddingTop: '0.875rem' }}>
              <div style={{ fontSize: '0.68rem', fontWeight: 800, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '0.5rem' }}>Branch / Manager Access</div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem' }}>
                {managers.map(mgr => {
                  const granted = (onb.grantedTo || []).includes(mgr.id);
                  return (
                    <button key={mgr.id}
                      onClick={() => {
                        if (granted) revokeOnboardingAccess(onb.id, mgr.id);
                        else grantOnboardingAccess(onb.id, mgr.id);
                        onRefresh();
                      }}
                      style={{
                        padding: '0.3rem 0.8rem', borderRadius: '99px', cursor: 'pointer',
                        fontSize: '0.76rem', fontWeight: 700, border: '1.5px solid',
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
      )}
    </div>
  );
}

// ─── Main Page ─────────────────────────────────────────────────
export default function OnboardedPage({ user }) {
  const [onboardings, setOnboardings] = useState([]);
  const [search, setSearch] = useState('');

  const isOwner = user?.role === 'owner';
  const userId  = user?.id;

  const load = () => setOnboardings(getAllOnboardings());

  useEffect(() => {
    load();
    // Birthday check — notify for any client with birthday today
    const all = getAllOnboardings();
    all.forEach(onb => {
      if (isBirthdayToday(onb.applicant?.dob)) {
        // Show a short browser notification (or just highlight in UI via isBirthdayToday)
        console.info(`🎂 Birthday today: ${onb.applicant?.name}`);
      }
    });
  }, []);

  const visible = (isOwner ? onboardings : onboardings.filter(o => (o.grantedTo || []).includes(userId)))
    .filter(o => {
      const q = search.toLowerCase();
      return !q || (o.applicant?.name || '').toLowerCase().includes(q) || (o.applicant?.phone || '').includes(q) || (o.loanType || '').toLowerCase().includes(q);
    });

  const todayBirthdays = visible.filter(o => isBirthdayToday(o.applicant?.dob));

  return (
    <div style={{ padding: '1.5rem', maxWidth: '900px', margin: '0 auto' }}>

      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.75rem', marginBottom: '1.25rem' }}>
        <div>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#1f2937', margin: 0 }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <ClipboardList size={22} color="#10b981" /> Onboarded Clients
            </span>
          </h2>
          <p style={{ color: '#6b7280', fontSize: '0.82rem', margin: '0.25rem 0 0' }}>
            {visible.length} client{visible.length !== 1 ? 's' : ''} — status updates trigger WhatsApp
          </p>
        </div>
        <input
          type="text" placeholder="Search by name, phone, loan..." value={search}
          onChange={e => setSearch(e.target.value)}
          style={{ padding: '0.55rem 1rem', borderRadius: '99px', border: '1.5px solid #e5e7eb', fontSize: '0.82rem', width: '220px', outline: 'none' }}
        />
      </div>

      {/* Birthday banner */}
      {todayBirthdays.length > 0 && (
        <div style={{ background: 'linear-gradient(135deg, #fef3c7, #fde68a)', borderRadius: '12px', padding: '0.875rem 1.25rem', marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.75rem', boxShadow: '0 2px 10px rgba(251,191,36,0.2)' }}>
          <Gift size={22} color="#d97706" />
          <div>
            <div style={{ fontWeight: 800, fontSize: '0.9rem', color: '#92400e' }}>🎂 Birthday Today!</div>
            <div style={{ fontSize: '0.8rem', color: '#b45309' }}>
              {todayBirthdays.map(o => o.applicant?.name).join(', ')} — click the birthday badge on their card to send wishes via WhatsApp.
            </div>
          </div>
        </div>
      )}

      {/* Stats row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))', gap: '0.75rem', marginBottom: '1.5rem' }}>
        {[
          { label: 'Total',       value: visible.length,                                    color: '#6366f1' },
          { label: 'In Progress', value: visible.filter(o => (o.status || 'In Progress') === 'In Progress').length, color: '#f59e0b' },
          { label: 'Completed',   value: visible.filter(o => o.status === 'Completed').length, color: '#10b981' },
        ].map(s => (
          <div key={s.label} style={{ background: 'white', borderRadius: '12px', padding: '0.875rem 1rem', boxShadow: '0 1px 6px rgba(0,0,0,0.05)', borderTop: `3px solid ${s.color}` }}>
            <div style={{ fontSize: '1.5rem', fontWeight: 800, color: s.color }}>{s.value}</div>
            <div style={{ fontSize: '0.72rem', fontWeight: 600, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* Client cards */}
      {visible.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '4rem 2rem', color: '#9ca3af' }}>
          <ClipboardList size={48} style={{ opacity: 0.2, marginBottom: '1rem' }} />
          <p style={{ fontWeight: 600 }}>No onboarded clients yet.</p>
          <p style={{ fontSize: '0.85rem' }}>Use "Fill Form" or "Share Link" from a lead to start.</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {visible.map(onb => (
            <ClientCard
              key={onb.id}
              onb={onb}
              isOwner={isOwner}
              userId={userId}
              onRefresh={load}
            />
          ))}
        </div>
      )}
    </div>
  );
}
