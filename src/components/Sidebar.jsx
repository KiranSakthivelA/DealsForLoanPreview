import { useNavigate, useLocation } from 'react-router-dom';
import { getLoggedInUser, logoutUser } from '../store/db';
import { LayoutDashboard, UserPlus, CalendarDays, LogOut } from 'lucide-react';

const NAV_ITEMS = [
  { path: '/managercrm',      icon: LayoutDashboard, label: 'Lead Details' },
  { path: '/worker-crm', icon: UserPlus,         label: 'Add Lead'    },
  { path: '/calendar',   icon: CalendarDays,     label: 'Calendar'    },
];

export default function Sidebar({ isOpen, onClose }) {
  const navigate = useNavigate();
  const location = useLocation();
  const user     = getLoggedInUser();

  const go = (path) => {
    navigate(path);
    if (onClose) onClose();
  };

  const logout = () => {
    logoutUser();
    window.location.replace('/login');
  };

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div
          onClick={onClose}
          style={{
            position: 'fixed', inset: 0,
            backgroundColor: 'rgba(0,0,0,0.45)',
            zIndex: 998,
            display: 'none',
          }}
          className="sidebar-overlay-mobile"
        />
      )}

      <aside className={`sidebar${isOpen ? ' open' : ''}`}>
        {/* Logo */}
        <div
          className="sidebar-header"
          onClick={() => go('/managercrm')}
          style={{ cursor: 'pointer', borderBottom: '1px solid var(--border-color)', paddingBottom: '1.25rem' }}
        >
          <img src="/Asset/f.png" alt="Deals For Loan" style={{ height: '32px', objectFit: 'contain' }} />
        </div>

        {/* Section label */}
        <div style={{
          fontSize: '0.65rem', fontWeight: 800,
          color: 'var(--text-muted)', textTransform: 'uppercase',
          letterSpacing: '0.08em', padding: '1rem 1rem 0.5rem',
        }}>
          Menu
        </div>

        {/* Nav links */}
        <nav className="sidebar-nav">
          {NAV_ITEMS.map(({ path, icon: Icon, label }) => {
            const active = location.pathname === path;
            return (
              <button
                key={path}
                onClick={() => go(path)}
                className={`nav-item${active ? ' active' : ''}`}
                style={{ background: 'none', border: 'none', cursor: 'pointer', width: '100%', textAlign: 'left' }}
              >
                <Icon size={18} strokeWidth={active ? 2.5 : 2} />
                {label}
              </button>
            );
          })}
        </nav>

        {/* User info + logout (pushed to bottom) */}
        <div style={{ marginTop: 'auto', padding: '0.75rem', borderTop: '1px solid var(--border-color)' }}>
          {user && (
            <div style={{
              padding: '0.6rem 0.875rem',
              marginBottom: '0.25rem',
              borderRadius: 'var(--radius-pill)',
              backgroundColor: 'var(--background-color)',
              fontSize: '0.8rem',
            }}>
              <div style={{ fontWeight: 700, color: 'var(--text-primary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{user.name}</div>
              <div style={{ color: 'var(--text-muted)', textTransform: 'uppercase', fontSize: '0.65rem', letterSpacing: '0.05em' }}>{user.role}</div>
            </div>
          )}
          <button
            onClick={logout}
            className="nav-item"
            style={{ background: 'none', border: 'none', cursor: 'pointer', width: '100%', textAlign: 'left', color: 'var(--error-color)' }}
          >
            <LogOut size={18} strokeWidth={2} />
            Logout
          </button>
        </div>
      </aside>
    </>
  );
}
