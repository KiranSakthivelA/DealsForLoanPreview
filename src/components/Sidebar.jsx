import { Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, CheckSquare, Calendar, BarChart2, Users, Settings, HelpCircle, LogOut } from 'lucide-react';

export default function Sidebar({ onClose, isOpen }) {
  const location = useLocation();

  const handleLinkClick = () => {
    if (onClose) onClose();
  };

  return (
    <aside className={`sidebar ${isOpen ? 'open' : ''}`}>
      {onClose && (
        <button 
          onClick={onClose} 
          className="mobile-close-btn"
          style={{ position: 'absolute', top: '1.25rem', right: '1rem', background: 'none', border: 'none', color: 'var(--text-muted)', display: window.innerWidth <= 768 ? 'block' : 'none' }}
        >
          ✕
        </button>
      )}
      <div className="sidebar-header">
        <img src="/Asset/f.png" alt="Deals For Loan" style={{ height: '32px', objectFit: 'contain' }} />
      </div>
      
      <nav className="sidebar-nav">
        <div style={{ fontSize: '0.65rem', fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', margin: '0.5rem 0 0.25rem 0.75rem' }}>
          Menu
        </div>
        
        <Link 
          to="/admin" 
          onClick={handleLinkClick}
          className={`nav-item ${location.pathname === '/admin' ? 'active' : ''}`}
        >
          <LayoutDashboard size={18} />
          Dashboard
        </Link>
        
        <Link 
          to="/apply" 
          onClick={handleLinkClick}
          className={`nav-item ${location.pathname === '/apply' ? 'active' : ''}`}
        >
          <CheckSquare size={18} />
          Client Form
        </Link>

        <Link to="#" className="nav-item">
          <Calendar size={18} />
          Calendar
        </Link>

        <Link to="#" className="nav-item">
          <BarChart2 size={18} />
          Analytics
        </Link>

        <Link to="#" className="nav-item">
          <Users size={18} />
          Team
        </Link>

        <div style={{ fontSize: '0.65rem', fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', margin: '1rem 0 0.25rem 0.75rem' }}>
          General
        </div>

        <Link to="#" className="nav-item">
          <Settings size={18} />
          Settings
        </Link>

        <Link to="#" className="nav-item">
          <HelpCircle size={18} />
          Help
        </Link>

        <div style={{ marginTop: 'auto' }}>
          <Link to="#" className="nav-item" style={{ color: 'var(--text-secondary)' }}>
            <LogOut size={18} />
            Logout
          </Link>
        </div>
      </nav>
    </aside>
  );
}
