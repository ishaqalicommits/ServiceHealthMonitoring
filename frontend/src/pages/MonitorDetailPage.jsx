import React, { useState, useEffect, useCallback } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import api from '../services/api';
import { StatusBadge } from '../components/common/StatusBadge';
import { MetricCard } from '../components/common/MetricCard';
import { Line } from 'react-chartjs-2';
import { useRealtimeSSE } from '../hooks/useRealtimeSSE';

export const MonitorDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [liveStatus, setLiveStatus] = useState(null);   // latest SSE status for this monitor
  const [liveChecks, setLiveChecks] = useState([]);      // prepended live check rows

  const fetchDetail = useCallback(async (isBackground = false) => {
    if (!isBackground) setLoading(true);
    try {
      const res = await api.get(`/monitors/${id}`, { params: { page, size: 15 } });
      setData(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      if (!isBackground) setLoading(false);
    }
  }, [id, page]);

  useEffect(() => {
    fetchDetail();
  }, [id, page]);

  // SSE: only react to events for THIS monitor
  const sseHandlers = {
    check: useCallback((event) => {
      if (event.monitorId !== id) return;
      setLiveStatus({ status: event.status, responseTimeMs: event.responseTimeMs, checkedAt: event.checkedAt });
      setLiveChecks(prev => [{
        status: event.status,
        responseTimeMs: event.responseTimeMs,
        checkedAt: event.checkedAt,
        errorMessage: event.error || null,
      }, ...prev].slice(0, 50));
    }, [id]),
  };
  useRealtimeSSE(sseHandlers);

  const handleCheckNow = async () => {
    try {
      await api.post(`/monitors/${id}/check-now`);
      setMessage({ type: 'success', text: 'Health check completed.' });
      fetchDetail();
    } catch (err) {
      setMessage({ type: 'danger', text: 'Health check failed.' });
    }
  };

  const handlePauseToggle = async () => {
    try {
      if (data?.monitor?.paused) {
        await api.post(`/monitors/${id}/resume`);
        setMessage({ type: 'success', text: 'Monitor resumed.' });
      } else {
        await api.post(`/monitors/${id}/pause`);
        setMessage({ type: 'success', text: 'Monitor paused.' });
      }
      fetchDetail();
    } catch (err) {
      setMessage({ type: 'danger', text: 'Action failed.' });
    }
  };

  const handleDelete = async () => {
    try {
      await api.delete(`/monitors/${id}`);
      navigate('/monitors');
    } catch (err) {
      setMessage({ type: 'danger', text: 'Failed to delete monitor.' });
    }
  };

  if (loading && !data) {
    return (
      <div className="d-flex justify-content-center py-5">
        <div className="spinner-border text-primary" role="status"></div>
      </div>
    );
  }

  const { monitor, checkResults, analytics, chartLabels, chartData: rawChartData } = data || {};

  const chartDataConfig = {
    labels: chartLabels?.length ? chartLabels : ['No Data'],
    datasets: [
      {
        label: 'Response Time (ms)',
        data: rawChartData?.length ? rawChartData : [0],
        borderColor: '#10b981',
        backgroundColor: 'rgba(16, 185, 129, 0.08)',
        fill: true,
        tension: 0.35,
        borderWidth: 2,
        pointRadius: 3
      }
    ]
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      y: {
        beginAtZero: true,
        ticks: { callback: (v) => v + ' ms' }
      }
    },
    plugins: { legend: { display: false } }
  };

  return (
    <div>
      {/* Top Actions Bar */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div className="d-flex align-items-center gap-3">
          <Link to="/monitors" className="btn btn-outline-secondary btn-sm">
            <i className="bi bi-arrow-left"></i>
          </Link>
          <div>
            <h4 className="fw-bold mb-0 d-flex align-items-center gap-2">
              {monitor?.name}
              <StatusBadge status={monitor?.status} />
            </h4>
            <p className="text-muted small mb-0 mt-1">
              <code>{monitor?.url || `${monitor?.hostname}:${monitor?.port || ''}`}</code> • Type:{' '}
              <strong>{monitor?.type}</strong> • Checked every{' '}
              <strong>{monitor?.checkIntervalSeconds}s</strong>
            </p>
          </div>
        </div>
        <div className="d-flex align-items-center gap-2">
          <button
            onClick={handleCheckNow}
            className="btn btn-outline-primary btn-sm d-flex align-items-center gap-1"
          >
            <i className="bi bi-arrow-repeat"></i> Check Now
          </button>
          <button
            onClick={handlePauseToggle}
            className={`btn btn-sm ${monitor?.paused ? 'btn-outline-success' : 'btn-outline-warning'}`}
          >
            <i className={`bi ${monitor?.paused ? 'bi-play-fill' : 'bi-pause-fill'} me-1`}></i>
            {monitor?.paused ? 'Resume' : 'Pause'}
          </button>
          <Link to={`/monitors/${id}/edit`} className="btn btn-outline-secondary btn-sm">
            <i className="bi bi-pencil me-1"></i> Edit
          </Link>
          <button
            onClick={() => setShowDeleteModal(true)}
            className="btn btn-outline-danger btn-sm"
          >
            <i className="bi bi-trash"></i>
          </button>
        </div>
      </div>

      {message.text && (
        <div className={`alert alert-${message.type} alert-dismissible fade show mb-4`} role="alert">
          {message.text}
          <button type="button" className="btn-close" onClick={() => setMessage({ type: '', text: '' })}></button>
        </div>
      )}

      {/* Metrics Cards */}
      <div className="row g-3 mb-4">
        <div className="col-md-3 col-sm-6">
          <MetricCard
            title="24h Uptime"
            value={analytics?.uptimePercentage != null ? analytics.uptimePercentage.toFixed(2) : 100}
            unit="%"
            subtext={`${analytics?.upChecks || 0} UP / ${analytics?.totalChecks || 0} checks`}
            colorClass="text-info"
          />
        </div>
        <div className="col-md-3 col-sm-6">
          <MetricCard
            title="Average Response"
            value={Math.round(analytics?.averageResponseTimeMs || 0)}
            unit="ms"
            subtext={`Min: ${analytics?.minResponseTimeMs || 0}ms / Max: ${analytics?.maxResponseTimeMs || 0}ms`}
            colorClass="text-primary"
          />
        </div>
        <div className="col-md-3 col-sm-6">
          <MetricCard
            title="Total Incidents"
            value={analytics?.incidentCount || 0}
            subtext={`Threshold: ${monitor?.failureThreshold} failures`}
            colorClass="text-warning"
          />
        </div>
        <div className="col-md-3 col-sm-6">
          <MetricCard
            title="SSL Expiry"
            value={monitor?.sslExpiryDays != null ? monitor.sslExpiryDays : 'N/A'}
            unit={monitor?.sslExpiryDays != null ? 'days' : ''}
            subtext={monitor?.url?.startsWith('https://') ? 'Inspected via TLS' : 'Not HTTPS'}
            colorClass={monitor?.sslExpiryDays != null && monitor.sslExpiryDays < 30 ? 'text-danger' : 'text-success'}
          />
        </div>
      </div>

      {/* Latency Trend Graph */}
      <div className="table-card mb-4">
        <div className="card-header d-flex justify-content-between align-items-center">
          <span>
            <i className="bi bi-graph-up me-2 text-primary"></i>Response Time History (24 Hours)
          </span>
          <span className="badge bg-light text-muted border">Milliseconds</span>
        </div>
        <div className="p-3" style={{ height: '220px' }}>
          <Line data={chartDataConfig} options={chartOptions} />
        </div>
      </div>

      {/* Detailed Check History Table */}
      <div className="table-card mb-4">
        <div className="card-header d-flex justify-content-between align-items-center">
          <span>
            <i className="bi bi-clock-history me-2 text-primary"></i>Recent Check Logs
          </span>
          <span className="badge bg-secondary bg-opacity-10 text-secondary">
            Page {page + 1} of {checkResults?.totalPages || 1}
          </span>
        </div>
        <div className="table-responsive">
          <table className="table table-hover mb-0">
            <thead>
              <tr>
                <th>Status</th>
                <th>Checked At (UTC)</th>
                <th>Response Time</th>
                <th>HTTP Status</th>
                <th>Keyword Result</th>
                <th>Error Detail</th>
              </tr>
            </thead>
            <tbody>
              {!checkResults?.content?.length ? (
                <tr>
                  <td colSpan="6" className="text-center py-4 text-muted">
                    No check logs recorded yet.
                  </td>
                </tr>
              ) : (
                checkResults.content.map((cr) => (
                  <tr key={cr.id}>
                    <td>
                      <StatusBadge status={cr.status} />
                    </td>
                    <td className="text-muted small">{cr.checkedAt}</td>
                    <td>
                      <strong>{cr.responseTimeMs} ms</strong>
                    </td>
                    <td>
                      {cr.httpStatusCode != null ? (
                        <span
                          className={`badge ${
                            cr.httpStatusCode >= 200 && cr.httpStatusCode < 300
                              ? 'bg-success bg-opacity-10 text-success'
                              : 'bg-danger bg-opacity-10 text-danger'
                          } border`}
                        >
                          {cr.httpStatusCode}
                        </span>
                      ) : (
                        <span className="text-muted">-</span>
                      )}
                    </td>
                    <td>
                      {cr.keywordFound != null ? (
                        <span
                          className={`badge ${
                            cr.keywordFound
                              ? 'bg-info bg-opacity-10 text-info'
                              : 'bg-secondary bg-opacity-10 text-secondary'
                          } border`}
                        >
                          {cr.keywordFound ? 'Found' : 'Not Found'}
                        </span>
                      ) : (
                        <span className="text-muted">-</span>
                      )}
                    </td>
                    <td className="text-muted small text-truncate" style={{ maxWidth: '300px' }}>
                      {cr.errorMessage || 'Success'}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {checkResults?.totalPages > 1 && (
          <div className="p-3 border-top d-flex justify-content-between align-items-center">
            <span className="text-muted small">
              Showing {checkResults.numberOfElements} entries
            </span>
            <div className="btn-group btn-group-sm">
              <button
                className="btn btn-outline-secondary"
                disabled={checkResults.first}
                onClick={() => setPage((p) => p - 1)}
              >
                Previous
              </button>
              <button
                className="btn btn-outline-secondary"
                disabled={checkResults.last}
                onClick={() => setPage((p) => p + 1)}
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="modal fade show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title fw-bold">Delete Monitor</h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => setShowDeleteModal(false)}
                ></button>
              </div>
              <div className="modal-body">
                <p>
                  Are you sure you want to delete monitor <strong>{monitor?.name}</strong>?
                </p>
                <p className="text-muted small mb-0">This will stop all health checks for this service.</p>
              </div>
              <div className="modal-footer">
                <button
                  type="button"
                  className="btn btn-light"
                  onClick={() => setShowDeleteModal(false)}
                >
                  Cancel
                </button>
                <button type="button" className="btn btn-danger" onClick={handleDelete}>
                  Yes, Delete Monitor
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
