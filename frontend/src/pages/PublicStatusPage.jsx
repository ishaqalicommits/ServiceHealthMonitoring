import React, { useState, useEffect, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../services/api';

export default function PublicStatusPage() {
    const { slug } = useParams();
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [lastRefreshed, setLastRefreshed] = useState(null);
    const [countdown, setCountdown] = useState(30);

    const fetchStatusPage = useCallback(async (isBackground = false) => {
        try {
            if (!isBackground) setLoading(true);
            const res = await api.get(`/public/status/${slug}`);
            setData(res.data);
            setError(null);
            setLastRefreshed(new Date());
            setCountdown(30);
        } catch (err) {
            console.error('Failed to load public status page:', err);
            setError(err.response?.data?.message || 'Status page not found or unavailable');
        } finally {
            setLoading(false);
        }
    }, [slug]);

    useEffect(() => {
        if (slug) fetchStatusPage();
    }, [slug, fetchStatusPage]);

    // Auto-refresh every 30 seconds
    useEffect(() => {
        const interval = setInterval(() => fetchStatusPage(true), 30000);
        return () => clearInterval(interval);
    }, [fetchStatusPage]);

    // Countdown timer
    useEffect(() => {
        const timer = setInterval(() => {
            setCountdown(c => (c <= 1 ? 30 : c - 1));
        }, 1000);
        return () => clearInterval(timer);
    }, [lastRefreshed]);

    if (loading) {
        return (
            <div className="min-vh-100 d-flex align-items-center justify-content-center bg-light">
                <div className="spinner-border text-primary" role="status">
                    <span className="visually-hidden">Loading status page...</span>
                </div>
            </div>
        );
    }

    if (error || !data) {
        return (
            <div className="min-vh-100 d-flex align-items-center justify-content-center bg-light">
                <div className="text-center p-5 bg-white rounded-3 shadow-sm border" style={{ maxWidth: '500px' }}>
                    <i className="bi bi-exclamation-triangle text-warning display-3 mb-3 d-block"></i>
                    <h3 className="fw-bold">Status Page Not Found</h3>
                    <p className="text-muted">{error || 'The status page you are looking for does not exist or is private.'}</p>
                    <div className="d-flex justify-content-center gap-2 mt-3">
                        <Link to="/status-pages" className="btn btn-outline-secondary">
                            <i className="bi bi-arrow-left me-1"></i> Back to Status Pages
                        </Link>
                        <Link to="/login" className="btn btn-primary">Go to Login</Link>
                    </div>
                </div>
            </div>
        );
    }

    const { page, monitors = [], activeIncidents = [] } = data;
    const allUp = monitors.every(m => m.status === 'UP');
    const anyDown = monitors.some(m => m.status === 'DOWN');

    return (
        <div className="min-vh-100 bg-light py-4">
            <div className="container" style={{ maxWidth: '900px' }}>
                {/* Top Navigation */}
                <div className="d-flex justify-content-between align-items-center mb-4">
                    <Link to="/status-pages" className="btn btn-white btn-sm border rounded-pill px-3 shadow-sm bg-white text-secondary fw-semibold">
                        <i className="bi bi-arrow-left me-1"></i> Back to Status Pages
                    </Link>
                    <Link to="/dashboard" className="btn btn-white btn-sm border rounded-pill px-3 shadow-sm bg-white text-primary fw-semibold">
                        <i className="bi bi-speedometer2 me-1"></i> Dashboard
                    </Link>
                </div>

                {/* Header / Brand */}
                <div className="text-center mb-4">
                    <h1 className="fw-bold mb-2" style={{ color: page.brandingColor || '#0f172a' }}>
                        {page.title || 'System Status'}
                    </h1>
                    {page.description && (
                        <p className="text-muted lead fs-6">{page.description}</p>
                    )}
                </div>

                {/* Overall System Banner */}
                <div className={`card border-0 shadow-sm rounded-3 mb-4 text-white ${
                    allUp ? 'bg-success' : anyDown ? 'bg-danger' : 'bg-warning'
                }`}>
                    <div className="card-body p-4 d-flex align-items-center justify-content-between">
                        <div className="d-flex align-items-center gap-3">
                            <i className={`bi ${allUp ? 'bi-check-circle-fill' : 'bi-exclamation-circle-fill'} fs-1`}></i>
                            <div>
                                <h4 className="mb-0 fw-bold">
                                    {allUp ? 'All Systems Operational' : anyDown ? 'Active Outage Detected' : 'Degraded System Performance'}
                                </h4>
                                <small className="opacity-75">
                                    Last checked: {new Date().toLocaleTimeString()}
                                </small>
                            </div>
                        </div>
                        <div className="text-end">
                            <button 
                                className="btn btn-light btn-sm text-dark fw-semibold mb-1"
                                onClick={() => fetchStatusPage(false)}
                            >
                                <i className="bi bi-arrow-clockwise me-1"></i> Refresh
                            </button>
                            <div className="small opacity-75 text-white">
                                Auto-refresh in <strong>{countdown}s</strong>
                            </div>
                            {lastRefreshed && (
                                <div style={{ fontSize: '0.7rem' }} className="opacity-60 text-white">
                                    Last updated: {lastRefreshed.toLocaleTimeString()}
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Active Incidents (if any) */}
                {activeIncidents.length > 0 && (
                    <div className="card border-0 shadow-sm rounded-3 mb-4">
                        <div className="card-header bg-danger text-white fw-bold py-3">
                            <i className="bi bi-lightning-charge me-2"></i> Ongoing Incidents ({activeIncidents.length})
                        </div>
                        <div className="card-body p-0">
                            <ul className="list-group list-group-flush">
                                {activeIncidents.map(inc => (
                                    <li key={inc.id} className="list-group-item p-3">
                                        <div className="d-flex justify-content-between align-items-center mb-1">
                                            <span className="fw-bold text-danger">{inc.monitorName}</span>
                                            <span className="badge bg-danger">{inc.status}</span>
                                        </div>
                                        <div className="text-muted small mb-2">
                                            Started: {new Date(inc.startedAt).toLocaleString()}
                                        </div>
                                        <p className="mb-0 small text-secondary">
                                            <strong>Root cause:</strong> {inc.cause || 'Service unresponsive'}
                                        </p>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>
                )}

                {/* Services Status List */}
                <div className="card border-0 shadow-sm rounded-3 mb-4">
                    <div className="card-header bg-white fw-bold py-3 border-bottom d-flex justify-content-between align-items-center">
                        <span><i className="bi bi-hdd-network me-2 text-primary"></i> Services Status</span>
                        <span className="text-muted small">{monitors.length} monitored components</span>
                    </div>
                    <div className="card-body p-0">
                        {monitors.length === 0 ? (
                            <div className="p-4 text-center text-muted">
                                No services configured for this status page.
                            </div>
                        ) : (
                            <ul className="list-group list-group-flush">
                                {monitors.map(m => (
                                    <li key={m.id || m.name} className="list-group-item p-3 d-flex justify-content-between align-items-center">
                                        <div>
                                            <div className="fw-bold text-dark">{m.name}</div>
                                            <div className="small text-muted d-flex gap-3 mt-1">
                                                <span><i className="bi bi-tag me-1"></i>{m.type}</span>
                                                {m.uptime24h !== undefined && (
                                                    <span><i className="bi bi-graph-up me-1"></i>24h: {m.uptime24h.toFixed(1)}%</span>
                                                )}
                                                {m.avgResponseTimeMs !== undefined && (
                                                    <span><i className="bi bi-speedometer2 me-1"></i>Avg: {Math.round(m.avgResponseTimeMs)}ms</span>
                                                )}
                                            </div>
                                        </div>
                                        <div>
                                            {m.status === 'UP' && (
                                                <span className="badge bg-success-subtle text-success border border-success px-3 py-2">
                                                    <i className="bi bi-check-circle me-1"></i> Operational
                                                </span>
                                            )}
                                            {m.status === 'DOWN' && (
                                                <span className="badge bg-danger-subtle text-danger border border-danger px-3 py-2">
                                                    <i className="bi bi-x-circle me-1"></i> Outage
                                                </span>
                                            )}
                                            {m.status === 'PAUSED' && (
                                                <span className="badge bg-secondary-subtle text-secondary border border-secondary px-3 py-2">
                                                    <i className="bi bi-pause-circle me-1"></i> Paused
                                                </span>
                                            )}
                                            {m.status === 'UNKNOWN' && (
                                                <span className="badge bg-info-subtle text-info border border-info px-3 py-2">
                                                    <i className="bi bi-question-circle me-1"></i> Unknown
                                                </span>
                                            )}
                                        </div>
                                    </li>
                                ))}
                            </ul>
                        )}
                    </div>
                </div>

                {/* Footer */}
                <div className="text-center text-muted small mt-5">
                    <p className="mb-2">Powered by <strong>ServiceWatch</strong> Real-Time Health Monitoring</p>
                    <div className="d-flex justify-content-center align-items-center gap-3">
                        <Link to="/status-pages" className="text-decoration-none text-muted">
                            <i className="bi bi-arrow-left me-1"></i>Status Pages
                        </Link>
                        <span>•</span>
                        <Link to="/dashboard" className="text-decoration-none text-muted">Dashboard</Link>
                        <span>•</span>
                        <Link to="/login" className="text-decoration-none text-muted">Admin Portal</Link>
                    </div>
                </div>
            </div>
        </div>
    );
}
