import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Star, ShieldCheck, Shield, CheckCircle2, ChevronRight, Home } from 'lucide-react';
import { LOAN_TYPES, saveEstimate } from '../store/db';

function CountUp({ end, duration = 2000, prefix = "", suffix = "" }) {
  const [count, setCount] = useState(0);
  const countRef = useRef(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) setIsVisible(true);
      },
      { threshold: 0.1 }
    );
    if (countRef.current) observer.observe(countRef.current);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!isVisible) return;
    
    let startTimestamp = null;
    const step = (timestamp) => {
      if (!startTimestamp) startTimestamp = timestamp;
      const progress = Math.min((timestamp - startTimestamp) / duration, 1);
      setCount(Math.floor(progress * end));
      if (progress < 1) {
        window.requestAnimationFrame(step);
      }
    };
    window.requestAnimationFrame(step);
  }, [isVisible, end, duration]);

  return <span ref={countRef}>{prefix}{count.toLocaleString()}{suffix}</span>;
}

const products = [
  { title: "Home Loan", desc: "Your Dream Home Awaits - Explore Our Range Of Home Loan Products.", icon: "🏡" },
  { title: "Loan against Property", desc: "Unlock your property's value with tailored loan solutions..", icon: "🏦" },
  { title: "Personal Loan", desc: "Achieve your dreams with our versatile personal loan options.", icon: "💸" },
  { title: "Business Loan", desc: "Boost your business growth with our flexible financing options.", icon: "💼" },
  { title: "Education Loan", desc: "Invest in your child's future with our specialized education loans.", icon: "🎓" },
  { title: "Car Loan", desc: "Drive your dream car with our quick and flexible car loans.", icon: "🚘" },
  { title: "Gold Loan", desc: "Meet your financial needs with gold loans from trusted banks.", icon: "🪙" },
  { title: "Credit Cards", desc: "Upgrade your lifestyle with feature-packed, rewarding credit cards.", icon: "💳" }
];

const insurance = [
  { title: "Life Insurance", desc: "Protect Your Loved One's Future With Our Reliable Life Insurance Plans.", icon: "👨‍👩‍👧‍👦", linkText: "Starting from ₹ 450/month*" },
  { title: "Health Insurance", desc: "Ensuring Your Health Is In Good Hands - Explore Our Top-notch Insurance Solutions.", icon: "🩺", linkText: "Starting from ₹ 450/month*" },
  { title: "General Insurance", desc: "Insurance Made Easy - Your Protection, Our Expertise.", icon: "☂️", linkText: "Starting from ₹ 450/month*" }
];

export default function LandingPage() {
  return (
    <div className="landing-page" style={{ position: 'relative', overflowX: 'hidden', backgroundColor: '#f8fafc' }}>
      
      {/* Background Grid Pattern */}
      <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundImage: 'radial-gradient(circle at 1px 1px, #e5e7eb 1px, transparent 0)', backgroundSize: '32px 32px', opacity: 0.6, zIndex: 0, pointerEvents: 'none', animation: 'move-background 30s linear infinite' }}></div>
      <style>{`
        @keyframes move-background {
          from { background-position: 0 0; }
          to { background-position: 32px 32px; }
        }
      `}</style>

      {/* Premium Background Gradients */}
      <div style={{ position: 'absolute', top: '-10%', right: '-5%', width: '800px', height: '800px', background: 'radial-gradient(circle, rgba(243, 158, 30, 0.15) 0%, transparent 70%)', filter: 'blur(100px)', zIndex: 0, pointerEvents: 'none' }}></div>
      <div style={{ position: 'absolute', top: '20%', left: '-10%', width: '700px', height: '700px', background: 'radial-gradient(circle, rgba(45, 46, 137, 0.1) 0%, transparent 70%)', filter: 'blur(100px)', zIndex: 0, pointerEvents: 'none' }}></div>
      <div style={{ position: 'absolute', bottom: '10%', right: '10%', width: '600px', height: '600px', background: 'radial-gradient(circle, rgba(243, 158, 30, 0.08) 0%, transparent 70%)', filter: 'blur(80px)', zIndex: 0, pointerEvents: 'none' }}></div>
      <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', width: '1000px', height: '1000px', background: 'radial-gradient(circle, rgba(45, 46, 137, 0.03) 0%, transparent 80%)', filter: 'blur(120px)', zIndex: 0, pointerEvents: 'none' }}></div>

      {/* Abstract Floating Shapes */}
      <div className="mobile-hide" style={{ position: 'absolute', top: '15%', left: '5%', width: '150px', height: '150px', background: 'rgba(243, 158, 30, 0.05)', borderRadius: '30% 70% 70% 30% / 30% 30% 70% 70%', filter: 'blur(40px)', animation: 'float 8s infinite ease-in-out', zIndex: 0 }}></div>
      <div className="mobile-hide" style={{ position: 'absolute', top: '40%', right: '10%', width: '200px', height: '200px', background: 'rgba(45, 46, 137, 0.05)', borderRadius: '50%', filter: 'blur(50px)', animation: 'float 12s infinite ease-in-out reverse', zIndex: 0 }}></div>
      <div className="mobile-hide" style={{ position: 'absolute', bottom: '20%', left: '15%', width: '180px', height: '180px', background: 'rgba(243, 158, 30, 0.03)', borderRadius: '40% 60% 60% 40% / 40% 40% 60% 60%', filter: 'blur(45px)', animation: 'float 10s infinite ease-in-out 2s', zIndex: 0 }}></div>

      {/* Abstract Geometric Lines (Like everydaybankingsolutions) */}
      <svg style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', opacity: 0.04, pointerEvents: 'none', zIndex: 0 }}>
        <pattern id="geometric-pattern" x="0" y="0" width="100" height="100" patternUnits="userSpaceOnUse">
          <path d="M0 100 L100 0 M0 0 L100 100" stroke="var(--accent-color)" strokeWidth="1" fill="none" />
          <circle cx="50" cy="50" r="2" fill="var(--accent-color)" />
        </pattern>
        <rect width="100%" height="100%" fill="url(#geometric-pattern)" />
      </svg>

      {/* Hero Section & Quick Estimate Form - Light Theme */}
      <section className="hero-section" style={{ position: 'relative', zIndex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '90vh', padding: '6rem 1rem' }}>
        
        <div className="container" style={{ position: 'relative', maxWidth: '1200px', margin: '0 auto', display: 'flex', alignItems: 'center', gap: '5rem', flexWrap: 'wrap', zIndex: 1 }}>
          
          {/* Left Text Block */}
          <div style={{ flex: '1 1 500px', textAlign: 'left' }}>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', backgroundColor: 'var(--primary-lighter)', color: 'var(--primary-color)', padding: '0.5rem 1.25rem', borderRadius: '99px', fontSize: '0.85rem', fontWeight: 700, marginBottom: '2rem', border: '1px solid rgba(255,255,255,0.5)', boxShadow: 'var(--shadow-sm)' }}>
              <ShieldCheck size={16} color="var(--primary-color)" /> TRUSTED FINANCIAL PARTNER
            </div>
            
            <h1 className="hero-title" style={{ color: 'var(--accent-color)', marginBottom: '1.5rem', lineHeight: '1.1', letterSpacing: '-0.04em', fontSize: '4.5rem', fontWeight: 800 }}>
              Unlock Your <br className="mobile-hide-br" />
              <span className="gradient-text">Financial Power.</span>
            </h1>
            
            <p style={{ fontSize: '1.25rem', color: 'var(--text-secondary)', marginBottom: '3rem', lineHeight: '1.6' }}>
              Experience seamless lending, secure credit cards, and comprehensive insurance plans tailored specifically for your lifestyle and everyday needs.
            </p>
            
            <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', flexWrap: 'wrap', marginBottom: '3rem' }}>
              <Link to="/apply" className="btn" style={{ background: 'var(--accent-color)', color: 'white', padding: '1.25rem 3rem', fontSize: '1.1rem', borderRadius: '12px', display: 'inline-flex', alignItems: 'center', gap: '0.75rem', boxShadow: '0 10px 25px rgba(45, 46, 137, 0.25)', transition: 'all 0.3s', fontWeight: 700, border: 'none' }} onMouseOver={e => {e.currentTarget.style.transform = 'translateY(-4px)'; e.currentTarget.style.boxShadow = '0 15px 35px rgba(45, 46, 137, 0.4)';}} onMouseOut={e => {e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 10px 25px rgba(45, 46, 137, 0.25)';}}>
                Start Application <ArrowRight size={20} />
              </Link>
              <Link to="#services" className="btn btn-secondary" style={{ padding: '1.25rem 3rem', fontSize: '1.1rem', borderRadius: '12px', display: 'inline-flex', alignItems: 'center', fontWeight: 600, background: 'white', color: 'var(--accent-color)' }}>
                Explore Services
              </Link>
            </div>

            {/* Trust Indicators */}
            <div style={{ display: 'flex', gap: '2rem', alignItems: 'center', flexWrap: 'wrap', borderTop: '1px solid rgba(0,0,0,0.05)', paddingTop: '2rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-secondary)', fontSize: '0.95rem', fontWeight: 600 }}>
                <CheckCircle2 size={18} color="#22c55e" /> Home Loans
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-secondary)', fontSize: '0.95rem', fontWeight: 600 }}>
                <CheckCircle2 size={18} color="#22c55e" /> Insurance
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-secondary)', fontSize: '0.95rem', fontWeight: 600 }}>
                <CheckCircle2 size={18} color="#22c55e" /> Premium Cards
              </div>
            </div>
          </div>

          {/* Right Form Block - Light Glassmorphism */}
          <div style={{ flex: '1 1 400px', position: 'relative' }}>
            <div style={{ 
              background: 'rgba(255, 255, 255, 0.7)', 
              backdropFilter: 'blur(20px)',
              WebkitBackdropFilter: 'blur(20px)',
              border: '1px solid rgba(255, 255, 255, 0.9)',
              borderRadius: '24px', 
              padding: '2.5rem 2rem',
              boxShadow: '0 20px 40px rgba(0, 0, 0, 0.08)',
              position: 'relative',
              zIndex: 10
            }}>
              <h3 style={{ fontSize: '1.3rem', color: 'var(--accent-color)', marginBottom: '1.5rem', fontWeight: 800 }}>Quick Eligibility Estimate</h3>
              <form onSubmit={(e) => {
                e.preventDefault();
                const name = e.target.name.value;
                const phone = e.target.phone.value;
                const service = e.target.service.value;
                const amount = e.target.amount.value;
                
                // 1. Save to Dashboard
                saveEstimate({ name, phone, service, amount });

                // 2. Open WhatsApp
                const text = `Hello Deals For Loan,\nI would like a quick estimate.\n\nName: ${name}\nPhone: ${phone}\nService: ${service}\nAmount: ₹${amount}`;
                const waUrl = `https://wa.me/919442173548?text=${encodeURIComponent(text)}`;
                window.open(waUrl, '_blank');
                
                e.target.reset();
              }} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                  <div style={{ textAlign: 'left' }}>
                    <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: '0.5rem', textTransform: 'uppercase' }}>Your Name *</label>
                    <input type="text" name="name" required placeholder="e.g. Rahul Kumar" style={{ width: '100%', padding: '1rem', borderRadius: '12px', border: '1px solid var(--border-color)', backgroundColor: 'white', fontSize: '1rem', fontWeight: 500, outline: 'none', transition: 'border 0.3s' }} onFocus={e => e.target.style.borderColor = 'var(--primary-color)'} onBlur={e => e.target.style.borderColor = 'var(--border-color)'} />
                  </div>
                  <div style={{ textAlign: 'left' }}>
                    <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: '0.5rem', textTransform: 'uppercase' }}>Phone Number *</label>
                    <input type="tel" name="phone" required placeholder="e.g. 9876543210" style={{ width: '100%', padding: '1rem', borderRadius: '12px', border: '1px solid var(--border-color)', backgroundColor: 'white', fontSize: '1rem', fontWeight: 500, outline: 'none', transition: 'border 0.3s' }} onFocus={e => e.target.style.borderColor = 'var(--primary-color)'} onBlur={e => e.target.style.borderColor = 'var(--border-color)'} />
                  </div>
                  <div style={{ textAlign: 'left' }}>
                    <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: '0.5rem', textTransform: 'uppercase' }}>I am looking for *</label>
                    <select name="service" required style={{ width: '100%', padding: '1rem', borderRadius: '12px', border: '1px solid var(--border-color)', backgroundColor: 'white', fontSize: '1rem', fontWeight: 500, outline: 'none', transition: 'border 0.3s' }} onFocus={e => e.target.style.borderColor = 'var(--primary-color)'} onBlur={e => e.target.style.borderColor = 'var(--border-color)'}>
                      <option value="" disabled selected>Select Product...</option>
                      {LOAN_TYPES.map(type => (
                        <option key={type} value={type}>{type}</option>
                      ))}
                      <option value="Credit Card">Credit Card</option>
                      <option value="Life Insurance">Life Insurance</option>
                    </select>
                  </div>
                  <div style={{ textAlign: 'left' }}>
                    <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: '0.5rem', textTransform: 'uppercase' }}>Required Amount (₹) *</label>
                    <input type="number" name="amount" required placeholder="e.g. 500000" style={{ width: '100%', padding: '1rem', borderRadius: '12px', border: '1px solid var(--border-color)', backgroundColor: 'white', fontSize: '1rem', fontWeight: 500, outline: 'none', transition: 'border 0.3s' }} onFocus={e => e.target.style.borderColor = 'var(--primary-color)'} onBlur={e => e.target.style.borderColor = 'var(--border-color)'} />
                  </div>
                </div>

                <button type="submit" style={{ marginTop: '0.5rem', width: '100%', padding: '1.25rem 2rem', borderRadius: '12px', border: 'none', background: 'linear-gradient(135deg, var(--primary-color) 0%, #ff8c00 100%)', color: 'white', fontSize: '1.1rem', fontWeight: 800, cursor: 'pointer', transition: 'all 0.3s', boxShadow: '0 8px 15px rgba(243, 158, 30, 0.3)' }} onMouseOver={e => e.currentTarget.style.transform = 'translateY(-2px)'} onMouseOut={e => e.currentTarget.style.transform = 'translateY(0)'}>
                  Get Free Estimate
                </button>
              </form>
            </div>
          </div>
          
        </div>
      </section>

      {/* Stats Section */}
      <section style={{ 
        padding: '3rem 0', 
        position: 'relative', 
        zIndex: 2, 
        borderTop: '1px solid rgba(0,0,0,0.05)',
        borderBottom: '1px solid rgba(0,0,0,0.05)',
        backgroundColor: 'rgba(255,255,255,0.5)',
        backdropFilter: 'blur(10px)'
      }}>
        <div className="container stats-flex" style={{ display: 'flex', justifyContent: 'space-around', alignItems: 'center' }}>
          <div style={{ textAlign: 'center', flex: 1 }}>
            <div style={{ fontSize: '2.5rem', fontWeight: 800, marginBottom: '0.25rem', color: 'var(--accent-color)' }}>
              <CountUp end={50} suffix="+" />
            </div>
            <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', fontWeight: 600 }}>Cities Covered</div>
          </div>
          <div className="mobile-hide" style={{ width: '1px', height: '40px', backgroundColor: 'var(--border-color)', margin: '0 2rem' }}></div>
          <div style={{ textAlign: 'center', flex: 1 }}>
            <div style={{ fontSize: '2.5rem', fontWeight: 800, marginBottom: '0.25rem', color: 'var(--accent-color)' }}>
              <CountUp end={100} suffix="+" />
            </div>
            <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', fontWeight: 600 }}>Partner Banks</div>
          </div>
          <div className="mobile-hide" style={{ width: '1px', height: '40px', backgroundColor: 'var(--border-color)', margin: '0 2rem' }}></div>
          <div style={{ textAlign: 'center', flex: 1 }}>
            <div style={{ fontSize: '2.5rem', fontWeight: 800, marginBottom: '0.25rem', color: 'var(--accent-color)' }}>
              <CountUp end={10} suffix="k+" />
            </div>
            <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', fontWeight: 600 }}>Happy Clients</div>
          </div>
          <div className="mobile-hide" style={{ width: '1px', height: '40px', backgroundColor: 'var(--border-color)', margin: '0 2rem' }}></div>
          <div style={{ textAlign: 'center', flex: 1 }}>
            <div style={{ fontSize: '2.5rem', fontWeight: 800, marginBottom: '0.25rem', color: 'var(--accent-color)' }}>
              <CountUp end={99} suffix="%" />
            </div>
            <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', fontWeight: 600 }}>Approval Rate</div>
          </div>
        </div>
      </section>

      {/* Tailored Solutions Section */}
      <section className="tailored-section" style={{ position: 'relative', zIndex: 1, backgroundColor: 'white' }}>
        <div style={{ maxWidth: '1400px', margin: '0 auto', textAlign: 'center' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', backgroundColor: 'rgba(45, 46, 137, 0.05)', color: 'var(--accent-color)', padding: '0.5rem 1rem', borderRadius: '99px', fontSize: '0.75rem', fontWeight: 700, marginBottom: '1.5rem', textTransform: 'uppercase', letterSpacing: '1px' }}>
            🔗 OUR FEATURES & SERVICES
          </div>
          
          <h2 style={{ fontSize: '3.5rem', color: 'var(--accent-color)', marginBottom: '1.5rem', fontWeight: 800, lineHeight: 1.2 }}>
            Financial Solutions <span style={{ position: 'relative', display: 'inline-block' }}>
              Tailored
              <svg width="160" height="20" viewBox="0 0 160 20" style={{ position: 'absolute', bottom: '-12px', left: '50%', transform: 'translateX(-50%)', zIndex: -1 }}>
                <path 
                  d="M10 10C40 13 120 13 150 10" 
                  stroke="var(--primary-color)" 
                  strokeWidth="8" 
                  fill="none" 
                  strokeLinecap="round" 
                  opacity="0.3" 
                />
                <path 
                  d="M13 12C45 15 115 15 147 12" 
                  stroke="var(--primary-color)" 
                  strokeWidth="5" 
                  fill="none" 
                  strokeLinecap="round" 
                />
              </svg>
            </span> <br/> For You
          </h2>
          
          <p style={{ fontSize: '1.1rem', color: 'var(--text-secondary)', maxWidth: '700px', margin: '0 auto 5rem', lineHeight: 1.6 }}>
            Discover a world of financial possibilities with our comprehensive range of services designed to meet your unique needs and aspirations.
          </p>

          <div className="tailored-grid">
            {/* Smart Loans Card */}
            <Link to="/apply" className="tailored-card" style={{ textDecoration: 'none', textAlign: 'left' }}>
              <div className="card-top">
                <div className="default-content">
                  <img src="/Asset/smart_loans.png" alt="Smart Loans" />
                </div>
                <div className="hover-content">
                  <h4 style={{ color: 'var(--accent-color)', marginBottom: '1.5rem', fontSize: '1.1rem', fontWeight: 800 }}>Our Loan Products</h4>
                  <ul style={{ listStyle: 'none', padding: 0, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                    {['Home Loan', 'Personal Loan', 'Business Loan', 'Education Loan', 'Car Loan', 'Gold Loan', 'Property Loan', 'Other Loans'].map(item => (
                      <li key={item} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.85rem', color: 'var(--text-primary)', fontWeight: 600 }}>
                        <CheckCircle2 size={14} color="var(--primary-color)" /> {item}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
              <div className="card-footer">
                <div className="footer-left">
                  <div className="icon-box"><Home size={18} /></div>
                  <h3>Smart Loans</h3>
                </div>
                <ChevronRight className="footer-arrow" size={20} />
              </div>
            </Link>

            {/* Secure Insurance Card */}
            <Link to="/apply" className="tailored-card" style={{ textDecoration: 'none', textAlign: 'left' }}>
              <div className="card-top">
                <div className="default-content">
                  <img src="/Asset/secure_insurance.png" alt="Secure Insurance" />
                </div>
                <div className="hover-content">
                  <h4 style={{ color: 'var(--accent-color)', marginBottom: '1.5rem', fontSize: '1.1rem', fontWeight: 800 }}>Insurance Protection</h4>
                  <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', lineHeight: 1.6, marginBottom: '1.5rem' }}>
                    Ensuring Your Health Is In Good Hands. Protect your family's future with our top-notch, reliable insurance solutions tailored for your peace of mind.
                  </p>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                    {['Life Insurance', 'Health Insurance', 'General Insurance'].map(item => (
                      <div key={item} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.85rem', color: 'var(--text-primary)', fontWeight: 600 }}>
                        <CheckCircle2 size={14} color="#22c55e" /> {item}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
              <div className="card-footer">
                <div className="footer-left">
                  <div className="icon-box" style={{ color: '#22c55e', backgroundColor: 'rgba(34, 197, 94, 0.1)' }}><Shield size={18} /></div>
                  <h3>Secure Insurance</h3>
                </div>
                <ChevronRight className="footer-arrow" size={20} />
              </div>
            </Link>

            {/* Credit Cards Card */}
            <Link to="/apply" className="tailored-card" style={{ textDecoration: 'none', textAlign: 'left' }}>
              <div className="card-top">
                <div className="default-content">
                  <img src="/Asset/credit_cards.png" alt="Credit Cards" />
                </div>
                <div className="hover-content">
                  <h4 style={{ color: 'var(--accent-color)', marginBottom: '1rem', fontSize: '1.1rem', fontWeight: 800 }}>Premium Cards</h4>
                  <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', lineHeight: 1.5, marginBottom: '1.5rem' }}>
                    Exclusive credit cards with unmatched rewards, travel benefits, and lifestyle privileges.
                  </p>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem', marginBottom: '1.5rem' }}>
                    {['Rewards Program', 'Travel Benefits', 'Zero Fees'].map(feat => (
                      <div key={feat} style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: 'var(--text-primary)', fontSize: '0.8rem', fontWeight: 600 }}>
                        <CheckCircle2 size={14} color="var(--primary-color)" /> {feat}
                      </div>
                    ))}
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 'auto' }}>
                    <span style={{ color: 'var(--primary-color)', fontWeight: 700, fontSize: '0.9rem' }}>Learn More →</span>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontWeight: 800, fontSize: '1rem', color: 'var(--accent-color)' }}>2%</div>
                      <div style={{ fontSize: '0.65rem', color: 'var(--text-secondary)', textTransform: 'uppercase' }}>Cashback</div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="card-footer">
                <div className="footer-left">
                  <div className="icon-box" style={{ color: 'var(--accent-color)', backgroundColor: 'rgba(45, 46, 137, 0.05)' }}><Shield size={18} /></div>
                  <h3>Credit Cards</h3>
                </div>
                <ChevronRight className="footer-arrow" size={20} />
              </div>
            </Link>
          </div>
        </div>
      </section>


      {/* Services Grid (We Facilitate) */}
      <section className="services-section" style={{ position: 'relative', zIndex: 1, backgroundColor: 'var(--background-color)' }}>
        <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
          <div style={{ marginBottom: '4rem', textAlign: 'center' }}>
            <h2 className="gradient-text" style={{ fontSize: '2.5rem', marginBottom: '1.25rem', fontWeight: 800 }}>We Facilitate</h2>
            <div style={{ width: '60px', height: '4px', background: 'var(--primary-color)', margin: '0 auto 1.5rem', borderRadius: '2px' }}></div>
            <p style={{ fontSize: '1.1rem', color: 'var(--text-secondary)', maxWidth: '600px', margin: '0 auto' }}>
              A wide range of financial products meticulously designed to suit your customers' diverse needs.
            </p>
          </div>

          <div className="facilitate-grid">
            {products.map((srv, idx) => (
              <div key={idx} className="modern-service-card">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '2rem' }}>
                  <div className="modern-icon-box">
                    <span style={{ fontSize: '1.75rem' }}>{srv.icon}</span>
                  </div>
                  <ChevronRight size={18} color="var(--text-muted)" className="card-arrow" />
                </div>
                <h3 style={{ fontSize: '1.25rem', color: 'var(--accent-color)', marginBottom: '1rem', fontWeight: 700 }}>{srv.title}</h3>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', marginBottom: '2rem', lineHeight: '1.6', flex: 1 }}>{srv.desc}</p>
                <Link to="/apply" className="modern-card-link">
                  Check Eligibility 
                  <ArrowRight size={16} />
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Insurance Grid */}
      <section className="insurance-section" style={{ position: 'relative', zIndex: 1, backgroundColor: 'var(--background-color)' }}>
        <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
          <div style={{ marginBottom: '4rem', textAlign: 'center' }}>
            <h2 className="gradient-text" style={{ fontSize: '2.5rem', marginBottom: '1.25rem', fontWeight: 800 }}>Insurance</h2>
            <div style={{ width: '60px', height: '4px', background: 'var(--primary-color)', margin: '0 auto 1.5rem', borderRadius: '2px' }}></div>
            <p style={{ fontSize: '1.1rem', color: 'var(--text-secondary)', maxWidth: '600px', margin: '0 auto' }}>
              Comprehensive protection plans designed to safeguard your life, health, and assets.
            </p>
          </div>

          <div className="insurance-grid">
            {insurance.map((srv, idx) => (
              <div key={idx} className="modern-service-card">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '2rem' }}>
                  <div className="modern-icon-box">
                    <span style={{ fontSize: '1.75rem' }}>{srv.icon}</span>
                  </div>
                  <ChevronRight size={18} color="var(--text-muted)" className="card-arrow" />
                </div>
                <h3 style={{ fontSize: '1.25rem', color: 'var(--accent-color)', marginBottom: '1rem', fontWeight: 700 }}>{srv.title}</h3>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', marginBottom: '2rem', lineHeight: '1.6', flex: 1 }}>{srv.desc}</p>
                <Link to="/apply" className="modern-card-link">
                  {srv.linkText}
                  <ArrowRight size={16} />
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      <style>{`
        .tailored-card {
          background-color: white;
          border-radius: 24px;
          overflow: hidden;
          box-shadow: 0 12px 30px rgba(0,0,0,0.05);
          display: flex;
          flex-direction: column;
          height: 480px;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          border: 1px solid rgba(0,0,0,0.02);
        }

        .tailored-card:hover {
          transform: translateY(-8px);
          box-shadow: 0 25px 50px rgba(0,0,0,0.12);
        }

        .card-top {
          flex: 1;
          position: relative;
          overflow: hidden;
        }

        .default-content {
          position: absolute;
          inset: 0;
          display: flex;
          align-items: center;
          justify-content: center;
          background-color: #f8fafc;
          transition: opacity 0.4s ease;
          z-index: 1;
        }

        .default-content img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        .hover-content {
          position: absolute;
          inset: 0;
          padding: 2.5rem;
          background: rgba(255, 255, 255, 0.45);
          backdrop-filter: blur(30px);
          -webkit-backdrop-filter: blur(30px);
          opacity: 0;
          visibility: hidden;
          transition: all 0.4s ease;
          z-index: 2;
          display: flex;
          flex-direction: column;
        }

        .tailored-card:hover .default-content {
          opacity: 0;
        }

        .tailored-card:hover .hover-content {
          opacity: 1;
          visibility: visible;
        }

        .card-footer {
          padding: 1.5rem 2rem;
          display: flex;
          justify-content: space-between;
          align-items: center;
          border-top: 1px solid rgba(0,0,0,0.05);
          background-color: white;
          transition: background-color 0.3s ease;
        }

        .footer-left {
          display: flex;
          align-items: center;
          gap: 1rem;
        }

        .footer-left .icon-box {
          width: 40px;
          height: 40px;
          background-color: var(--primary-lighter);
          border-radius: 10px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: var(--primary-color);
          transition: all 0.3s ease;
        }

        .footer-left h3 {
          font-size: 1.15rem;
          font-weight: 700;
          color: var(--accent-color);
          margin: 0;
        }

        .footer-arrow {
          color: var(--text-muted);
          transition: all 0.3s ease;
        }

        .tailored-card:hover .footer-arrow {
          color: var(--primary-color);
          transform: translateX(4px);
        }

        .modern-service-card {
          background: white;
          border-radius: 20px;
          padding: 2rem;
          display: flex;
          flex-direction: column;
          border: 1px solid rgba(0,0,0,0.04);
          transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
          cursor: pointer;
          box-shadow: 0 4px 20px rgba(0,0,0,0.02);
          position: relative;
          overflow: hidden;
        }

        .modern-service-card:hover {
          transform: translateY(-10px);
          box-shadow: 0 20px 40px rgba(45, 46, 137, 0.08);
          border-color: rgba(45, 46, 137, 0.1);
        }

        .modern-icon-box {
          width: 64px;
          height: 64px;
          background: rgba(243, 158, 30, 0.08);
          border-radius: 18px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: var(--primary-color);
          transition: all 0.3s ease;
        }

        .modern-service-card:hover .modern-icon-box {
          transform: scale(1.1) rotate(5deg);
        }

        .modern-card-link {
          display: inline-flex;
          align-items: center;
          gap: 0.5rem;
          color: var(--primary-color);
          font-weight: 700;
          font-size: 0.95rem;
          text-decoration: none;
          margin-top: auto;
          transition: all 0.3s ease;
        }

        .modern-card-link:hover {
          gap: 0.75rem;
          opacity: 0.8;
        }

        .card-arrow {
          transition: all 0.3s ease;
        }

        .modern-service-card:hover .card-arrow {
          transform: translateX(4px);
          color: var(--primary-color);
        }

        @media (max-width: 1100px) {
          .mobile-hide { display: none !important; }
        }
      `}</style>
    </div>
  );
}
