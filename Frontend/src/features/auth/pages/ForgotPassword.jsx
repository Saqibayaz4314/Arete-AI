import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import API_BASE from '../../../utils/api';
import '../auth.form.scss';
import { useToast } from '../../../context/ToastContext';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const toast = useToast();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');
    setLoading(true);

    try {
      const response = await axios.post(
        `${API_BASE}/api/auth/forgot-password`,
        { email },
        { withCredentials: true }
      );
      const msg = response.data.message || 'Email sent successfully.';
      setMessage(msg);
      toast.showSuccess(msg);
    } catch (err) {
      const errMsg = err.response?.data?.message || 'Failed to send recovery email.';
      setError(errMsg);
      toast.showError(errMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="auth-main">
      <div className="auth-container">
        <h1>Recover Password</h1>
        <p style={{ textAlign: 'center', color: 'var(--text-secondary)', marginBottom: '1.5rem' }}>
          Enter your email and we'll send you a link to reset your password.
        </p>

        {error && <div className="error-msg">{error}</div>}
        {message && <div style={{ color: '#8a9a7e', background: 'rgba(138, 154, 126, 0.1)', padding: '0.75rem', borderRadius: '8px', textAlign: 'center', marginBottom: '1rem', border: '1px solid rgba(138, 154, 126, 0.2)' }}>{message}</div>}

        <form onSubmit={handleSubmit}>
          <div className="input-group">
            <label htmlFor="email">Email</label>
            <input
              type="email"
              id="email"
              placeholder="Enter your email address"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <button className="btn-submit" disabled={loading}>
            {loading ? 'Sending...' : 'Send Recovery Email'}
          </button>
        </form>

        <div className="auth-footer">
          <p>Remember your password? <Link to="/login">Login</Link></p>
        </div>
      </div>
    </main>
  );
};

export default ForgotPassword;
