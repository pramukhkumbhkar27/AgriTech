import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import MainLayout from './layouts/MainLayout';
import PublicLayout from './layouts/PublicLayout';
import ProtectedRoute from './components/common/ProtectedRoute';

// Pages
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import FarmerDashboardPage from './pages/FarmerDashboardPage';
import FarmsPage from './pages/FarmsPage';
import FarmDetailsPage from './pages/FarmDetailsPage';
import CropsPage from './pages/CropsPage';
import CropDetailsPage from './pages/CropDetailsPage';
import WeatherPage from './pages/WeatherPage';
import SoilHealthPage from './pages/SoilHealthPage';
import PestAlertsPage from './pages/PestAlertsPage';
import MarketplacePage from './pages/MarketplacePage';
import OrdersHistoryPage from './pages/OrdersHistoryPage';
import ConsultationsPage from './pages/ConsultationsPage';
import ExpertDashboardPage from './pages/ExpertDashboardPage';
import ForumPage from './pages/ForumPage';
import CalendarPage from './pages/CalendarPage';
import AdminDashboardPage from './pages/AdminDashboardPage';
import ProfilePage from './pages/ProfilePage';

function App() {
  return (
    <Routes>
      {/* Public Routes with Public Layout */}
      <Route element={<PublicLayout />}>
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
      </Route>

      {/* Authenticated Protected Routes with Sidebar & Navbar Layout */}
      <Route element={<ProtectedRoute />}>
        <Route element={<MainLayout />}>
          <Route path="/dashboard" element={<FarmerDashboardPage />} />
          <Route path="/farms" element={<FarmsPage />} />
          <Route path="/farms/:id" element={<FarmDetailsPage />} />
          <Route path="/crops" element={<CropsPage />} />
          <Route path="/crops/:id" element={<CropDetailsPage />} />
          <Route path="/weather" element={<WeatherPage />} />
          <Route path="/soil" element={<SoilHealthPage />} />
          <Route path="/pest-alerts" element={<PestAlertsPage />} />
          <Route path="/marketplace" element={<MarketplacePage />} />
          <Route path="/orders" element={<OrdersHistoryPage />} />
          <Route path="/consultations" element={<ConsultationsPage />} />
          <Route path="/forum" element={<ForumPage />} />
          <Route path="/calendar" element={<CalendarPage />} />
          <Route path="/profile" element={<ProfilePage />} />
        </Route>
      </Route>

      {/* Expert Only Portal */}
      <Route element={<ProtectedRoute allowedRoles={['expert', 'admin']} />}>
        <Route element={<MainLayout />}>
          <Route path="/expert-dashboard" element={<ExpertDashboardPage />} />
        </Route>
      </Route>

      {/* Admin Only Portal */}
      <Route element={<ProtectedRoute allowedRoles={['admin']} />}>
        <Route element={<MainLayout />}>
          <Route path="/admin" element={<AdminDashboardPage />} />
        </Route>
      </Route>

      {/* Catch-all redirect */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default App;
