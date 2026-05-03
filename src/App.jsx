import { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation, useNavigate } from 'react-router-dom';
import Navbar from './components/Navbar';
import ClientForm from './pages/ClientForm';
import AdminDashboard from './pages/AdminDashboard';
import LandingPage from './pages/LandingPage';
import About from './pages/About';
import Calculator from './pages/Calculator';
import Login from './pages/Login';
import WorkerCRM from './pages/WorkerCRM';
import CalendarView from './pages/CalendarView';
import Footer from './components/Footer';
import { Menu, LogOut, LayoutDashboard, UserPlus, CalendarDays } from 'lucide-react';
import { getLoggedInUser, logoutUser } from './store/db';

// ─────────────────────────────────────────────
// Sidebar (inline – no routing dependency issues)
// ─────────────────────────────────────────────
function Sidebar({ currentPath, onNav, isOpen, onClose }) {
  const logout = () => {
    logoutUser();
    window.location.replace('/managercrm');
  };

  const navItems = [
    { path: '/managercrm',      icon: <LayoutDashboard size={18} />, label: 'Lead Details' },
    { path: '/worker-crm', icon: <UserPlus size={18} />,        label: 'Add Lead'    },
    { path: '/calendar',   icon: <CalendarDays size={18} />,    label: 'Calendar'    },
  ];

  const user = getLoggedInUser();

  return (
    <>
      {/* Mobile dark overlay */}
      {isOpen && (
        <div
          onClick={onClose}
          style={{
            position: 'fixed', inset: 0,
            background: 'rgba(0,0,0,0.5)',
            zIndex: 998,
          }}
        />
      )}

      <aside className={`sidebar ${isOpen ? 'open' : ''}`}>
        {/* Logo */}
        <div
          onClick={() => { onNav('/managercrm'); onClose(); }}
          style={{
            padding: '1.25rem 1.5rem',
            borderBottom: '1px solid #f0f0f0',
            cursor: 'pointer',
          }}
        >
          <img src="/Asset/f.png" alt="Deals For Loan" style={{ height: '32px', objectFit: 'contain' }} />
        </div>

        {/* Menu label */}
        <div style={{ padding: '1rem 1.25rem 0.4rem', fontSize: '0.62rem', fontWeight: 800, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
          Menu
        </div>

        {/* Nav items */}
        <nav style={{ flex: 1, padding: '0.25rem 0.75rem', display: 'flex', flexDirection: 'column', gap: '2px' }}>
          {navItems.map(({ path, icon, label }) => {
            const active = currentPath === path;
            return (
              <button
                key={path}
                onClick={() => { onNav(path); onClose(); }}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.75rem',
                  width: '100%',
                  padding: '0.7rem 0.875rem',
                  borderRadius: '10px',
                  border: 'none',
                  cursor: 'pointer',
                  textAlign: 'left',
                  fontSize: '0.875rem',
                  fontWeight: active ? 700 : 500,
                  color: active ? '#f39e1e' : '#4b5563',
                  background: active ? '#fef5e8' : 'transparent',
                  borderLeft: active ? '3px solid #f39e1e' : '3px solid transparent',
                  transition: 'all 0.15s',
                }}
                onMouseEnter={e => { if (!active) e.currentTarget.style.background = '#f9fafb'; }}
                onMouseLeave={e => { if (!active) e.currentTarget.style.background = 'transparent'; }}
              >
                {icon} {label}
              </button>
            );
          })}
        </nav>

        {/* Footer: user + logout */}
        <div style={{ padding: '0.75rem', borderTop: '1px solid #f0f0f0' }}>
          {user && (
            <div style={{ padding: '0.5rem 0.875rem', marginBottom: '0.25rem', background: '#f8fafc', borderRadius: '10px', fontSize: '0.78rem' }}>
              <div style={{ fontWeight: 700, color: '#1f2937' }}>{user.name}</div>
              <div style={{ color: '#9ca3af', fontSize: '0.65rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{user.role}</div>
            </div>
          )}
          <button
            onClick={logout}
            style={{
              display: 'flex', alignItems: 'center', gap: '0.75rem',
              width: '100%', padding: '0.7rem 0.875rem',
              borderRadius: '10px', border: 'none', cursor: 'pointer',
              textAlign: 'left', fontSize: '0.875rem', fontWeight: 500,
              color: '#ef4444', background: 'transparent',
              borderLeft: '3px solid transparent',
            }}
            onMouseEnter={e => { e.currentTarget.style.background = '#fff1f2'; }}
            onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; }}
          >
            <LogOut size={18} /> Logout
          </button>
        </div>
      </aside>
    </>
  );
}

// ─────────────────────────────────────────────
// Dashboard shell – handles all /managercrm /worker-crm /calendar
// Uses useNavigate to change URL + conditionally renders page
// ─────────────────────────────────────────────
function DashboardShell() {
  const location = useLocation();
  const navigate  = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const user = getLoggedInUser();

  // Auto-logout after 15 minutes of inactivity
  useEffect(() => {
    if (!user) return;
    
    let timeoutId;
    const resetTimer = () => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => {
        logoutUser();
        window.location.replace('/managercrm');
      }, 15 * 60 * 1000); // 15 mins
    };

    window.addEventListener('mousemove', resetTimer);
    window.addEventListener('keydown', resetTimer);
    window.addEventListener('click', resetTimer);
    window.addEventListener('scroll', resetTimer);
    
    resetTimer(); // initialize
    
    return () => {
      clearTimeout(timeoutId);
      window.removeEventListener('mousemove', resetTimer);
      window.removeEventListener('keydown', resetTimer);
      window.removeEventListener('click', resetTimer);
      window.removeEventListener('scroll', resetTimer);
    };
  }, [user]);

  if (!user) {
    return <Login />;
  }

  const currentPath = location.pathname;

  const handleNav = (path) => {
    navigate(path);
    setSidebarOpen(false);
  };

  return (
    <div className="app-container">
      <Sidebar
        currentPath={currentPath}
        onNav={handleNav}
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      <div className="main-content">
        {/* Top header */}
        <header className="top-header">
          <button
            onClick={() => setSidebarOpen(true)}
            className="mobile-nav-toggle"
            style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '0.5rem' }}
          >
            <Menu size={24} />
          </button>

          <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: '0.9rem', fontWeight: 700, color: '#111827' }}>{user.name}</div>
              <div style={{ fontSize: '0.7rem', color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{user.role}</div>
            </div>
            <button
              onClick={() => { logoutUser(); window.location.replace('/managercrm'); }}
              style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#ef4444', display: 'flex', alignItems: 'center' }}
            >
              <LogOut size={20} />
            </button>
          </div>
        </header>

        {/* Page content — conditional render based on URL */}
        <main style={{ flex: 1 }}>
          {currentPath === '/managercrm'      && <AdminDashboard user={user} />}
          {currentPath === '/worker-crm' && <WorkerCRM />}
          {currentPath === '/calendar'   && <CalendarView />}
        </main>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
// Public layout
// ─────────────────────────────────────────────
function PublicLayout({ children }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <Navbar />
      <main style={{ flex: 1 }}>{children}</main>
      <Footer />
    </div>
  );
}

// ─────────────────────────────────────────────
// App root
// ─────────────────────────────────────────────
export default function App() {
  return (
    <Router>
      <Routes>
        {/* /login route strictly redirects to /managercrm now that it handles auth internally */}
        <Route path="/login" element={<Navigate to="/managercrm" replace />} />

        {/* Public */}
        <Route path="/" element={<PublicLayout><LandingPage /></PublicLayout>} />
        <Route path="/about" element={<PublicLayout><About /></PublicLayout>} />
        <Route path="/calculator" element={<PublicLayout><Calculator /></PublicLayout>} />
        <Route path="/apply" element={<PublicLayout><ClientForm /></PublicLayout>} />

        {/* Dashboard – all three pages go through DashboardShell */}
        <Route path="/managercrm"      element={<DashboardShell />} />
        <Route path="/worker-crm" element={<DashboardShell />} />
        <Route path="/calendar"   element={<DashboardShell />} />

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}
