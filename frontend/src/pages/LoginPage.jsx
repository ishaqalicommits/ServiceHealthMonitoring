import React, { useState } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export const LoginPage = () => {
  const [searchParams] = useSearchParams();
  const [isRegister, setIsRegister] = useState(searchParams.get('mode') === 'register');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login, register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (isRegister) {
      if (!username.trim() || !email.trim() || !password) {
        setError('Please fill in all fields.');
        return;
      }
      if (password.length < 6) {
        setError('Password must be at least 6 characters.');
        return;
      }
      if (password !== confirmPassword) {
        setError('Passwords do not match.');
        return;
      }
    } else {
      if (!username.trim() || !password) {
        setError('Please enter your email/username and password.');
        return;
      }
    }

    setLoading(true);
    try {
      if (isRegister) {
        await register(username.trim(), email.trim(), password);
      } else {
        await login(username.trim(), password);
      }
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.error || (isRegister ? 'Registration failed.' : 'Invalid credentials or server unavailable.'));
    } finally {
      setLoading(false);
    }
  };

  const switchMode = (toRegister) => {
    setIsRegister(toRegister);
    setError('');
    setPassword('');
    setConfirmPassword('');
  };

  return (
    <div
      style={{
        backgroundColor: '#0f172a',
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '1.5rem'
      }}
    >
      <div
        className="card border-0 shadow-lg p-4 p-md-5"
        style={{ width: '100%', maxWidth: '440px', borderRadius: '1rem' }}
      >
        {/* Back to Home Link */}
        <div className="mb-3">
          <Link to="/" className="text-decoration-none text-muted small d-inline-flex align-items-center gap-1">
            <i className="bi bi-arrow-left"></i> Back to Landing Page
          </Link>
        </div>

        {/* Brand Header */}
        <div className="text-center mb-4">
          <div className="d-inline-flex align-items-center justify-content-center bg-primary bg-opacity-10 text-primary p-3 rounded-circle mb-3">
            <i className="bi bi-shield-check fs-1"></i>
          </div>
          <h3 className="fw-bold text-dark mb-1">ServiceWatch</h3>
          <p className="text-muted small">Real-Time Service Health & Observability</p>
        </div>

        {/* Tab Switcher */}
        <div className="d-flex bg-light p-1 rounded-3 mb-4 border">
          <button
            type="button"
            className={`btn btn-sm w-50 fw-semibold rounded-2 ${!isRegister ? 'btn-white shadow-sm text-primary bg-white' : 'text-muted'}`}
            onClick={() => switchMode(false)}
          >
            Sign In
          </button>
          <button
            type="button"
            className={`btn btn-sm w-50 fw-semibold rounded-2 ${isRegister ? 'btn-white shadow-sm text-primary bg-white' : 'text-muted'}`}
            onClick={() => switchMode(true)}
          >
            Create Account
          </button>
        </div>

        {error && (
          <div className="alert alert-danger py-2 small mb-3">
            <i className="bi bi-exclamation-triangle me-1"></i> {error}
          </div>
        )}

        <form onSubmit={handleSubmit} autoComplete="on">
          {isRegister && (
            <div className="mb-3">
              <label className="form-label small fw-semibold text-secondary">Username</label>
              <div className="input-group">
                <span className="input-group-text bg-light text-muted">
                  <i className="bi bi-person"></i>
                </span>
                <input
                  type="text"
                  className="form-control"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="e.g. ishaq_ali"
                  required
                  autoFocus
                />
              </div>
            </div>
          )}

          <div className="mb-3">
            <label className="form-label small fw-semibold text-secondary">
              {isRegister ? 'Email Address' : 'Email or Username'}
            </label>
            <div className="input-group">
              <span className="input-group-text bg-light text-muted">
                <i className="bi bi-envelope"></i>
              </span>
              <input
                type={isRegister ? 'email' : 'text'}
                className="form-control"
                value={isRegister ? email : username}
                onChange={(e) => (isRegister ? setEmail(e.target.value) : setUsername(e.target.value))}
                placeholder={isRegister ? 'yourname@example.com' : 'Enter your email or username'}
                required
                autoFocus={!isRegister}
              />
            </div>
          </div>

          <div className="mb-3">
            <label className="form-label small fw-semibold text-secondary">Password</label>
            <div className="input-group">
              <span className="input-group-text bg-light text-muted">
                <i className="bi bi-lock"></i>
              </span>
              <input
                type={showPassword ? 'text' : 'password'}
                className="form-control"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter password"
                required
                minLength="6"
              />
              <button
                type="button"
                className="btn btn-light border text-muted"
                onClick={() => setShowPassword(!showPassword)}
                title={showPassword ? 'Hide password' : 'Show password'}
              >
                <i className={`bi ${showPassword ? 'bi-eye-slash' : 'bi-eye'}`}></i>
              </button>
            </div>
            {isRegister && <div className="form-text small">Must be at least 6 characters.</div>}
          </div>

          {isRegister && (
            <div className="mb-4">
              <label className="form-label small fw-semibold text-secondary">Confirm Password</label>
              <div className="input-group">
                <span className="input-group-text bg-light text-muted">
                  <i className="bi bi-lock-fill"></i>
                </span>
                <input
                  type={showPassword ? 'text' : 'password'}
                  className="form-control"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Re-enter password"
                  required
                />
              </div>
            </div>
          )}

          <button type="submit" className="btn btn-primary w-100 py-2 fw-semibold mt-2" disabled={loading}>
            {loading ? (
              <span>
                <span className="spinner-border spinner-border-sm me-2"></span>
                {isRegister ? 'Creating Account...' : 'Signing In...'}
              </span>
            ) : isRegister ? (
              'Create Account'
            ) : (
              'Sign In to Dashboard'
            )}
          </button>
        </form>

        <div className="mt-4 text-center">
          <small className="text-muted">
            {isRegister ? (
              <>
                Already have an account?{' '}
                <button
                  type="button"
                  className="btn btn-link p-0 small text-decoration-none fw-semibold"
                  onClick={() => switchMode(false)}
                >
                  Sign In
                </button>
              </>
            ) : (
              <>
                Need an account?{' '}
                <button
                  type="button"
                  className="btn btn-link p-0 small text-decoration-none fw-semibold"
                  onClick={() => switchMode(true)}
                >
                  Create one now
                </button>
              </>
            )}
          </small>
        </div>
      </div>
    </div>
  );
};
