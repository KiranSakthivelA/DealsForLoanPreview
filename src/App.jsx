import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import ClientForm from './pages/ClientForm';
import AdminDashboard from './pages/AdminDashboard';
import { Bell, Search, Mail } from 'lucide-react';

function App() {
  return (
    <Router>
      <div className="app-container">
        <Sidebar />
        
        <div className="main-content">
          <header className="top-header" style={{ justifyContent: 'flex-end' }}>
            <div className="header-actions">
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
              <Route path="/admin" element={<AdminDashboard />} />
            </Routes>
          </main>
        </div>
      </div>
    </Router>
  );
}

export default App;
