import React, { useState, useEffect } from 'react';
import api from '../services/api';
import {
  FaCloudSun,
  FaSearch,
  FaWind,
  FaTint,
  FaSun,
  FaMoon,
  FaExclamationTriangle,
  FaCheckCircle,
  FaInfoCircle,
  FaKey,
} from 'react-icons/fa';

const WeatherPage = () => {
  const [query, setQuery] = useState('Pune');
  const [weather, setWeather] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [apiGuide, setApiGuide] = useState(null);
  const [showApiModal, setShowApiModal] = useState(false);

  useEffect(() => {
    fetchWeather('Pune');
  }, []);

  const fetchWeather = async (loc) => {
    try {
      setLoading(true);
      setError('');
      const res = await api.get(`/weather?location=${encodeURIComponent(loc || query)}`);
      if (res.data.success) {
        setWeather(res.data.weather);
        setApiGuide(res.data.apiConfigurationGuide);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch agro-meteorological data');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (query.trim()) {
      fetchWeather(query);
    }
  };

  return (
    <div className="weather-page pb-5">
      {/* Header */}
      <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center mb-4 gap-3">
        <div>
          <h2 className="fw-bold mb-1">Agro-Meteorology & Weather Forecasting</h2>
          <p className="text-muted small mb-0">
            Real-time field conditions, 7-day agricultural outlooks, and intelligent crop precautions.
          </p>
        </div>

        <button
          className="btn btn-sm btn-outline-secondary d-flex align-items-center gap-1"
          onClick={() => setShowApiModal(true)}
        >
          <FaKey /> Weather API Guide
        </button>
      </div>

      {/* Search Bar & Location Selector */}
      <div className="card border-0 shadow-sm rounded-4 p-3 mb-4 bg-white">
        <form onSubmit={handleSearch}>
          <div className="row g-2">
            <div className="col-md-9">
              <div className="input-group">
                <span className="input-group-text bg-light border-end-0">
                  <FaSearch className="text-muted" />
                </span>
                <input
                  type="text"
                  className="form-control border-start-0"
                  placeholder="Enter city, district, or village (e.g. Pune, Ludhiana, Nagpur, Nashik, Delhi)..."
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                />
              </div>
            </div>
            <div className="col-md-3">
              <button type="submit" className="btn btn-agri-primary w-100 fw-semibold">
                Get Field Weather
              </button>
            </div>
          </div>
        </form>

        <div className="d-flex flex-wrap gap-2 mt-3 pt-2 border-top small text-muted align-items-center">
          <span className="fw-bold">Popular Regions:</span>
          {['Pune', 'Nagpur', 'Nashik', 'Ludhiana', 'Bengaluru', 'Jaipur', 'Hyderabad'].map((city) => (
            <button
              key={city}
              type="button"
              className="btn btn-sm btn-light border py-0 px-2"
              onClick={() => {
                setQuery(city);
                fetchWeather(city);
              }}
            >
              {city}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="text-center py-5">
          <div className="spinner-border text-success mb-2" role="status"></div>
          <p className="text-muted small">Loading agro-weather forecast...</p>
        </div>
      ) : error ? (
        <div className="alert alert-danger my-4">{error}</div>
      ) : weather ? (
        <>
          {/* Main Weather Card */}
          <div className="card border-0 shadow-sm rounded-4 mb-4 overflow-hidden weather-main-card">
            <div className="row align-items-center g-4">
              <div className="col-lg-5">
                <span className="badge bg-white text-dark mb-2 px-3 py-1">
                  📍 {weather.location}
                </span>
                <div className="d-flex align-items-center gap-3">
                  <span className="display-3 fw-bold">{weather.temperature}°C</span>
                  <div>
                    <h4 className="fw-bold mb-0">{weather.condition}</h4>
                    <span className="opacity-75">Feels like {weather.feelsLike}°C</span>
                  </div>
                </div>
                <p className="mt-2 mb-0 opacity-90 small">{weather.description}</p>
                <div className="mt-2" style={{ fontSize: '0.75rem', opacity: 0.8 }}>
                  Data Source: <strong>{weather.source}</strong> {weather.cached && '• (Cached)'}
                </div>
              </div>

              <div className="col-lg-7">
                <div className="row g-2 text-dark">
                  <div className="col-6 col-sm-3">
                    <div className="p-3 bg-white rounded-3 shadow-sm text-center">
                      <FaTint className="text-info fs-4 mb-1" />
                      <div className="text-muted" style={{ fontSize: '0.7rem' }}>Humidity</div>
                      <div className="fw-bold fs-5">{weather.humidity}%</div>
                    </div>
                  </div>

                  <div className="col-6 col-sm-3">
                    <div className="p-3 bg-white rounded-3 shadow-sm text-center">
                      <FaWind className="text-secondary fs-4 mb-1" />
                      <div className="text-muted" style={{ fontSize: '0.7rem' }}>Wind Speed</div>
                      <div className="fw-bold fs-5">{weather.windSpeed} km/h</div>
                    </div>
                  </div>

                  <div className="col-6 col-sm-3">
                    <div className="p-3 bg-white rounded-3 shadow-sm text-center">
                      <FaSun className="text-warning fs-4 mb-1" />
                      <div className="text-muted" style={{ fontSize: '0.7rem' }}>Sunrise</div>
                      <div className="fw-bold fs-6 mt-1">{weather.sunrise}</div>
                    </div>
                  </div>

                  <div className="col-6 col-sm-3">
                    <div className="p-3 bg-white rounded-3 shadow-sm text-center">
                      <FaMoon className="text-primary fs-4 mb-1" />
                      <div className="text-muted" style={{ fontSize: '0.7rem' }}>Sunset</div>
                      <div className="fw-bold fs-6 mt-1">{weather.sunset}</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Actionable Farming Precautions */}
          <div className="card border-0 shadow-sm rounded-4 p-4 mb-4 bg-white">
            <h5 className="fw-bold text-dark mb-3">
              <FaExclamationTriangle className="text-warning me-2" />
              Actionable Farming Precautions & Spray Advisory
            </h5>

            <div className="row g-3">
              {weather.precautions?.map((prec, i) => (
                <div key={i} className="col-md-6">
                  <div
                    className={`p-3 rounded-3 border h-100 ${
                      prec.type === 'warning'
                        ? 'bg-warning-subtle border-warning'
                        : prec.type === 'info'
                        ? 'bg-info-subtle border-info'
                        : 'bg-success-subtle border-success'
                    }`}
                  >
                    <div className="fw-bold mb-1 d-flex align-items-center gap-1">
                      {prec.type === 'warning' && <FaExclamationTriangle className="text-warning" />}
                      {prec.type === 'info' && <FaInfoCircle className="text-info" />}
                      {prec.type === 'success' && <FaCheckCircle className="text-success" />}
                      {prec.category}
                    </div>
                    <p className="mb-0 small text-secondary">{prec.message}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* 7-Day Agricultural Forecast */}
          <div className="card border-0 shadow-sm rounded-4 p-4 bg-white">
            <h5 className="fw-bold text-dark mb-3">7-Day Agricultural Outlook</h5>
            <div className="row g-3">
              {weather.forecast?.map((day, idx) => (
                <div key={idx} className="col-6 col-md-4 col-lg">
                  <div className="weather-forecast-pill h-100 d-flex flex-column justify-content-between">
                    <div>
                      <div className="fw-bold text-dark small">{day.day}</div>
                      <div className="text-muted" style={{ fontSize: '0.7rem' }}>{day.date}</div>
                    </div>

                    <div className="my-2">
                      <FaCloudSun className="display-6 text-warning" />
                      <div className="small fw-semibold mt-1">{day.condition}</div>
                    </div>

                    <div>
                      <div className="fw-bold">
                        <span className="text-danger">{day.tempMax}°</span>{' '}
                        <span className="text-muted">/ {day.tempMin}°</span>
                      </div>
                      <div className="text-muted mt-1" style={{ fontSize: '0.75rem' }}>
                        💧 {day.rainChance}% Rain
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </>
      ) : null}

      {/* API Key Guide Modal */}
      {showApiModal && (
        <div className="modal fade show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title fw-bold text-dark">
                  <FaKey className="text-warning me-2" /> OpenWeather API Integration Guide
                </h5>
                <button type="button" className="btn-close" onClick={() => setShowApiModal(false)}></button>
              </div>
              <div className="modal-body small text-secondary">
                <p>
                  Agri-Tech supports live real-time OpenWeatherMap API data as well as high-accuracy simulated
                  agro-meteorological fallback when no key is set.
                </p>
                <h6 className="fw-bold text-dark">To enable live API queries:</h6>
                <ol className="ps-3 mb-3">
                  <li className="mb-1">Create a free account at <strong>https://openweathermap.org/api</strong></li>
                  <li className="mb-1">Copy your free API Key from the OpenWeather account dashboard.</li>
                  <li className="mb-1">Open <code>server/.env</code> in your project folder.</li>
                  <li className="mb-1">Set <code>OPENWEATHER_API_KEY=your_key_here</code>.</li>
                  <li>Restart the backend server.</li>
                </ol>
                <div className="p-2 rounded bg-light border text-muted">
                  <strong>Current Status:</strong> {weather?.isRealtimeAPI ? '🟢 Active Realtime API' : '🟡 Simulated Fallback Mode Active'}
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-agri-primary" onClick={() => setShowApiModal(false)}>
                  Understood
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default WeatherPage;
