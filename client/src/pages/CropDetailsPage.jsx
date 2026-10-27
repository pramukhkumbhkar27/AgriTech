import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../services/api';
import {
  FaSeedling,
  FaCalendarAlt,
  FaWater,
  FaFlask,
  FaArrowLeft,
  FaPlus,
  FaCheckCircle,
  FaCheck,
  FaTractor,
} from 'react-icons/fa';

const STAGES = ['Germination', 'Vegetative', 'Flowering', 'Fruiting', 'Maturity', 'Harvested'];

const CropDetailsPage = () => {
  const { id } = useParams();
  const [crop, setCrop] = useState(null);
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Fertilizer modal
  const [showFertModal, setShowFertModal] = useState(false);
  const [fertForm, setFertForm] = useState({
    fertilizerName: '',
    quantity: '',
    method: 'Drip Fertigation',
    notes: '',
  });

  // Stage update modal
  const [selectedStage, setSelectedStage] = useState('');

  useEffect(() => {
    fetchCropData();
  }, [id]);

  const fetchCropData = async () => {
    try {
      setLoading(true);
      const res = await api.get(`/crops/${id}`);
      if (res.data.success) {
        setCrop(res.data.crop);
        setActivities(res.data.activities || []);
        setSelectedStage(res.data.crop.growthStage);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch crop data');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStage = async (newStage) => {
    try {
      const res = await api.put(`/crops/${id}`, { growthStage: newStage });
      if (res.data.success) {
        setCrop(res.data.crop);
        setSelectedStage(res.data.crop.growthStage);
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to update growth stage');
    }
  };

  const handleAddFertilizer = async (e) => {
    e.preventDefault();
    try {
      const res = await api.post(`/crops/${id}/fertilizer`, fertForm);
      if (res.data.success) {
        setCrop(res.data.crop);
        setShowFertModal(false);
        setFertForm({
          fertilizerName: '',
          quantity: '',
          method: 'Drip Fertigation',
          notes: '',
        });
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to add fertilizer record');
    }
  };

  const handleToggleActivity = async (activityId, currentStatus) => {
    try {
      const newStatus = currentStatus === 'Completed' ? 'Pending' : 'Completed';
      await api.put(`/activities/${activityId}`, { status: newStatus });
      fetchCropData();
    } catch {
      // silent
    }
  };

  if (loading) {
    return (
      <div className="text-center py-5">
        <div className="spinner-border text-success" role="status"></div>
      </div>
    );
  }

  if (error || !crop) {
    return (
      <div className="alert alert-danger my-4">
        {error || 'Crop not found'}
        <div className="mt-2">
          <Link to="/crops" className="btn btn-sm btn-outline-danger">
            Back to Crops
          </Link>
        </div>
      </div>
    );
  }

  const currentStageIndex = STAGES.indexOf(crop.growthStage);

  return (
    <div className="crop-details-page pb-5">
      <div className="mb-3">
        <Link to="/crops" className="text-decoration-none text-muted small fw-bold d-flex align-items-center gap-1">
          <FaArrowLeft /> Back to Crops Management
        </Link>
      </div>

      {/* Main Crop Banner */}
      <div className="card border-0 shadow-sm rounded-4 p-4 mb-4 bg-white">
        <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3">
          <div>
            <div className="d-flex align-items-center gap-2 mb-1">
              <h2 className="fw-bold text-dark mb-0">{crop.name}</h2>
              {crop.variety && <span className="badge bg-light text-dark border">Var: {crop.variety}</span>}
              <span className="badge bg-success-subtle text-success">{crop.healthStatus}</span>
            </div>
            <p className="text-muted small mb-0">
              Farm: <strong>{crop.farm?.name}</strong> • Plot: <strong>{crop.fieldPlot}</strong> • Season: <strong>{crop.season}</strong>
            </p>
          </div>

          <div className="d-flex gap-2">
            <button className="btn btn-agri-primary btn-sm d-flex align-items-center gap-1" onClick={() => setShowFertModal(true)}>
              <FaPlus /> Log Fertilizer Input
            </button>
            {crop.status !== 'Harvested' && (
              <button
                className="btn btn-agri-accent btn-sm d-flex align-items-center gap-1"
                onClick={() => handleUpdateStage('Harvested')}
              >
                <FaCheckCircle /> Mark Harvest Complete
              </button>
            )}
          </div>
        </div>

        <hr className="my-3" />

        {/* Growth Stage Stepper / Timeline */}
        <div className="my-3">
          <div className="d-flex justify-content-between align-items-center mb-2">
            <h6 className="fw-bold text-dark mb-0">Crop Growth Timeline</h6>
            <span className="badge bg-success">
              Stage: {crop.growthStage} ({crop.growthProgressPercentage}%)
            </span>
          </div>

          <div className="row g-2 text-center small my-2">
            {STAGES.map((stg, idx) => {
              const isPast = idx < currentStageIndex;
              const isCurrent = idx === currentStageIndex;

              return (
                <div key={stg} className="col-4 col-md-2">
                  <div
                    className={`p-2 rounded-3 border cursor-pointer transition ${
                      isCurrent
                        ? 'bg-success text-white fw-bold shadow-sm'
                        : isPast
                        ? 'bg-success-subtle text-success'
                        : 'bg-light text-muted'
                    }`}
                    onClick={() => handleUpdateStage(stg)}
                    title="Click to advance growth stage"
                    style={{ cursor: 'pointer' }}
                  >
                    <div style={{ fontSize: '0.7rem' }}>Step {idx + 1}</div>
                    <div className="text-truncate">{stg}</div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Grid: Fertilizer Records & Field Activities */}
      <div className="row g-4 mb-4">
        {/* Fertilizer Application Records */}
        <div className="col-lg-7">
          <div className="card border-0 shadow-sm rounded-4 p-4 bg-white h-100">
            <div className="d-flex justify-content-between align-items-center mb-3">
              <h5 className="fw-bold text-dark mb-0">
                <FaFlask className="text-info me-2" />
                Fertilizer & Nutrient Applications ({crop.fertilizerRecords?.length || 0})
              </h5>
              <button className="btn btn-sm btn-outline-info" onClick={() => setShowFertModal(true)}>
                + Add Record
              </button>
            </div>

            {crop.fertilizerRecords?.length === 0 ? (
              <div className="text-center py-4 text-muted small">
                No fertilizer applications recorded yet for this crop cycle.
              </div>
            ) : (
              <div className="table-responsive">
                <table className="table table-hover align-middle mb-0 small">
                  <thead className="table-light">
                    <tr>
                      <th>Date</th>
                      <th>Fertilizer Name</th>
                      <th>Dosage</th>
                      <th>Method</th>
                      <th>Notes</th>
                    </tr>
                  </thead>
                  <tbody>
                    {crop.fertilizerRecords.map((f, i) => (
                      <tr key={i}>
                        <td>{new Date(f.date).toLocaleDateString()}</td>
                        <td className="fw-semibold text-dark">{f.fertilizerName}</td>
                        <td>{f.quantity}</td>
                        <td><span className="badge bg-light text-dark border">{f.method}</span></td>
                        <td className="text-muted text-truncate" style={{ maxWidth: 180 }}>
                          {f.notes || '—'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

        {/* Scheduled Activities & Irrigation Reminders */}
        <div className="col-lg-5">
          <div className="card border-0 shadow-sm rounded-4 p-4 bg-white h-100">
            <div className="d-flex justify-content-between align-items-center mb-3">
              <h5 className="fw-bold text-dark mb-0">
                <FaCalendarAlt className="text-success me-2" />
                Scheduled Operations
              </h5>
              <Link to="/calendar" className="text-success small fw-bold text-decoration-none">
                Calendar View
              </Link>
            </div>

            {activities.length === 0 ? (
              <div className="text-center py-4 text-muted small">
                No pending activities linked to this crop.
              </div>
            ) : (
              <div className="list-group list-group-flush">
                {activities.map((act) => (
                  <div key={act._id} className="list-group-item d-flex align-items-center justify-content-between px-0 py-2">
                    <div className="d-flex align-items-start gap-2">
                      <button
                        className={`btn btn-sm rounded-circle p-1 mt-1 ${
                          act.status === 'Completed' ? 'btn-success' : 'btn-outline-secondary'
                        }`}
                        style={{ width: 22, height: 22, display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}
                        onClick={() => handleToggleActivity(act._id, act.status)}
                      >
                        <FaCheck style={{ fontSize: '0.65rem' }} />
                      </button>
                      <div>
                        <div className={`fw-semibold small ${act.status === 'Completed' ? 'text-decoration-line-through text-muted' : 'text-dark'}`}>
                          {act.title}
                        </div>
                        <div className="text-muted" style={{ fontSize: '0.75rem' }}>
                          {act.activityType} • {new Date(act.scheduledDate).toLocaleDateString()}
                        </div>
                      </div>
                    </div>
                    <span className="badge bg-secondary-subtle text-secondary small">
                      {act.priority}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Add Fertilizer Modal */}
      {showFertModal && (
        <div className="modal fade show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title fw-bold text-dark">Log Fertilizer Application</h5>
                <button type="button" className="btn-close" onClick={() => setShowFertModal(false)}></button>
              </div>

              <form onSubmit={handleAddFertilizer}>
                <div className="modal-body">
                  <div className="mb-3">
                    <label className="form-label small fw-semibold">Fertilizer Name *</label>
                    <input
                      type="text"
                      className="form-control"
                      placeholder="e.g. 19:19:19 NPK, Urea, DAP, Vermicompost"
                      value={fertForm.fertilizerName}
                      onChange={(e) => setFertForm({ ...fertForm, fertilizerName: e.target.value })}
                      required
                    />
                  </div>

                  <div className="mb-3">
                    <label className="form-label small fw-semibold">Dosage / Quantity *</label>
                    <input
                      type="text"
                      className="form-control"
                      placeholder="e.g. 5 kg/acre or 50 kg bag"
                      value={fertForm.quantity}
                      onChange={(e) => setFertForm({ ...fertForm, quantity: e.target.value })}
                      required
                    />
                  </div>

                  <div className="mb-3">
                    <label className="form-label small fw-semibold">Application Method</label>
                    <select
                      className="form-select"
                      value={fertForm.method}
                      onChange={(e) => setFertForm({ ...fertForm, method: e.target.value })}
                    >
                      <option value="Drip Fertigation">Drip Fertigation (ड्रिप द्वारा)</option>
                      <option value="Foliar Spray">Foliar Spray (पर्णीय छिड़काव)</option>
                      <option value="Broadcasting">Broadcasting / Soil Placement</option>
                      <option value="Basal Drill">Basal Seed-Cum-Fertilizer Drill</option>
                    </select>
                  </div>

                  <div className="mb-3">
                    <label className="form-label small fw-semibold">Field Observations / Notes</label>
                    <textarea
                      rows="2"
                      className="form-control"
                      placeholder="Weather conditions, soil moisture at application time..."
                      value={fertForm.notes}
                      onChange={(e) => setFertForm({ ...fertForm, notes: e.target.value })}
                    ></textarea>
                  </div>
                </div>

                <div className="modal-footer">
                  <button type="button" className="btn btn-light" onClick={() => setShowFertModal(false)}>
                    Cancel
                  </button>
                  <button type="submit" className="btn btn-agri-primary">
                    Save Record
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

export default CropDetailsPage;
