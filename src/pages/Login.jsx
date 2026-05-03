import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { loginUser } from '../store/db';
import { Lock, Mail, AlertCircle, Eye, EyeOff } from 'lucide-react';

// Input styles kept separate so icons never get buried
const inputBase = {
  width: '100%',
  boxSizing: 'border-box',
  padding: '0.75rem 1rem 0.75rem 2.6rem',
  fontSize: '0.9rem',
  fontFamily: 'inherit',
  fontWeight: 500,
  color: '#111827',
  background: '#f9fafb',
  border: '1.5px solid #e5e7eb',
  borderRadius: '10px',
  outline: 'none',
  transition: 'border-color 0.2s, box-shadow 0.2s, background 0.2s',
  // NO transform — keeps icon always visible
};

const iconStyle = {
  position: 'absolute',
  left: '13px',
  top: '50%',
  transform: 'translateY(-50%)',
  color: '#9ca3af',
  pointerEvents: 'none',
  zIndex: 2,              // always above the input
};

export default function Login() {
  const [email, setEmail]       = useState('');
  const [password, setPassword] = useState('');
  const [showPwd, setShowPwd]   = useState(false);
  const [error, setError]       = useState('');
  const [loading, setLoading]   = useState(false);
  const [focusEmail, setFocusEmail] = useState(false);
  const [focusPwd,   setFocusPwd]   = useState(false);
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

  const focusStyle = {
    borderColor: 'var(--primary-color)',
    boxShadow: '0 0 0 3px rgba(243,158,30,0.15)',
    background: '#fff',
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
      <div style={{
        width: '100%',
        maxWidth: '420px',
        background: '#fff',
        borderRadius: '24px',
        boxShadow: '0 20px 40px rgba(0,0,0,0.1)',
        padding: '2.5rem 2rem',
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
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', marginTop: '0.35rem', marginBottom: 0 }}>
            Enter your credentials to access the CRM.
          </p>
        </div>

        {/* Error */}
        {error && (
          <div style={{
            background: '#fef2f2', color: '#ef4444',
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
              <Mail size={16} style={iconStyle} />
              <input
                type="email"
                required
                autoComplete="email"
                value={email}
                placeholder="manager@dealsforloan.in"
                onChange={e => setEmail(e.target.value)}
                onFocus={() => setFocusEmail(true)}
                onBlur={() => setFocusEmail(false)}
                style={{ ...inputBase, ...(focusEmail ? focusStyle : {}) }}
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
              <Lock size={16} style={iconStyle} />
              <input
                type={showPwd ? 'text' : 'password'}
                required
                autoComplete="current-password"
                value={password}
                placeholder="Enter your password"
                onChange={e => setPassword(e.target.value)}
                onFocus={() => setFocusPwd(true)}
                onBlur={() => setFocusPwd(false)}
                style={{
                  ...inputBase,
                  paddingRight: '2.75rem',   // room for eye icon
                  ...(focusPwd ? focusStyle : {}),
                }}
              />
              {/* Eye toggle — always visible */}
              <button
                type="button"
                onClick={() => setShowPwd(v => !v)}
                title={showPwd ? 'Hide password' : 'Show password'}
                style={{
                  position: 'absolute', right: '12px', top: '50%',
                  transform: 'translateY(-50%)',
                  background: 'none', border: 'none', cursor: 'pointer',
                  color: '#9ca3af', padding: '4px',
                  display: 'flex', alignItems: 'center',
                  zIndex: 2,
                }}
              >
                {showPwd ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={loading}
            className="btn btn-primary"
            style={{
              width: '100%',
              padding: '0.875rem',
              borderRadius: '12px',
              fontSize: '1rem',
              fontWeight: 700,
              marginTop: '0.25rem',
              opacity: loading ? 0.7 : 1,
              cursor: loading ? 'not-allowed' : 'pointer',
              transform: 'none',    // override btn-primary hover transform while disabled
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
