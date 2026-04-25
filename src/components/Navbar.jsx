import { Link, useLocation } from 'react-router-dom';
import { ChevronDown, Menu, X } from 'lucide-react';
import { useState } from 'react';

const LOAN_TYPES = [
  "Personal Loan", "Business Loan", "Home Loan", "Mortgage Loan",
  "CC Transfer", "Doctor Loan", "Professional Loan", "Working Capital"
];

const CARD_TYPES = [
  "Credit Cards", "Premium Cards", "Business Cards"
];

const INSURANCE_TYPES = [
  "Life Insurance", "Health Insurance", "Car Insurance", "Term Insurance", "General Insurance"
];

function NavDropdown({ title, items }) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div 
      className="nav-dropdown-container"
      onMouseEnter={() => setIsOpen(true)}
      onMouseLeave={() => setIsOpen(false)}
      style={{ position: 'relative' }}
    >
      <div 
        onClick={() => setIsOpen(!isOpen)}
        style={{ fontWeight: 600, fontSize: '0.95rem', color: 'var(--accent-color)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.25rem', padding: '0.5rem 0' }}
      >
        {title} <ChevronDown size={16} style={{ transform: isOpen ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }} />
      </div>
      
      {/* Dropdown Menu */}
      <div className={`dropdown-menu ${isOpen ? 'show' : ''}`} style={{
        position: 'absolute',
        top: '100%',
        left: '50%',
        transform: 'translateX(-50%) translateY(10px)',
        backgroundColor: 'white',
        borderRadius: '12px',
        boxShadow: '0 10px 40px rgba(0,0,0,0.1)',
        padding: '1rem',
        minWidth: '200px',
        zIndex: 1000,
        opacity: 0,
        visibility: 'hidden',
        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        border: '1px solid rgba(0,0,0,0.05)',
        backdropFilter: 'blur(20px)',
        background: 'rgba(255, 255, 255, 0.95)'
      }}>
        <div style={{ display: 'grid', gridTemplateColumns: items.length > 5 ? '1fr 1fr' : '1fr', gap: '0.25rem', minWidth: items.length > 5 ? '380px' : '200px' }}>
          {items.map((item, idx) => (
            <Link 
              key={idx} 
              to="/apply" 
              className="dropdown-item"
              style={{
                padding: '0.75rem 1rem',
                borderRadius: '8px',
                fontSize: '0.9rem',
                color: 'var(--text-primary)',
                textDecoration: 'none',
                fontWeight: 500,
                transition: 'all 0.2s',
                display: 'block'
              }}
            >
              {item}
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}

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
      <NavDropdown title="Loans" items={LOAN_TYPES} />
      <NavDropdown title="Cards" items={CARD_TYPES} />
      <NavDropdown title="Insurance" items={INSURANCE_TYPES} />
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
      <Link 
        to="/apply" 
        onClick={() => setIsMobileMenuOpen(false)} 
        className="btn btn-primary" 
        style={{ 
          padding: '0.75rem 1.5rem', 
          fontSize: '0.95rem', 
          borderRadius: '10px', 
          whiteSpace: 'nowrap', 
          color: 'white',
          background: 'linear-gradient(135deg, var(--accent-color) 0%, #1a1b5d 100%)',
          boxShadow: '0 4px 12px rgba(45, 46, 137, 0.2)',
          textAlign: 'center'
        }}
      >
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
        <div className="desktop-only" style={{ display: 'flex', gap: '2.5rem', alignItems: 'center', flex: 1, justifyContent: 'center', padding: '0 2rem' }}>
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
        <div style={{ position: 'absolute', top: '100%', left: 0, right: 0, backgroundColor: 'white', borderTop: '1px solid #eee', padding: '2rem', display: 'flex', flexDirection: 'column', gap: '1.5rem', boxShadow: '0 10px 20px rgba(0,0,0,0.05)', zIndex: 99, maxHeight: '80vh', overflowY: 'auto' }}>
          {navLinks}
          <hr style={{ border: 'none', borderTop: '1px solid #eee' }} />
          {actionLinks}
        </div>
      )}

      <style>{`
        @media (max-width: 1024px) {
          nav { padding: 1rem 1.25rem !important; }
          .desktop-only { display: none !important; }
          .mobile-toggle { display: block !important; }
          
          .dropdown-menu {
            min-width: 100% !important;
            box-shadow: none !important;
            border: none !important;
            background: #f8fafc !important;
            margin-top: 0.5rem !important;
          }
          
          .dropdown-menu > div {
            grid-template-columns: 1fr !important;
            min-width: 0 !important;
          }

          .dropdown-item {
            padding: 0.5rem 1rem !important;
          }
        }
        
        .dropdown-menu.show {
          opacity: 1 !important;
          visibility: visible !important;
          transform: translateX(-50%) translateY(0) !important;
        }

        .dropdown-item:hover {
          background-color: var(--primary-lighter);
          color: var(--primary-color) !important;
          padding-left: 1.25rem !important;
        }

        .nav-dropdown-container:hover .dropdown-menu {
          opacity: 1;
          visibility: visible;
          transform: translateX(-50%) translateY(0);
        }
      `}</style>
    </nav>
  );
}
