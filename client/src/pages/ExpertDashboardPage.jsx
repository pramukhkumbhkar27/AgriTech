import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import {
  FaUserMd,
  FaCheckCircle,
  FaTimesCircle,
  FaHourglassHalf,
  FaFlask,
  FaMapMarkerAlt,
  FaReply,
  FaShieldAlt,
} from 'react-icons/fa';

const ExpertDashboardPage = () => {
  const { user } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Response Modal
  const [showResponseModal, setShowResponseModal] = useState(false);
  const [selectedConsultation, setSelectedConsultation] = useState(null);
  const [responseForm, setResponseForm] = useState({
    diagnosis: '',
    advice: '',
    suggestedTreatments: '',
  });

  useEffect(() => {
    fetchDashboard();
  }, []);

  const fetchDashboard = async () => {
    try {
      setLoading(true);
      const res = await api.get('/dashboard/expert');
      if (res.data.success) {
        setData(res.data.data);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load expert advisory metrics');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (consultationId, newStatus) => {
    try {
      await api.put(`/consultations/${consultationId}/status`, { status: newStatus });
      fetchDashboard();
    } catch (err) {
      alert(err.response?.data?.message || 'Status update failed');
    }
  };

  const handleOpenResponse = (c) => {
    setSelectedConsultation(c);
    setResponseForm({
      diagnosis: c.expertResponse?.diagnosis || '',
      advice: c.expertResponse?.advice || '',
      suggestedTreatments: c.expertResponse?.suggestedTreatments?.join('\n') || '',
    });
    setShowResponseModal(true);
  };

  const handleSendResponse = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        diagnosis: responseForm.diagnosis,
        advice: responseForm.advice,
        suggestedTreatments: responseForm.suggestedTreatments
          .split('\n')
          .map((t) => t.trim())
          .filter(Boolean),
      };

      const res = await api.put(`/consultations/${selectedConsultation._id}/respond`, payload);
      if (res.data.success) {
        setShowResponseModal(false);
        fetchDashboard();
        alert('Diagnostic advice delivered to farmer successfully!');
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to submit response');
    }
  };

  if (loading) {
    return (
      <div className="text-center py-5">
        <div className="spinner-border text-success" role="status"></div>
      </div>
    );
  }

  const { counts, recentConsultations } = data || { counts: {}, recentConsultations: [] };

  return (
    <div className="expert-dashboard pb-5">
      {/* Header */}
      <div className="mb-4">
        <h2 className="fw-bold mb-1">
          Expert Advisory Portal • <span className="text-success">{user?.name}</span>
        </h2>
        <p className="text-muted small mb-0">
          Specialization: <strong>{user?.specialization}</strong> • Extension Science & Diagnostic Hub
        </p>
      </div>

      {/* Metrics Row */}
      <div className="row g-3 mb-4">
        <div className="col-6 col-md-3">
          <div className="stat-card">
            <div className="stat-icon-wrapper" style={{ background: '#fef3c7', color: '#92400e' }}>
              <FaHourglassHalf />
            </div>
            <div>
              <div className="text-muted small">Pending Requests</div>
              <h3 className="fw-bold mb-0">{counts.pendingRequests || 0}</h3>
            </div>
          </div>
        </div>

        <div className="col-6 col-md-3">
          <div className="stat-card">
            <div className="stat-icon-wrapper" style={{ background: '#e0f2fe', color: '#0369a1' }}>
              <FaFlask />
            </div>
            <div>
              <div className="text-muted small">Active Cases</div>
              <h3 className="fw-bold mb-0">{counts.acceptedCases || 0}</h3>
            </div>
          </div>
        </div>

        <div className="col-6 col-md-3">
          <div className="stat-card">
            <div className="stat-icon-wrapper" style={{ background: '#d1fae5', color: '#065f46' }}>
              <FaCheckCircle />
            </div>
            <div>
              <div className="text-muted small">Completed Consultations</div>
              <h3 className="fw-bold mb-0">{counts.completedConsultations || 0}</h3>
            </div>
          </div>
        </div>

        <div className="col-6 col-md-3">
          <div className="stat-card">
            <div className="stat-icon-wrapper" style={{ background: '#f3e8ff', color: '#7e22ce' }}>
              <FaShieldAlt />
            </div>
            <div>
              <div className="text-muted small">Verified Advisories</div>
              <h3 className="fw-bold mb-0">{counts.verifiedAdvisories || 0}</h3>
            </div>
          </div>
        </div>
      </div>

      {/* Consultations List */}
      <div className="card border-0 shadow-sm rounded-4 p-4 bg-white">
        <h5 className="fw-bold text-dark mb-3">Farmer Inquiries & Field Requests</h5>

        {recentConsultations.length === 0 ? (
          <div className="text-center py-4 text-muted small">
            No farmer consultation requests assigned right now.
          </div>
        ) : (
          <div className="d-flex flex-column gap-3">
            {recentConsultations.map((c) => (
              <div key={c._id} className="p-3 border rounded-3 bg-light">
                <div className="d-flex justify-content-between align-items-start mb-2">
                  <div>
                    <h5 className="fw-bold text-dark mb-0">
                      {c.cropName} • {c.topic}
                    </h5>
                    <div className="text-muted small">
                      Farmer: <strong>{c.farmer?.name}</strong> • Phone: {c.farmer?.phone} • Location:{' '}
                      {c.farm?.name} ({c.farmer?.location?.city || 'Pune'})
                    </div>
                  </div>

                  <span
                    className={`badge ${
                      c.status === 'Completed'
                        ? 'bg-success text-white'
                        : c.status === 'Accepted'
                        ? 'bg-primary text-white'
                        : 'bg-warning text-dark'
                    }`}
                  >
                    {c.status}
                  </span>
                </div>

                <div className="p-3 bg-white rounded border my-2 small">
                  <strong>Problem Description:</strong>
                  <p className="mb-0 text-secondary">{c.problemDescription}</p>
                </div>

                {c.expertResponse?.advice && (
                  <div className="p-2 px-3 bg-success-subtle rounded border border-success-subtle text-success small mb-2">
                    <strong>Prescription Given:</strong> {c.expertResponse.advice}
                  </div>
                )}

                <div className="d-flex justify-content-between align-items-center mt-2 pt-2 border-top">
                  <span className="text-muted small">
                    Requested on: {new Date(c.createdAt).toLocaleDateString()}
                  </span>

                  <div className="d-flex gap-2">
                    {c.status === 'Pending' && (
                      <>
                        <button
                          className="btn btn-sm btn-outline-success"
                          onClick={() => handleUpdateStatus(c._id, 'Accepted')}
                        >
                          Accept Case
                        </button>
                        <button
                          className="btn btn-sm btn-outline-danger"
                          onClick={() => handleUpdateStatus(c._id, 'Rejected')}
                        >
                          Decline
                        </button>
                      </>
                    )}

                    {(c.status === 'Accepted' || c.status === 'Pending') && (
                      <button className="btn btn-sm btn-agri-primary" onClick={() => handleOpenResponse(c)}>
                        <FaReply className="me-1" /> Provide Diagnostic Advice
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Response Modal */}
      {showResponseModal && (
        <div className="modal fade show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-dialog-centered modal-lg">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title fw-bold text-dark">
                  Provide Agronomic Diagnosis & Prescription
                </h5>
                <button type="button" className="btn-close" onClick={() => setShowResponseModal(false)}></button>
              </div>

              <form onSubmit={handleSendResponse}>
                <div className="modal-body">
                  <div className="mb-3">
                    <label className="form-label small fw-semibold">Clinical / Field Diagnosis *</label>
                    <input
                      type="text"
                      className="form-control"
                      placeholder="e.g. Early Blight (Alternaria solani) with secondary magnesium deficiency"
                      value={responseForm.diagnosis}
                      onChange={(e) => setResponseForm({ ...responseForm, diagnosis: e.target.value })}
                      required
                    />
                  </div>

                  <div className="mb-3">
                    <label className="form-label small fw-semibold">Agronomic Scientific Advice *</label>
                    <textarea
                      rows="3"
                      className="form-control"
                      placeholder="Explain root cause, irrigation adjustments, and immediate spray timings..."
                      value={responseForm.advice}
                      onChange={(e) => setResponseForm({ ...responseForm, advice: e.target.value })}
                      required
                    ></textarea>
                  </div>

                  <div className="mb-3">
                    <label className="form-label small fw-semibold">
                      Recommended Treatments & Dosages (1 per line)
                    </label>
                    <textarea
                      rows="3"
                      className="form-control"
                      placeholder="Spray Chlorothalonil 75% WP @ 2g/L&#10;Incorporate 5 tons/ha vermicompost&#10;Install yellow sticky traps"
                      value={responseForm.suggestedTreatments}
                      onChange={(e) => setResponseForm({ ...responseForm, suggestedTreatments: e.target.value })}
                    ></textarea>
                  </div>
                </div>

                <div className="modal-footer">
                  <button type="button" className="btn btn-light" onClick={() => setShowResponseModal(false)}>
                    Cancel
                  </button>
                  <button type="submit" className="btn btn-agri-primary">
                    Transmit Solution to Farmer
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ExpertDashboardPage;
