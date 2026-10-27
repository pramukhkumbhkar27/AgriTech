import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { FaLeaf, FaUser, FaLock, FaEnvelope, FaPhone, FaMapMarkerAlt, FaUserCheck } from 'react-icons/fa';

const RegisterPage = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'farmer',
    phone: '',
    city: '',
    state: '',
    specialization: '',
    experienceYears: 0,
    bio: '',
  });

  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { register } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters long.');
      return;
    }

    setLoading(true);

    try {
      const payload = {
        name: formData.name,
        email: formData.email,
        password: formData.password,
        role: formData.role,
        phone: formData.phone,
        location: {
          city: formData.city,
          state: formData.state,
        },
        specialization: formData.specialization,
        experienceYears: Number(formData.experienceYears) || 0,
        bio: formData.bio,
      };

      const res = await register(payload);
      if (res.success) {
        if (res.user.role === 'expert') navigate('/expert-dashboard');
        else navigate('/dashboard');
      } else {
        setError(res.message || 'Registration failed');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="py-5" style={{ minHeight: '80vh' }}>
      <div className="container">
        <div className="row justify-content-center">
          <div className="col-md-9 col-lg-7">
            <div className="card shadow-lg border-0 rounded-4 p-4 p-md-5 bg-white">
              <div className="text-center mb-4">
                <div
                  className="d-inline-flex align-items-center justify-content-center text-white rounded-circle mb-3 shadow"
                  style={{ width: 56, height: 56, background: '#2d6a4f' }}
                >
                  <FaLeaf className="fs-3" />
                </div>
                <h3 className="fw-bold text-dark">Join Agri-Tech Platform</h3>
                <p className="text-muted small">Register as a Farmer or an Agricultural Consultant Expert</p>
              </div>

              {error && <div className="alert alert-danger py-2 small">{error}</div>}

              <form onSubmit={handleSubmit}>
                {/* Role Selector Tabs */}
                <div className="row g-2 mb-4">
                  <div className="col-6">
                    <button
                      type="button"
                      className={`btn w-100 py-2 fw-semibold ${
                        formData.role === 'farmer' ? 'btn-agri-primary' : 'btn-outline-secondary'
                      }`}
                      onClick={() => setFormData({ ...formData, role: 'farmer' })}
                    >
                      👨‍🌾 I am a Farmer
                    </button>
                  </div>
                  <div className="col-6">
                    <button
                      type="button"
                      className={`btn w-100 py-2 fw-semibold ${
                        formData.role === 'expert' ? 'btn-agri-primary' : 'btn-outline-secondary'
                      }`}
                      onClick={() => setFormData({ ...formData, role: 'expert' })}
                    >
                      🔬 Agricultural Expert
                    </button>
                  </div>
                </div>

                <div className="row g-3">
                  <div className="col-md-6">
                    <label className="form-label small fw-semibold">Full Name *</label>
                    <div className="input-group">
                      <span className="input-group-text bg-light border-end-0">
                        <FaUser className="text-muted" />
                      </span>
                      <input
                        type="text"
                        name="name"
                        className="form-control border-start-0"
                        placeholder="Ramesh Patil"
                        value={formData.name}
                        onChange={handleChange}
                        required
                      />
                    </div>
                  </div>

                  <div className="col-md-6">
                    <label className="form-label small fw-semibold">Email Address *</label>
                    <div className="input-group">
                      <span className="input-group-text bg-light border-end-0">
                        <FaEnvelope className="text-muted" />
                      </span>
                      <input
                        type="email"
                        name="email"
                        className="form-control border-start-0"
                        placeholder="farmer@example.com"
                        value={formData.email}
                        onChange={handleChange}
                        required
                      />
                    </div>
                  </div>

                  <div className="col-md-6">
                    <label className="form-label small fw-semibold">Password (min 6 chars) *</label>
                    <div className="input-group">
                      <span className="input-group-text bg-light border-end-0">
                        <FaLock className="text-muted" />
                      </span>
                      <input
                        type="password"
                        name="password"
                        className="form-control border-start-0"
                        placeholder="••••••••"
                        value={formData.password}
                        onChange={handleChange}
                        required
                      />
                    </div>
                  </div>

                  <div className="col-md-6">
                    <label className="form-label small fw-semibold">Phone / WhatsApp</label>
                    <div className="input-group">
                      <span className="input-group-text bg-light border-end-0">
                        <FaPhone className="text-muted" />
                      </span>
                      <input
                        type="tel"
                        name="phone"
                        className="form-control border-start-0"
                        placeholder="+91 9822012345"
                        value={formData.phone}
                        onChange={handleChange}
                      />
                    </div>
                  </div>

                  <div className="col-md-6">
                    <label className="form-label small fw-semibold">City / District *</label>
                    <div className="input-group">
                      <span className="input-group-text bg-light border-end-0">
                        <FaMapMarkerAlt className="text-muted" />
                      </span>
                      <input
                        type="text"
                        name="city"
                        className="form-control border-start-0"
                        placeholder="Pune / Ludhiana"
                        value={formData.city}
                        onChange={handleChange}
                        required
                      />
                    </div>
                  </div>

                  <div className="col-md-6">
                    <label className="form-label small fw-semibold">State *</label>
                    <input
                      type="text"
                      name="state"
                      className="form-control"
                      placeholder="Maharashtra / Punjab"
                      value={formData.state}
                      onChange={handleChange}
                      required
                    />
                  </div>

                  {formData.role === 'expert' && (
                    <>
                      <div className="col-md-8">
                        <label className="form-label small fw-semibold">Area of Specialization *</label>
                        <input
                          type="text"
                          name="specialization"
                          className="form-control"
                          placeholder="e.g., Soil Fertility & Integrated Pest Management"
                          value={formData.specialization}
                          onChange={handleChange}
                          required
                        />
                      </div>

                      <div className="col-md-4">
                        <label className="form-label small fw-semibold">Years of Experience</label>
                        <input
                          type="number"
                          name="experienceYears"
                          className="form-control"
                          min="0"
                          value={formData.experienceYears}
                          onChange={handleChange}
                        />
                      </div>

                      <div className="col-12">
                        <label className="form-label small fw-semibold">Professional Bio / Academic Affiliation</label>
                        <textarea
                          name="bio"
                          rows="2"
                          className="form-control"
                          placeholder="Brief background on your research, agronomic consulting, or extension service..."
                          value={formData.bio}
                          onChange={handleChange}
                        ></textarea>
                      </div>
                    </>
                  )}
                </div>

                <div className="mt-4">
                  <button
                    type="submit"
                    disabled={loading}
                    className="btn btn-agri-primary w-100 py-2 fw-semibold d-flex align-items-center justify-content-center gap-2"
                  >
                    {loading ? (
                      <span className="spinner-border spinner-border-sm" role="status"></span>
                    ) : (
                      <>
                        <FaUserCheck /> Complete Registration
                      </>
                    )}
                  </button>
                </div>
              </form>

              <div className="text-center mt-4 text-muted small">
                Already registered?{' '}
                <Link to="/login" className="text-success fw-bold text-decoration-none">
                  Sign In to Your Account
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;
