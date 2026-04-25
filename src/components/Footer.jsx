import { Link } from 'react-router-dom';
import { ArrowRight, MapPin, Phone, Mail } from 'lucide-react';

export default function Footer() {
  return (
    <footer style={{ 
      position: 'relative', 
      backgroundColor: '#f8fafc', 
      borderTop: '1px solid rgba(0,0,0,0.05)',
      overflow: 'hidden'
    }}>
      {/* Background Gradient & Grid */}
      <div style={{ 
        position: 'absolute', 
        top: 0, 
        left: 0, 
        width: '100%', 
        height: '100%', 
        backgroundImage: 'linear-gradient(to bottom right, rgba(45, 46, 137, 0.08) 0%, rgba(243, 158, 30, 0.03) 100%)',
        zIndex: 0 
      }}></div>
      <div style={{ 
        position: 'absolute', 
        top: 0, 
        left: 0, 
        right: 0, 
        bottom: 0, 
        backgroundImage: 'linear-gradient(rgba(0, 0, 0, 0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(0, 0, 0, 0.03) 1px, transparent 1px)', 
        backgroundSize: '40px 40px', 
        zIndex: 0 
      }}></div>

      <div style={{ position: 'relative', zIndex: 1, maxWidth: '1400px', margin: '0 auto', padding: '4rem 2rem 2rem' }}>
        
        {/* Top Section - Logo and CTA */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4rem' }}>
          <div style={{ maxWidth: '400px' }}>
            <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', textDecoration: 'none', marginBottom: '1rem' }}>
              <img src="/Asset/f.png" alt="Deals For Loan Logo" style={{ height: '40px' }} />
            </Link>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', lineHeight: '1.6' }}>
              Your trusted partner for loans, insurance, and credit card solutions across India.
            </p>
          </div>
          <div>
            <Link to="/apply" className="btn btn-primary" style={{ padding: '0.85rem 2rem', fontSize: '1rem', borderRadius: '8px', display: 'inline-flex', alignItems: 'center', gap: '0.5rem', backgroundColor: 'var(--accent-color)' }}>
              Get Started <ArrowRight size={18} />
            </Link>
          </div>
        </div>

        {/* Middle Section - Links Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '2rem', marginBottom: '4rem' }}>
          
          {/* LOANS */}
          <div>
            <h4 style={{ fontSize: '0.9rem', fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '1px', marginBottom: '1.5rem', textTransform: 'uppercase', position: 'relative' }}>
              Loans
              <div style={{ position: 'absolute', bottom: '-8px', left: 0, width: '24px', height: '2px', backgroundColor: 'var(--accent-color)' }}></div>
            </h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {['Personal Loan', 'Business Loan', 'Home Loan', 'Gold Loan', 'Loan Against Property'].map(link => (
                <Link key={link} to="#" style={{ color: 'var(--text-secondary)', textDecoration: 'none', fontSize: '0.9rem', transition: 'color 0.2s' }} onMouseOver={e => e.target.style.color = 'var(--primary-color)'} onMouseOut={e => e.target.style.color = 'var(--text-secondary)'}>{link}</Link>
              ))}
            </div>
          </div>

          {/* INSURANCE */}
          <div>
            <h4 style={{ fontSize: '0.9rem', fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '1px', marginBottom: '1.5rem', textTransform: 'uppercase', position: 'relative' }}>
              Insurance
              <div style={{ position: 'absolute', bottom: '-8px', left: 0, width: '24px', height: '2px', backgroundColor: 'var(--accent-color)' }}></div>
            </h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {['Life Insurance', 'Health Insurance', 'General Insurance'].map(link => (
                <Link key={link} to="#" style={{ color: 'var(--text-secondary)', textDecoration: 'none', fontSize: '0.9rem', transition: 'color 0.2s' }} onMouseOver={e => e.target.style.color = 'var(--primary-color)'} onMouseOut={e => e.target.style.color = 'var(--text-secondary)'}>{link}</Link>
              ))}
            </div>
          </div>

          {/* CREDIT CARDS */}
          <div>
            <h4 style={{ fontSize: '0.9rem', fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '1px', marginBottom: '1.5rem', textTransform: 'uppercase', position: 'relative' }}>
              Credit Cards
              <div style={{ position: 'absolute', bottom: '-8px', left: 0, width: '24px', height: '2px', backgroundColor: 'var(--accent-color)' }}></div>
            </h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {['Axis Bank Cards', 'HDFC Bank Cards', 'ICICI Bank Cards', 'IDFC First Cards', 'IndusInd Cards'].map(link => (
                <Link key={link} to="#" style={{ color: 'var(--text-secondary)', textDecoration: 'none', fontSize: '0.9rem', transition: 'color 0.2s' }} onMouseOver={e => e.target.style.color = 'var(--primary-color)'} onMouseOut={e => e.target.style.color = 'var(--text-secondary)'}>{link}</Link>
              ))}
            </div>
          </div>

          {/* QUICK LINKS */}
          <div>
            <h4 style={{ fontSize: '0.9rem', fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '1px', marginBottom: '1.5rem', textTransform: 'uppercase', position: 'relative' }}>
              Quick Links
              <div style={{ position: 'absolute', bottom: '-8px', left: 0, width: '24px', height: '2px', backgroundColor: 'var(--accent-color)' }}></div>
            </h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {['About Us', 'Apply Now'].map(link => (
                <Link key={link} to={link === 'Apply Now' ? '/apply' : '#'} style={{ color: 'var(--text-secondary)', textDecoration: 'none', fontSize: '0.9rem', transition: 'color 0.2s' }} onMouseOver={e => e.target.style.color = 'var(--primary-color)'} onMouseOut={e => e.target.style.color = 'var(--text-secondary)'}>{link}</Link>
              ))}
            </div>
          </div>

          {/* CONTACT */}
          <div>
            <h4 style={{ fontSize: '0.9rem', fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '1px', marginBottom: '1.5rem', textTransform: 'uppercase', position: 'relative' }}>
              Contact
              <div style={{ position: 'absolute', bottom: '-8px', left: 0, width: '24px', height: '2px', backgroundColor: 'var(--accent-color)' }}></div>
            </h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div style={{ display: 'flex', gap: '0.75rem', color: 'var(--text-secondary)', fontSize: '0.9rem', lineHeight: '1.5' }}>
                <MapPin size={18} style={{ color: 'var(--accent-color)', flexShrink: 0, marginTop: '2px' }} />
                <span>123 Business Avenue,<br/>Tech Park, Suite 400,<br/>Financial District,<br/>New Delhi - 110001</span>
              </div>
              <div style={{ display: 'flex', gap: '0.75rem', color: 'var(--text-secondary)', fontSize: '0.9rem', alignItems: 'center' }}>
                <Phone size={16} style={{ color: 'var(--accent-color)', flexShrink: 0 }} />
                <span>+91 00000 00000</span>
              </div>
              <div style={{ display: 'flex', gap: '0.75rem', color: 'var(--text-secondary)', fontSize: '0.9rem', alignItems: 'center' }}>
                <Mail size={16} style={{ color: 'var(--accent-color)', flexShrink: 0 }} />
                <span>contact@dealsforloan.com</span>
              </div>
            </div>

            {/* Social Icons */}
            <div style={{ display: 'flex', gap: '1rem', marginTop: '1.5rem' }}>
              <Link to="#" style={{ width: '36px', height: '36px', backgroundColor: 'rgba(45, 46, 137, 0.08)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--accent-color)' }}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"></path></svg>
              </Link>
              <Link to="#" style={{ width: '36px', height: '36px', backgroundColor: 'rgba(45, 46, 137, 0.08)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--accent-color)' }}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line></svg>
              </Link>
              <Link to="#" style={{ width: '36px', height: '36px', backgroundColor: 'rgba(45, 46, 137, 0.08)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--accent-color)' }}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"></path><rect x="2" y="9" width="4" height="12"></rect><circle cx="4" cy="4" r="2"></circle></svg>
              </Link>
            </div>
          </div>

        </div>

        {/* Bottom Section */}
        <div style={{ borderTop: '1px solid rgba(0,0,0,0.08)', paddingTop: '2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <span>© 2026 Deals For Loan. All rights reserved.</span>
            <span>|</span>
            <span>Website by Deals For Loan Tech Team</span>
          </div>
          <div style={{ display: 'flex', gap: '1.5rem' }}>
            <Link to="#" style={{ color: 'var(--text-secondary)', textDecoration: 'none' }}>Privacy Policy</Link>
            <Link to="#" style={{ color: 'var(--text-secondary)', textDecoration: 'none' }}>Terms of Service</Link>
          </div>
        </div>

      </div>
    </footer>
  );
}
