import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';

export default function TeamPage() {
    const { user: currentUser } = useAuth();
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [successMessage, setSuccessMessage] = useState(null);

    // Add user modal state
    const [showModal, setShowModal] = useState(false);
    const [newUser, setNewUser] = useState({
        username: '',
        email: '',
        password: '',
        role: 'OPERATOR'
    });
    const [saving, setSaving] = useState(false);

    const fetchTeam = async () => {
        try {
            setLoading(true);
            const res = await api.get('/team');
            setUsers(res.data);
            setError(null);
        } catch (err) {
            console.error('Failed to fetch team members:', err);
            setError(err.response?.data?.message || 'Failed to load team members');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchTeam();
    }, []);

    const handleCreateUser = async (e) => {
        e.preventDefault();
        try {
            setSaving(true);
            await api.post('/team', newUser);
            setSuccessMessage(`User "${newUser.username}" created successfully.`);
            setShowModal(false);
            setNewUser({ username: '', email: '', password: '', role: 'OPERATOR' });
            fetchTeam();
        } catch (err) {
            alert(err.response?.data?.message || 'Failed to create user');
        } finally {
            setSaving(false);
        }
    };

    const handleRoleChange = async (userId, newRole) => {
        try {
            await api.post(`/team/${userId}/role`, { role: newRole });
            setSuccessMessage('User role updated successfully');
            fetchTeam();
        } catch (err) {
            alert(err.response?.data?.message || 'Failed to update user role');
        }
    };

    const handleToggleActive = async (userId) => {
        try {
            await api.post(`/team/${userId}/toggle-active`);
            setSuccessMessage('User status updated');
            fetchTeam();
        } catch (err) {
            alert(err.response?.data?.message || 'Failed to toggle user status');
        }
    };

    const handleDeleteUser = async (userId, username) => {
        if (!window.confirm(`Are you sure you want to permanently delete user "${username}"?`)) {
            return;
        }
        try {
            await api.delete(`/team/${userId}`);
            setSuccessMessage(`User "${username}" deleted`);
            fetchTeam();
        } catch (err) {
            alert(err.response?.data?.message || 'Failed to delete user');
        }
    };

    return (
        <div>
            <div className="d-flex justify-content-between align-items-center mb-4">
                <div>
                    <h3 className="fw-bold mb-1">Team Management</h3>
                    <p className="text-muted mb-0">Manage platform users, roles, and administrative privileges.</p>
                </div>
                {currentUser?.role === 'ADMIN' && (
                    <button className="btn btn-primary" onClick={() => setShowModal(true)}>
                        <i className="bi bi-person-plus me-1"></i> Add Team Member
                    </button>
                )}
            </div>

            {successMessage && (
                <div className="alert alert-success alert-dismissible fade show" role="alert">
                    <i className="bi bi-check-circle me-2"></i> {successMessage}
                    <button type="button" className="btn-close" onClick={() => setSuccessMessage(null)}></button>
                </div>
            )}

            {error && (
                <div className="alert alert-danger" role="alert">
                    <i className="bi bi-exclamation-octagon me-2"></i> {error}
                </div>
            )}

            <div className="card table-card shadow-sm border-0">
                <div className="card-header bg-white py-3">
                    <h6 className="mb-0 fw-bold">Active Platform Members ({users.length})</h6>
                </div>
                <div className="table-responsive">
                    <table className="table table-hover align-middle mb-0">
                        <thead className="table-light">
                            <tr>
                                <th>User</th>
                                <th>Email</th>
                                <th>Role</th>
                                <th>Status</th>
                                <th>Last Login</th>
                                <th>Created</th>
                                {currentUser?.role === 'ADMIN' && <th className="text-end">Actions</th>}
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr>
                                    <td colSpan={currentUser?.role === 'ADMIN' ? 7 : 6} className="text-center py-4">
                                        <div className="spinner-border spinner-border-sm text-primary me-2"></div> Loading team...
                                    </td>
                                </tr>
                            ) : users.length === 0 ? (
                                <tr>
                                    <td colSpan={currentUser?.role === 'ADMIN' ? 7 : 6} className="text-center py-4 text-muted">
                                        No team members found.
                                    </td>
                                </tr>
                            ) : (
                                users.map(u => (
                                    <tr key={u.id}>
                                        <td>
                                            <div className="d-flex align-items-center gap-2">
                                                <div className="avatar bg-primary-subtle text-primary rounded-circle d-flex align-items-center justify-content-center fw-bold" style={{ width: 36, height: 36 }}>
                                                    {u.username.substring(0, 2).toUpperCase()}
                                                </div>
                                                <div>
                                                    <div className="fw-semibold">{u.username}</div>
                                                    {currentUser?.id === u.id && (
                                                        <span className="badge bg-light text-dark border">You</span>
                                                    )}
                                                </div>
                                            </div>
                                        </td>
                                        <td>{u.email}</td>
                                        <td>
                                            {currentUser?.role === 'ADMIN' && currentUser?.id !== u.id ? (
                                                <div className="d-flex align-items-center gap-2">
                                                    <span
                                                        className="d-inline-block rounded-circle flex-shrink-0"
                                                        style={{
                                                            width: 10, height: 10,
                                                            backgroundColor:
                                                                u.role === 'ADMIN' ? '#dc3545' :
                                                                u.role === 'OPERATOR' ? '#0d6efd' : '#6c757d'
                                                        }}
                                                    />
                                                    <select
                                                        className="form-select form-select-sm border-0 fw-semibold ps-1 pe-4"
                                                        style={{
                                                            width: '120px',
                                                            background: 'transparent',
                                                            color:
                                                                u.role === 'ADMIN' ? '#dc3545' :
                                                                u.role === 'OPERATOR' ? '#0d6efd' : '#6c757d',
                                                            cursor: 'pointer',
                                                            boxShadow: 'none'
                                                        }}
                                                        value={u.role}
                                                        onChange={(e) => handleRoleChange(u.id, e.target.value)}
                                                    >
                                                        <option value="ADMIN">ADMIN</option>
                                                        <option value="OPERATOR">OPERATOR</option>
                                                        <option value="VIEWER">VIEWER</option>
                                                    </select>
                                                </div>
                                            ) : (
                                                <span
                                                    className="badge px-3 py-2"
                                                    style={{
                                                        fontSize: '0.75rem',
                                                        letterSpacing: '0.05em',
                                                        backgroundColor:
                                                            u.role === 'ADMIN' ? '#dc354520' :
                                                            u.role === 'OPERATOR' ? '#0d6efd20' : '#6c757d20',
                                                        color:
                                                            u.role === 'ADMIN' ? '#dc3545' :
                                                            u.role === 'OPERATOR' ? '#0d6efd' : '#6c757d',
                                                        border: `1px solid ${
                                                            u.role === 'ADMIN' ? '#dc354550' :
                                                            u.role === 'OPERATOR' ? '#0d6efd50' : '#6c757d50'
                                                        }`,
                                                        borderRadius: '20px',
                                                    }}
                                                >
                                                    {u.role === 'ADMIN' && <i className="bi bi-shield-fill me-1" style={{ fontSize: '0.65rem' }}></i>}
                                                    {u.role === 'OPERATOR' && <i className="bi bi-wrench me-1" style={{ fontSize: '0.65rem' }}></i>}
                                                    {u.role === 'VIEWER' && <i className="bi bi-eye me-1" style={{ fontSize: '0.65rem' }}></i>}
                                                    {u.role}
                                                </span>
                                            )}
                                        </td>
                                        <td>
                                            {u.active ? (
                                                <span className="badge bg-success-subtle text-success border border-success">Active</span>
                                            ) : (
                                                <span className="badge bg-danger-subtle text-danger border border-danger">Disabled</span>
                                            )}
                                        </td>
                                        <td className="small text-muted">
                                            {u.lastLoginAt ? new Date(u.lastLoginAt).toLocaleString() : 'Never'}
                                        </td>
                                        <td className="small text-muted">
                                            {u.createdAt ? new Date(u.createdAt).toLocaleDateString() : 'N/A'}
                                        </td>
                                        {currentUser?.role === 'ADMIN' && (
                                            <td className="text-end">
                                                {currentUser?.id !== u.id && (
                                                    <div className="btn-group btn-group-sm">
                                                        <button
                                                            className={`btn ${u.active ? 'btn-outline-warning' : 'btn-outline-success'}`}
                                                            onClick={() => handleToggleActive(u.id)}
                                                            title={u.active ? 'Disable account' : 'Enable account'}
                                                        >
                                                            <i className={`bi ${u.active ? 'bi-lock' : 'bi-unlock'}`}></i>
                                                        </button>
                                                        <button
                                                            className="btn btn-outline-danger"
                                                            onClick={() => handleDeleteUser(u.id, u.username)}
                                                            title="Delete user"
                                                        >
                                                            <i className="bi bi-trash"></i>
                                                        </button>
                                                    </div>
                                                )}
                                            </td>
                                        )}
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Add User Modal */}
            {showModal && (
                <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }} tabIndex="-1">
                    <div className="modal-dialog modal-dialog-centered">
                        <div className="modal-content border-0 shadow">
                            <form onSubmit={handleCreateUser}>
                                <div className="modal-header">
                                    <h5 className="modal-title fw-bold">Add Team Member</h5>
                                    <button type="button" className="btn-close" onClick={() => setShowModal(false)}></button>
                                </div>
                                <div className="modal-body">
                                    <div className="mb-3">
                                        <label className="form-label small fw-bold">Username</label>
                                        <input
                                            type="text"
                                            className="form-control"
                                            required
                                            value={newUser.username}
                                            onChange={(e) => setNewUser({ ...newUser, username: e.target.value })}
                                            placeholder="e.g. john_ops"
                                        />
                                    </div>
                                    <div className="mb-3">
                                        <label className="form-label small fw-bold">Email Address</label>
                                        <input
                                            type="email"
                                            className="form-control"
                                            required
                                            value={newUser.email}
                                            onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                                            placeholder="john@example.com"
                                        />
                                    </div>
                                    <div className="mb-3">
                                        <label className="form-label small fw-bold">Initial Password</label>
                                        <input
                                            type="password"
                                            className="form-control"
                                            required
                                            minLength="6"
                                            value={newUser.password}
                                            onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
                                            placeholder="Minimum 6 characters"
                                        />
                                    </div>
                                    <div className="mb-3">
                                        <label className="form-label small fw-bold">Role</label>
                                        <select
                                            className="form-select"
                                            value={newUser.role}
                                            onChange={(e) => setNewUser({ ...newUser, role: e.target.value })}
                                        >
                                            <option value="OPERATOR">OPERATOR (Can manage monitors & incidents)</option>
                                            <option value="ADMIN">ADMIN (Full access + user management)</option>
                                            <option value="VIEWER">VIEWER (Read-only)</option>
                                        </select>
                                    </div>
                                </div>
                                <div className="modal-footer">
                                    <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
                                    <button type="submit" className="btn btn-primary" disabled={saving}>
                                        {saving ? 'Creating...' : 'Create Account'}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
