import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Star, ShieldCheck, Shield, CheckCircle2, ChevronRight, Home } from 'lucide-react';
import { LOAN_TYPES } from '../store/db';

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

      {/* Hero Section & Quick Estimate Form */}
      <section style={{ padding: '4rem 0', position: 'relative', zIndex: 1, display: 'flex', alignItems: 'center', minHeight: '85vh' }}>
        <div className="container hero-grid">
          
          {/* Left Hero Content */}
          <div style={{ paddingRight: '2rem' }}>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', backgroundColor: 'var(--primary-lighter)', color: 'var(--primary-color)', padding: '0.5rem 1rem', borderRadius: '8px', fontSize: '0.85rem', fontWeight: 700, marginBottom: '2rem' }}>
              <ShieldCheck size={16} /> TRUSTED FINANCIAL PARTNER
            </div>
            
            <h1 style={{ fontSize: '4.5rem', color: 'var(--accent-color)', marginBottom: '1.5rem', lineHeight: '1.05', letterSpacing: '-0.03em' }}>
              Banking <br/>
              Solutions For <br/>
              <span className="gradient-text">Everyday Needs.</span>
            </h1>
            
            <p style={{ fontSize: '1.25rem', color: 'var(--text-secondary)', marginBottom: '3rem', lineHeight: '1.6', maxWidth: '540px' }}>
              Experience seamless lending, secure credit cards, and comprehensive insurance plans tailored specifically for your lifestyle.
            </p>
            
            <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
              <Link to="/apply" className="btn" style={{ background: 'linear-gradient(135deg, var(--accent-color) 0%, #1a1b5d 100%)', color: 'white', padding: '1.25rem 2.5rem', fontSize: '1.1rem', borderRadius: '12px', display: 'inline-flex', alignItems: 'center', gap: '0.75rem', boxShadow: '0 10px 25px rgba(45, 46, 137, 0.25)', transition: 'all 0.3s' }} onMouseOver={e => e.currentTarget.style.transform = 'translateY(-4px) scale(1.02)'} onMouseOut={e => e.currentTarget.style.transform = 'translateY(0) scale(1)'}>
                Get Started <ArrowRight size={20} />
              </Link>
            </div>
          </div>
          
          {/* Right Hero - Visuals & Quick Estimate Form */}
          <div style={{ position: 'relative' }}>
            {/* CSS Floating Credit Cards */}
            <div className="mobile-hide" style={{ position: 'absolute', top: '-120px', right: '-40px', width: '320px', height: '200px', background: 'linear-gradient(135deg, var(--accent-color) 0%, var(--accent-hover) 100%)', borderRadius: '20px', padding: '1.5rem', color: 'white', boxShadow: '0 24px 48px rgba(26, 62, 114, 0.25)', transform: 'rotate(12deg)', zIndex: 1, opacity: 0.9 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '2rem' }}>
                <Shield size={32} opacity={0.8} />
                <div style={{ width: '40px', height: '30px', background: 'rgba(255,255,255,0.2)', borderRadius: '6px' }}></div>
              </div>
              <div style={{ fontSize: '1.25rem', letterSpacing: '2px', marginBottom: '1rem', fontFamily: 'monospace' }}>**** **** **** 8892</div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', opacity: 0.8 }}>
                <span>Platinum Rewards</span>
                <span>12/28</span>
              </div>
            </div>

            <div className="mobile-hide" style={{ position: 'absolute', bottom: '-80px', left: '-120px', width: '300px', height: '190px', background: 'linear-gradient(135deg, var(--primary-color) 0%, var(--primary-dark) 100%)', borderRadius: '20px', padding: '1.5rem', color: 'white', boxShadow: '0 24px 48px rgba(243, 158, 30, 0.25)', transform: 'rotate(-8deg)', zIndex: 1, opacity: 0.9 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '2rem' }}>
                <img src="/Asset/f.png" alt="Logo" style={{ height: '30px', filter: 'brightness(0) invert(1)' }} />
                <div style={{ width: '40px', height: '30px', background: 'rgba(255,255,255,0.2)', borderRadius: '6px' }}></div>
              </div>
              <div style={{ fontSize: '1.25rem', letterSpacing: '2px', marginBottom: '1rem', fontFamily: 'monospace' }}>**** **** **** 4210</div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', opacity: 0.8 }}>
                <span>Business Elite</span>
                <span>09/27</span>
              </div>
            </div>

            <div className="glass" style={{ padding: '2.5rem', borderRadius: '24px', boxShadow: '0 20px 40px rgba(0,0,0,0.08)', position: 'relative', zIndex: 2, backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)' }}>
              <h3 style={{ fontSize: '1.5rem', color: 'var(--accent-color)', marginBottom: '0.5rem', fontWeight: 800 }}>Quick Estimate</h3>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', marginBottom: '2rem' }}>Fill in your details to get a fast loan estimate.</p>
              
              <form onSubmit={e => { e.preventDefault(); window.location.href = '/apply'; }}>
                <div style={{ marginBottom: '1.25rem' }}>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>Full Name</label>
                  <input type="text" className="form-control" required placeholder="John Doe" style={{ borderRadius: '12px', boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.03)' }} />
                </div>
                <div style={{ marginBottom: '1.25rem' }}>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>Phone Number</label>
                  <input type="tel" className="form-control" required placeholder="+91 00000 00000" style={{ borderRadius: '12px', boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.03)' }} />
                </div>
                <div style={{ marginBottom: '2rem' }}>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>Loan Type</label>
                  <select className="form-control" required style={{ borderRadius: '12px', height: '50px', cursor: 'pointer', boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.03)' }}>
                    <option value="" disabled selected>Select Loan Type</option>
                    {LOAN_TYPES.map(type => <option key={type} value={type}>{type}</option>)}
                  </select>
                </div>
                <button type="submit" className="btn btn-primary" style={{ width: '100%', padding: '1.1rem', fontSize: '1.1rem', borderRadius: '12px', fontWeight: 700 }}>
                  Get Estimate Now
                </button>
              </form>
            </div>
          </div>
          
        </div>
      </section>

      {/* Slim Stats Banner (Matched to User Image) */}
      <section style={{ 
        background: 'linear-gradient(90deg, #1e1b4b 0%, #2d2e89 50%, #1e1b4b 100%)', 
        padding: '2rem 0', 
        position: 'relative', 
        zIndex: 2, 
        boxShadow: '0 15px 35px rgba(0,0,0,0.1)',
        overflow: 'hidden'
      }}>
        <div className="container stats-flex" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ textAlign: 'center', color: 'white', flex: 1 }}>
            <div style={{ fontSize: '2.2rem', fontWeight: 800, marginBottom: '0.15rem', letterSpacing: '-0.02em' }}>
              <CountUp end={1250} suffix="+" />
            </div>
            <div style={{ fontSize: '0.75rem', opacity: 0.7, textTransform: 'uppercase', letterSpacing: '1.5px', fontWeight: 700 }}>Professionals</div>
          </div>
          <div style={{ width: '1px', height: '40px', backgroundColor: 'rgba(255,255,255,0.15)', margin: '0 2rem' }}></div>
          <div style={{ textAlign: 'center', color: 'white', flex: 1 }}>
            <div style={{ fontSize: '2.2rem', fontWeight: 800, marginBottom: '0.15rem', letterSpacing: '-0.02em' }}>
              <CountUp end={75} suffix="+" />
            </div>
            <div style={{ fontSize: '0.75rem', opacity: 0.7, textTransform: 'uppercase', letterSpacing: '1.5px', fontWeight: 700 }}>Cities Covered</div>
          </div>
          <div style={{ width: '1px', height: '40px', backgroundColor: 'rgba(255,255,255,0.15)', margin: '0 2rem' }}></div>
          <div style={{ textAlign: 'center', color: 'white', flex: 1 }}>
            <div style={{ fontSize: '2.2rem', fontWeight: 800, marginBottom: '0.15rem', letterSpacing: '-0.02em' }}>
              <CountUp end={275} suffix="+" />
            </div>
            <div style={{ fontSize: '0.75rem', opacity: 0.7, textTransform: 'uppercase', letterSpacing: '1.5px', fontWeight: 700 }}>Partner Banks</div>
          </div>
          <div style={{ width: '1px', height: '40px', backgroundColor: 'rgba(255,255,255,0.15)', margin: '0 2rem' }}></div>
          <div style={{ textAlign: 'center', color: 'white', flex: 1 }}>
            <div style={{ fontSize: '2.2rem', fontWeight: 800, marginBottom: '0.15rem', letterSpacing: '-0.02em' }}>
              <CountUp end={2} prefix="$" suffix="B+" />
            </div>
            <div style={{ fontSize: '0.75rem', opacity: 0.7, textTransform: 'uppercase', letterSpacing: '1.5px', fontWeight: 700 }}>Loans Disbursed</div>
          </div>
        </div>
      </section>

      {/* Tailored Solutions Section */}
      <section style={{ padding: '8rem 4rem', position: 'relative', zIndex: 1, backgroundColor: 'white' }}>
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
      <section style={{ padding: '6rem 4rem 4rem', position: 'relative', zIndex: 1, backgroundColor: 'var(--background-color)' }}>
        <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
          <div style={{ marginBottom: '3rem' }}>
            <h2 style={{ fontSize: '2rem', color: '#1f2937', marginBottom: '0.5rem', fontWeight: 700 }}>We Facilitate</h2>
            <p style={{ fontSize: '1rem', color: 'var(--text-secondary)' }}>
              Wide Range of Financial Products That suits your customer's needs!
            </p>
          </div>

          <div className="facilitate-grid">
            {products.map((srv, idx) => (
              <div key={idx} style={{ backgroundColor: 'white', borderRadius: '8px', padding: '1.5rem', boxShadow: '0 4px 12px rgba(0,0,0,0.03)', display: 'flex', flexDirection: 'column', transition: 'box-shadow 0.2s, transform 0.2s', cursor: 'pointer', border: '1px solid rgba(0,0,0,0.02)' }} onMouseOver={e => {e.currentTarget.style.boxShadow = '0 10px 25px rgba(0,0,0,0.08)'; e.currentTarget.style.transform = 'translateY(-4px)'}} onMouseOut={e => {e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.03)'; e.currentTarget.style.transform = 'translateY(0)'}}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
                  <h3 style={{ fontSize: '1.1rem', color: '#1f2937', margin: 0, fontWeight: 600 }}>{srv.title}</h3>
                  <div style={{ fontSize: '1.5rem' }}>{srv.icon}</div>
                </div>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '1.5rem', lineHeight: '1.5', flex: 1 }}>{srv.desc}</p>
                <Link to="/apply" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem', color: 'var(--primary-color)', fontSize: '0.9rem', fontWeight: 600, textDecoration: 'none' }}>
                  Check Eligibility 
                  <span style={{ backgroundColor: 'var(--primary-lighter)', color: 'var(--primary-color)', borderRadius: '50%', width: '18px', height: '18px', display: 'flex', alignItems: 'center', justifyContent: 'center', marginLeft: '4px' }}>
                    <ChevronRight size={12} strokeWidth={3} />
                  </span>
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Insurance Grid */}
      <section style={{ padding: '0 4rem 6rem', position: 'relative', zIndex: 1, backgroundColor: 'var(--background-color)' }}>
        <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
          <div style={{ marginBottom: '3rem' }}>
            <h2 style={{ fontSize: '2rem', color: '#1f2937', marginBottom: '0.5rem', fontWeight: 700 }}>Insurance</h2>
            <p style={{ fontSize: '1rem', color: 'var(--text-secondary)' }}>
              Wide Range of Insurance Products
            </p>
          </div>

          <div className="insurance-grid">
            {insurance.map((srv, idx) => (
              <div key={idx} style={{ backgroundColor: 'white', borderRadius: '8px', padding: '1.5rem', boxShadow: '0 4px 12px rgba(0,0,0,0.03)', display: 'flex', flexDirection: 'column', transition: 'box-shadow 0.2s, transform 0.2s', cursor: 'pointer', border: '1px solid rgba(0,0,0,0.02)' }} onMouseOver={e => {e.currentTarget.style.boxShadow = '0 10px 25px rgba(0,0,0,0.08)'; e.currentTarget.style.transform = 'translateY(-4px)'}} onMouseOut={e => {e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.03)'; e.currentTarget.style.transform = 'translateY(0)'}}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
                  <h3 style={{ fontSize: '1.1rem', color: '#1f2937', margin: 0, fontWeight: 600 }}>{srv.title}</h3>
                  <div style={{ fontSize: '1.5rem' }}>{srv.icon}</div>
                </div>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '1.5rem', lineHeight: '1.5', flex: 1 }}>{srv.desc}</p>
                <Link to="/apply" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem', color: '#374151', fontSize: '0.9rem', fontWeight: 600, textDecoration: 'none' }}>
                  {srv.linkText}
                  <span style={{ backgroundColor: 'var(--primary-lighter)', color: 'var(--primary-color)', borderRadius: '50%', width: '18px', height: '18px', display: 'flex', alignItems: 'center', justifyContent: 'center', marginLeft: '4px' }}>
                    <ChevronRight size={12} strokeWidth={3} />
                  </span>
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

        @media (max-width: 1100px) {
          .mobile-hide { display: none !important; }
        }
      `}</style>
    </div>
  );
}
