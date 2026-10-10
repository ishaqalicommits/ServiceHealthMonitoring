import React, { useState } from 'react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';

export default function ProfilePage() {
    const { user, setUser } = useAuth();

    // Profile state
    const [username, setUsername] = useState(user?.username || '');
    const [timezone, setTimezone] = useState(user?.timezone || 'UTC');
    const [themePreference, setThemePreference] = useState(user?.themePreference || 'light');
    const [profileSaving, setProfileSaving] = useState(false);
    const [profileMsg, setProfileMsg] = useState(null);
    const [profileErr, setProfileErr] = useState(null);

    // Password state
    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [passwordSaving, setPasswordSaving] = useState(false);
    const [passwordMsg, setPasswordMsg] = useState(null);
    const [passwordErr, setPasswordErr] = useState(null);

    const handleUpdateProfile = async (e) => {
        e.preventDefault();
        try {
            setProfileSaving(true);
            setProfileMsg(null);
            setProfileErr(null);

            const res = await api.post('/api/profile/update', {
                username,
                timezone,
                themePreference
            });

            setUser(res.data);
            setProfileMsg('Profile updated successfully.');
        } catch (err) {
            setProfileErr(err.response?.data?.message || 'Failed to update profile');
        } finally {
            setProfileSaving(false);
        }
    };

    const handleChangePassword = async (e) => {
        e.preventDefault();
        setPasswordMsg(null);
        setPasswordErr(null);

        if (newPassword.length < 6) {
            setPasswordErr('New password must be at least 6 characters long.');
            return;
        }

        if (newPassword !== confirmPassword) {
            setPasswordErr('New passwords do not match.');
            return;
        }

        try {
            setPasswordSaving(true);
            const res = await api.post('/api/profile/password', {
                currentPassword,
                newPassword
            });

            setPasswordMsg(res.data?.message || 'Password changed successfully.');
            setCurrentPassword('');
            setNewPassword('');
            setConfirmPassword('');
        } catch (err) {
            setPasswordErr(err.response?.data?.message || 'Failed to change password. Ensure current password is correct.');
        } finally {
            setPasswordSaving(false);
        }
    };

    return (
        <div>
            <div className="mb-4">
                <h3 className="fw-bold mb-1">User Profile & Account Settings</h3>
                <p className="text-muted mb-0">Manage your personal preferences, display timezone, and security credentials.</p>
            </div>

            <div className="row g-4">
                {/* Profile Details & Preferences */}
                <div className="col-lg-6">
                    <div className="card border-0 shadow-sm rounded-3">
                        <div className="card-header bg-white py-3 border-bottom">
                            <h6 className="mb-0 fw-bold">
                                <i className="bi bi-person-gear me-2 text-primary"></i> Account Details
                            </h6>
                        </div>
                        <div className="card-body p-4">
                            {profileMsg && (
                                <div className="alert alert-success alert-dismissible fade show small" role="alert">
                                    <i className="bi bi-check-circle me-1"></i> {profileMsg}
                                    <button type="button" className="btn-close" onClick={() => setProfileMsg(null)}></button>
                                </div>
                            )}

                            {profileErr && (
                                <div className="alert alert-danger small" role="alert">
                                    <i className="bi bi-exclamation-octagon me-1"></i> {profileErr}
                                </div>
                            )}

                            <form onSubmit={handleUpdateProfile}>
                                <div className="mb-3">
                                    <label className="form-label small fw-bold">Email Address</label>
                                    <input
                                        type="email"
                                        className="form-control bg-light"
                                        value={user?.email || ''}
                                        disabled
                                        readOnly
                                    />
                                    <div className="form-text small">Email address is managed by platform administrators.</div>
                                </div>

                                <div className="mb-3">
                                    <label className="form-label small fw-bold">Username</label>
                                    <input
                                        type="text"
                                        className="form-control"
                                        required
                                        value={username}
                                        onChange={(e) => setUsername(e.target.value)}
                                    />
                                </div>

                                <div className="mb-3">
                                    <label className="form-label small fw-bold">Assigned Role</label>
                                    <div>
                                        <span className={`badge ${
                                            user?.role === 'ADMIN' ? 'bg-danger' : user?.role === 'OPERATOR' ? 'bg-primary' : 'bg-secondary'
                                        }`}>
                                            {user?.role}
                                        </span>
                                    </div>
                                </div>

                                <div className="mb-3">
                                    <label className="form-label small fw-bold">Display Timezone</label>
                                    <select
                                        className="form-select"
                                        value={timezone}
                                        onChange={(e) => setTimezone(e.target.value)}
                                    >
                                        <option value="UTC">UTC (Coordinated Universal Time)</option>
                                        <option value="Asia/Kolkata">Asia/Kolkata (IST +5:30)</option>
                                        <option value="America/New_York">America/New_York (EST/EDT)</option>
                                        <option value="America/Los_Angeles">America/Los_Angeles (PST/PDT)</option>
                                        <option value="Europe/London">Europe/London (GMT/BST)</option>
                                    </select>
                                </div>

                                <div className="mb-4">
                                    <label className="form-label small fw-bold">Theme Preference</label>
                                    <select
                                        className="form-select"
                                        value={themePreference}
                                        onChange={(e) => setThemePreference(e.target.value)}
                                    >
                                        <option value="light">Light Theme</option>
                                        <option value="dark">Dark Theme</option>
                                    </select>
                                </div>

                                <button
                                    type="submit"
                                    className="btn btn-primary"
                                    disabled={profileSaving}
                                >
                                    {profileSaving ? 'Saving Changes...' : 'Save Profile Preferences'}
                                </button>
                            </form>
                        </div>
                    </div>
                </div>

                {/* Password Change Card */}
                <div className="col-lg-6">
                    <div className="card border-0 shadow-sm rounded-3">
                        <div className="card-header bg-white py-3 border-bottom">
                            <h6 className="mb-0 fw-bold">
                                <i className="bi bi-key me-2 text-warning"></i> Change Password
                            </h6>
                        </div>
                        <div className="card-body p-4">
                            {passwordMsg && (
                                <div className="alert alert-success alert-dismissible fade show small" role="alert">
                                    <i className="bi bi-check-circle me-1"></i> {passwordMsg}
                                    <button type="button" className="btn-close" onClick={() => setPasswordMsg(null)}></button>
                                </div>
                            )}

                            {passwordErr && (
                                <div className="alert alert-danger small" role="alert">
                                    <i className="bi bi-exclamation-octagon me-1"></i> {passwordErr}
                                </div>
                            )}

                            <form onSubmit={handleChangePassword}>
                                <div className="mb-3">
                                    <label className="form-label small fw-bold">Current Password</label>
                                    <input
                                        type="password"
                                        className="form-control"
                                        required
                                        value={currentPassword}
                                        onChange={(e) => setCurrentPassword(e.target.value)}
                                    />
                                </div>

                                <div className="mb-3">
                                    <label className="form-label small fw-bold">New Password</label>
                                    <input
                                        type="password"
                                        className="form-control"
                                        required
                                        minLength="6"
                                        value={newPassword}
                                        onChange={(e) => setNewPassword(e.target.value)}
                                    />
                                    <div className="form-text small">Minimum 6 characters.</div>
                                </div>

                                <div className="mb-4">
                                    <label className="form-label small fw-bold">Confirm New Password</label>
                                    <input
                                        type="password"
                                        className="form-control"
                                        required
                                        minLength="6"
                                        value={confirmPassword}
                                        onChange={(e) => setConfirmPassword(e.target.value)}
                                    />
                                </div>

                                <button
                                    type="submit"
                                    className="btn btn-warning text-dark fw-semibold"
                                    disabled={passwordSaving}
                                >
                                    {passwordSaving ? 'Updating Password...' : 'Update Password'}
                                </button>
                            </form>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
