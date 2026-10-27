import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import {
  FaBug,
  FaPlus,
  FaSearch,
  FaShieldAlt,
  FaExclamationTriangle,
  FaCheckCircle,
  FaMapMarkerAlt,
  FaLeaf,
  FaUserMd,
} from 'react-icons/fa';

const PestAlertsPage = () => {
  const { user } = useAuth();
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Filters
  const [search, setSearch] = useState('');
  const [cropFilter, setCropFilter] = useState('');
  const [severityFilter, setSeverityFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  // Report Modal
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    pestName: '',
    scientificName: '',
    cropAffected: 'Cotton',
    symptoms: '',
    severity: 'Medium',
    affectedRegion: '',
    prevention: '',
    management: '',
  });

  useEffect(() => {
    fetchAlerts();
  }, [cropFilter, severityFilter, statusFilter]);

  const fetchAlerts = async () => {
    try {
      setLoading(true);
      const params = {};
      if (search) params.search = search;
      if (cropFilter) params.crop = cropFilter;
      if (severityFilter) params.severity = severityFilter;
      if (statusFilter) params.status = statusFilter;

      const res = await api.get('/pests', { params });
      if (res.data.success) {
        setAlerts(res.data.alerts);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load pest advisories');
    } finally {
      setLoading(false);
    }
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchAlerts();
  };

  const handleCreateAlert = async (e) => {
    e.preventDefault();
    try {
      const res = await api.post('/pests', formData);
      if (res.data.success) {
        setShowModal(false);
        fetchAlerts();
        setFormData({
          pestName: '',
          scientificName: '',
          cropAffected: 'Cotton',
          symptoms: '',
          severity: 'Medium',
          affectedRegion: '',
          prevention: '',
          management: '',
        });
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to submit alert');
    }
  };

  const handleAcknowledge = async (alertId) => {
    try {
      await api.put(`/pests/${alertId}/status`, { status: 'Acknowledged' });
      fetchAlerts();
    } catch {
      // silent
    }
  };

  const getSeverityBadge = (sev) => {
    if (sev === 'Critical') return 'bg-danger text-white';
    if (sev === 'High') return 'bg-warning text-dark';
    if (sev === 'Medium') return 'bg-primary-subtle text-primary';
    return 'bg-secondary-subtle text-secondary';
  };

  const isExpertOrAdmin = user?.role === 'expert' || user?.role === 'admin';

  return (
    <div className="pest-alerts-page pb-5">
      {/* Header */}
      <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center mb-4 gap-3">
        <div>
          <h2 className="fw-bold mb-1">Pest & Disease Early Warning System</h2>
          <p className="text-muted small mb-0">
            Scientifically verified agricultural disease outbreaks, biological IPM protocols, and farmer alert feeds.
          </p>
        </div>

        <button
          className="btn btn-agri-primary d-flex align-items-center gap-1 shadow-sm"
          onClick={() => setShowModal(true)}
        >
          <FaPlus /> {isExpertOrAdmin ? 'Publish Expert Advisory' : 'Report Suspected Pest'}
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="card border-0 shadow-sm rounded-4 p-3 mb-4 bg-white">
        <div className="row g-3 align-items-center">
          <div className="col-md-5">
            <form onSubmit={handleSearchSubmit}>
              <div className="input-group">
                <span className="input-group-text bg-light border-end-0">
                  <FaSearch className="text-muted" />
                </span>
                <input
                  type="text"
                  className="form-control border-start-0"
                  placeholder="Search by pest, crop, region, or symptoms..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
                <button type="submit" className="btn btn-agri-primary">
                  Search
                </button>
              </div>
            </form>
          </div>

          <div className="col-md-3">
            <select
              className="form-select"
              value={severityFilter}
              onChange={(e) => setSeverityFilter(e.target.value)}
            >
              <option value="">All Severity Levels</option>
              <option value="Critical">Critical</option>
              <option value="High">High</option>
              <option value="Medium">Medium</option>
              <option value="Low">Low</option>
            </select>
          </div>

          <div className="col-md-2">
            <select
              className="form-select"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="">All Statuses</option>
              <option value="New">New</option>
              <option value="Acknowledged">Acknowledged</option>
              <option value="Resolved">Resolved</option>
            </select>
          </div>

          <div className="col-md-2">
            <input
              type="text"
              className="form-control"
              placeholder="Filter Crop..."
              value={cropFilter}
              onChange={(e) => setCropFilter(e.target.value)}
            />
          </div>
        </div>
      </div>

      {/* Alerts Feed */}
      {loading ? (
        <div className="text-center py-5">
          <div className="spinner-border text-success" role="status"></div>
        </div>
      ) : alerts.length === 0 ? (
        <div className="card border-0 shadow-sm rounded-4 p-5 text-center bg-white">
          <FaCheckCircle className="display-4 text-success opacity-50 mb-3 mx-auto" />
          <h5 className="fw-bold text-dark">No active pest alerts matching your search</h5>
          <p className="text-muted small">Fields in this region currently have no critical reported outbreaks.</p>
        </div>
      ) : (
        <div className="row g-4">
          {alerts.map((alert) => (
            <div key={alert._id} className="col-lg-6">
              <div className="card h-100 border-0 shadow-sm rounded-4 p-4 agri-card d-flex flex-column">
                <div className="d-flex justify-content-between align-items-start mb-2">
                  <div>
                    <span className={`badge ${getSeverityBadge(alert.severity)} mb-1`}>
                      {alert.severity} Severity
                    </span>
                    <h5 className="fw-bold text-dark mb-0">{alert.pestName}</h5>
                    {alert.scientificName && (
                      <small className="text-muted fst-italic">({alert.scientificName})</small>
                    )}
                  </div>

                  <span className="badge bg-light text-dark border">
                    Status: {alert.status}
                  </span>
                </div>

                <div className="d-flex align-items-center gap-3 text-muted small my-2">
                  <span>
                    <FaLeaf className="text-success me-1" />
                    Crop: <strong>{alert.cropAffected}</strong>
                  </span>
                  <span>
                    <FaMapMarkerAlt className="text-danger me-1" />
                    Region: <strong>{alert.affectedRegion}</strong>
                  </span>
                </div>

                {alert.isVerifiedAdvisory && (
                  <div className="d-flex align-items-center gap-1 text-success small fw-semibold mb-2">
                    <FaShieldAlt /> Verified by Entomologist / Agronomist ({alert.verifiedBy?.name || 'Dr. Sunita Patel'})
                  </div>
                )}

                <div className="p-3 bg-light rounded-3 border my-2 small">
                  <strong>Symptoms:</strong>
                  <p className="mb-0 text-secondary">{alert.symptoms}</p>
                </div>

                {alert.management && (
                  <div className="p-3 bg-success-subtle rounded-3 border border-success-subtle my-2 small">
                    <strong className="text-success">Integrated Pest Management (IPM) Advisory:</strong>
                    <p className="mb-0 text-dark">{alert.management}</p>
                  </div>
                )}

                {alert.prevention && (
                  <p className="small text-muted mb-3">
                    <strong>Prevention:</strong> {alert.prevention}
                  </p>
                )}

                <div className="d-flex justify-content-between align-items-center mt-auto pt-2 border-top small text-muted">
                  <span>Reported: {new Date(alert.createdAt).toLocaleDateString()}</span>
                  {alert.status === 'New' && (
                    <button
                      className="btn btn-sm btn-outline-success"
                      onClick={() => handleAcknowledge(alert._id)}
                    >
                      Acknowledge Bulletin
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create Alert / Report Modal */}
      {showModal && (
        <div className="modal fade show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-dialog-centered modal-lg">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title fw-bold text-dark">
                  {isExpertOrAdmin ? 'Publish Verified Pest Advisory' : 'Report Suspected Pest / Disease'}
                </h5>
                <button type="button" className="btn-close" onClick={() => setShowModal(false)}></button>
              </div>

              <form onSubmit={handleCreateAlert}>
                <div className="modal-body">
                  <div className="row g-3">
                    <div className="col-md-6">
                      <label className="form-label small fw-semibold">Pest or Disease Name *</label>
                      <input
                        type="text"
                        className="form-control"
                        placeholder="e.g. Pink Bollworm, Fall Armyworm, Leaf Curl"
                        value={formData.pestName}
                        onChange={(e) => setFormData({ ...formData, pestName: e.target.value })}
                        required
                      />
                    </div>

                    <div className="col-md-6">
                      <label className="form-label small fw-semibold">Affected Crop *</label>
                      <input
                        type="text"
                        className="form-control"
                        placeholder="e.g. Cotton, Tomato, Wheat"
                        value={formData.cropAffected}
                        onChange={(e) => setFormData({ ...formData, cropAffected: e.target.value })}
                        required
                      />
                    </div>

                    <div className="col-md-6">
                      <label className="form-label small fw-semibold">Scientific Binomial Name</label>
                      <input
                        type="text"
                        className="form-control"
                        placeholder="e.g. Spodoptera frugiperda"
                        value={formData.scientificName}
                        onChange={(e) => setFormData({ ...formData, scientificName: e.target.value })}
                      />
                    </div>

                    <div className="col-md-3">
                      <label className="form-label small fw-semibold">Severity</label>
                      <select
                        className="form-select"
                        value={formData.severity}
                        onChange={(e) => setFormData({ ...formData, severity: e.target.value })}
                      >
                        <option value="Low">Low</option>
                        <option value="Medium">Medium</option>
                        <option value="High">High</option>
                        <option value="Critical">Critical</option>
                      </select>
                    </div>

                    <div className="col-md-3">
                      <label className="form-label small fw-semibold">Affected Region / District *</label>
                      <input
                        type="text"
                        className="form-control"
                        placeholder="e.g. Pune, Maharashtra"
                        value={formData.affectedRegion}
                        onChange={(e) => setFormData({ ...formData, affectedRegion: e.target.value })}
                        required
                      />
                    </div>

                    <div className="col-12">
                      <label className="form-label small fw-semibold">Observed Symptoms *</label>
                      <textarea
                        rows="3"
                        className="form-control"
                        placeholder="Describe visual symptoms on leaves, stems, pods, or fruits..."
                        value={formData.symptoms}
                        onChange={(e) => setFormData({ ...formData, symptoms: e.target.value })}
                        required
                      ></textarea>
                    </div>

                    <div className="col-12">
                      <label className="form-label small fw-semibold">
                        Recommended IPM Treatment & Spraying Protocol
                      </label>
                      <textarea
                        rows="3"
                        className="form-control"
                        placeholder="Biological controls, neem formulations, chemical dosages..."
                        value={formData.management}
                        onChange={(e) => setFormData({ ...formData, management: e.target.value })}
                      ></textarea>
                    </div>

                    <div className="col-12">
                      <label className="form-label small fw-semibold">Prevention Tips / Cultural Practices</label>
                      <input
                        type="text"
                        className="form-control"
                        placeholder="Pheromone traps, crop rotation, resistant varieties..."
                        value={formData.prevention}
                        onChange={(e) => setFormData({ ...formData, prevention: e.target.value })}
                      />
                    </div>
                  </div>
                </div>

                <div className="modal-footer">
                  <button type="button" className="btn btn-light" onClick={() => setShowModal(false)}>
                    Cancel
                  </button>
                  <button type="submit" className="btn btn-agri-primary">
                    Submit Advisory
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

export default PestAlertsPage;
