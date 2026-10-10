import React, { useState } from 'react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';

export default function SettingsPage() {
    const { user } = useAuth();
    const [retentionDays, setRetentionDays] = useState(30);
    const [purging, setPurging] = useState(false);
    const [message, setMessage] = useState(null);
    const [error, setError] = useState(null);

    const handleApplyRetention = async (e) => {
        e.preventDefault();
        if (!window.confirm(`Are you sure you want to permanently purge check result logs older than ${retentionDays} days?`)) {
            return;
        }

        try {
            setPurging(true);
            setMessage(null);
            setError(null);
            const res = await api.post(`/api/settings/retention/apply?retentionDays=${retentionDays}`);
            setMessage(res.data?.message || `Successfully purged records older than ${retentionDays} days.`);
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to apply retention policy.');
        } finally {
            setPurging(false);
        }
    };

    return (
        <div>
            <div className="mb-4">
                <h3 className="fw-bold mb-1">System Settings & Configuration</h3>
                <p className="text-muted mb-0">Manage global data retention, security controls, and review engine configuration.</p>
            </div>

            {message && (
                <div className="alert alert-success alert-dismissible fade show" role="alert">
                    <i className="bi bi-check-circle me-2"></i> {message}
                    <button type="button" className="btn-close" onClick={() => setMessage(null)}></button>
                </div>
            )}

            {error && (
                <div className="alert alert-danger" role="alert">
                    <i className="bi bi-exclamation-octagon me-2"></i> {error}
                </div>
            )}

            <div className="row g-4">
                {/* Data Retention Card */}
                <div className="col-lg-6">
                    <div className="card border-0 shadow-sm rounded-3 h-100">
                        <div className="card-header bg-white py-3 border-bottom">
                            <h6 className="mb-0 fw-bold">
                                <i className="bi bi-database-check me-2 text-primary"></i> Data Retention Policy
                            </h6>
                        </div>
                        <div className="card-body p-4">
                            <p className="text-muted small">
                                ServiceWatch stores health check results for historical metrics and uptime calculation.
                                To manage MongoDB storage growth, configure a log retention threshold or trigger manual cleanup.
                            </p>

                            <form onSubmit={handleApplyRetention}>
                                <div className="mb-3">
                                    <label className="form-label small fw-bold">Retention Threshold (Days)</label>
                                    <select
                                        className="form-select"
                                        value={retentionDays}
                                        onChange={(e) => setRetentionDays(Number(e.target.value))}
                                    >
                                        <option value={7}>7 Days (High frequency pruning)</option>
                                        <option value={14}>14 Days</option>
                                        <option value={30}>30 Days (Recommended default)</option>
                                        <option value={60}>60 Days</option>
                                        <option value={90}>90 Days (Quarterly archiving)</option>
                                    </select>
                                </div>
                                <button
                                    type="submit"
                                    className="btn btn-outline-danger btn-sm"
                                    disabled={purging || user?.role !== 'ADMIN'}
                                >
                                    <i className="bi bi-trash3 me-1"></i>
                                    {purging ? 'Purging Old Records...' : `Purge Records Older Than ${retentionDays} Days`}
                                </button>
                                {user?.role !== 'ADMIN' && (
                                    <div className="form-text text-warning mt-2">
                                        <i className="bi bi-shield-lock me-1"></i> Administrator role required to purge database records.
                                    </div>
                                )}
                            </form>
                        </div>
                    </div>
                </div>

                {/* SSRF & Security Rules Card */}
                <div className="col-lg-6">
                    <div className="card border-0 shadow-sm rounded-3 h-100">
                        <div className="card-header bg-white py-3 border-bottom">
                            <h6 className="mb-0 fw-bold">
                                <i className="bi bi-shield-shaded me-2 text-success"></i> SSRF Protection Rules
                            </h6>
                        </div>
                        <div className="card-body p-4">
                            <p className="text-muted small">
                                The monitoring engine enforces strict outbound security filtering to prevent Server-Side Request Forgery (SSRF).
                            </p>
                            <ul className="list-group list-group-flush small">
                                <li className="list-group-item d-flex justify-content-between px-0">
                                    <span>Loopback Protection</span>
                                    <span className="badge bg-success-subtle text-success">127.0.0.1 / ::1 Blocked</span>
                                </li>
                                <li className="list-group-item d-flex justify-content-between px-0">
                                    <span>Private RFC-1918 Ranges</span>
                                    <span className="badge bg-success-subtle text-success">10.0.0.0/8, 172.16.0.0/12, 192.168.0.0/16</span>
                                </li>
                                <li className="list-group-item d-flex justify-content-between px-0">
                                    <span>Cloud Metadata Endpoints</span>
                                    <span className="badge bg-success-subtle text-success">169.254.169.254 Blocked</span>
                                </li>
                                <li className="list-group-item d-flex justify-content-between px-0">
                                    <span>Internal Top-Level Domains</span>
                                    <span className="badge bg-success-subtle text-success">.local, .internal, .localhost</span>
                                </li>
                            </ul>
                        </div>
                    </div>
                </div>

                {/* Engine Configuration */}
                <div className="col-lg-6">
                    <div className="card border-0 shadow-sm rounded-3">
                        <div className="card-header bg-white py-3 border-bottom">
                            <h6 className="mb-0 fw-bold">
                                <i className="bi bi-cpu me-2 text-info"></i> Scheduler & Engine Specs
                            </h6>
                        </div>
                        <div className="card-body p-4">
                            <table className="table table-sm table-borderless small mb-0">
                                <tbody>
                                    <tr>
                                        <td className="text-muted">Scheduler Concurrency Pool:</td>
                                        <td className="fw-semibold">10 worker threads (Bounded)</td>
                                    </tr>
                                    <tr>
                                        <td className="text-muted">Default Check Interval:</td>
                                        <td className="fw-semibold">60 seconds</td>
                                    </tr>
                                    <tr>
                                        <td className="text-muted">Default Request Timeout:</td>
                                        <td className="fw-semibold">10 seconds</td>
                                    </tr>
                                    <tr>
                                        <td className="text-muted">Retry Policy:</td>
                                        <td className="fw-semibold">Configurable per-monitor with backoff</td>
                                    </tr>
                                    <tr>
                                        <td className="text-muted">SSL Warning Horizon:</td>
                                        <td className="fw-semibold">30 days prior to expiration</td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>

                {/* Environment Info */}
                <div className="col-lg-6">
                    <div className="card border-0 shadow-sm rounded-3">
                        <div className="card-header bg-white py-3 border-bottom">
                            <h6 className="mb-0 fw-bold">
                                <i className="bi bi-info-circle me-2 text-secondary"></i> System Diagnostics
                            </h6>
                        </div>
                        <div className="card-body p-4">
                            <table className="table table-sm table-borderless small mb-0">
                                <tbody>
                                    <tr>
                                        <td className="text-muted">Platform:</td>
                                        <td className="fw-semibold">ServiceWatch Observability v1.0.0</td>
                                    </tr>
                                    <tr>
                                        <td className="text-muted">Backend Runtime:</td>
                                        <td className="fw-semibold">Java 17 / Spring Boot 3.2.5</td>
                                    </tr>
                                    <tr>
                                        <td className="text-muted">Database:</td>
                                        <td className="fw-semibold">MongoDB 8.0 (Replica Set / Standalone)</td>
                                    </tr>
                                    <tr>
                                        <td className="text-muted">Frontend:</td>
                                        <td className="fw-semibold">React 18 + Vite + Bootstrap 5.3</td>
                                    </tr>
                                    <tr>
                                        <td className="text-muted">Authentication:</td>
                                        <td className="fw-semibold">BCrypt Hashing + Spring Security Session</td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
