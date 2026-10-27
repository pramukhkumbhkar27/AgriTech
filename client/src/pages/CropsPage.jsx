import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import api from '../services/api';
import {
  FaSeedling,
  FaPlus,
  FaBookOpen,
  FaCalendarAlt,
  FaWater,
  FaHeartbeat,
  FaSearch,
  FaFilter,
  FaEye,
  FaTrashAlt,
} from 'react-icons/fa';

const CropsPage = () => {
  const { t } = useTranslation();
  const [crops, setCrops] = useState([]);
  const [farms, setFarms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [referenceCrops, setReferenceCrops] = useState([]);
  const [showRefDrawer, setShowRefDrawer] = useState(false);

  // Filters
  const [search, setSearch] = useState('');
  const [farmFilter, setFarmFilter] = useState('');
  const [seasonFilter, setSeasonFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('Active');

  // Modal
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    farm: '',
    name: '',
    variety: '',
    category: 'Cereal',
    season: 'Kharif',
    fieldPlot: 'Plot 1',
    areaAllocated: 1,
    plantingDate: new Date().toISOString().split('T')[0],
    expectedHarvestDate: '',
    growthStage: 'Germination',
    healthStatus: 'Good',
    notes: '',
  });

  useEffect(() => {
    fetchFarms();
    fetchReferenceDatabase();
  }, []);

  useEffect(() => {
    fetchCrops();
  }, [farmFilter, seasonFilter, statusFilter]);

  const fetchFarms = async () => {
    try {
      const res = await api.get('/farms');
      if (res.data.success) {
        setFarms(res.data.farms);
        if (res.data.farms.length > 0 && !formData.farm) {
          setFormData((prev) => ({ ...prev, farm: res.data.farms[0]._id }));
        }
      }
    } catch {
      // silent
    }
  };

  const fetchReferenceDatabase = async () => {
    try {
      const res = await api.get('/crops/reference/database');
      if (res.data.success) {
        setReferenceCrops(res.data.crops);
      }
    } catch {
      // silent
    }
  };

  const fetchCrops = async () => {
    try {
      setLoading(true);
      const params = {};
      if (search) params.search = search;
      if (farmFilter) params.farm = farmFilter;
      if (seasonFilter) params.season = seasonFilter;
      if (statusFilter) params.status = statusFilter;

      const res = await api.get('/crops', { params });
      if (res.data.success) {
        setCrops(res.data.crops);
      }
    } catch (err) {
      console.warn('Failed to fetch crops:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchCrops();
  };

  const handleCreateCrop = async (e) => {
    e.preventDefault();
    try {
      const res = await api.post('/crops', formData);
      if (res.data.success) {
        setShowModal(false);
        fetchCrops();
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to add crop record');
    }
  };

  const handleDelete = async (cropId, cropName) => {
    if (window.confirm(`Delete crop record "${cropName}"? Associated activities will also be removed.`)) {
      try {
        await api.delete(`/crops/${cropId}`);
        setCrops((prev) => prev.filter((c) => c._id !== cropId));
      } catch (err) {
        alert(err.response?.data?.message || 'Failed to delete crop');
      }
    }
  };

  const handleSelectReferenceCrop = (refCrop) => {
    setFormData((prev) => ({
      ...prev,
      name: refCrop.name.split(' ')[0],
      category: refCrop.category,
      season: refCrop.season,
      notes: `Recommended fertilizer: ${refCrop.recommendedFertilizer}. Optimal pH: ${refCrop.optimalPh}`,
    }));
    setShowRefDrawer(false);
    setShowModal(true);
  };

  return (
    <div className="crops-page pb-5">
      {/* Header */}
      <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center mb-4 gap-3">
        <div>
          <h2 className="fw-bold mb-1">{t('crops.title')}</h2>
          <p className="text-muted small mb-0">
            Track vegetative stages, automated fertigation reminders, and projected harvest dates.
          </p>
        </div>

        <div className="d-flex gap-2">
          <button
            className="btn btn-outline-success d-flex align-items-center gap-1"
            onClick={() => setShowRefDrawer(true)}
          >
            <FaBookOpen /> {t('crops.referenceGuide')}
          </button>
          <button
            className="btn btn-agri-primary d-flex align-items-center gap-1 shadow-sm"
            onClick={() => setShowModal(true)}
          >
            <FaPlus /> {t('crops.addNew')}
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="card border-0 shadow-sm rounded-4 p-3 mb-4 bg-white">
        <div className="row g-3 align-items-center">
          <div className="col-md-4">
            <form onSubmit={handleSearchSubmit}>
              <div className="input-group">
                <span className="input-group-text bg-light border-end-0">
                  <FaSearch className="text-muted" />
                </span>
                <input
                  type="text"
                  className="form-control border-start-0"
                  placeholder="Search by crop, variety, or plot..."
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
              value={farmFilter}
              onChange={(e) => setFarmFilter(e.target.value)}
            >
              <option value="">All Farms</option>
              {farms.map((f) => (
                <option key={f._id} value={f._id}>
                  {f.name}
                </option>
              ))}
            </select>
          </div>

          <div className="col-md-2">
            <select
              className="form-select"
              value={seasonFilter}
              onChange={(e) => setSeasonFilter(e.target.value)}
            >
              <option value="">All Seasons</option>
              <option value="Kharif">Kharif</option>
              <option value="Rabi">Rabi</option>
              <option value="Zaid">Zaid</option>
              <option value="Year-Round">Year-Round</option>
            </select>
          </div>

          <div className="col-md-3">
            <select
              className="form-select"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="">All Statuses</option>
              <option value="Active">Active Crops</option>
              <option value="Harvested">Harvested</option>
            </select>
          </div>
        </div>
      </div>

      {/* Crops Cards List */}
      {loading ? (
        <div className="text-center py-5">
          <div className="spinner-border text-success" role="status"></div>
        </div>
      ) : crops.length === 0 ? (
        <div className="card border-0 shadow-sm rounded-4 p-5 text-center bg-white">
          <FaSeedling className="display-4 text-success opacity-50 mb-3 mx-auto" />
          <h5 className="fw-bold text-dark">No crops matching filter criteria</h5>
          <p className="text-muted small">
            Start a new crop cycle to automatically generate growth stages and farm irrigation schedules.
          </p>
          <div>
            <button className="btn btn-agri-primary" onClick={() => setShowModal(true)}>
              <FaPlus className="me-1" /> Register Crop Cycle
            </button>
          </div>
        </div>
      ) : (
        <div className="row g-4">
          {crops.map((crop) => (
            <div key={crop._id} className="col-md-6 col-lg-4">
              <div className="card h-100 border-0 shadow-sm rounded-4 p-3 agri-card d-flex flex-column">
                <div className="d-flex justify-content-between align-items-start mb-2">
                  <div>
                    <h5 className="fw-bold text-dark mb-0">{crop.name}</h5>
                    <span className="text-muted small">
                      {crop.variety ? `Var: ${crop.variety}` : crop.category}
                    </span>
                  </div>
                  <span
                    className={`badge ${
                      crop.healthStatus === 'Excellent'
                        ? 'bg-success-subtle text-success'
                        : crop.healthStatus === 'Good'
                        ? 'bg-primary-subtle text-primary'
                        : 'bg-warning-subtle text-warning'
                    }`}
                  >
                    {crop.healthStatus}
                  </span>
                </div>

                <div className="text-muted small mb-2">
                  Plot: <strong>{crop.fieldPlot}</strong> • Farm:{' '}
                  <strong>{crop.farm?.name || 'General Farm'}</strong>
                </div>

                {/* Growth Stage Progress */}
                <div className="my-2">
                  <div className="d-flex justify-content-between small text-muted mb-1">
                    <span>
                      Stage: <strong>{crop.growthStage}</strong>
                    </span>
                    <span className="fw-bold">{crop.growthProgressPercentage || 15}%</span>
                  </div>
                  <div className="agri-progress">
                    <div
                      className="agri-progress-bar"
                      style={{ width: `${crop.growthProgressPercentage || 15}%` }}
                    ></div>
                  </div>
                </div>

                <div className="row g-2 my-2 small">
                  <div className="col-6">
                    <div className="p-2 rounded bg-light border">
                      <span className="text-muted d-block" style={{ fontSize: '0.7rem' }}>
                        Sown On
                      </span>
                      <strong>{new Date(crop.plantingDate).toLocaleDateString()}</strong>
                    </div>
                  </div>
                  <div className="col-6">
                    <div className="p-2 rounded bg-light border">
                      <span className="text-muted d-block" style={{ fontSize: '0.7rem' }}>
                        Target Harvest
                      </span>
                      <strong>{new Date(crop.expectedHarvestDate).toLocaleDateString()}</strong>
                    </div>
                  </div>
                </div>

                {crop.notes && (
                  <p className="text-muted small mt-1 mb-3 flex-grow-1 text-truncate-2" style={{ maxHeight: 38, overflow: 'hidden' }}>
                    {crop.notes}
                  </p>
                )}

                <div className="d-flex justify-content-between align-items-center mt-auto pt-2 border-top">
                  <Link to={`/crops/${crop._id}`} className="btn btn-sm btn-outline-success fw-semibold">
                    <FaEye className="me-1" /> View Timeline & Logs
                  </Link>
                  <button
                    className="btn btn-sm btn-light border text-danger"
                    onClick={() => handleDelete(crop._id, crop.name)}
                    title="Delete Crop Record"
                  >
                    <FaTrashAlt />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add Crop Modal */}
      {showModal && (
        <div className="modal fade show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-dialog-centered modal-lg">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title fw-bold text-dark">Register New Crop Cycle</h5>
                <button type="button" className="btn-close" onClick={() => setShowModal(false)}></button>
              </div>

              <form onSubmit={handleCreateCrop}>
                <div className="modal-body">
                  <div className="row g-3">
                    <div className="col-md-6">
                      <label className="form-label small fw-semibold">Select Farm Parcel *</label>
                      <select
                        className="form-select"
                        value={formData.farm}
                        onChange={(e) => setFormData({ ...formData, farm: e.target.value })}
                        required
                      >
                        {farms.map((f) => (
                          <option key={f._id} value={f._id}>
                            {f.name} ({f.totalArea} {f.areaUnit})
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="col-md-6">
                      <label className="form-label small fw-semibold">Crop Name *</label>
                      <input
                        type="text"
                        className="form-control"
                        placeholder="e.g. Cotton, Wheat, Tomato, Soybean"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        required
                      />
                    </div>

                    <div className="col-md-4">
                      <label className="form-label small fw-semibold">Variety / Hybrid</label>
                      <input
                        type="text"
                        className="form-control"
                        placeholder="e.g. Bt-Cotton BG-II / HD-2967"
                        value={formData.variety}
                        onChange={(e) => setFormData({ ...formData, variety: e.target.value })}
                      />
                    </div>

                    <div className="col-md-4">
                      <label className="form-label small fw-semibold">Crop Category</label>
                      <select
                        className="form-select"
                        value={formData.category}
                        onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                      >
                        <option value="Cereal">Cereal (अनाज)</option>
                        <option value="Pulse">Pulse (दलहन)</option>
                        <option value="Vegetable">Vegetable (सब्जी)</option>
                        <option value="Fruit">Fruit (फल)</option>
                        <option value="Oilseed">Oilseed (तिलहन)</option>
                        <option value="Commercial">Commercial / Cash Crop</option>
                        <option value="Spice">Spice</option>
                      </select>
                    </div>

                    <div className="col-md-4">
                      <label className="form-label small fw-semibold">Season</label>
                      <select
                        className="form-select"
                        value={formData.season}
                        onChange={(e) => setFormData({ ...formData, season: e.target.value })}
                      >
                        <option value="Kharif">Kharif (Monsoon)</option>
                        <option value="Rabi">Rabi (Winter)</option>
                        <option value="Zaid">Zaid (Summer)</option>
                        <option value="Year-Round">Year-Round</option>
                      </select>
                    </div>

                    <div className="col-md-4">
                      <label className="form-label small fw-semibold">Field / Plot Identifier</label>
                      <input
                        type="text"
                        className="form-control"
                        placeholder="Plot A-1"
                        value={formData.fieldPlot}
                        onChange={(e) => setFormData({ ...formData, fieldPlot: e.target.value })}
                      />
                    </div>

                    <div className="col-md-4">
                      <label className="form-label small fw-semibold">Planting Date *</label>
                      <input
                        type="date"
                        className="form-control"
                        value={formData.plantingDate}
                        onChange={(e) => setFormData({ ...formData, plantingDate: e.target.value })}
                        required
                      />
                    </div>

                    <div className="col-md-4">
                      <label className="form-label small fw-semibold">Target Harvest Date *</label>
                      <input
                        type="date"
                        className="form-control"
                        value={formData.expectedHarvestDate}
                        onChange={(e) => setFormData({ ...formData, expectedHarvestDate: e.target.value })}
                        required
                      />
                    </div>

                    <div className="col-md-6">
                      <label className="form-label small fw-semibold">Initial Growth Stage</label>
                      <select
                        className="form-select"
                        value={formData.growthStage}
                        onChange={(e) => setFormData({ ...formData, growthStage: e.target.value })}
                      >
                        <option value="Germination">Germination (अंकुरण)</option>
                        <option value="Vegetative">Vegetative (शाकीय वृद्धि)</option>
                        <option value="Flowering">Flowering (फूल आना)</option>
                        <option value="Fruiting">Fruiting (फल बनना)</option>
                        <option value="Maturity">Maturity (परिपक्वता)</option>
                      </select>
                    </div>

                    <div className="col-md-6">
                      <label className="form-label small fw-semibold">Health Condition</label>
                      <select
                        className="form-select"
                        value={formData.healthStatus}
                        onChange={(e) => setFormData({ ...formData, healthStatus: e.target.value })}
                      >
                        <option value="Excellent">Excellent</option>
                        <option value="Good">Good</option>
                        <option value="Moderate">Moderate</option>
                        <option value="At Risk">At Risk</option>
                      </select>
                    </div>

                    <div className="col-12">
                      <label className="form-label small fw-semibold">Field Notes / Seed Treatment Details</label>
                      <textarea
                        rows="2"
                        className="form-control"
                        placeholder="Seed treatment with Trichoderma, sowing depth, or special instructions..."
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
                    Create Crop & Generate Schedule
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Reference Crop Library Drawer / Modal */}
      {showRefDrawer && (
        <div className="modal fade show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-dialog-centered modal-xl modal-dialog-scrollable">
            <div className="modal-content">
              <div className="modal-header bg-light">
                <div>
                  <h5 className="modal-title fw-bold text-dark">
                    <FaBookOpen className="text-success me-2" />
                    Curated Crop Knowledge Library
                  </h5>
                  <small className="text-muted">
                    Reference scientific agronomic recommendations for optimal yield and pest resistance.
                  </small>
                </div>
                <button type="button" className="btn-close" onClick={() => setShowRefDrawer(false)}></button>
              </div>

              <div className="modal-body p-4">
                <div className="row g-4">
                  {referenceCrops.map((crop, idx) => (
                    <div key={idx} className="col-md-6">
                      <div className="card h-100 border p-3 rounded-4 shadow-sm">
                        <div className="d-flex justify-content-between align-items-start mb-2">
                          <div>
                            <h5 className="fw-bold text-dark mb-0">{crop.name}</h5>
                            <small className="text-muted fst-italic">{crop.scientificName}</small>
                          </div>
                          <span className="badge bg-success">{crop.season}</span>
                        </div>

                        <div className="row g-2 small my-2">
                          <div className="col-6">
                            <div className="p-2 bg-light rounded border">
                              <span className="text-muted d-block" style={{ fontSize: '0.7rem' }}>Optimal Soil pH</span>
                              <strong>{crop.optimalPh}</strong>
                            </div>
                          </div>
                          <div className="col-6">
                            <div className="p-2 bg-light rounded border">
                              <span className="text-muted d-block" style={{ fontSize: '0.7rem' }}>Duration</span>
                              <strong>{crop.growthDurationDays} Days</strong>
                            </div>
                          </div>
                        </div>

                        <p className="small text-muted mb-2">
                          💧 <strong>Water Requirement:</strong> {crop.waterRequirement}
                        </p>
                        <p className="small text-muted mb-2">
                          🧪 <strong>Recommended Fertilizer:</strong> {crop.recommendedFertilizer}
                        </p>
                        <p className="small text-muted mb-3">
                          🐛 <strong>Common Pests:</strong> {crop.commonPests?.join(', ')}
                        </p>

                        <div className="mt-auto pt-2 border-top">
                          <button
                            className="btn btn-sm btn-agri-primary w-100"
                            onClick={() => handleSelectReferenceCrop(crop)}
                          >
                            Use this Template to Add Crop
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="modal-footer bg-light">
                <span className="text-muted small me-auto">
                  * Curated educational reference data. Always correlate with local KVK guidelines.
                </span>
                <button type="button" className="btn btn-secondary" onClick={() => setShowRefDrawer(false)}>
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CropsPage;
