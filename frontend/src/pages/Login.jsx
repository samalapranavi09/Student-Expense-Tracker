import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { KeyRound, Mail, AlertTriangle } from 'lucide-react';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [formLoading, setFormLoading] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!email || !password) {
      setError('Please fill in all details.');
      return;
    }

    setFormLoading(true);
    const result = await login(email, password);
    setFormLoading(false);

    if (result.success) {
      navigate('/');
    } else {
      setError(result.error);
    }
  };

  return (
    <div className="auth-page">
      <div className="glass-card auth-card">
        <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
          <span style={{ fontSize: '2.5rem' }}>💰</span>
        </div>
        <h2 className="auth-title">Vardhaman CSE</h2>
        <h3 style={{
          textAlign: 'center',
          color: 'var(--accent-purple)',
          fontFamily: 'var(--font-display)',
          fontSize: '1.05rem',
          fontWeight: 600,
          marginBottom: '1rem',
          letterSpacing: '0.02em'
        }}>
          Student Expense Tracker & AI Advisor
        </h3>
        <p className="auth-subtitle">Log in to manage your budgets and see saving tips</p>

        {error && (
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.6rem',
            background: 'rgba(248, 113, 113, 0.12)',
            color: 'var(--danger)',
            padding: '0.8rem',
            borderRadius: 'var(--radius-sm)',
            fontSize: '0.85rem',
            border: '1px solid rgba(248, 113, 113, 0.2)',
            marginBottom: '1.2rem'
          }}>
            <AlertTriangle size={18} style={{ flexShrink: 0 }} />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label" htmlFor="email-input">
              College Email
            </label>
            <div style={{ position: 'relative' }}>
              <Mail size={18} style={{
                position: 'absolute',
                left: '12px',
                top: '50%',
                transform: 'translateY(-50%)',
                color: 'var(--text-secondary)'
              }} />
              <input
                id="email-input"
                type="email"
                className="form-input"
                placeholder="student@vardhaman.org"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                style={{ paddingLeft: '2.5rem' }}
                required
              />
            </div>
          </div>

          <div className="form-group" style={{ marginBottom: '2rem' }}>
            <label className="form-label" htmlFor="password-input">
              Password
            </label>
            <div style={{ position: 'relative' }}>
              <KeyRound size={18} style={{
                position: 'absolute',
                left: '12px',
                top: '50%',
                transform: 'translateY(-50%)',
                color: 'var(--text-secondary)'
              }} />
              <input
                id="password-input"
                type="password"
                className="form-input"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                style={{ paddingLeft: '2.5rem' }}
                required
              />
            </div>
          </div>

          <button
            type="submit"
            className="btn btn-primary"
            style={{ width: '100%', padding: '0.8rem' }}
            disabled={formLoading}
          >
            {formLoading ? 'Authenticating...' : 'Sign In'}
          </button>
        </form>

        <div className="auth-footer">
          Don't have an account?{' '}
          <Link to="/register" style={{ fontWeight: 600 }}>
            Create Account
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Login;
