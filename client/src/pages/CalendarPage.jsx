import React, { useState, useEffect } from 'react';
import api from '../services/api';
import {
  FaCalendarAlt,
  FaPlus,
  FaCheck,
  FaClock,
  FaWater,
  FaFlask,
  FaBug,
  FaSeedling,
  FaCheckCircle,
  FaTrashAlt,
} from 'react-icons/fa';

const CalendarPage = () => {
  const [activities, setActivities] = useState([]);
  const [farms, setFarms] = useState([]);
  const [crops, setCrops] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filter
  const [typeFilter, setTypeFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  // Add Activity Modal
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    farm: '',
    crop: '',
    title: '',
    activityType: 'Irrigation',
    scheduledDate: new Date().toISOString().split('T')[0],
    priority: 'Medium',
    notes: '',
  });

  useEffect(() => {
    fetchInitialData();
  }, []);

  useEffect(() => {
    fetchActivities();
  }, [typeFilter, statusFilter]);

  const fetchInitialData = async () => {
    try {
      setLoading(true);
      const [fRes, cRes] = await Promise.all([api.get('/farms'), api.get('/crops')]);
      if (fRes.data.success) {
        setFarms(fRes.data.farms);
        if (fRes.data.farms.length > 0) {
          setFormData((prev) => ({ ...prev, farm: fRes.data.farms[0]._id }));
        }
      }
      if (cRes.data.success) setCrops(cRes.data.crops);
    } catch {
      // silent
    } finally {
      setLoading(false);
    }
  };

  const fetchActivities = async () => {
    try {
      const params = {};
      if (typeFilter) params.type = typeFilter;
      if (statusFilter) params.status = statusFilter;

      const res = await api.get('/activities', { params });
      if (res.data.success) {
        setActivities(res.data.activities);
      }
    } catch {
      // silent
    }
  };

  const handleCreateActivity = async (e) => {
    e.preventDefault();
    try {
      const res = await api.post('/activities', formData);
      if (res.data.success) {
        setShowModal(false);
        fetchActivities();
        setFormData({
          farm: farms[0]?._id || '',
          crop: '',
          title: '',
          activityType: 'Irrigation',
          scheduledDate: new Date().toISOString().split('T')[0],
          priority: 'Medium',
          notes: '',
        });
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to create farm reminder');
    }
  };

  const handleToggleStatus = async (id, currentStatus) => {
    try {
      const newStatus = currentStatus === 'Completed' ? 'Pending' : 'Completed';
      await api.put(`/activities/${id}`, { status: newStatus });
      fetchActivities();
    } catch {
      // silent
    }
  };

  const handleDeleteActivity = async (id) => {
    if (window.confirm('Delete this calendar reminder?')) {
      try {
        await api.delete(`/activities/${id}`);
        setActivities((prev) => prev.filter((a) => a._id !== id));
      } catch {
        // silent
      }
    }
  };

  const getActivityIcon = (type) => {
    if (type === 'Irrigation') return <FaWater className="text-info" />;
    if (type === 'Fertilization') return <FaFlask className="text-warning" />;
    if (type === 'Pesticide' || type === 'Scouting') return <FaBug className="text-danger" />;
    if (type === 'Harvesting') return <FaSeedling className="text-success" />;
    return <FaCalendarAlt className="text-secondary" />;
  };

  return (
    <div className="calendar-page pb-5">
      {/* Header */}
      <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center mb-4 gap-3">
        <div>
          <h2 className="fw-bold mb-1">Farm Activity Calendar & Operations Schedule</h2>
          <p className="text-muted small mb-0">
            Never miss an irrigation cycle, fertilizer application, scouting date, or harvest window.
          </p>
        </div>

        <button
          className="btn btn-agri-primary d-flex align-items-center gap-1 shadow-sm"
          onClick={() => setShowModal(true)}
        >
          <FaPlus /> Add Farm Reminder / Operation
        </button>
      </div>

      {/* Filter Bar */}
      <div className="card border-0 shadow-sm rounded-4 p-3 mb-4 bg-white">
        <div className="row g-3 align-items-center">
          <div className="col-md-6">
            <select
              className="form-select"
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
            >
              <option value="">All Operation Types</option>
              <option value="Irrigation">Irrigation</option>
              <option value="Fertilization">Fertilization</option>
              <option value="Pesticide">Pesticide / Spraying</option>
              <option value="Weeding">Weeding & Intercultural</option>
              <option value="Harvesting">Harvesting</option>
              <option value="Scouting">Pest Scouting</option>
            </select>
          </div>

          <div className="col-md-6">
            <select
              className="form-select"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="">All Statuses</option>
              <option value="Pending">Pending Operations</option>
              <option value="Completed">Completed Operations</option>
            </select>
          </div>
        </div>
      </div>

      {/* Timeline List */}
      {activities.length === 0 ? (
        <div className="card border-0 shadow-sm rounded-4 p-5 text-center bg-white">
          <FaCalendarAlt className="display-4 text-success opacity-50 mb-3 mx-auto" />
          <h5 className="fw-bold text-dark">No scheduled farm activities</h5>
          <p className="text-muted small">Schedule field operations or register crops to auto-generate reminders.</p>
          <div>
            <button className="btn btn-agri-primary" onClick={() => setShowModal(true)}>
              <FaPlus className="me-1" /> Add Reminder
            </button>
          </div>
        </div>
      ) : (
        <div className="d-flex flex-column gap-3">
          {activities.map((act) => (
            <div
              key={act._id}
              className={`card border-0 shadow-sm rounded-4 p-3 ${
                act.status === 'Completed' ? 'bg-light opacity-75' : 'bg-white'
              }`}
            >
              <div className="d-flex justify-content-between align-items-center">
                <div className="d-flex align-items-center gap-3">
                  <button
                    className={`btn btn-sm rounded-circle p-2 ${
                      act.status === 'Completed' ? 'btn-success' : 'btn-outline-secondary'
                    }`}
                    style={{ width: 34, height: 34, display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}
                    onClick={() => handleToggleStatus(act._id, act.status)}
                    title="Toggle completed"
                  >
                    <FaCheck />
                  </button>

                  <div>
                    <div className="d-flex align-items-center gap-2">
                      {getActivityIcon(act.activityType)}
                      <span
                        className={`fw-bold fs-6 ${
                          act.status === 'Completed' ? 'text-decoration-line-through text-muted' : 'text-dark'
                        }`}
                      >
                        {act.title}
                      </span>
                    </div>

                    <div className="text-muted small mt-1">
                      Farm: <strong>{act.farm?.name}</strong>{' '}
                      {act.crop && (
                        <span>
                          • Crop: <strong>{act.crop?.name}</strong> ({act.crop?.growthStage})
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="d-flex align-items-center gap-3">
                  <div className="text-end d-none d-sm-block">
                    <div className="fw-bold small text-dark">
                      <FaClock className="me-1 text-muted" />
                      {new Date(act.scheduledDate).toLocaleDateString()}
                    </div>
                    <span
                      className={`badge ${
                        act.priority === 'High'
                          ? 'bg-danger-subtle text-danger'
                          : 'bg-secondary-subtle text-secondary'
                      }`}
                      style={{ fontSize: '0.65rem' }}
                    >
                      {act.priority} Priority
                    </span>
                  </div>

                  <button
                    className="btn btn-sm btn-light border text-danger"
                    onClick={() => handleDeleteActivity(act._id)}
                    title="Delete Reminder"
                  >
                    <FaTrashAlt />
                  </button>
                </div>
              </div>

              {act.notes && (
                <p className="text-muted small mb-0 mt-2 ps-5 border-start ms-4">
                  {act.notes}
                </p>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Add Reminder Modal */}
      {showModal && (
        <div className="modal fade show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-dialog-centered modal-lg">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title fw-bold text-dark">Schedule Farm Operation / Reminder</h5>
                <button type="button" className="btn-close" onClick={() => setShowModal(false)}></button>
              </div>

              <form onSubmit={handleCreateActivity}>
                <div className="modal-body">
                  <div className="row g-3">
                    <div className="col-md-6">
                      <label className="form-label small fw-semibold">Target Farm *</label>
                      <select
                        className="form-select"
                        value={formData.farm}
                        onChange={(e) => setFormData({ ...formData, farm: e.target.value })}
                        required
                      >
                        {farms.map((f) => (
                          <option key={f._id} value={f._id}>
                            {f.name}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="col-md-6">
                      <label className="form-label small fw-semibold">Associated Crop</label>
                      <select
                        className="form-select"
                        value={formData.crop}
                        onChange={(e) => setFormData({ ...formData, crop: e.target.value })}
                      >
                        <option value="">General Farm Activity (No specific crop)</option>
                        {crops.map((c) => (
                          <option key={c._id} value={c._id}>
                            {c.name} ({c.fieldPlot})
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="col-md-8">
                      <label className="form-label small fw-semibold">Activity Title *</label>
                      <input
                        type="text"
                        className="form-control"
                        placeholder="e.g. Run 3-hour drip fertigation with 19:19:19"
                        value={formData.title}
                        onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                        required
                      />
                    </div>

                    <div className="col-md-4">
                      <label className="form-label small fw-semibold">Operation Type</label>
                      <select
                        className="form-select"
                        value={formData.activityType}
                        onChange={(e) => setFormData({ ...formData, activityType: e.target.value })}
                      >
                        <option value="Irrigation">Irrigation (सिंचाई)</option>
                        <option value="Fertilization">Fertilization (उर्वरक)</option>
                        <option value="Pesticide">Pesticide / Spraying</option>
                        <option value="Weeding">Weeding / Intercultural</option>
                        <option value="Scouting">Pest Scouting</option>
                        <option value="Harvesting">Harvesting (कटाई)</option>
                        <option value="Soil Testing">Soil Testing</option>
                      </select>
                    </div>

                    <div className="col-md-6">
                      <label className="form-label small fw-semibold">Scheduled Date *</label>
                      <input
                        type="date"
                        className="form-control"
                        value={formData.scheduledDate}
                        onChange={(e) => setFormData({ ...formData, scheduledDate: e.target.value })}
                        required
                      />
                    </div>

                    <div className="col-md-6">
                      <label className="form-label small fw-semibold">Priority</label>
                      <select
                        className="form-select"
                        value={formData.priority}
                        onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                      >
                        <option value="Low">Low</option>
                        <option value="Medium">Medium</option>
                        <option value="High">High</option>
                      </select>
                    </div>

                    <div className="col-12">
                      <label className="form-label small fw-semibold">Notes & Instructions</label>
                      <textarea
                        rows="2"
                        className="form-control"
                        placeholder="Equipment details, valve sequence, operator instructions..."
                        value={formData.notes}
                        onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                      ></textarea>
                    </div>
                  </div>
                </div>

                <div className="modal-footer">
                  <button type="button" className="btn btn-light" onClick={() => setShowModal(false)}>
                    Cancel
                  </button>
                  <button type="submit" className="btn btn-agri-primary">
                    Save to Farm Calendar
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

export default CalendarPage;
