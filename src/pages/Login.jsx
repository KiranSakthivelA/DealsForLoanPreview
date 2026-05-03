import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { loginUser } from '../store/db';
import { Lock, Mail, AlertCircle, Eye, EyeOff } from 'lucide-react';

export default function Login() {
  const [email, setEmail]       = useState('');
  const [password, setPassword] = useState('');
  const [showPwd, setShowPwd]   = useState(false);
  const [error, setError]       = useState('');
  const [loading, setLoading]   = useState(false);
  const navigate = useNavigate();

  const handleLogin = (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    setTimeout(() => {
      const user = loginUser(email, password);
      if (user) {
        navigate('/admin');
      } else {
        setError('Invalid email or password. Please try again.');
        setLoading(false);
      }
    }, 400);
  };

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: '#f3f4f6',
      padding: '1rem',
      boxSizing: 'border-box',
    }}>
      <div className="card" style={{
        width: '100%',
        maxWidth: '420px',
        padding: '2.5rem 2rem',
        borderRadius: '24px',
        boxShadow: '0 20px 40px rgba(0,0,0,0.1)',
        boxSizing: 'border-box',
      }}>
        {/* Logo + Title */}
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <img
            src="/Asset/f.png"
            alt="Deals For Loan"
            style={{ height: '40px', objectFit: 'contain', marginBottom: '1.25rem' }}
          />
          <h2 style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--accent-color)', margin: 0 }}>
            Manager Login
          </h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', marginTop: '0.35rem' }}>
            Enter your credentials to access the CRM.
          </p>
        </div>

        {/* Error */}
        {error && (
          <div style={{
            backgroundColor: '#fef2f2', color: '#ef4444',
            padding: '0.75rem 1rem', borderRadius: '8px',
            fontSize: '0.83rem', display: 'flex', alignItems: 'center',
            gap: '0.5rem', marginBottom: '1.25rem',
            border: '1px solid #fee2e2',
          }}>
            <AlertCircle size={15} style={{ flexShrink: 0 }} /> {error}
          </div>
        )}

        <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>

          {/* Email */}
          <div>
            <label style={{
              display: 'block', fontSize: '0.85rem', fontWeight: 600,
              color: 'var(--text-secondary)', marginBottom: '0.4rem',
            }}>
              Email Address
            </label>
            <div style={{ position: 'relative' }}>
              <Mail size={16} style={{
                position: 'absolute', left: '13px', top: '50%',
                transform: 'translateY(-50%)', color: 'var(--text-muted)',
                pointerEvents: 'none',
              }} />
              <input
                type="email"
                className="form-control"
                required
                autoComplete="email"
                value={email}
                placeholder="manager@dealsforloan.in"
                onChange={e => setEmail(e.target.value)}
                style={{
                  width: '100%', boxSizing: 'border-box',
                  paddingLeft: '40px', borderRadius: '12px',
                }}
              />
            </div>
          </div>

          {/* Password */}
          <div>
            <label style={{
              display: 'block', fontSize: '0.85rem', fontWeight: 600,
              color: 'var(--text-secondary)', marginBottom: '0.4rem',
            }}>
              Password
            </label>
            <div style={{ position: 'relative' }}>
              <Lock size={16} style={{
                position: 'absolute', left: '13px', top: '50%',
                transform: 'translateY(-50%)', color: 'var(--text-muted)',
                pointerEvents: 'none',
              }} />
              <input
                type={showPwd ? 'text' : 'password'}
                className="form-control"
                required
                autoComplete="current-password"
                value={password}
                placeholder="Enter your password"
                onChange={e => setPassword(e.target.value)}
                style={{
                  width: '100%', boxSizing: 'border-box',
                  paddingLeft: '40px', paddingRight: '42px', borderRadius: '12px',
                }}
              />
              <button
                type="button"
                onClick={() => setShowPwd(v => !v)}
                style={{
                  position: 'absolute', right: '12px', top: '50%',
                  transform: 'translateY(-50%)', background: 'none',
                  border: 'none', cursor: 'pointer', color: 'var(--text-muted)',
                  padding: '4px', display: 'flex', alignItems: 'center',
                }}
              >
                {showPwd ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          {/* Submit */}
          <button
            type="submit"
            className="btn btn-primary"
            disabled={loading}
            style={{
              width: '100%', padding: '0.875rem',
              borderRadius: '12px', fontSize: '1rem', fontWeight: 700,
              opacity: loading ? 0.7 : 1, cursor: loading ? 'not-allowed' : 'pointer',
              marginTop: '0.25rem',
            }}
          >
            {loading ? 'Signing in…' : 'Secure Login'}
          </button>
        </form>

        <div style={{ marginTop: '1.5rem', textAlign: 'center', fontSize: '0.78rem', color: 'var(--text-muted)' }}>
          Contact your administrator if you have login issues.
        </div>
      </div>
    </div>
  );
}
