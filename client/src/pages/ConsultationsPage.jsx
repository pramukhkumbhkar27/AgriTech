import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import {
  FaUserMd,
  FaPlus,
  FaCalendarAlt,
  FaCheckCircle,
  FaHourglassHalf,
  FaComments,
  FaUserGraduate,
  FaFlask,
  FaTimesCircle,
} from 'react-icons/fa';

const TOPICS = [
  'Crop Health & Disease',
  'Soil Fertility & Nutrients',
  'Irrigation Management',
  'Pest Control & Spraying',
  'Yield Optimization',
  'Organic Certification & Practice',
  'Other Farming Advisory',
];

const ConsultationsPage = () => {
  const { user } = useAuth();
  const [experts, setExperts] = useState([]);
  const [consultations, setConsultations] = useState([]);
  const [farms, setFarms] = useState([]);
  const [loading, setLoading] = useState(true);

  // Modal
  const [showModal, setShowModal] = useState(false);
  const [selectedExpert, setSelectedExpert] = useState(null);
  const [formData, setFormData] = useState({
    expertId: '',
    farmId: '',
    cropName: '',
    topic: 'Crop Health & Disease',
    urgency: 'Normal',
    preferredDate: new Date(Date.now() + 2 * 86400000).toISOString().split('T')[0],
    problemDescription: '',
  });

  useEffect(() => {
    fetchInitialData();
  }, []);

  const fetchInitialData = async () => {
    try {
      setLoading(true);
      const [eRes, cRes, fRes] = await Promise.all([
        api.get('/auth/experts'),
        api.get('/consultations'),
        api.get('/farms'),
      ]);

      if (eRes.data.success) setExperts(eRes.data.experts);
      if (cRes.data.success) setConsultations(cRes.data.consultations);
      if (fRes.data.success) {
        setFarms(fRes.data.farms);
        if (fRes.data.farms.length > 0) {
          setFormData((prev) => ({ ...prev, farmId: fRes.data.farms[0]._id }));
        }
      }
    } catch {
      // silent
    } finally {
      setLoading(false);
    }
  };

  const handleOpenConsultationModal = (expert) => {
    setSelectedExpert(expert);
    setFormData((prev) => ({ ...prev, expertId: expert._id }));
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await api.post('/consultations', formData);
      if (res.data.success) {
        setShowModal(false);
        setConsultations((prev) => [res.data.consultation, ...prev]);
        setFormData({
          expertId: '',
          farmId: farms[0]?._id || '',
          cropName: '',
          topic: 'Crop Health & Disease',
          urgency: 'Normal',
          preferredDate: new Date(Date.now() + 2 * 86400000).toISOString().split('T')[0],
          problemDescription: '',
        });
        alert('Consultation request submitted to expert successfully!');
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to submit consultation request');
    }
  };

  const getStatusBadge = (st) => {
    if (st === 'Completed') return 'bg-success text-white';
    if (st === 'Accepted') return 'bg-primary text-white';
    if (st === 'Rejected') return 'bg-danger text-white';
    return 'bg-warning text-dark';
  };

  return (
    <div className="consultations-page pb-5">
      {/* Header */}
      <div className="mb-4">
        <h2 className="fw-bold mb-1">Agricultural Expert Consultations</h2>
        <p className="text-muted small mb-0">
          Connect directly with certified agronomists, soil chemists, and entomologists for personalized crop guidance.
        </p>
      </div>

      {/* Verified Experts Directory */}
      <div className="card border-0 shadow-sm rounded-4 p-4 mb-4 bg-white">
        <h5 className="fw-bold text-dark mb-3 d-flex align-items-center gap-2">
          <FaUserGraduate className="text-success" />
          Verified Agricultural Scientists & Extension Specialists
        </h5>

        <div className="row g-4">
          {experts.map((exp) => (
            <div key={exp._id} className="col-md-6 col-lg-6">
              <div className="card h-100 border rounded-4 p-3 bg-light shadow-sm d-flex flex-column">
                <div className="d-flex align-items-center gap-3 mb-3">
                  <div
                    className="rounded-circle d-flex align-items-center justify-content-center text-white fw-bold fs-4 shadow-sm"
                    style={{ width: 56, height: 56, background: '#2d6a4f' }}
                  >
                    {exp.name.charAt(3) || 'E'}
                  </div>
                  <div>
                    <h5 className="fw-bold text-dark mb-0">{exp.name}</h5>
                    <span className="badge bg-success-subtle text-success">
                      {exp.experienceYears}+ Years Field Experience
                    </span>
                  </div>
                </div>

                <div className="mb-2 small">
                  <strong>Specialization:</strong>{' '}
                  <span className="text-secondary">{exp.specialization}</span>
                </div>

                <div className="mb-2 small text-muted">
                  <strong>Languages:</strong> {exp.languages?.join(', ')}
                </div>

                {exp.bio && <p className="small text-muted flex-grow-1 mb-3">{exp.bio}</p>}

                <div className="mt-auto pt-2 border-top">
                  <button
                    className="btn btn-agri-primary btn-sm w-100 fw-semibold"
                    onClick={() => handleOpenConsultationModal(exp)}
                  >
                    Request Advisory Consultation
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Farmer's Consultations History & Responses */}
      <div className="card border-0 shadow-sm rounded-4 p-4 bg-white">
        <h5 className="fw-bold text-dark mb-3 d-flex align-items-center gap-2">
          <FaComments className="text-primary" />
          My Consultation Inquiries & Agronomic Prescriptions
        </h5>

        {loading ? (
          <div className="text-center py-5">
            <div className="spinner-border text-success" role="status"></div>
          </div>
        ) : consultations.length === 0 ? (
          <div className="text-center py-4 text-muted small">
            You have not requested any consultations yet. Select an expert above to book an inquiry.
          </div>
        ) : (
          <div className="d-flex flex-column gap-3">
            {consultations.map((c) => (
              <div key={c._id} className="p-3 border rounded-3 bg-light">
                <div className="d-flex justify-content-between align-items-start mb-2">
                  <div>
                    <span className="fw-bold text-dark fs-6">{c.cropName} • {c.topic}</span>
                    <div className="text-muted small">
                      Consultant: <strong>{c.expert?.name}</strong> • Preferred Date:{' '}
                      {new Date(c.preferredDate).toLocaleDateString()}
                    </div>
                  </div>

                  <span className={`badge ${getStatusBadge(c.status)}`}>
                    {c.status}
                  </span>
                </div>

                <div className="p-2 bg-white rounded border my-2 small">
                  <strong>Problem Description:</strong>
                  <p className="mb-0 text-muted">{c.problemDescription}</p>
                </div>

                {/* If completed, show Expert Response */}
                {c.expertResponse?.advice && (
                  <div className="p-3 bg-success-subtle rounded-3 border border-success-subtle mt-3 small">
                    <div className="d-flex align-items-center gap-2 text-success fw-bold mb-1">
                      <FaCheckCircle /> Expert Diagnosis: {c.expertResponse.diagnosis}
                    </div>
                    <p className="mb-2 text-dark">
                      <strong>Agronomic Advice:</strong> {c.expertResponse.advice}
                    </p>

                    {c.expertResponse.suggestedTreatments?.length > 0 && (
                      <div>
                        <strong>Recommended Protocol:</strong>
                        <ul className="mb-0 ps-3">
                          {c.expertResponse.suggestedTreatments.map((t, idx) => (
                            <li key={idx}>{t}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Request Consultation Modal */}
      {showModal && (
        <div className="modal fade show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-dialog-centered modal-lg">
            <div className="modal-content">
              <div className="modal-header">
                <div>
                  <h5 className="modal-title fw-bold text-dark">
                    Consultation Request with {selectedExpert?.name}
                  </h5>
                  <small className="text-muted">{selectedExpert?.specialization}</small>
                </div>
                <button type="button" className="btn-close" onClick={() => setShowModal(false)}></button>
              </div>

              <form onSubmit={handleSubmit}>
                <div className="modal-body">
                  <div className="row g-3">
                    <div className="col-md-6">
                      <label className="form-label small fw-semibold">Subject Crop *</label>
                      <input
                        type="text"
                        className="form-control"
                        placeholder="e.g. Cotton, Tomato, Wheat"
                        value={formData.cropName}
                        onChange={(e) => setFormData({ ...formData, cropName: e.target.value })}
                        required
                      />
                    </div>

                    <div className="col-md-6">
                      <label className="form-label small fw-semibold">Consultation Topic *</label>
                      <select
                        className="form-select"
                        value={formData.topic}
                        onChange={(e) => setFormData({ ...formData, topic: e.target.value })}
                        required
                      >
                        {TOPICS.map((top) => (
                          <option key={top} value={top}>
                            {top}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="col-md-6">
                      <label className="form-label small fw-semibold">Associated Farm Parcel</label>
                      <select
                        className="form-select"
                        value={formData.farmId}
                        onChange={(e) => setFormData({ ...formData, farmId: e.target.value })}
                      >
                        {farms.map((f) => (
                          <option key={f._id} value={f._id}>
                            {f.name} ({f.location?.city})
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="col-md-3">
                      <label className="form-label small fw-semibold">Urgency Level</label>
                      <select
                        className="form-select"
                        value={formData.urgency}
                        onChange={(e) => setFormData({ ...formData, urgency: e.target.value })}
                      >
                        <option value="Normal">Normal</option>
                        <option value="High">High</option>
                        <option value="Critical">Critical</option>
                      </select>
                    </div>

                    <div className="col-md-3">
                      <label className="form-label small fw-semibold">Preferred Date *</label>
                      <input
                        type="date"
                        className="form-control"
                        value={formData.preferredDate}
                        onChange={(e) => setFormData({ ...formData, preferredDate: e.target.value })}
                        required
                      />
                    </div>

                    <div className="col-12">
                      <label className="form-label small fw-semibold">
                        Detailed Problem Description & Symptoms *
                      </label>
                      <textarea
                        rows="4"
                        className="form-control"
                        placeholder="Describe yellowing, leaf spot pattern, pest infestation, soil type, and any past chemical sprays..."
                        value={formData.problemDescription}
                        onChange={(e) => setFormData({ ...formData, problemDescription: e.target.value })}
                        required
                        minLength={10}
                      ></textarea>
                    </div>
                  </div>
                </div>

                <div className="modal-footer">
                  <button type="button" className="btn btn-light" onClick={() => setShowModal(false)}>
                    Cancel
                  </button>
                  <button type="submit" className="btn btn-agri-primary">
                    Submit Inquiry
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

export default ConsultationsPage;
