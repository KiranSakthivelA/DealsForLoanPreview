import { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import ClientForm from './pages/ClientForm';
import AdminDashboard from './pages/AdminDashboard';
import { Menu } from 'lucide-react';

function AdminLogin({ onLogin }) {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleLogin = (e) => {
    e.preventDefault();
    // Default password for preview: admin123
    if (password === 'admin123') {
      localStorage.setItem('dfl_admin_auth', 'true');
      onLogin();
    } else {
      setError('Invalid password');
    }
  };

  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh', width: '100vw', padding: '1rem', backgroundColor: 'var(--background-color)' }}>
      <div className="card" style={{ padding: '2.5rem', width: '100%', maxWidth: '400px', textAlign: 'center' }}>
        <div style={{ width: '48px', height: '48px', borderRadius: '50%', border: '4px solid var(--primary-color)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem' }}>
          <div style={{ width: '16px', height: '16px', backgroundColor: 'var(--primary-color)', borderRadius: '50%' }}></div>
        </div>
        <h2 style={{ marginBottom: '0.5rem' }}>Admin Portal</h2>
        <p style={{ color: 'var(--text-secondary)', marginBottom: '2rem' }}>Please enter the admin password to access the dashboard.</p>
        
        <form onSubmit={handleLogin}>
          <div className="form-group">
            <input 
              type="password" 
              className="form-control" 
              placeholder="Enter password..." 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              style={{ textAlign: 'center' }}
            />
          </div>
          {error && <div style={{ color: 'var(--error-color)', fontSize: '0.85rem', marginBottom: '1rem', fontWeight: 600 }}>{error}</div>}
          <button type="submit" className="btn btn-primary" style={{ width: '100%' }}>Login</button>
        </form>
        <p style={{ marginTop: '1.5rem', fontSize: '0.75rem', color: 'var(--text-muted)' }}>Hint: The password is <b>admin123</b></p>
      </div>
    </div>
  );
}

// Protected Route Wrapper
function ProtectedAdminRoute({ children }) {
  const [isAuthenticated, setIsAuthenticated] = useState(
    localStorage.getItem('dfl_admin_auth') === 'true'
  );

  if (!isAuthenticated) {
    return <AdminLogin onLogin={() => setIsAuthenticated(true)} />;
  }

  return children;
}

function App() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  return (
    <Router>
      <div className="app-container">
        
        {/* Mobile Sidebar Overlay */}
        <div 
          className={`sidebar-overlay ${isSidebarOpen ? 'open' : ''}`} 
          onClick={() => setIsSidebarOpen(false)}
        ></div>

        <div className={`sidebar-wrapper ${isSidebarOpen ? 'open' : ''}`} style={{ display: 'contents' }}>
          {/* We need to pass a prop or use CSS to toggle the sidebar class */}
          <div className={`sidebar ${isSidebarOpen ? 'open' : ''}`}>
             <Sidebar onClose={() => setIsSidebarOpen(false)} />
          </div>
        </div>
        
        <div className="main-content">
          <header className="top-header" style={{ justifyContent: 'space-between' }}>
            <button 
              className="mobile-nav-toggle"
              onClick={() => setIsSidebarOpen(true)}
            >
              <Menu size={24} />
            </button>
            
            <div className="header-actions" style={{ marginLeft: 'auto' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', cursor: 'pointer', marginLeft: '0.5rem' }}>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>
                  <span style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--text-primary)' }}>Admin User</span>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>admin@dealsforloan.com</span>
                </div>
              </div>
            </div>
          </header>

          <main className="page-content">
            <Routes>
              <Route path="/" element={<ClientForm />} />
              <Route 
                path="/admin" 
                element={
                  <ProtectedAdminRoute>
                    <AdminDashboard />
                  </ProtectedAdminRoute>
                } 
              />
              <Route path="*" element={<Navigate to="/" />} />
            </Routes>
          </main>
        </div>
      </div>
    </Router>
  );
}

export default App;
