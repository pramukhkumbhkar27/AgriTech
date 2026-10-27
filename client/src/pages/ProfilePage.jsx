import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { FaUserCircle, FaSave, FaLock, FaCheckCircle } from 'react-icons/fa';

const ProfilePage = () => {
  const { user, updateProfile, changePassword } = useAuth();

  const [formData, setFormData] = useState({
    name: user?.name || '',
    phone: user?.phone || '',
    address: user?.address || '',
    city: user?.location?.city || '',
    state: user?.location?.state || '',
    specialization: user?.specialization || '',
    bio: user?.bio || '',
  });

  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  const [profileMsg, setProfileMsg] = useState({ type: '', text: '' });
  const [passMsg, setPassMsg] = useState({ type: '', text: '' });
  const [savingProfile, setSavingProfile] = useState(false);
  const [savingPass, setSavingPass] = useState(false);

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    setProfileMsg({ type: '', text: '' });
    setSavingProfile(true);

    try {
      const res = await updateProfile({
        name: formData.name,
        phone: formData.phone,
        address: formData.address,
        location: { city: formData.city, state: formData.state },
        specialization: formData.specialization,
        bio: formData.bio,
      });

      if (res.success) {
        setProfileMsg({ type: 'success', text: 'Profile updated successfully!' });
      } else {
        setProfileMsg({ type: 'danger', text: res.message || 'Update failed' });
      }
    } catch (err) {
      setProfileMsg({ type: 'danger', text: err.response?.data?.message || 'Error updating profile' });
    } finally {
      setSavingProfile(false);
    }
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    setPassMsg({ type: '', text: '' });

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setPassMsg({ type: 'danger', text: 'New password and confirmation do not match.' });
      return;
    }

    if (passwordData.newPassword.length < 6) {
      setPassMsg({ type: 'danger', text: 'New password must be at least 6 characters.' });
      return;
    }

    setSavingPass(true);
    try {
      const res = await changePassword(passwordData.currentPassword, passwordData.newPassword);
      if (res.success) {
        setPassMsg({ type: 'success', text: 'Password updated successfully!' });
        setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
      } else {
        setPassMsg({ type: 'danger', text: res.message || 'Failed to update password' });
      }
    } catch (err) {
      setPassMsg({ type: 'danger', text: err.response?.data?.message || 'Error updating password' });
    } finally {
      setSavingPass(false);
    }
  };

  return (
    <div className="profile-page pb-5">
      <div className="mb-4">
        <h2 className="fw-bold mb-1">User Profile & Account Security</h2>
        <p className="text-muted small mb-0">Manage your contact details, farm addresses, and login credentials.</p>
      </div>

      <div className="row g-4">
        {/* Profile Details Form */}
        <div className="col-lg-7">
          <div className="card border-0 shadow-sm rounded-4 p-4 bg-white">
            <div className="d-flex align-items-center gap-3 mb-4">
              <div
                className="rounded-circle d-flex align-items-center justify-content-center text-white fw-bold fs-3"
                style={{ width: 64, height: 64, background: '#2d6a4f' }}
              >
                {user?.name?.charAt(0) || 'U'}
              </div>
              <div>
                <h5 className="fw-bold text-dark mb-0">{user?.name}</h5>
                <span className="badge bg-success-subtle text-success text-uppercase">
                  Role: {user?.role}
                </span>
                <div className="text-muted small">{user?.email}</div>
              </div>
            </div>

            {profileMsg.text && (
              <div className={`alert alert-${profileMsg.type} py-2 small`}>{profileMsg.text}</div>
            )}

            <form onSubmit={handleProfileSubmit}>
              <div className="row g-3">
                <div className="col-md-6">
                  <label className="form-label small fw-semibold">Full Name *</label>
                  <input
                    type="text"
                    className="form-control"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                  />
                </div>

                <div className="col-md-6">
                  <label className="form-label small fw-semibold">Phone / WhatsApp</label>
                  <input
                    type="text"
                    className="form-control"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  />
                </div>

                <div className="col-md-6">
                  <label className="form-label small fw-semibold">City / District</label>
                  <input
                    type="text"
                    className="form-control"
                    value={formData.city}
                    onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                  />
                </div>

                <div className="col-md-6">
                  <label className="form-label small fw-semibold">State</label>
                  <input
                    type="text"
                    className="form-control"
                    value={formData.state}
                    onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                  />
                </div>

                <div className="col-12">
                  <label className="form-label small fw-semibold">Permanent Farm Address</label>
                  <input
                    type="text"
                    className="form-control"
                    value={formData.address}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  />
                </div>

                {user?.role === 'expert' && (
                  <div className="col-12">
                    <label className="form-label small fw-semibold">Agricultural Specialization</label>
                    <input
                      type="text"
                      className="form-control"
                      value={formData.specialization}
                      onChange={(e) => setFormData({ ...formData, specialization: e.target.value })}
                    />
                  </div>
                )}

                <div className="col-12">
                  <label className="form-label small fw-semibold">Bio / Agricultural Background</label>
                  <textarea
                    rows="3"
                    className="form-control"
                    value={formData.bio}
                    onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                  ></textarea>
                </div>

                <div className="col-12">
                  <button type="submit" disabled={savingProfile} className="btn btn-agri-primary">
                    <FaSave className="me-1" /> {savingProfile ? 'Saving...' : 'Save Profile Changes'}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>

        {/* Change Password Form */}
        <div className="col-lg-5">
          <div className="card border-0 shadow-sm rounded-4 p-4 bg-white h-100">
            <h5 className="fw-bold text-dark mb-3 d-flex align-items-center gap-2">
              <FaLock className="text-secondary" /> Change Password
            </h5>

            {passMsg.text && (
              <div className={`alert alert-${passMsg.type} py-2 small`}>{passMsg.text}</div>
            )}

            <form onSubmit={handlePasswordSubmit}>
              <div className="mb-3">
                <label className="form-label small fw-semibold">Current Password *</label>
                <input
                  type="password"
                  className="form-control"
                  placeholder="••••••••"
                  value={passwordData.currentPassword}
                  onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                  required
                />
              </div>

              <div className="mb-3">
                <label className="form-label small fw-semibold">New Password (min 6 chars) *</label>
                <input
                  type="password"
                  className="form-control"
                  placeholder="••••••••"
                  value={passwordData.newPassword}
                  onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                  required
                />
              </div>

              <div className="mb-4">
                <label className="form-label small fw-semibold">Confirm New Password *</label>
                <input
                  type="password"
                  className="form-control"
                  placeholder="••••••••"
                  value={passwordData.confirmPassword}
                  onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                  required
                />
              </div>

              <button type="submit" disabled={savingPass} className="btn btn-agri-secondary w-100">
                {savingPass ? 'Updating...' : 'Update Password'}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
