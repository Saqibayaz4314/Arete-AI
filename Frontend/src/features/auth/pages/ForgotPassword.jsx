import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import API_BASE, { api } from '../../../utils/api';

import '../auth.form.scss';
import { useToast } from '../../../context/ToastContext';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [emailSent, setEmailSent] = useState(false);
  const [resetUrl, setResetUrl] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const toast = useToast();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');
    setResetUrl('');
    setEmailSent(false);
    setLoading(true);

    try {
      const response = await api.post('/api/auth/forgot-password', { email });
      const msg = response.data.message || 'Reset link generated successfully.';
      setMessage(msg);
      setEmailSent(response.data.emailSent || false);
      if (response.data.resetUrl && !response.data.emailSent) {
        setResetUrl(response.data.resetUrl);
      }
      toast.showSuccess(msg);
    } catch (err) {
      const errMsg = err.response?.data?.message || 'Failed to send recovery email.';
      setError(errMsg);
      toast.showError(errMsg);
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = () => {
    if (resetUrl) {
      navigator.clipboard.writeText(resetUrl);
      setCopied(true);
      toast.showSuccess('Reset link copied to clipboard!');
      setTimeout(() => setCopied(false), 3000);
    }
  };

  return (
    <main className="auth-main">
      <div className="auth-container">
        <h1>Recover Password</h1>
        <p style={{ textAlign: 'center', color: 'var(--text-secondary)', marginBottom: '1.5rem' }}>
          Enter your email to receive a password reset link in your inbox.
        </p>

        {error && <div className="error-msg">{error}</div>}
        
        {message && (
          <div style={{ color: '#818cf8', background: 'rgba(99, 102, 241, 0.1)', padding: '1rem', borderRadius: '10px', textAlign: 'center', marginBottom: '1.5rem', border: '1px solid rgba(99, 102, 241, 0.2)', fontSize: '0.95rem', lineHeight: '1.5' }}>
            {emailSent ? '📩 ' : ''}{message}
          </div>
        )}

        {/* Display reset card ONLY if email delivery was not possible */}
        {resetUrl && !emailSent && (
          <div className="reset-generated-card" style={{ background: 'rgba(15, 23, 42, 0.8)', border: '1px solid rgba(99, 102, 241, 0.3)', borderRadius: '12px', padding: '1.25rem', marginBottom: '1.5rem', textAlign: 'center' }}>
            <h3 style={{ color: '#f8fafc', fontSize: '1.1rem', marginBottom: '0.5rem' }}>🔑 Direct Reset Link Ready</h3>
            <p style={{ color: '#94a3b8', fontSize: '0.85rem', marginBottom: '1rem' }}>Click below to set your new password:</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              <a href={resetUrl} className="btn-submit" style={{ display: 'inline-block', textAlign: 'center', textDecoration: 'none', background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)' }}>
                Reset Password Now ➔
              </a>
              <button type="button" onClick={handleCopy} style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: '#cbd5e1', padding: '0.6rem', borderRadius: '8px', cursor: 'pointer', fontSize: '0.85rem' }}>
                {copied ? '✓ Link Copied!' : '📋 Copy Reset Link'}
              </button>
            </div>
          </div>
        )}

        {!emailSent && !resetUrl && (
          <form onSubmit={handleSubmit}>
            <div className="input-group">
              <label htmlFor="email">Email Address</label>
              <input
                type="email"
                id="email"
                placeholder="Enter your account email address"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <button className="btn-submit" disabled={loading}>
              {loading ? 'Sending...' : 'Send Password Reset Email'}
            </button>
          </form>
        )}

        <div className="auth-footer">
          <p>Remember your password? <Link to="/login">Login</Link></p>
        </div>
      </div>
    </main>
  );
};

export default ForgotPassword;
