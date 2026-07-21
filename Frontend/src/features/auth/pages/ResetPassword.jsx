import React, { useState } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import API_BASE, { api } from '../../../utils/api';

import '../auth.form.scss';
import { useToast } from '../../../context/ToastContext';

const ResetPassword = () => {
  const { token } = useParams();
  const navigate = useNavigate();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const toast = useToast();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      toast.showError('Passwords do not match');
      return;
    }

    setLoading(true);

    try {
      const response = await api.put(`/api/auth/reset-password/${token}`, { password });
      const msg = response.data.message || 'Password reset successfully. Redirecting to login...';
      setMessage(msg);
      toast.showSuccess(msg);
      setTimeout(() => navigate('/login'), 3000);
    } catch (err) {
      const errMsg = err.response?.data?.message || 'Failed to reset password. The token may be invalid or expired.';
      setError(errMsg);
      toast.showError(errMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="auth-main">
      <div className="auth-container">
        <h1>Set New Password</h1>

        {error && <div className="error-msg">{error}</div>}
        {message && <div style={{ color: '#8a9a7e', background: 'rgba(138, 154, 126, 0.1)', padding: '0.75rem', borderRadius: '8px', textAlign: 'center', marginBottom: '1rem', border: '1px solid rgba(138, 154, 126, 0.2)' }}>{message}</div>}

        <form onSubmit={handleSubmit}>
          <div className="input-group">
            <label htmlFor="password">New Password</label>
            <input
              type="password"
              id="password"
              placeholder="Enter new password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
          <div className="input-group">
            <label htmlFor="confirmPassword">Confirm New Password</label>
            <input
              type="password"
              id="confirmPassword"
              placeholder="Confirm new password"
              required
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
            />
          </div>
          <button className="btn-submit" disabled={loading || message}>
            {loading ? 'Resetting...' : 'Reset Password'}
          </button>
        </form>

        <div className="auth-footer">
          <p>Remember your password? <Link to="/login">Login</Link></p>
        </div>
      </div>
    </main>
  );
};

export default ResetPassword;
