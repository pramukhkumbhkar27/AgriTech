import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';
import { useTranslation } from 'react-i18next';
import { changeLanguage } from '../../i18n/i18n';
import api from '../../services/api';
import {
  FaLeaf,
  FaBell,
  FaShoppingCart,
  FaUserCircle,
  FaGlobe,
  FaSignOutAlt,
  FaBars,
  FaCheckDouble,
} from 'react-icons/fa';

const Navbar = ({ onToggleSidebar }) => {
  const { user, isAuthenticated, logout } = useAuth();
  const { cartCount } = useCart();
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();

  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [showNotifications, setShowNotifications] = useState(false);

  useEffect(() => {
    if (isAuthenticated) {
      fetchNotifications();
      const interval = setInterval(fetchNotifications, 60000); // refresh every minute
      return () => clearInterval(interval);
    }
  }, [isAuthenticated]);

  const fetchNotifications = async () => {
    try {
      const res = await api.get('/notifications');
      if (res.data.success) {
        setNotifications(res.data.notifications);
        setUnreadCount(res.data.unreadCount);
      }
    } catch {
      // silent
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await api.put('/notifications/read-all');
      setUnreadCount(0);
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
    } catch {
      // silent
    }
  };

  const handleLanguageChange = (lang) => {
    changeLanguage(lang);
  };

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const getRoleBadgeClass = (role) => {
    if (role === 'admin') return 'bg-danger';
    if (role === 'expert') return 'bg-primary';
    return 'bg-success';
  };

  return (
    <nav className="navbar navbar-expand-lg agri-navbar px-3 px-lg-4">
      <div className="container-fluid p-0">
        <div className="d-flex align-items-center">
          {isAuthenticated && (
            <button
              className="btn btn-sm btn-outline-secondary d-lg-none me-2"
              onClick={onToggleSidebar}
              type="button"
              aria-label="Toggle Sidebar"
            >
              <FaBars />
            </button>
          )}

          <Link to="/" className="navbar-brand d-flex align-items-center text-decoration-none">
            <div
              className="d-flex align-items-center justify-content-center me-2 text-white rounded-circle shadow-sm"
              style={{
                width: 40,
                height: 40,
                background: 'linear-gradient(135deg, #2d6a4f 0%, #1b4332 100%)',
              }}
            >
              <FaLeaf className="fs-5" />
            </div>
            <div>
              <span className="fw-bold fs-4 text-dark brand-font" style={{ letterSpacing: '-0.5px' }}>
                Agri<span style={{ color: '#2d6a4f' }}>Tech</span>
              </span>
              <span className="badge ms-2 bg-light text-dark border d-none d-sm-inline-block" style={{ fontSize: '0.65rem' }}>
                Smart Farming
              </span>
            </div>
          </Link>
        </div>

        <div className="d-flex align-items-center gap-2 gap-md-3">
          {/* Language Switcher */}
          <div className="dropdown">
            <button
              className="btn btn-sm btn-light border d-flex align-items-center gap-1 dropdown-toggle px-2"
              type="button"
              id="langDropdown"
              data-bs-toggle="dropdown"
              aria-expanded="false"
            >
              <FaGlobe className="text-secondary" />
              <span className="fw-medium text-uppercase">{i18n.language}</span>
            </button>
            <ul className="dropdown-menu dropdown-menu-end shadow-sm" aria-labelledby="langDropdown">
              <li>
                <button
                  className={`dropdown-item ${i18n.language === 'en' ? 'active' : ''}`}
                  onClick={() => handleLanguageChange('en')}
                >
                  🇬🇧 English
                </button>
              </li>
              <li>
                <button
                  className={`dropdown-item ${i18n.language === 'hi' ? 'active' : ''}`}
                  onClick={() => handleLanguageChange('hi')}
                >
                  🇮🇳 हिन्दी (Hindi)
                </button>
              </li>
            </ul>
          </div>

          {isAuthenticated ? (
            <>
              {/* Marketplace Cart Pill */}
              <Link
                to="/marketplace"
                className="btn btn-sm btn-light border position-relative d-flex align-items-center gap-1 px-3"
                title="Marketplace Cart"
              >
                <FaShoppingCart className="text-secondary" />
                <span className="d-none d-md-inline fw-medium">{t('marketplace.cart')}</span>
                {cartCount > 0 && (
                  <span className="badge rounded-pill bg-danger ms-1" style={{ fontSize: '0.7rem' }}>
                    {cartCount}
                  </span>
                )}
              </Link>

              {/* Notifications Dropdown */}
              <div className="position-relative">
                <button
                  className="btn btn-sm btn-light border position-relative p-2"
                  onClick={() => setShowNotifications(!showNotifications)}
                  aria-label="Notifications"
                >
                  <FaBell className="text-secondary" />
                  {unreadCount > 0 && (
                    <span
                      className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger"
                      style={{ fontSize: '0.65rem' }}
                    >
                      {unreadCount}
                    </span>
                  )}
                </button>

                {showNotifications && (
                  <div
                    className="card position-absolute end-0 mt-2 shadow-lg z-3 border"
                    style={{ width: 330, maxHeight: 420, overflowY: 'auto' }}
                  >
                    <div className="card-header bg-white d-flex justify-content-between align-items-center py-2 px-3">
                      <span className="fw-bold small">Notifications ({unreadCount} new)</span>
                      {unreadCount > 0 && (
                        <button
                          className="btn btn-link btn-sm p-0 text-success text-decoration-none small"
                          onClick={handleMarkAllRead}
                        >
                          <FaCheckDouble className="me-1" /> Mark read
                        </button>
                      )}
                    </div>
                    <div className="list-group list-group-flush">
                      {notifications.length === 0 ? (
                        <div className="p-3 text-center text-muted small">No new notifications</div>
                      ) : (
                        notifications.map((item) => (
                          <div
                            key={item._id}
                            className={`list-group-item list-group-item-action p-2 px-3 small ${
                              !item.isRead ? 'bg-light' : ''
                            }`}
                          >
                            <div className="d-flex justify-content-between align-items-start">
                              <span className="fw-semibold text-dark">{item.title}</span>
                              <span className="badge bg-secondary" style={{ fontSize: '0.6rem' }}>
                                {item.type}
                              </span>
                            </div>
                            <p className="mb-1 text-muted small">{item.message}</p>
                            <span className="text-secondary" style={{ fontSize: '0.7rem' }}>
                              {new Date(item.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </span>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* User Dropdown */}
              <div className="dropdown">
                <button
                  className="btn btn-sm btn-light border d-flex align-items-center gap-2 dropdown-toggle px-2 py-1"
                  type="button"
                  id="userDropdown"
                  data-bs-toggle="dropdown"
                  aria-expanded="false"
                >
                  <FaUserCircle className="fs-5 text-secondary" />
                  <span className="fw-semibold d-none d-md-inline text-truncate" style={{ maxWidth: 120 }}>
                    {user?.name}
                  </span>
                  <span className={`badge ${getRoleBadgeClass(user?.role)} text-uppercase`} style={{ fontSize: '0.65rem' }}>
                    {user?.role}
                  </span>
                </button>
                <ul className="dropdown-menu dropdown-menu-end shadow-sm" aria-labelledby="userDropdown">
                  <li className="px-3 py-2 border-bottom">
                    <div className="fw-bold text-dark">{user?.name}</div>
                    <div className="text-muted small text-truncate" style={{ maxWidth: 200 }}>
                      {user?.email}
                    </div>
                  </li>
                  <li>
                    <Link className="dropdown-item" to="/dashboard">
                      📊 {t('nav.dashboard')}
                    </Link>
                  </li>
                  {user?.role === 'admin' && (
                    <li>
                      <Link className="dropdown-item" to="/admin">
                        🛡️ {t('nav.admin')}
                      </Link>
                    </li>
                  )}
                  {user?.role === 'expert' && (
                    <li>
                      <Link className="dropdown-item" to="/expert-dashboard">
                        🔬 Expert Advisory Dashboard
                      </Link>
                    </li>
                  )}
                  <li>
                    <Link className="dropdown-item" to="/profile">
                      ⚙️ {t('nav.profile')}
                    </Link>
                  </li>
                  <li>
                    <hr className="dropdown-divider" />
                  </li>
                  <li>
                    <button className="dropdown-item text-danger d-flex align-items-center gap-2" onClick={handleLogout}>
                      <FaSignOutAlt /> {t('nav.logout')}
                    </button>
                  </li>
                </ul>
              </div>
            </>
          ) : (
            <div className="d-flex gap-2">
              <Link to="/login" className="btn btn-sm btn-outline-success fw-medium px-3">
                {t('nav.login')}
              </Link>
              <Link to="/register" className="btn btn-sm btn-agri-primary fw-medium px-3">
                {t('nav.register')}
              </Link>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
