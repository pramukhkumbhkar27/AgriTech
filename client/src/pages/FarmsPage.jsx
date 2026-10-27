import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import api from '../services/api';
import {
  FaTractor,
  FaPlus,
  FaSearch,
  FaMapMarkerAlt,
  FaRulerCombined,
  FaWater,
  FaLayerGroup,
  FaEdit,
  FaTrashAlt,
  FaEye,
  FaThLarge,
  FaList,
} from 'react-icons/fa';

const FarmsPage = () => {
  const { t } = useTranslation();
  const [farms, setFarms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [soilTypeFilter, setSoilTypeFilter] = useState('');
  const [irrigationFilter, setIrrigationFilter] = useState('');
  const [viewMode, setViewMode] = useState('grid'); // 'grid' or 'list'

  // Modal State
  const [showModal, setShowModal] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [selectedFarmId, setSelectedFarmId] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    city: '',
    state: '',
    address: '',
    totalArea: '',
    areaUnit: 'acres',
    soilType: 'Loamy',
    irrigationType: 'Drip',
    description: '',
  });

  useEffect(() => {
    fetchFarms();
  }, [soilTypeFilter, irrigationFilter]);

  const fetchFarms = async () => {
    try {
      setLoading(true);
      const params = {};
      if (search) params.search = search;
      if (soilTypeFilter) params.soilType = soilTypeFilter;
      if (irrigationFilter) params.irrigationType = irrigationFilter;

      const res = await api.get('/farms', { params });
      if (res.data.success) {
        setFarms(res.data.farms);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch farms');
    } finally {
      setLoading(false);
    }
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchFarms();
  };

  const handleOpenAddModal = () => {
    setIsEditing(false);
    setSelectedFarmId(null);
    setFormData({
      name: '',
      city: '',
      state: '',
      address: '',
      totalArea: '',
      areaUnit: 'acres',
      soilType: 'Loamy',
      irrigationType: 'Drip',
      description: '',
    });
    setShowModal(true);
  };

  const handleOpenEditModal = (farm) => {
    setIsEditing(true);
    setSelectedFarmId(farm._id);
    setFormData({
      name: farm.name,
      city: farm.location?.city || '',
      state: farm.location?.state || '',
      address: farm.location?.address || '',
      totalArea: farm.totalArea,
      areaUnit: farm.areaUnit || 'acres',
      soilType: farm.soilType || 'Loamy',
      irrigationType: farm.irrigationType || 'Drip',
      description: farm.description || '',
    });
    setShowModal(true);
  };

  const handleDelete = async (farmId, farmName) => {
    if (window.confirm(`Are you sure you want to delete farm "${farmName}" and its associated records?`)) {
      try {
        await api.delete(`/farms/${farmId}`);
        setFarms((prev) => prev.filter((f) => f._id !== farmId));
      } catch (err) {
        alert(err.response?.data?.message || 'Failed to delete farm');
      }
    }
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        name: formData.name,
        location: {
          city: formData.city,
          state: formData.state,
          address: formData.address,
        },
        totalArea: Number(formData.totalArea),
        areaUnit: formData.areaUnit,
        soilType: formData.soilType,
        irrigationType: formData.irrigationType,
        description: formData.description,
      };

      if (isEditing) {
        const res = await api.put(`/farms/${selectedFarmId}`, payload);
        if (res.data.success) {
          setShowModal(false);
          fetchFarms();
        }
      } else {
        const res = await api.post('/farms', payload);
        if (res.data.success) {
          setShowModal(false);
          fetchFarms();
        }
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Error saving farm details');
    }
  };

  return (
    <div className="farms-page pb-5">
      {/* Header */}
      <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center mb-4 gap-3">
        <div>
          <h2 className="fw-bold mb-1">{t('farms.title')}</h2>
          <p className="text-muted small mb-0">Register, manage, and monitor all your agricultural land holdings.</p>
        </div>
        <button className="btn btn-agri-primary d-flex align-items-center gap-2 shadow-sm" onClick={handleOpenAddModal}>
          <FaPlus /> {t('farms.addNew')}
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
                  placeholder={t('farms.searchPlaceholder')}
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
              value={soilTypeFilter}
              onChange={(e) => setSoilTypeFilter(e.target.value)}
            >
              <option value="">All Soil Types</option>
              <option value="Black">Black Soil</option>
              <option value="Alluvial">Alluvial Soil</option>
              <option value="Red">Red Soil</option>
              <option value="Loamy">Loamy Soil</option>
              <option value="Clay">Clay Soil</option>
            </select>
          </div>

          <div className="col-md-3">
            <select
              className="form-select"
              value={irrigationFilter}
              onChange={(e) => setIrrigationFilter(e.target.value)}
            >
              <option value="">All Irrigation Systems</option>
              <option value="Drip">Drip Irrigation</option>
              <option value="Sprinkler">Sprinkler System</option>
              <option value="Canal">Canal Irrigation</option>
              <option value="Tube Well">Tube Well</option>
              <option value="Rainfed">Rainfed</option>
            </select>
          </div>

          <div className="col-md-1 d-flex justify-content-end gap-1">
            <button
              className={`btn btn-sm ${viewMode === 'grid' ? 'btn-agri-primary' : 'btn-light border'}`}
              onClick={() => setViewMode('grid')}
              title="Grid View"
            >
              <FaThLarge />
            </button>
            <button
              className={`btn btn-sm ${viewMode === 'list' ? 'btn-agri-primary' : 'btn-light border'}`}
              onClick={() => setViewMode('list')}
              title="List View"
            >
              <FaList />
            </button>
          </div>
        </div>
      </div>

      {/* Farms Display */}
      {loading ? (
        <div className="text-center py-5">
          <div className="spinner-border text-success mb-2" role="status"></div>
          <p className="text-muted small">{t('common.loading')}</p>
        </div>
      ) : farms.length === 0 ? (
        <div className="card border-0 shadow-sm rounded-4 p-5 text-center bg-white">
          <div
            className="d-inline-flex align-items-center justify-content-center text-success bg-light rounded-circle mx-auto mb-3"
            style={{ width: 64, height: 64 }}
          >
            <FaTractor className="fs-3" />
          </div>
          <h5 className="fw-bold text-dark">{t('farms.noFarms')}</h5>
          <p className="text-muted small">Register your land plots to start monitoring crop cycles and soil nutrition.</p>
          <div>
            <button className="btn btn-agri-primary" onClick={handleOpenAddModal}>
              <FaPlus className="me-1" /> {t('farms.addNew')}
            </button>
          </div>
        </div>
      ) : viewMode === 'grid' ? (
        <div className="row g-4">
          {farms.map((farm) => (
            <div key={farm._id} className="col-md-6 col-lg-4">
              <div className="card h-100 border-0 shadow-sm rounded-4 agri-card p-3 d-flex flex-column">
                <div className="d-flex justify-content-between align-items-start mb-2">
                  <h5 className="fw-bold text-dark mb-0">{farm.name}</h5>
                  <span className="badge bg-success-subtle text-success">
                    {farm.activeCropCount || 0} Active Crops
                  </span>
                </div>

                <div className="text-muted small mb-3">
                  <FaMapMarkerAlt className="text-danger me-1" />
                  {farm.location?.city}, {farm.location?.state}
                </div>

                <div className="row g-2 mb-3 small">
                  <div className="col-6">
                    <div className="p-2 rounded bg-light border">
                      <span className="text-muted d-block" style={{ fontSize: '0.7rem' }}>
                        <FaRulerCombined className="me-1" /> {t('farms.area')}
                      </span>
                      <strong>{farm.totalArea} {farm.areaUnit}</strong>
                    </div>
                  </div>
                  <div className="col-6">
                    <div className="p-2 rounded bg-light border">
                      <span className="text-muted d-block" style={{ fontSize: '0.7rem' }}>
                        <FaLayerGroup className="me-1" /> {t('farms.soilType')}
                      </span>
                      <strong>{farm.soilType}</strong>
                    </div>
                  </div>
                  <div className="col-12">
                    <div className="p-2 rounded bg-light border">
                      <span className="text-muted d-block" style={{ fontSize: '0.7rem' }}>
                        <FaWater className="me-1" /> {t('farms.irrigation')}
                      </span>
                      <strong>{farm.irrigationType} System</strong>
                    </div>
                  </div>
                </div>

                {farm.description && (
                  <p className="text-muted small mb-3 flex-grow-1 text-truncate-2" style={{ maxHeight: 40, overflow: 'hidden' }}>
                    {farm.description}
                  </p>
                )}

                <div className="d-flex justify-content-between align-items-center mt-auto pt-2 border-top">
                  <Link to={`/farms/${farm._id}`} className="btn btn-sm btn-outline-success fw-semibold">
                    <FaEye className="me-1" /> View Details
                  </Link>

                  <div className="d-flex gap-1">
                    <button
                      className="btn btn-sm btn-light border text-secondary"
                      onClick={() => handleOpenEditModal(farm)}
                      title="Edit Farm"
                    >
                      <FaEdit />
                    </button>
                    <button
                      className="btn btn-sm btn-light border text-danger"
                      onClick={() => handleDelete(farm._id, farm.name)}
                      title="Delete Farm"
                    >
                      <FaTrashAlt />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        /* List View */
        <div className="card border-0 shadow-sm rounded-4 overflow-hidden bg-white">
          <div className="table-responsive">
            <table className="table table-hover align-middle mb-0">
              <thead className="table-light">
                <tr className="small text-muted">
                  <th>Farm Name</th>
                  <th>Location</th>
                  <th>Area</th>
                  <th>Soil Type</th>
                  <th>Irrigation</th>
                  <th>Active Crops</th>
                  <th className="text-end">Actions</th>
                </tr>
              </thead>
              <tbody>
                {farms.map((farm) => (
                  <tr key={farm._id}>
                    <td className="fw-bold text-dark">{farm.name}</td>
                    <td>{farm.location?.city}, {farm.location?.state}</td>
                    <td>{farm.totalArea} {farm.areaUnit}</td>
                    <td><span className="badge bg-light text-dark border">{farm.soilType}</span></td>
                    <td>{farm.irrigationType}</td>
                    <td><span className="badge bg-success-subtle text-success">{farm.activeCropCount || 0}</span></td>
                    <td className="text-end">
                      <div className="d-inline-flex gap-1">
                        <Link to={`/farms/${farm._id}`} className="btn btn-sm btn-light border text-success">
                          <FaEye />
                        </Link>
                        <button className="btn btn-sm btn-light border text-secondary" onClick={() => handleOpenEditModal(farm)}>
                          <FaEdit />
                        </button>
                        <button className="btn btn-sm btn-light border text-danger" onClick={() => handleDelete(farm._id, farm.name)}>
                          <FaTrashAlt />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Add / Edit Farm Modal */}
      {showModal && (
        <div className="modal fade show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-dialog-centered modal-lg">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title fw-bold text-dark">
                  {isEditing ? 'Edit Farm Parcel' : 'Register New Land Plot / Farm'}
                </h5>
                <button type="button" className="btn-close" onClick={() => setShowModal(false)}></button>
              </div>

              <form onSubmit={handleFormSubmit}>
                <div className="modal-body">
                  <div className="row g-3">
                    <div className="col-md-6">
                      <label className="form-label small fw-semibold">Farm Name *</label>
                      <input
                        type="text"
                        className="form-control"
                        placeholder="e.g. Green Valley Farm"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        required
                      />
                    </div>

                    <div className="col-md-3">
                      <label className="form-label small fw-semibold">City / Village *</label>
                      <input
                        type="text"
                        className="form-control"
                        placeholder="e.g. Pune"
                        value={formData.city}
                        onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                        required
                      />
                    </div>

                    <div className="col-md-3">
                      <label className="form-label small fw-semibold">State *</label>
                      <input
                        type="text"
                        className="form-control"
                        placeholder="e.g. Maharashtra"
                        value={formData.state}
                        onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                        required
                      />
                    </div>

                    <div className="col-md-6">
                      <label className="form-label small fw-semibold">Address / Survey Number</label>
                      <input
                        type="text"
                        className="form-control"
                        placeholder="Gat No. 128, Rui Shivar"
                        value={formData.address}
                        onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                      />
                    </div>

                    <div className="col-md-3">
                      <label className="form-label small fw-semibold">Total Area *</label>
                      <input
                        type="number"
                        step="0.01"
                        min="0.1"
                        className="form-control"
                        placeholder="e.g. 10.5"
                        value={formData.totalArea}
                        onChange={(e) => setFormData({ ...formData, totalArea: e.target.value })}
                        required
                      />
                    </div>

                    <div className="col-md-3">
                      <label className="form-label small fw-semibold">Area Unit</label>
                      <select
                        className="form-select"
                        value={formData.areaUnit}
                        onChange={(e) => setFormData({ ...formData, areaUnit: e.target.value })}
                      >
                        <option value="acres">Acres</option>
                        <option value="hectares">Hectares</option>
                        <option value="bigha">Bigha</option>
                      </select>
                    </div>

                    <div className="col-md-6">
                      <label className="form-label small fw-semibold">Soil Type</label>
                      <select
                        className="form-select"
                        value={formData.soilType}
                        onChange={(e) => setFormData({ ...formData, soilType: e.target.value })}
                      >
                        <option value="Black">Black Soil (Regur)</option>
                        <option value="Alluvial">Alluvial Soil</option>
                        <option value="Red">Red Soil</option>
                        <option value="Loamy">Loamy Soil</option>
                        <option value="Laterite">Laterite Soil</option>
                        <option value="Clay">Clay Soil</option>
                        <option value="Sandy Loam">Sandy Loam</option>
                        <option value="Other">Other</option>
                      </select>
                    </div>

                    <div className="col-md-6">
                      <label className="form-label small fw-semibold">Irrigation Method</label>
                      <select
                        className="form-select"
                        value={formData.irrigationType}
                        onChange={(e) => setFormData({ ...formData, irrigationType: e.target.value })}
                      >
                        <option value="Drip">Drip Irrigation</option>
                        <option value="Sprinkler">Sprinkler Irrigation</option>
                        <option value="Canal">Canal Irrigation</option>
                        <option value="Tube Well">Tube Well</option>
                        <option value="Rainfed">Rainfed</option>
                        <option value="Other">Other</option>
                      </select>
                    </div>

                    <div className="col-12">
                      <label className="form-label small fw-semibold">Description / Notes</label>
                      <textarea
                        rows="2"
                        className="form-control"
                        placeholder="Topography, water source, boundary details..."
                        value={formData.description}
                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      ></textarea>
                    </div>
                  </div>
                </div>

                <div className="modal-footer">
                  <button type="button" className="btn btn-light" onClick={() => setShowModal(false)}>
                    Cancel
                  </button>
                  <button type="submit" className="btn btn-agri-primary">
                    {isEditing ? 'Save Changes' : 'Register Farm'}
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

export default FarmsPage;
