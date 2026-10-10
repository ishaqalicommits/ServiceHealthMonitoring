import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import { StatusBadge } from '../components/common/StatusBadge';
import { useRealtimeSSE } from '../hooks/useRealtimeSSE';

export const MonitorsListPage = () => {
  const [monitors, setMonitors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [message, setMessage] = useState({ type: '', text: '' });

  const fetchMonitors = useCallback(async (isBackground = false) => {
    if (!isBackground) setLoading(true);
    try {
      const res = await api.get('/monitors', {
        params: { search: search.trim() || undefined, page, size: 10 }
      });
      if (res.data.content) {
        setMonitors(res.data.content);
        setTotalPages(res.data.totalPages);
      } else {
        setMonitors(res.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      if (!isBackground) setLoading(false);
    }
  }, [page, search]);

  useEffect(() => {
    fetchMonitors();
  }, [page]);

  // SSE: update individual monitor status in-place when a check arrives
  const sseHandlers = {
    check: useCallback((data) => {
      setMonitors(prev => prev.map(m =>
        m.id === data.monitorId
          ? { ...m, status: data.status, lastCheckedAt: data.checkedAt, lastResponseMs: data.responseTimeMs }
          : m
      ));
    }, []),
  };
  useRealtimeSSE(sseHandlers);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setPage(0);
    fetchMonitors();
  };

  const handleCheckNow = async (id) => {
    try {
      await api.post(`/monitors/${id}/check-now`);
      setMessage({ type: 'success', text: 'Health check completed.' });
      fetchMonitors();
    } catch (err) {
      setMessage({ type: 'danger', text: 'Health check failed.' });
    }
  };

  const handlePauseToggle = async (id, isPaused) => {
    try {
      if (isPaused) {
        await api.post(`/monitors/${id}/resume`);
        setMessage({ type: 'success', text: 'Monitor resumed.' });
      } else {
        await api.post(`/monitors/${id}/pause`);
        setMessage({ type: 'success', text: 'Monitor paused.' });
      }
      fetchMonitors();
    } catch (err) {
      setMessage({ type: 'danger', text: 'Action failed.' });
    }
  };

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h4 className="fw-bold mb-1">Monitors</h4>
          <p className="text-muted small mb-0">Manage and inspect all website, API, and network endpoints</p>
        </div>
        <Link to="/monitors/new" className="btn btn-primary d-flex align-items-center gap-2">
          <i className="bi bi-plus-lg"></i> Add New Monitor
        </Link>
      </div>

      {message.text && (
        <div className={`alert alert-${message.type} alert-dismissible fade show mb-4`} role="alert">
          {message.text}
          <button type="button" className="btn-close" onClick={() => setMessage({ type: '', text: '' })}></button>
        </div>
      )}

      {/* Search Bar */}
      <div className="table-card mb-4">
        <div className="p-3">
          <form onSubmit={handleSearchSubmit} className="row g-2">
            <div className="col-md-6">
              <div className="input-group">
                <span className="input-group-text bg-light text-muted">
                  <i className="bi bi-search"></i>
                </span>
                <input
                  type="text"
                  className="form-control"
                  placeholder="Search monitors by name..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
                <button className="btn btn-outline-secondary" type="submit">
                  Search
                </button>
                {search && (
                  <button
                    className="btn btn-outline-danger"
                    type="button"
                    onClick={() => {
                      setSearch('');
                      setPage(0);
                      setTimeout(fetchMonitors, 0);
                    }}
                  >
                    Clear
                  </button>
                )}
              </div>
            </div>
          </form>
        </div>
      </div>

      {/* Monitors Table */}
      <div className="table-card">
        <div className="table-responsive">
          <table className="table table-hover align-middle mb-0">
            <thead>
              <tr>
                <th>Status</th>
                <th>Name</th>
                <th>Type</th>
                <th>Target / URL</th>
                <th>Interval</th>
                <th>SSL Expiry</th>
                <th>Last Checked</th>
                <th className="text-end">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="8" className="text-center py-5">
                    <div className="spinner-border text-primary" role="status"></div>
                  </td>
                </tr>
              ) : monitors.length === 0 ? (
                <tr>
                  <td colSpan="8">
                    <div className="empty-state">
                      <i className="bi bi-shield-slash"></i>
                      <h5>No monitors found</h5>
                      <p className="text-muted">Start tracking your services by adding your first monitor.</p>
                      <Link to="/monitors/new" className="btn btn-primary btn-sm">
                        Add Monitor
                      </Link>
                    </div>
                  </td>
                </tr>
              ) : (
                monitors.map((m) => (
                  <tr key={m.id}>
                    <td><StatusBadge status={m.status} /></td>
                    <td>
                      <Link to={`/monitors/${m.id}`} className="fw-bold text-dark text-decoration-none">
                        {m.name}
                      </Link>
                      {m.tags && m.tags.length > 0 && (
                        <div className="d-flex gap-1 mt-1">
                          {m.tags.map((t, idx) => (
                            <span key={idx} className="badge bg-light text-muted border" style={{ fontSize: '0.65rem' }}>
                              #{t}
                            </span>
                          ))}
                        </div>
                      )}
                    </td>
                    <td>
                      <span className="badge bg-secondary bg-opacity-10 text-secondary border">{m.type}</span>
                    </td>
                    <td className="text-truncate" style={{ maxWidth: '250px' }}>
                      <code>{m.url || `${m.hostname}:${m.port || ''}`}</code>
                    </td>
                    <td>{m.checkIntervalSeconds}s</td>
                    <td>
                      {m.sslExpiryDays != null ? (
                        <span className={`badge ${m.sslExpiryDays < 30 ? 'bg-warning text-dark' : 'bg-light text-dark border'}`}>
                          {m.sslExpiryDays} days
                        </span>
                      ) : (
                        <span className="text-muted">—</span>
                      )}
                    </td>
                    <td className="text-muted small">
                      {m.lastCheckedAt
                        ? new Date(m.lastCheckedAt).toLocaleTimeString()
                        : 'Never'}
                      {m.lastResponseMs != null && (
                        <span className="ms-1 badge bg-light text-secondary border">{m.lastResponseMs} ms</span>
                      )}
                    </td>
                    <td className="text-end">
                      <div className="btn-group btn-group-sm">
                        <button
                          onClick={() => handleCheckNow(m.id)}
                          className="btn btn-outline-primary"
                          title="Trigger instant health check"
                        >
                          <i className="bi bi-arrow-repeat"></i>
                        </button>
                        <button
                          onClick={() => handlePauseToggle(m.id, m.paused)}
                          className={`btn ${m.paused ? 'btn-outline-success' : 'btn-outline-warning'}`}
                          title={m.paused ? 'Resume' : 'Pause'}
                        >
                          <i className={`bi ${m.paused ? 'bi-play-fill' : 'bi-pause-fill'}`}></i>
                        </button>
                        <Link to={`/monitors/${m.id}/edit`} className="btn btn-outline-secondary" title="Edit">
                          <i className="bi bi-pencil"></i>
                        </Link>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {totalPages > 1 && (
          <div className="p-3 border-top d-flex justify-content-between align-items-center">
            <span className="text-muted small">
              Page {page + 1} of {totalPages}
            </span>
            <div className="btn-group btn-group-sm">
              <button
                className="btn btn-outline-secondary"
                disabled={page === 0}
                onClick={() => setPage((p) => p - 1)}
              >
                Previous
              </button>
              <button
                className="btn btn-outline-secondary"
                disabled={page >= totalPages - 1}
                onClick={() => setPage((p) => p + 1)}
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
