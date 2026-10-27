import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import api from '../services/api';
import {
  FaVial,
  FaFlask,
  FaCheckCircle,
  FaExclamationTriangle,
  FaInfoCircle,
  FaChartLine,
  FaPlus,
  FaHistory,
} from 'react-icons/fa';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';

const SoilHealthPage = () => {
  const { t } = useTranslation();
  const [farms, setFarms] = useState([]);
  const [soilTests, setSoilTests] = useState([]);
  const [selectedFarm, setSelectedFarm] = useState('');
  const [loading, setLoading] = useState(true);

  // Form
  const [formData, setFormData] = useState({
    farm: '',
    sampleCollectionDate: new Date().toISOString().split('T')[0],
    plotIdentifier: 'Main Plot',
    soilType: 'Loamy',
    ph: 6.8,
    nitrogen: 180,
    phosphorus: 25,
    potassium: 190,
    moisture: 28,
    organicMatter: 1.8,
    dataSource: 'Manual Farmer Entry',
    notes: '',
  });

  const [latestAnalysis, setLatestAnalysis] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchFarmsAndSoil();
  }, []);

  const fetchFarmsAndSoil = async () => {
    try {
      setLoading(true);
      const [fRes, sRes] = await Promise.all([api.get('/farms'), api.get('/soil')]);
      if (fRes.data.success) {
        setFarms(fRes.data.farms);
        if (fRes.data.farms.length > 0) {
          setFormData((prev) => ({ ...prev, farm: fRes.data.farms[0]._id }));
          setSelectedFarm(fRes.data.farms[0]._id);
        }
      }
      if (sRes.data.success) {
        setSoilTests(sRes.data.soilTests);
        if (sRes.data.soilTests.length > 0) {
          setLatestAnalysis(sRes.data.soilTests[0]);
        }
      }
    } catch {
      // silent
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setSubmitting(true);
      const res = await api.post('/soil', formData);
      if (res.data.success) {
        setLatestAnalysis(res.data.soilTest);
        setSoilTests((prev) => [res.data.soilTest, ...prev]);
        alert('Soil analysis record saved successfully!');
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to submit soil test');
    } finally {
      setSubmitting(false);
    }
  };

  // Prepare chart data for chronological comparison
  const chartData = [...soilTests]
    .reverse()
    .filter((st) => !selectedFarm || st.farm?._id === selectedFarm)
    .map((st) => ({
      date: new Date(st.sampleCollectionDate).toLocaleDateString([], { month: 'short', day: 'numeric' }),
      pH: st.ph,
      Nitrogen: st.nitrogen,
      Phosphorus: st.phosphorus,
      Potassium: st.potassium,
    }));

  return (
    <div className="soil-page pb-5">
      {/* Header */}
      <div className="mb-4">
        <h2 className="fw-bold mb-1">{t('soil.title')}</h2>
        <p className="text-muted small mb-0">{t('soil.subtitle')}</p>
      </div>

      {/* Prominent Educational Notice Banner */}
      <div className="alert alert-warning border-warning shadow-sm rounded-4 mb-4 small d-flex align-items-center gap-3">
        <FaInfoCircle className="fs-3 text-warning flex-shrink-0" />
        <div>
          <strong>Educational Agronomic Advisory Notice:</strong> {t('soil.disclaimer')} Always consult your district
          Soil Health Card laboratory before applying chemical amendments at scale.
        </div>
      </div>

      <div className="row g-4 mb-4">
        {/* Soil Entry Form */}
        <div className="col-lg-6">
          <div className="card border-0 shadow-sm rounded-4 p-4 bg-white h-100">
            <h5 className="fw-bold text-dark mb-3 d-flex align-items-center gap-2">
              <FaVial className="text-info" /> Log Soil Laboratory Test Metrics
            </h5>

            <form onSubmit={handleSubmit}>
              <div className="row g-3">
                <div className="col-md-6">
                  <label className="form-label small fw-semibold">Target Farm *</label>
                  <select
                    className="form-select"
                    value={formData.farm}
                    onChange={(e) => {
                      setFormData({ ...formData, farm: e.target.value });
                      setSelectedFarm(e.target.value);
                    }}
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
                  <label className="form-label small fw-semibold">Plot / Sector Identifier</label>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="Plot A-1"
                    value={formData.plotIdentifier}
                    onChange={(e) => setFormData({ ...formData, plotIdentifier: e.target.value })}
                  />
                </div>

                <div className="col-md-6">
                  <label className="form-label small fw-semibold">Soil pH (0 - 14) *</label>
                  <input
                    type="number"
                    step="0.1"
                    min="3"
                    max="11"
                    className="form-control"
                    value={formData.ph}
                    onChange={(e) => setFormData({ ...formData, ph: parseFloat(e.target.value) })}
                    required
                  />
                  <small className="text-muted" style={{ fontSize: '0.7rem' }}>Optimal: 6.5 - 7.5</small>
                </div>

                <div className="col-md-6">
                  <label className="form-label small fw-semibold">Nitrogen (N) [kg/ha] *</label>
                  <input
                    type="number"
                    min="0"
                    className="form-control"
                    value={formData.nitrogen}
                    onChange={(e) => setFormData({ ...formData, nitrogen: parseFloat(e.target.value) })}
                    required
                  />
                  <small className="text-muted" style={{ fontSize: '0.7rem' }}>Sufficient: 140 - 280 kg/ha</small>
                </div>

                <div className="col-md-6">
                  <label className="form-label small fw-semibold">Phosphorus (P) [kg/ha] *</label>
                  <input
                    type="number"
                    min="0"
                    className="form-control"
                    value={formData.phosphorus}
                    onChange={(e) => setFormData({ ...formData, phosphorus: parseFloat(e.target.value) })}
                    required
                  />
                  <small className="text-muted" style={{ fontSize: '0.7rem' }}>Sufficient: 15 - 35 kg/ha</small>
                </div>

                <div className="col-md-6">
                  <label className="form-label small fw-semibold">Potassium (K) [kg/ha] *</label>
                  <input
                    type="number"
                    min="0"
                    className="form-control"
                    value={formData.potassium}
                    onChange={(e) => setFormData({ ...formData, potassium: parseFloat(e.target.value) })}
                    required
                  />
                  <small className="text-muted" style={{ fontSize: '0.7rem' }}>Sufficient: 120 - 250 kg/ha</small>
                </div>

                <div className="col-md-6">
                  <label className="form-label small fw-semibold">Moisture (%)</label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    className="form-control"
                    value={formData.moisture}
                    onChange={(e) => setFormData({ ...formData, moisture: parseFloat(e.target.value) })}
                  />
                </div>

                <div className="col-md-6">
                  <label className="form-label small fw-semibold">Organic Carbon / Matter (%)</label>
                  <input
                    type="number"
                    step="0.1"
                    min="0"
                    max="10"
                    className="form-control"
                    value={formData.organicMatter}
                    onChange={(e) => setFormData({ ...formData, organicMatter: parseFloat(e.target.value) })}
                  />
                </div>

                <div className="col-12">
                  <button type="submit" disabled={submitting} className="btn btn-agri-primary w-100 py-2 fw-semibold">
                    {submitting ? 'Analyzing...' : t('soil.analyzeBtn')}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>

        {/* Live Analysis & Scientific Recommendations */}
        <div className="col-lg-6">
          <div className="card border-0 shadow-sm rounded-4 p-4 bg-white h-100">
            <h5 className="fw-bold text-dark mb-3 d-flex align-items-center gap-2">
              <FaFlask className="text-success" /> Scientific Agronomic Analysis & Score
            </h5>

            {latestAnalysis ? (
              <div>
                <div className="p-3 rounded-3 bg-light border mb-3">
                  <div className="d-flex justify-content-between align-items-center mb-2">
                    <span className="fw-bold text-dark">{latestAnalysis.plotIdentifier} ({latestAnalysis.farm?.name})</span>
                    <span className="badge bg-success-subtle text-success fs-6">
                      Health Rating: {latestAnalysis.interpretation?.overallRating || 'Good'}
                    </span>
                  </div>

                  <div className="row g-2 text-center small mt-1">
                    <div className="col-3 p-2 bg-white rounded border">
                      <div className="text-muted" style={{ fontSize: '0.65rem' }}>pH Status</div>
                      <div className="fw-bold text-success">{latestAnalysis.interpretation?.phStatus}</div>
                    </div>
                    <div className="col-3 p-2 bg-white rounded border">
                      <div className="text-muted" style={{ fontSize: '0.65rem' }}>Nitrogen (N)</div>
                      <div className="fw-bold">{latestAnalysis.interpretation?.nitrogenStatus}</div>
                    </div>
                    <div className="col-3 p-2 bg-white rounded border">
                      <div className="text-muted" style={{ fontSize: '0.65rem' }}>Phosphorus (P)</div>
                      <div className="fw-bold">{latestAnalysis.interpretation?.phosphorusStatus}</div>
                    </div>
                    <div className="col-3 p-2 bg-white rounded border">
                      <div className="text-muted" style={{ fontSize: '0.65rem' }}>Potassium (K)</div>
                      <div className="fw-bold">{latestAnalysis.interpretation?.potassiumStatus}</div>
                    </div>
                  </div>
                </div>

                <h6 className="fw-bold text-dark mb-2">Targeted Soil Amendment Recommendations</h6>
                <div className="d-flex flex-column gap-2" style={{ maxHeight: 260, overflowY: 'auto' }}>
                  {latestAnalysis.recommendations?.map((rec, idx) => (
                    <div key={idx} className="p-2 px-3 rounded-3 bg-light border small">
                      <div className="d-flex justify-content-between mb-1">
                        <strong className="text-success">{rec.parameter} • {rec.issue}</strong>
                        <span className="badge bg-secondary-subtle text-secondary" style={{ fontSize: '0.65rem' }}>
                          {rec.actionType}
                        </span>
                      </div>
                      <p className="mb-0 text-muted">{rec.suggestion}</p>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="text-center py-5 text-muted small">
                Submit a soil test on the left to view scientific interpretation and corrective amendments.
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Historical Trend Chart */}
      <div className="card border-0 shadow-sm rounded-4 p-4 bg-white mb-4">
        <div className="d-flex justify-content-between align-items-center mb-3">
          <h5 className="fw-bold text-dark mb-0 d-flex align-items-center gap-2">
            <FaChartLine className="text-success" /> Chronological Soil Fertility Progression
          </h5>
          <span className="text-muted small">NPK Macronutrients [kg/ha]</span>
        </div>

        <div style={{ height: 280 }}>
          {chartData.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Area type="monotone" dataKey="Nitrogen" stroke="#2d6a4f" fill="#52b788" opacity={0.4} />
                <Area type="monotone" dataKey="Potassium" stroke="#e9c46a" fill="#f4a261" opacity={0.3} />
                <Area type="monotone" dataKey="Phosphorus" stroke="#0369a1" fill="#7dd3fc" opacity={0.3} />
              </AreaChart>
            </ResponsiveContainer>
          ) : (
            <div className="d-flex align-items-center justify-content-center h-100 text-muted small">
              No historical trend data available yet
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SoilHealthPage;
