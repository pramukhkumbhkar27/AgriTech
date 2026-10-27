import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useTranslation } from 'react-i18next';
import {
  FaChartPie,
  FaTractor,
  FaSeedling,
  FaCloudSunRain,
  FaVial,
  FaBug,
  FaStore,
  FaClipboardList,
  FaUserMd,
  FaComments,
  FaCalendarAlt,
  FaShieldAlt,
  FaUserCog,
} from 'react-icons/fa';

const Sidebar = ({ isOpen, onClose }) => {
  const { user } = useAuth();
  const { t } = useTranslation();

  const farmerNav = [
    { to: '/dashboard', label: t('nav.dashboard'), icon: <FaChartPie /> },
    { to: '/farms', label: t('nav.farms'), icon: <FaTractor /> },
    { to: '/crops', label: t('nav.crops'), icon: <FaSeedling /> },
    { to: '/weather', label: t('nav.weather'), icon: <FaCloudSunRain /> },
    { to: '/soil', label: t('nav.soilHealth'), icon: <FaVial /> },
    { to: '/pest-alerts', label: t('nav.pestAlerts'), icon: <FaBug /> },
    { to: '/marketplace', label: t('nav.marketplace'), icon: <FaStore /> },
    { to: '/orders', label: t('nav.orders'), icon: <FaClipboardList /> },
    { to: '/consultations', label: t('nav.consultations'), icon: <FaUserMd /> },
    { to: '/forum', label: t('nav.forum'), icon: <FaComments /> },
    { to: '/calendar', label: t('nav.calendar'), icon: <FaCalendarAlt /> },
  ];

  const expertNav = [
    { to: '/expert-dashboard', label: 'Advisory Dashboard', icon: <FaChartPie /> },
    { to: '/consultations', label: 'Farmer Requests', icon: <FaUserMd /> },
    { to: '/pest-alerts', label: 'Pest Advisories', icon: <FaBug /> },
    { to: '/crops', label: 'Crop Library', icon: <FaSeedling /> },
    { to: '/forum', label: t('nav.forum'), icon: <FaComments /> },
    { to: '/profile', label: 'Expert Profile', icon: <FaUserCog /> },
  ];

  const adminNav = [
    { to: '/admin', label: 'Admin Overview', icon: <FaShieldAlt /> },
    { to: '/farms', label: 'Farms Registry', icon: <FaTractor /> },
    { to: '/crops', label: 'Crop Database', icon: <FaSeedling /> },
    { to: '/marketplace', label: 'Product Catalog', icon: <FaStore /> },
    { to: '/pest-alerts', label: 'Alert Verification', icon: <FaBug /> },
    { to: '/forum', label: 'Forum Moderation', icon: <FaComments /> },
    { to: '/profile', label: 'Admin Settings', icon: <FaUserCog /> },
  ];

  let navItems = farmerNav;
  if (user?.role === 'expert') navItems = expertNav;
  if (user?.role === 'admin') navItems = adminNav;

  return (
    <>
      {/* Mobile backdrop */}
      {isOpen && (
        <div
          className="modal-backdrop fade show d-lg-none"
          style={{ zIndex: 1025 }}
          onClick={onClose}
        ></div>
      )}

      <aside className={`agri-sidebar ${isOpen ? 'show' : ''}`}>
        <div className="px-2 mb-3">
          <div className="p-2 rounded bg-light border d-flex align-items-center">
            <div
              className="rounded-circle d-flex align-items-center justify-content-center text-white me-2"
              style={{ width: 34, height: 34, background: '#2d6a4f' }}
            >
              {user?.name?.charAt(0) || 'U'}
            </div>
            <div className="overflow-hidden">
              <div className="fw-bold small text-truncate">{user?.name}</div>
              <div className="text-muted text-uppercase" style={{ fontSize: '0.65rem' }}>
                {user?.role} Portal
              </div>
            </div>
          </div>
        </div>

        <nav className="nav flex-column">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              onClick={onClose}
              className={({ isActive }) =>
                `sidebar-nav-item ${isActive ? 'active' : ''}`
              }
            >
              <span className="nav-icon">{item.icon}</span>
              <span>{item.label}</span>
            </NavLink>
          ))}
        </nav>
      </aside>
    </>
  );
};

export default Sidebar;
