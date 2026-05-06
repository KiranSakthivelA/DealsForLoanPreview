import React, { useState, useEffect } from 'react';
import { getAllOnboardings } from '../store/db';
import { BadgeCheck, Calendar, IndianRupee, FileText } from 'lucide-react';

export default function ClientHistory({ user }) {
  const [closedDeals, setClosedDeals] = useState([]);

  useEffect(() => {
    const all = getAllOnboardings();
    // Filter only completed deals
    const completed = all.filter(o => o.status === 'Completed');
    setClosedDeals(completed);
  }, []);

  if (user?.role !== 'owner') {
    return <div style={{ padding: '2rem', textAlign: 'center', color: '#6b7280' }}>Access Denied. Owner only.</div>;
  }

  return (
    <div style={{ padding: '2rem', maxWidth: '1200px', margin: '0 auto' }}>
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: '#111827', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <FileText color="#f59e0b" /> Client History
        </h1>
        <p style={{ color: '#6b7280', marginTop: '0.25rem' }}>Record of all successfully closed deals and their upcoming follow-ups.</p>
      </div>

      {closedDeals.length === 0 ? (
        <div style={{ padding: '3rem', textAlign: 'center', background: 'white', borderRadius: '16px', border: '1px dashed #cbd5e1' }}>
          <BadgeCheck size={48} color="#d1d5db" style={{ marginBottom: '1rem' }} />
          <h3 style={{ color: '#475569', fontSize: '1.1rem', marginBottom: '0.5rem' }}>No closed deals yet</h3>
          <p style={{ color: '#94a3b8', fontSize: '0.9rem' }}>When deals are marked as "Deal Done", they will appear here.</p>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '1.5rem' }}>
          {closedDeals.map(deal => {
            const clientName = deal.applicant?.name || 'Unknown Client';
            const phone = deal.applicant?.phone || '';
            const loanType = deal.loanType || 'N/A';
            const closeDate = deal.statusUpdatedAt ? new Date(deal.statusUpdatedAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : 'N/A';
            const followUp = deal.dealFollowUpDate ? new Date(deal.dealFollowUpDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' }) : 'Not scheduled';

            return (
              <div key={deal.id} style={{
                background: 'white', borderRadius: '16px', padding: '1.5rem',
                border: '1px solid #e2e8f0', boxShadow: '0 4px 12px rgba(0,0,0,0.03)',
                borderTop: '4px solid #10b981', display: 'flex', flexDirection: 'column'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
                  <div>
                    <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#111827', margin: 0 }}>{clientName}</h3>
                    <div style={{ fontSize: '0.8rem', color: '#64748b', marginTop: '0.25rem' }}>{phone}</div>
                  </div>
                  <span style={{ fontSize: '0.7rem', background: '#ecfdf5', color: '#059669', padding: '0.2rem 0.6rem', borderRadius: '99px', fontWeight: 700, whiteSpace: 'nowrap' }}>
                    {loanType}
                  </span>
                </div>

                <div style={{ background: '#f8fafc', borderRadius: '12px', padding: '1rem', flex: 1, display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: '#64748b', fontSize: '0.8rem', fontWeight: 600 }}>
                      <BadgeCheck size={14} /> Closed On
                    </div>
                    <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#334155' }}>{closeDate}</div>
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: '#64748b', fontSize: '0.8rem', fontWeight: 600 }}>
                      <IndianRupee size={14} /> Deal Amount
                    </div>
                    <div style={{ fontSize: '0.95rem', fontWeight: 800, color: '#10b981' }}>
                      ₹{deal.dealAmount ? Number(deal.dealAmount).toLocaleString('en-IN') : '0'}
                    </div>
                  </div>
                  
                  <div style={{ borderTop: '1px dashed #cbd5e1', margin: '0.25rem 0' }} />

                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: '#64748b', fontSize: '0.8rem', fontWeight: 600 }}>
                      <Calendar size={14} /> 6-Month Follow-Up
                    </div>
                    <div style={{ fontSize: '0.85rem', fontWeight: 700, color: deal.dealFollowUpDate ? '#f59e0b' : '#94a3b8' }}>
                      {followUp}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
