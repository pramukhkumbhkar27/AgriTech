import React from 'react';
import { Link } from 'react-router-dom';
import { FaLeaf, FaPhoneAlt, FaEnvelope, FaMapMarkerAlt, FaHeart } from 'react-icons/fa';

const Footer = () => {
  return (
    <footer className="bg-white border-top mt-auto pt-5 pb-4">
      <div className="container">
        <div className="row g-4">
          <div className="col-lg-4 col-md-6">
            <div className="d-flex align-items-center mb-3">
              <div
                className="d-flex align-items-center justify-content-center me-2 text-white rounded-circle"
                style={{ width: 36, height: 36, background: '#2d6a4f' }}
              >
                <FaLeaf />
              </div>
              <span className="fw-bold fs-4 text-dark brand-font">
                Agri<span style={{ color: '#2d6a4f' }}>Tech</span>
              </span>
            </div>
            <p className="text-muted small mb-3">
              Next-generation smart farming management platform empowering growers, agronomists, and agricultural
              communities with real-time agro-meteorology, NPK soil diagnostics, pest early warning advisories, and certified resource marketplaces.
            </p>
            <div className="small text-muted">
              <div>
                <FaPhoneAlt className="me-2 text-success" /> Kisan Helpline: <strong>1800-180-1551</strong> (Toll Free)
              </div>
              <div className="mt-1">
                <FaEnvelope className="me-2 text-success" /> support@agritech.com
              </div>
            </div>
          </div>

          <div className="col-lg-2 col-md-6 col-6">
            <h6 className="fw-bold text-dark mb-3">Platform Modules</h6>
            <ul className="list-unstyled small mb-0">
              <li className="mb-2"><Link to="/dashboard" className="text-secondary text-decoration-none">Farmer Dashboard</Link></li>
              <li className="mb-2"><Link to="/farms" className="text-secondary text-decoration-none">Farm Registry</Link></li>
              <li className="mb-2"><Link to="/crops" className="text-secondary text-decoration-none">Crop Management</Link></li>
              <li className="mb-2"><Link to="/weather" className="text-secondary text-decoration-none">Weather & Precautions</Link></li>
              <li className="mb-2"><Link to="/soil" className="text-secondary text-decoration-none">Soil Health Analysis</Link></li>
            </ul>
          </div>

          <div className="col-lg-3 col-md-6 col-6">
            <h6 className="fw-bold text-dark mb-3">Resources & Advisory</h6>
            <ul className="list-unstyled small mb-0">
              <li className="mb-2"><Link to="/pest-alerts" className="text-secondary text-decoration-none">Pest & Disease Alerts</Link></li>
              <li className="mb-2"><Link to="/marketplace" className="text-secondary text-decoration-none">Agri-Inputs Marketplace</Link></li>
              <li className="mb-2"><Link to="/consultations" className="text-secondary text-decoration-none">Consult an Expert</Link></li>
              <li className="mb-2"><Link to="/forum" className="text-secondary text-decoration-none">Kisan Discussion Forum</Link></li>
              <li className="mb-2"><Link to="/calendar" className="text-secondary text-decoration-none">Farm Calendar</Link></li>
            </ul>
          </div>

          <div className="col-lg-3 col-md-6">
            <h6 className="fw-bold text-dark mb-3">Notice & Transparency</h6>
            <p className="text-muted small" style={{ fontSize: '0.8rem' }}>
              <strong>Educational Disclaimer:</strong> Soil recommendations, weather predictions, and pest advisories provide indicative agronomical guidance. Actual inputs depend on regional soil testing, microclimate, and local Krishi Vigyan Kendra (KVK) guidelines.
            </p>
            <div className="p-2 rounded bg-light border small text-muted">
              Built with MERN Stack • React Vite • Bootstrap 5 • Recharts • MongoDB
            </div>
          </div>
        </div>

        <hr className="my-4" />

        <div className="d-flex flex-column flex-md-row justify-content-between align-items-center small text-muted">
          <div>
            © {new Date().getFullYear()} Agri-Tech Smart Farming Management System. All rights reserved.
          </div>
          <div className="mt-2 mt-md-0">
            Dedicated to sustainable agriculture and farmer empowerment.
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
