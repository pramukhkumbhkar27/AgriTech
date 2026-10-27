import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const ProtectedRoute = ({ allowedRoles = [] }) => {
  const { isAuthenticated, user, loading } = useAuth();

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center vh-100">
        <div className="spinner-border text-success" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles.length > 0 && !allowedRoles.includes(user?.role)) {
    return (
      <div className="container py-5 text-center">
        <div className="card shadow-sm p-5 border-0 mx-auto" style={{ maxWidth: 500 }}>
          <h3 className="text-danger fw-bold mb-3">Access Restricted</h3>
          <p className="text-muted">
            Your current role (<strong>{user?.role}</strong>) does not have permission to view this section.
          </p>
          <div>
            <a href="/dashboard" className="btn btn-agri-primary">
              Return to My Dashboard
            </a>
          </div>
        </div>
      </div>
    );
  }

  return <Outlet />;
};

export default ProtectedRoute;
