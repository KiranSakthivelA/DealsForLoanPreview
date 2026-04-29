import { useState } from 'react';

export default function Calculator() {
  const [amount, setAmount] = useState(500000);
  const [interest, setInterest] = useState(10.5);
  const [tenure, setTenure] = useState(5);

  const calculateEMI = () => {
    const p = parseFloat(amount);
    const r = parseFloat(interest) / 12 / 100;
    const n = parseFloat(tenure) * 12;
    
    if (!p || !r || !n) return { emi: 0, totalInterest: 0, totalPayment: 0 };
    
    const emi = (p * r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1);
    const totalPayment = emi * n;
    const totalInterest = totalPayment - p;
    
    return {
      emi: Math.round(emi),
      totalInterest: Math.round(totalInterest),
      totalPayment: Math.round(totalPayment)
    };
  };

  const results = calculateEMI();

  return (
    <div style={{ backgroundColor: 'var(--background-color)', minHeight: '100vh', padding: '4rem 1rem' }}>
      <div className="container" style={{ maxWidth: '1000px' }}>
        <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
          <h1 style={{ fontSize: '2.5rem', color: 'var(--accent-color)', fontWeight: 800, marginBottom: '1rem' }}>EMI Loan Calculator</h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '1.1rem' }}>Plan your finances easily. Calculate your monthly EMI, total interest, and total payment.</p>
        </div>

        <div className="split-layout" style={{ backgroundColor: 'white', borderRadius: '24px', boxShadow: '0 20px 40px rgba(0,0,0,0.05)', overflow: 'hidden' }}>
          
          {/* Controls */}
          <div style={{ flex: '1.5 1 400px', padding: '3rem' }}>
            
            <div style={{ marginBottom: '2.5rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
                <label style={{ fontWeight: 600, color: 'var(--text-primary)' }}>Loan Amount (₹)</label>
                <div style={{ fontWeight: 700, color: 'var(--accent-color)', fontSize: '1.2rem', backgroundColor: 'var(--primary-lighter)', padding: '0.25rem 1rem', borderRadius: '8px' }}>
                  ₹ {new Intl.NumberFormat('en-IN').format(amount)}
                </div>
              </div>
              <input 
                type="range" 
                min="50000" 
                max="10000000" 
                step="50000"
                value={amount} 
                onChange={(e) => setAmount(e.target.value)}
                style={{ width: '100%', cursor: 'pointer', accentColor: 'var(--primary-color)' }}
              />
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.5rem' }}>
                <span>₹50K</span>
                <span>₹1Cr+</span>
              </div>
            </div>

            <div style={{ marginBottom: '2.5rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
                <label style={{ fontWeight: 600, color: 'var(--text-primary)' }}>Interest Rate (%)</label>
                <div style={{ fontWeight: 700, color: 'var(--accent-color)', fontSize: '1.2rem', backgroundColor: 'var(--primary-lighter)', padding: '0.25rem 1rem', borderRadius: '8px' }}>
                  {interest}%
                </div>
              </div>
              <input 
                type="range" 
                min="5" 
                max="25" 
                step="0.1"
                value={interest} 
                onChange={(e) => setInterest(e.target.value)}
                style={{ width: '100%', cursor: 'pointer', accentColor: 'var(--primary-color)' }}
              />
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.5rem' }}>
                <span>5%</span>
                <span>25%</span>
              </div>
            </div>

            <div style={{ marginBottom: '1rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
                <label style={{ fontWeight: 600, color: 'var(--text-primary)' }}>Loan Tenure (Years)</label>
                <div style={{ fontWeight: 700, color: 'var(--accent-color)', fontSize: '1.2rem', backgroundColor: 'var(--primary-lighter)', padding: '0.25rem 1rem', borderRadius: '8px' }}>
                  {tenure} Years
                </div>
              </div>
              <input 
                type="range" 
                min="1" 
                max="30" 
                step="1"
                value={tenure} 
                onChange={(e) => setTenure(e.target.value)}
                style={{ width: '100%', cursor: 'pointer', accentColor: 'var(--primary-color)' }}
              />
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.5rem' }}>
                <span>1 Yr</span>
                <span>30 Yrs</span>
              </div>
            </div>

          </div>

          {/* Results Sidebar */}
          <div style={{ flex: '1 1 300px', backgroundColor: 'var(--accent-color)', color: 'white', padding: '3rem', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
            <h3 style={{ fontSize: '1.2rem', opacity: 0.9, marginBottom: '2rem', textAlign: 'center' }}>Your EMI Summary</h3>
            
            <div style={{ textAlign: 'center', marginBottom: '2.5rem', backgroundColor: 'rgba(255,255,255,0.1)', padding: '2rem 1rem', borderRadius: '16px' }}>
              <div style={{ fontSize: '0.9rem', textTransform: 'uppercase', letterSpacing: '1px', opacity: 0.8, marginBottom: '0.5rem' }}>Monthly EMI</div>
              <div style={{ fontSize: '2.5rem', fontWeight: 800, color: 'var(--primary-light)' }}>
                ₹ {new Intl.NumberFormat('en-IN').format(results.emi)}
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '1rem' }}>
                <span style={{ opacity: 0.8 }}>Principal Amount</span>
                <span style={{ fontWeight: 700 }}>₹ {new Intl.NumberFormat('en-IN').format(amount)}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '1rem' }}>
                <span style={{ opacity: 0.8 }}>Total Interest</span>
                <span style={{ fontWeight: 700 }}>₹ {new Intl.NumberFormat('en-IN').format(results.totalInterest)}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', paddingTop: '0.5rem' }}>
                <span style={{ fontWeight: 600 }}>Total Payment</span>
                <span style={{ fontWeight: 800, fontSize: '1.1rem', color: 'var(--primary-light)' }}>₹ {new Intl.NumberFormat('en-IN').format(results.totalPayment)}</span>
              </div>
            </div>

            <button className="btn btn-primary" style={{ width: '100%', marginTop: '3rem', padding: '1rem', borderRadius: '99px', fontSize: '1rem', fontWeight: 700 }} onClick={() => window.location.href = '/apply'}>
              Apply For This Loan
            </button>
          </div>

        </div>
      </div>
    </div>
  );
}
