import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { FaLeaf, FaLock, FaEnvelope, FaSignInAlt, FaUserCheck } from 'react-icons/fa';

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await login(email, password);
      if (res.success) {
        if (res.user.role === 'admin') navigate('/admin');
        else if (res.user.role === 'expert') navigate('/expert-dashboard');
        else navigate('/dashboard');
      } else {
        setError(res.message || 'Invalid credentials');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickFill = (roleEmail, rolePassword) => {
    setEmail(roleEmail);
    setPassword(rolePassword);
  };

  return (
    <div className="py-5" style={{ minHeight: '80vh' }}>
      <div className="container">
        <div className="row justify-content-center">
          <div className="col-md-8 col-lg-5">
            <div className="card shadow-lg border-0 rounded-4 p-4 p-md-5 bg-white">
              <div className="text-center mb-4">
                <div
                  className="d-inline-flex align-items-center justify-content-center text-white rounded-circle mb-3 shadow"
                  style={{ width: 56, height: 56, background: '#2d6a4f' }}
                >
                  <FaLeaf className="fs-3" />
                </div>
                <h3 className="fw-bold text-dark">Welcome to Agri-Tech</h3>
                <p className="text-muted small">Sign in to manage your farms and crop operations</p>
              </div>

              {error && <div className="alert alert-danger py-2 small">{error}</div>}

              <form onSubmit={handleSubmit}>
                <div className="mb-3">
                  <label className="form-label small fw-semibold">Email Address</label>
                  <div className="input-group">
                    <span className="input-group-text bg-light border-end-0">
                      <FaEnvelope className="text-muted" />
                    </span>
                    <input
                      type="email"
                      className="form-control border-start-0"
                      placeholder="name@example.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                    />
                  </div>
                </div>

                <div className="mb-3">
                  <label className="form-label small fw-semibold">Password</label>
                  <div className="input-group">
                    <span className="input-group-text bg-light border-end-0">
                      <FaLock className="text-muted" />
                    </span>
                    <input
                      type="password"
                      className="form-control border-start-0"
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="btn btn-agri-primary w-100 py-2 fw-semibold d-flex align-items-center justify-content-center gap-2 mb-3"
                >
                  {loading ? (
                    <span className="spinner-border spinner-border-sm" role="status"></span>
                  ) : (
                    <>
                      <FaSignInAlt /> Sign In
                    </>
                  )}
                </button>
              </form>

              {/* Demo Quick-Fill Buttons */}
              <div className="mt-3 p-3 bg-light rounded-3 border">
                <div className="d-flex align-items-center gap-1 text-muted small fw-bold mb-2">
                  <FaUserCheck className="text-success" /> One-Click Demo Credentials:
                </div>
                <div className="d-grid gap-2">
                  <button
                    type="button"
                    className="btn btn-sm btn-outline-success text-start d-flex justify-content-between align-items-center"
                    onClick={() => handleQuickFill('farmer@agritech.com', 'FarmerPassword123!')}
                  >
                    <span>👨‍🌾 <strong>Farmer:</strong> Ramesh Patil</span>
                    <span className="badge bg-success-subtle text-success">Quick Fill</span>
                  </button>

                  <button
                    type="button"
                    className="btn btn-sm btn-outline-primary text-start d-flex justify-content-between align-items-center"
                    onClick={() => handleQuickFill('expert@agritech.com', 'ExpertPassword123!')}
                  >
                    <span>🔬 <strong>Expert:</strong> Dr. Anand Sharma</span>
                    <span className="badge bg-primary-subtle text-primary">Quick Fill</span>
                  </button>

                  <button
                    type="button"
                    className="btn btn-sm btn-outline-danger text-start d-flex justify-content-between align-items-center"
                    onClick={() => handleQuickFill('admin@agritech.com', 'AdminPassword123!')}
                  >
                    <span>🛡️ <strong>Admin:</strong> System Administrator</span>
                    <span className="badge bg-danger-subtle text-danger">Quick Fill</span>
                  </button>
                </div>
              </div>

              <div className="text-center mt-4 text-muted small">
                Don't have an account?{' '}
                <Link to="/register" className="text-success fw-bold text-decoration-none">
                  Register for Free
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
