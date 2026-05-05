import { useState, useEffect } from 'react';
import {
  ClipboardList, CheckCircle2, Clock, Phone, Mail, Calendar,
  Download, Shield, ChevronDown, Gift
} from 'lucide-react';
import {
  getAllOnboardings, updateOnboardingStatus,
  grantOnboardingAccess, revokeOnboardingAccess, MOCK_USERS
} from '../store/db';

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

// ─── Client Card ───────────────────────────────────────────────
function ClientCard({ onb, isOwner, userId, onRefresh }) {
  const [expanded, setExpanded] = useState(false);
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

  const downloadFile = (f) => {
    if (!f.base64) return;
    const a = document.createElement('a');
    a.href = f.base64;
    a.download = f.displayName || 'document';
    a.click();
  };

  const canAccess = isOwner || (onb.grantedTo || []).includes(userId);

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
          {/* Avatar */}
          <div style={{ width: '42px', height: '42px', borderRadius: '50%', background: `${statusMeta.color}20`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, fontSize: '1.1rem', fontWeight: 800, color: statusMeta.color }}>
            {(onb.applicant?.name || '?')[0].toUpperCase()}
          </div>
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
        </div>
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
              <div style={{ fontSize: '0.68rem', fontWeight: 800, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '0.625rem' }}>Documents</div>
              {Object.entries(onb.documents || {}).map(([section, slots]) => {
                const uploaded = (slots || []).filter(s => s.uploaded);
                if (!uploaded.length) return null;
                return (
                  <div key={section} style={{ marginBottom: '0.625rem' }}>
                    <div style={{ fontSize: '0.68rem', color: '#9ca3af', fontWeight: 700, marginBottom: '0.3rem', textTransform: 'uppercase' }}>{section}</div>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem' }}>
                      {uploaded.map((f, i) => (
                        <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', background: f.base64 ? '#f0fdf4' : '#f8fafc', border: `1px solid ${f.base64 ? '#bbf7d0' : '#e5e7eb'}`, borderRadius: '8px', padding: '0.35rem 0.7rem', fontSize: '0.75rem' }}>
                          <CheckCircle2 size={12} color={f.base64 ? '#10b981' : '#9ca3af'} />
                          <span style={{ maxWidth: '160px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', fontWeight: 500 }}>{f.displayName || 'File'}</span>
                          {f.base64 && (
                            <button onClick={() => downloadFile(f)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#2563eb', fontSize: '0.7rem', fontWeight: 700, padding: '0 0.1rem', display: 'flex', alignItems: 'center', gap: '0.15rem' }}>
                              <Download size={11} /> DL
                            </button>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
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
