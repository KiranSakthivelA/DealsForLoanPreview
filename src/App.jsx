import { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import ClientForm from './pages/ClientForm';
import AdminDashboard from './pages/AdminDashboard';
import { Menu } from 'lucide-react';

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
                element={<AdminDashboard />} 
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
