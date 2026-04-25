import { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import Navbar from './components/Navbar';
import ClientForm from './pages/ClientForm';
import AdminDashboard from './pages/AdminDashboard';
import LandingPage from './pages/LandingPage';
import Footer from './components/Footer';
import { Menu } from 'lucide-react';

function AppLayout() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const location = useLocation();
  const isAdminRoute = location.pathname.startsWith('/admin');

  if (!isAdminRoute) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', backgroundColor: 'var(--background-color)' }}>
        <Navbar />
        <main style={{ flex: 1 }}>
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/apply" element={<ClientForm />} />
            <Route path="*" element={<Navigate to="/" />} />
          </Routes>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="app-container">
      {/* Mobile Sidebar Overlay */}
      <div 
        className={`sidebar-overlay ${isSidebarOpen ? 'open' : ''}`} 
        onClick={() => setIsSidebarOpen(false)}
      ></div>

      <Sidebar onClose={() => setIsSidebarOpen(false)} isOpen={isSidebarOpen} />
      
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
            <Route path="/admin" element={<AdminDashboard />} />
            <Route path="*" element={<Navigate to="/admin" />} />
          </Routes>
        </main>
      </div>
    </div>
  );
}

function App() {
  return (
    <Router>
      <AppLayout />
    </Router>
  );
}

export default App;
