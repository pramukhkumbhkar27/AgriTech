import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTranslation } from 'react-i18next';
import api from '../services/api';
import {
  FaTractor,
  FaSeedling,
  FaCalendarCheck,
  FaCloudSun,
  FaVial,
  FaBug,
  FaPlus,
  FaCheck,
  FaExclamationTriangle,
  FaArrowRight,
  FaWind,
  FaTint,
} from 'react-icons/fa';
import {
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';

const COLORS = ['#2d6a4f', '#52b788', '#e9c46a', '#f4a261', '#e76f51', '#457b9d'];

const FarmerDashboardPage = () => {
  const { user } = useAuth();
  const { t } = useTranslation();

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchDashboard();
  }, []);

  const fetchDashboard = async () => {
    try {
      setLoading(true);
      const res = await api.get('/dashboard/farmer');
      if (res.data.success) {
        setData(res.data.data);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load dashboard metrics');
    } finally {
      setLoading(false);
    }
  };

  const handleToggleActivity = async (activityId, currentStatus) => {
    try {
      const newStatus = currentStatus === 'Completed' ? 'Pending' : 'Completed';
      await api.put(`/activities/${activityId}`, { status: newStatus });
      fetchDashboard();
    } catch {
      // silent
    }
  };

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center py-5" style={{ minHeight: '60vh' }}>
        <div className="text-center">
          <div className="spinner-border text-success mb-2" role="status"></div>
          <p className="text-muted small">{t('common.loading')}</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="alert alert-danger my-4">
        {error}
        <button className="btn btn-sm btn-outline-danger ms-3" onClick={fetchDashboard}>
          Retry
        </button>
      </div>
    );
  }

  const { counts, weather, activeCrops, upcomingActivities, recentSoilTests, activePestAlerts, charts } = data;

  const stageChartData = (charts?.cropsDistribution || []).map((item) => ({
    name: item._id,
    count: item.count,
  }));

  const healthChartData = (charts?.healthBreakdown || []).map((item) => ({
    name: item._id,
    value: item.count,
  }));

  return (
    <div className="dashboard-page pb-5">
      {/* Welcome Bar & Quick Actions */}
      <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center mb-4 gap-3">
        <div>
          <h2 className="fw-bold mb-1">
            {t('dashboard.welcome')}, <span style={{ color: '#2d6a4f' }}>{user?.name}</span>! 🌾
          </h2>
          <p className="text-muted small mb-0">{t('dashboard.subheading')}</p>
        </div>

        <div className="d-flex flex-wrap gap-2">
          <Link to="/crops" className="btn btn-sm btn-agri-primary d-flex align-items-center gap-1 shadow-sm">
            <FaPlus /> {t('dashboard.addCrop')}
          </Link>
          <Link to="/farms" className="btn btn-sm btn-agri-secondary d-flex align-items-center gap-1">
            <FaTractor /> {t('dashboard.addFarm')}
          </Link>
          <Link to="/soil" className="btn btn-sm btn-light border d-flex align-items-center gap-1">
            <FaVial className="text-info" /> {t('dashboard.testSoil')}
          </Link>
          <Link to="/consultations" className="btn btn-sm btn-agri-accent d-flex align-items-center gap-1">
            {t('dashboard.askExpert')}
          </Link>
        </div>
      </div>

      {/* Metric Cards Row */}
      <div className="row g-3 mb-4">
        <div className="col-6 col-lg-3">
          <div className="stat-card">
            <div className="stat-icon-wrapper" style={{ background: '#d8f3dc', color: '#1b4332' }}>
              <FaTractor />
            </div>
            <div>
              <div className="text-muted small fw-medium">{t('dashboard.totalFarms')}</div>
              <h3 className="fw-bold text-dark mb-0">{counts.totalFarms}</h3>
            </div>
          </div>
        </div>

        <div className="col-6 col-lg-3">
          <div className="stat-card">
            <div className="stat-icon-wrapper" style={{ background: '#e0f2fe', color: '#0369a1' }}>
              <FaSeedling />
            </div>
            <div>
              <div className="text-muted small fw-medium">{t('dashboard.totalCrops')}</div>
              <h3 className="fw-bold text-dark mb-0">{counts.totalCrops}</h3>
            </div>
          </div>
        </div>

        <div className="col-6 col-lg-3">
          <div className="stat-card">
            <div className="stat-icon-wrapper" style={{ background: '#fef3c7', color: '#92400e' }}>
              <FaCalendarCheck />
            </div>
            <div>
              <div className="text-muted small fw-medium">{t('dashboard.activeCycles')}</div>
              <h3 className="fw-bold text-dark mb-0">{counts.activeCropCycles}</h3>
            </div>
          </div>
        </div>

        <div className="col-6 col-lg-3">
          <div className="stat-card">
            <div className="stat-icon-wrapper" style={{ background: '#fee2e2', color: '#991b1b' }}>
              <FaExclamationTriangle />
            </div>
            <div>
              <div className="text-muted small fw-medium">{t('dashboard.pendingActivities')}</div>
              <h3 className="fw-bold text-dark mb-0">{upcomingActivities.length}</h3>
            </div>
          </div>
        </div>
      </div>

      {/* Weather & Precautions Section */}
      {weather && (
        <div className="card border-0 shadow-sm rounded-4 mb-4 overflow-hidden">
          <div className="card-body p-4 weather-main-card">
            <div className="row align-items-center g-3">
              <div className="col-md-5">
                <span className="badge bg-white text-dark mb-2">
                  📍 {weather.location}
                </span>
                <div className="d-flex align-items-center gap-3">
                  <span className="display-4 fw-bold">{weather.temperature}°C</span>
                  <div>
                    <h5 className="mb-0 fw-semibold">{weather.condition}</h5>
                    <small className="opacity-75">Feels like {weather.feelsLike}°C</small>
                  </div>
                </div>
                <div className="d-flex gap-3 mt-3 opacity-90 small">
                  <span><FaTint className="me-1" /> Humidity: {weather.humidity}%</span>
                  <span><FaWind className="me-1" /> Wind: {weather.windSpeed} km/h</span>
                </div>
              </div>

              <div className="col-md-7">
                <h6 className="fw-bold text-white mb-2">Smart Farming Precautions</h6>
                <div className="d-flex flex-column gap-2">
                  {weather.precautions?.slice(0, 2).map((prec, i) => (
                    <div
                      key={i}
                      className="p-2 px-3 rounded-3 small"
                      style={{ background: 'rgba(255, 255, 255, 0.15)', backdropFilter: 'blur(4px)' }}
                    >
                      <strong className="text-warning me-1">[{prec.category}]:</strong>
                      <span>{prec.message}</span>
                    </div>
                  ))}
                </div>
                <div className="text-end mt-2">
                  <Link to="/weather" className="text-white text-decoration-none small fw-bold">
                    View 7-Day Forecast & Soil Advisory <FaArrowRight className="ms-1" />
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Main Grid: Crops & Operations */}
      <div className="row g-4 mb-4">
        {/* Left Column: Active Crops */}
        <div className="col-lg-7">
          <div className="card border-0 shadow-sm rounded-4 h-100">
            <div className="card-header bg-white border-0 d-flex justify-content-between align-items-center pt-3 px-3">
              <h5 className="fw-bold text-dark mb-0">Active Crops & Growth Status</h5>
              <Link to="/crops" className="text-success small fw-bold text-decoration-none">
                Manage Crops
              </Link>
            </div>

            <div className="card-body p-3">
              {activeCrops.length === 0 ? (
                <div className="text-center py-4 text-muted small">
                  No active crops currently registered.{' '}
                  <Link to="/crops" className="text-success fw-bold">
                    Add your first crop
                  </Link>
                </div>
              ) : (
                <div className="d-flex flex-column gap-3">
                  {activeCrops.map((crop) => (
                    <div key={crop._id} className="p-3 border rounded-3 bg-light">
                      <div className="d-flex justify-content-between align-items-center mb-1">
                        <div>
                          <span className="fw-bold text-dark">{crop.name}</span>
                          {crop.variety && <small className="text-muted ms-2">({crop.variety})</small>}
                        </div>
                        <span className="badge bg-success-subtle text-success">{crop.healthStatus}</span>
                      </div>

                      <div className="d-flex justify-content-between text-muted small mb-1">
                        <span>Farm: {crop.farm?.name || 'Main Farm'} • {crop.growthStage}</span>
                        <span className="fw-semibold">{crop.growthProgressPercentage || 15}%</span>
                      </div>

                      <div className="agri-progress mb-2">
                        <div
                          className="agri-progress-bar"
                          style={{ width: `${crop.growthProgressPercentage || 15}%` }}
                        ></div>
                      </div>

                      <div className="d-flex justify-content-between text-muted small" style={{ fontSize: '0.75rem' }}>
                        <span>Planted: {new Date(crop.plantingDate).toLocaleDateString()}</span>
                        <span>Harvest: {new Date(crop.expectedHarvestDate).toLocaleDateString()}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Column: Upcoming Operations */}
        <div className="col-lg-5">
          <div className="card border-0 shadow-sm rounded-4 h-100">
            <div className="card-header bg-white border-0 d-flex justify-content-between align-items-center pt-3 px-3">
              <h5 className="fw-bold text-dark mb-0">Upcoming Field Operations</h5>
              <Link to="/calendar" className="text-success small fw-bold text-decoration-none">
                Calendar
              </Link>
            </div>

            <div className="card-body p-3">
              {upcomingActivities.length === 0 ? (
                <div className="text-center py-4 text-muted small">
                  All scheduled operations are completed!
                </div>
              ) : (
                <div className="list-group list-group-flush">
                  {upcomingActivities.map((act) => (
                    <div
                      key={act._id}
                      className="list-group-item d-flex align-items-center justify-content-between px-0 py-2 border-bottom"
                    >
                      <div className="d-flex align-items-start gap-2">
                        <button
                          className={`btn btn-sm rounded-circle p-1 mt-1 ${
                            act.status === 'Completed' ? 'btn-success' : 'btn-outline-secondary'
                          }`}
                          style={{ width: 22, height: 22, display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}
                          onClick={() => handleToggleActivity(act._id, act.status)}
                          title="Mark operation complete"
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

                      <span
                        className={`badge ${
                          act.priority === 'High' ? 'bg-danger-subtle text-danger' : 'bg-secondary-subtle text-secondary'
                        }`}
                        style={{ fontSize: '0.7rem' }}
                      >
                        {act.priority}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Analytics & Soil Health Row */}
      <div className="row g-4 mb-4">
        {/* Interactive Charts */}
        <div className="col-lg-6">
          <div className="card border-0 shadow-sm rounded-4 p-3 h-100">
            <h6 className="fw-bold text-dark mb-3">Crop Distribution by Growth Stage</h6>
            <div style={{ height: 250 }}>
              {stageChartData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={stageChartData}>
                    <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                    <YAxis allowDecimals={false} tick={{ fontSize: 12 }} />
                    <Tooltip />
                    <Bar dataKey="count" fill="#2d6a4f" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="d-flex align-items-center justify-content-center h-100 text-muted small">
                  Add crops to visualize growth analytics
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Soil Health Summary Card */}
        <div className="col-lg-6">
          <div className="card border-0 shadow-sm rounded-4 p-3 h-100">
            <div className="d-flex justify-content-between align-items-center mb-3">
              <h6 className="fw-bold text-dark mb-0">Recent Soil Health Overview</h6>
              <Link to="/soil" className="text-success small fw-bold text-decoration-none">
                Soil Diagnostics
              </Link>
            </div>

            {recentSoilTests.length === 0 ? (
              <div className="text-center py-4 text-muted small">
                No soil tests logged yet.{' '}
                <Link to="/soil" className="text-success fw-bold">
                  Enter NPK Test
                </Link>
              </div>
            ) : (
              recentSoilTests.map((st) => (
                <div key={st._id} className="p-3 border rounded-3 bg-light mb-2">
                  <div className="d-flex justify-content-between align-items-center mb-2">
                    <span className="fw-bold small">{st.farm?.name} ({st.plotIdentifier})</span>
                    <span className="badge bg-success-subtle text-success">
                      Rating: {st.interpretation?.overallRating || 'Good'}
                    </span>
                  </div>
                  <div className="row text-center g-2 small">
                    <div className="col-3 p-1 bg-white rounded border">
                      <div className="text-muted" style={{ fontSize: '0.65rem' }}>pH</div>
                      <div className="fw-bold text-success">{st.ph}</div>
                    </div>
                    <div className="col-3 p-1 bg-white rounded border">
                      <div className="text-muted" style={{ fontSize: '0.65rem' }}>Nitrogen (N)</div>
                      <div className="fw-bold">{st.nitrogen}</div>
                    </div>
                    <div className="col-3 p-1 bg-white rounded border">
                      <div className="text-muted" style={{ fontSize: '0.65rem' }}>Phosphorus (P)</div>
                      <div className="fw-bold">{st.phosphorus}</div>
                    </div>
                    <div className="col-3 p-1 bg-white rounded border">
                      <div className="text-muted" style={{ fontSize: '0.65rem' }}>Potassium (K)</div>
                      <div className="fw-bold">{st.potassium}</div>
                    </div>
                  </div>
                  {st.recommendations?.[0] && (
                    <p className="mt-2 mb-0 small text-muted" style={{ fontSize: '0.75rem' }}>
                      💡 <strong>Advisory:</strong> {st.recommendations[0].suggestion}
                    </p>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Pest Alerts Banner */}
      {activePestAlerts.length > 0 && (
        <div className="card border-0 shadow-sm rounded-4 p-3 bg-danger-subtle border-start border-danger border-4">
          <div className="d-flex justify-content-between align-items-center mb-2">
            <div className="d-flex align-items-center gap-2 text-danger fw-bold">
              <FaBug /> Regional Pest & Disease Alerts ({activePestAlerts.length} Active)
            </div>
            <Link to="/pest-alerts" className="btn btn-sm btn-outline-danger">
              View All Bulletins
            </Link>
          </div>
          <div className="row g-2">
            {activePestAlerts.slice(0, 2).map((alert) => (
              <div key={alert._id} className="col-md-6">
                <div className="p-2 bg-white rounded border small">
                  <div className="d-flex justify-content-between">
                    <strong className="text-dark">{alert.pestName} ({alert.cropAffected})</strong>
                    <span className="badge bg-danger">{alert.severity}</span>
                  </div>
                  <div className="text-muted text-truncate" style={{ fontSize: '0.75rem' }}>
                    {alert.symptoms}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default FarmerDashboardPage;
