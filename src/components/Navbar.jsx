import { Link, useLocation } from 'react-router-dom';
import { ChevronDown, Menu, X } from 'lucide-react';
import { useState } from 'react';

export default function Navbar() {
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const navLinks = (
    <>
      <Link 
        to="/" 
        onClick={() => setIsMobileMenuOpen(false)}
        style={{ fontWeight: 600, fontSize: '0.95rem', color: location.pathname === '/' ? 'var(--primary-color)' : 'var(--accent-color)', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '0.25rem' }}
      >
        Home
      </Link>
      <div style={{ fontWeight: 600, fontSize: '0.95rem', color: 'var(--accent-color)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
        Loans <ChevronDown size={16} />
      </div>
      <div style={{ fontWeight: 600, fontSize: '0.95rem', color: 'var(--accent-color)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
        Cards <ChevronDown size={16} />
      </div>
    </>
  );

  const actionLinks = (
    <>
      <Link to="#" onClick={() => setIsMobileMenuOpen(false)} style={{ fontWeight: 600, fontSize: '0.95rem', color: 'var(--text-primary)', textDecoration: 'none', whiteSpace: 'nowrap' }}>
        Become a Partner
      </Link>
      <Link to="#" onClick={() => setIsMobileMenuOpen(false)} style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', fontWeight: 600, fontSize: '0.95rem', color: 'var(--text-primary)', textDecoration: 'none', whiteSpace: 'nowrap' }}>
        <span style={{ backgroundColor: 'red', color: 'white', fontSize: '0.65rem', padding: '0.15rem 0.35rem', borderRadius: '4px', fontWeight: 800 }}>NEW</span>
        Check Cibil Score
      </Link>
      <Link to="/apply" onClick={() => setIsMobileMenuOpen(false)} className="btn btn-primary" style={{ padding: '0.75rem 1.5rem', fontSize: '0.95rem', borderRadius: '8px', backgroundColor: 'var(--accent-color)', whiteSpace: 'nowrap' }}>
        Apply Now
      </Link>
    </>
  );

  return (
    <nav style={{ backgroundColor: 'white', padding: '1.25rem 4rem', position: 'sticky', top: 0, zIndex: 100, boxShadow: '0 4px 20px rgba(0,0,0,0.03)' }}>
      <div style={{ maxWidth: '1400px', margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
        {/* Logo - Left */}
        <Link to="/" style={{ display: 'flex', alignItems: 'center', textDecoration: 'none', flexShrink: 0 }}>
          <img src="/Asset/f.png" alt="Deals For Loan Logo" style={{ height: '40px' }} />
        </Link>
        
        {/* Links - Centered (Desktop) */}
        <div className="desktop-only" style={{ display: 'flex', gap: '2rem', alignItems: 'center', flex: 1, justifyContent: 'center', padding: '0 2rem' }}>
          {navLinks}
        </div>
        
        {/* Actions - Right (Desktop) */}
        <div className="desktop-only" style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', flexShrink: 0 }}>
          {actionLinks}
        </div>

        {/* Mobile Toggle */}
        <button 
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          style={{ display: 'none', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--accent-color)' }}
          className="mobile-toggle"
        >
          {isMobileMenuOpen ? <X size={28} /> : <Menu size={28} />}
        </button>
      </div>

      {/* Mobile Menu Overlay */}
      {isMobileMenuOpen && (
        <div style={{ position: 'absolute', top: '100%', left: 0, right: 0, backgroundColor: 'white', borderTop: '1px solid #eee', padding: '2rem', display: 'flex', flexDirection: 'column', gap: '1.5rem', boxShadow: '0 10px 20px rgba(0,0,0,0.05)', zIndex: 99 }}>
          {navLinks}
          <hr style={{ border: 'none', borderTop: '1px solid #eee' }} />
          {actionLinks}
        </div>
      )}

      <style>{`
        @media (max-width: 1024px) {
          nav { padding: 1rem 2rem !important; }
          .desktop-only { display: none !important; }
          .mobile-toggle { display: block !important; }
        }
      `}</style>
    </nav>
  );
}
