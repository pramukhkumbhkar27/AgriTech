import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../services/api';
import {
  FaTractor,
  FaMapMarkerAlt,
  FaRulerCombined,
  FaWater,
  FaLayerGroup,
  FaSeedling,
  FaVial,
  FaPlus,
  FaArrowLeft,
  FaCloudSun,
} from 'react-icons/fa';

const FarmDetailsPage = () => {
  const { id } = useParams();
  const [farm, setFarm] = useState(null);
  const [crops, setCrops] = useState([]);
  const [soilTests, setSoilTests] = useState([]);
  const [weather, setWeather] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchFarmData();
  }, [id]);

  const fetchFarmData = async () => {
    try {
      setLoading(true);
      const res = await api.get(`/farms/${id}`);
      if (res.data.success) {
        setFarm(res.data.farm);
        setCrops(res.data.crops || []);
        setSoilTests(res.data.recentSoilTests || []);

        // Also fetch weather for this farm
        try {
          const wRes = await api.get(`/weather/farm/${id}`);
          if (wRes.data.success) {
            setWeather(wRes.data.weather);
          }
        } catch {
          // ignore weather failure
        }
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load farm details');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="text-center py-5">
        <div className="spinner-border text-success" role="status"></div>
      </div>
    );
  }

  if (error || !farm) {
    return (
      <div className="alert alert-danger my-4">
        {error || 'Farm not found'}
        <div className="mt-2">
          <Link to="/farms" className="btn btn-sm btn-outline-danger">
            Back to Farms
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="farm-details-page pb-5">
      <div className="mb-3">
        <Link to="/farms" className="text-decoration-none text-muted small fw-bold d-flex align-items-center gap-1">
          <FaArrowLeft /> Back to My Farms
        </Link>
      </div>

      {/* Header Banner */}
      <div className="card border-0 shadow-sm rounded-4 p-4 mb-4 bg-white">
        <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3">
          <div>
            <div className="d-flex align-items-center gap-2 mb-1">
              <h2 className="fw-bold text-dark mb-0">{farm.name}</h2>
              <span className="badge bg-success-subtle text-success">Active Plot</span>
            </div>
            <p className="text-muted small mb-0">
              <FaMapMarkerAlt className="text-danger me-1" />
              {farm.location?.address && `${farm.location.address}, `}
              {farm.location?.city}, {farm.location?.state}, {farm.location?.country}
            </p>
          </div>

          <div className="d-flex gap-2">
            <Link to="/crops" className="btn btn-agri-primary btn-sm d-flex align-items-center gap-1">
              <FaPlus /> Register Crop Cycle
            </Link>
            <Link to="/soil" className="btn btn-agri-secondary btn-sm d-flex align-items-center gap-1">
              <FaVial /> Log Soil Test
            </Link>
          </div>
        </div>

        <hr className="my-3" />

        {/* Farm Specs */}
        <div className="row g-3 small">
          <div className="col-6 col-md-3">
            <div className="p-3 rounded-3 bg-light border">
              <div className="text-muted mb-1">
                <FaRulerCombined className="me-1 text-success" /> Land Area
              </div>
              <h5 className="fw-bold mb-0">{farm.totalArea} {farm.areaUnit}</h5>
            </div>
          </div>

          <div className="col-6 col-md-3">
            <div className="p-3 rounded-3 bg-light border">
              <div className="text-muted mb-1">
                <FaLayerGroup className="me-1 text-warning" /> Soil Type
              </div>
              <h5 className="fw-bold mb-0">{farm.soilType}</h5>
            </div>
          </div>

          <div className="col-6 col-md-3">
            <div className="p-3 rounded-3 bg-light border">
              <div className="text-muted mb-1">
                <FaWater className="me-1 text-info" /> Irrigation
              </div>
              <h5 className="fw-bold mb-0">{farm.irrigationType}</h5>
            </div>
          </div>

          <div className="col-6 col-md-3">
            <div className="p-3 rounded-3 bg-light border">
              <div className="text-muted mb-1">
                <FaSeedling className="me-1 text-success" /> Crops Sown
              </div>
              <h5 className="fw-bold mb-0">{crops.length} Batches</h5>
            </div>
          </div>
        </div>

        {farm.description && (
          <p className="text-muted small mt-3 mb-0">
            <strong>Notes & Infrastructure:</strong> {farm.description}
          </p>
        )}
      </div>

      {/* Localized Weather Banner */}
      {weather && (
        <div className="card border-0 shadow-sm rounded-4 p-3 mb-4 text-white" style={{ background: '#2d6a4f' }}>
          <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-2">
            <div className="d-flex align-items-center gap-3">
              <FaCloudSun className="display-6 text-warning" />
              <div>
                <span className="badge bg-white text-dark mb-1">Microclimate at {farm.name}</span>
                <h5 className="mb-0 fw-bold">{weather.temperature}°C • {weather.condition}</h5>
                <small className="opacity-75">Humidity: {weather.humidity}% | Wind: {weather.windSpeed} km/h</small>
              </div>
            </div>
            {weather.precautions?.[0] && (
              <div className="bg-white text-dark rounded-3 p-2 px-3 small border" style={{ maxWidth: 450 }}>
                <strong className="text-success">Actionable Precaution:</strong> {weather.precautions[0].message}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Crops Registered on this farm */}
      <div className="row g-4 mb-4">
        <div className="col-lg-7">
          <div className="card border-0 shadow-sm rounded-4 p-4 bg-white h-100">
            <div className="d-flex justify-content-between align-items-center mb-3">
              <h5 className="fw-bold text-dark mb-0">
                <FaSeedling className="text-success me-2" />
                Crops Growing on this Farm
              </h5>
              <Link to="/crops" className="btn btn-sm btn-outline-success">
                Add Crop
              </Link>
            </div>

            {crops.length === 0 ? (
              <div className="text-center py-4 text-muted small">
                No active crops associated with this farm yet.
              </div>
            ) : (
              <div className="d-flex flex-column gap-3">
                {crops.map((crop) => (
                  <div key={crop._id} className="p-3 border rounded-3 bg-light">
                    <div className="d-flex justify-content-between align-items-center mb-1">
                      <span className="fw-bold text-dark">{crop.name} ({crop.variety || 'Standard'})</span>
                      <span className="badge bg-success-subtle text-success">{crop.healthStatus}</span>
                    </div>
                    <div className="text-muted small mb-2">
                      Plot: {crop.fieldPlot} • Stage: <strong>{crop.growthStage}</strong> ({crop.growthProgressPercentage || 15}%)
                    </div>
                    <div className="agri-progress mb-2">
                      <div className="agri-progress-bar" style={{ width: `${crop.growthProgressPercentage || 15}%` }}></div>
                    </div>
                    <div className="d-flex justify-content-between text-muted small" style={{ fontSize: '0.75rem' }}>
                      <span>Sown: {new Date(crop.plantingDate).toLocaleDateString()}</span>
                      <span>Target: {new Date(crop.expectedHarvestDate).toLocaleDateString()}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Soil History on this farm */}
        <div className="col-lg-5">
          <div className="card border-0 shadow-sm rounded-4 p-4 bg-white h-100">
            <div className="d-flex justify-content-between align-items-center mb-3">
              <h5 className="fw-bold text-dark mb-0">
                <FaVial className="text-info me-2" />
                Soil Health Records
              </h5>
              <Link to="/soil" className="btn btn-sm btn-outline-info">
                New Test
              </Link>
            </div>

            {soilTests.length === 0 ? (
              <div className="text-center py-4 text-muted small">
                No soil tests recorded for this farm yet.
              </div>
            ) : (
              soilTests.map((st) => (
                <div key={st._id} className="p-3 border rounded-3 bg-light mb-2">
                  <div className="d-flex justify-content-between align-items-center mb-1">
                    <span className="fw-bold small">{st.plotIdentifier}</span>
                    <span className="badge bg-success-subtle text-success">
                      Rating: {st.interpretation?.overallRating || 'Good'}
                    </span>
                  </div>
                  <div className="text-muted small mb-2" style={{ fontSize: '0.75rem' }}>
                    Sample Date: {new Date(st.sampleCollectionDate).toLocaleDateString()}
                  </div>
                  <div className="row text-center g-1 small">
                    <div className="col-3 p-1 bg-white rounded border">
                      <div className="text-muted" style={{ fontSize: '0.65rem' }}>pH</div>
                      <div className="fw-bold">{st.ph}</div>
                    </div>
                    <div className="col-3 p-1 bg-white rounded border">
                      <div className="text-muted" style={{ fontSize: '0.65rem' }}>N</div>
                      <div className="fw-bold">{st.nitrogen}</div>
                    </div>
                    <div className="col-3 p-1 bg-white rounded border">
                      <div className="text-muted" style={{ fontSize: '0.65rem' }}>P</div>
                      <div className="fw-bold">{st.phosphorus}</div>
                    </div>
                    <div className="col-3 p-1 bg-white rounded border">
                      <div className="text-muted" style={{ fontSize: '0.65rem' }}>K</div>
                      <div className="fw-bold">{st.potassium}</div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default FarmDetailsPage;
