import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import { MetricCard } from '../components/common/MetricCard';
import { StatusBadge } from '../components/common/StatusBadge';
import { useRealtimeSSE } from '../hooks/useRealtimeSSE';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js';
import { Line } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

const MAX_LIVE_CHECKS = 20;

export const DashboardPage = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [liveChecks, setLiveChecks] = useState([]);  // Real-time checks from SSE
  const [liveChart, setLiveChart] = useState({ labels: [], data: [] }); // Live chart data
  const [lastPushAt, setLastPushAt] = useState(null);

  /* ── Initial fetch ── */
  const fetchStats = useCallback(async () => {
    try {
      const res = await api.get('/dashboard/stats');
      setStats(res.data);
      // Seed live chart from historical data
      if (res.data?.chartLabels?.length) {
        setLiveChart({
          labels: res.data.chartLabels.slice(-20),
          data: res.data.chartData.slice(-20),
        });
      }
    } catch (err) {
      console.error('Failed to load dashboard stats', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchStats();
    // Refresh counts every 30s as a fallback only
    const interval = setInterval(fetchStats, 30000);
    return () => clearInterval(interval);
  }, [fetchStats]);

  /* ── Real-time SSE handler ── */
  const sseHandlers = {
    check: useCallback((data) => {
      setLastPushAt(new Date());

      // Prepend new check to live table
      setLiveChecks(prev => [data, ...prev].slice(0, MAX_LIVE_CHECKS));

      // Append to chart
      setLiveChart(prev => {
        const label = new Date(data.checkedAt).toLocaleTimeString();
        const newLabels = [...prev.labels, label].slice(-20);
        const newData   = [...prev.data, data.responseTimeMs].slice(-20);
        return { labels: newLabels, data: newData };
      });

      // Update summary counters optimistically
      setStats(prev => {
        if (!prev) return prev;
        const wasDown = prev.downList?.some(m => m.id === data.monitorId);
        if (data.status === 'DOWN' && !wasDown) {
          return {
            ...prev,
            upMonitors: Math.max(0, (prev.upMonitors || 0) - 1),
            downMonitors: (prev.downMonitors || 0) + 1,
            downList: [...(prev.downList || []), { id: data.monitorId, name: data.monitorName, type: '' }],
          };
        }
        if (data.status === 'UP' && wasDown) {
          return {
            ...prev,
            upMonitors: (prev.upMonitors || 0) + 1,
            downMonitors: Math.max(0, (prev.downMonitors || 0) - 1),
            downList: (prev.downList || []).filter(m => m.id !== data.monitorId),
          };
        }
        return prev;
      });
    }, []),
  };

  useRealtimeSSE(sseHandlers);

  /* ── Chart ── */
  const chartLabels = liveChart.labels.length ? liveChart.labels : (stats?.chartLabels || ['No Data']);
  const chartValues = liveChart.data.length   ? liveChart.data   : (stats?.chartData   || [0]);

  const chartData = {
    labels: chartLabels,
    datasets: [{
      label: 'Response Time (ms)',
      data: chartValues,
      borderColor: '#3b82f6',
      backgroundColor: 'rgba(59, 130, 246, 0.08)',
      fill: true,
      tension: 0.35,
      borderWidth: 2,
      pointRadius: 3,
    }]
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    animation: { duration: 300 },
    scales: {
      y: { beginAtZero: true, ticks: { callback: val => val + ' ms' } }
    },
    plugins: { legend: { display: false } }
  };

  /* ── Merge live checks with historical for the table ── */
  const tableChecks = liveChecks.length
    ? liveChecks
    : (stats?.recentChecks || []);

  if (loading && !stats) {
    return (
      <div className="d-flex justify-content-center align-items-center py-5">
        <div className="spinner-border text-primary" role="status"></div>
      </div>
    );
  }

  return (
    <div>
      {/* Live indicator */}
      <div className="d-flex align-items-center justify-content-end mb-3 gap-2">
        <span
          className="badge bg-success bg-opacity-10 border border-success text-success fw-normal px-3 py-2"
          style={{ fontSize: '0.75rem' }}
        >
          <span
            style={{
              display: 'inline-block',
              width: 8, height: 8,
              borderRadius: '50%',
              backgroundColor: '#22c55e',
              marginRight: 6,
              animation: 'pulse 1.5s ease-in-out infinite',
            }}
          />
          LIVE
          {lastPushAt && (
            <span className="ms-2 text-muted" style={{ fontSize: '0.7rem' }}>
              Last update: {lastPushAt.toLocaleTimeString()}
            </span>
          )}
        </span>
      </div>

      {/* Summary Metrics Cards */}
      <div className="row g-3 mb-4">
        <div className="col-xl-2 col-md-4 col-sm-6">
          <MetricCard title="Total Monitors" value={stats?.totalMonitors ?? 0}
            subtext="Configured endpoints" colorClass="text-primary" />
        </div>
        <div className="col-xl-2 col-md-4 col-sm-6">
          <MetricCard title="Operational" value={stats?.upMonitors ?? 0}
            subtext="Responding normally" colorClass="text-success" />
        </div>
        <div className="col-xl-2 col-md-4 col-sm-6">
          <MetricCard title="Outages" value={stats?.downMonitors ?? 0}
            subtext="Requires attention" colorClass="text-danger" />
        </div>
        <div className="col-xl-2 col-md-4 col-sm-6">
          <MetricCard title="Paused" value={stats?.pausedMonitors ?? 0}
            subtext="Disabled checks" colorClass="text-secondary" />
        </div>
        <div className="col-xl-2 col-md-4 col-sm-6">
          <MetricCard title="Avg Response" value={stats?.avgResponseTime ?? 0}
            unit="ms" subtext="Last 24 hours" colorClass="text-dark" />
        </div>
        <div className="col-xl-2 col-md-4 col-sm-6">
          <MetricCard title="Overall Uptime" value={stats?.overallUptime ?? 100}
            unit="%" subtext="Last 24 hours" colorClass="text-info" />
        </div>
      </div>

      {/* Active Outage Banner */}
      {stats?.downList?.length > 0 && (
        <div className="alert alert-danger border-danger shadow-sm mb-4">
          <div className="d-flex align-items-center gap-2 mb-2">
            <i className="bi bi-exclamation-triangle-fill fs-5"></i>
            <h6 className="mb-0 fw-bold">Active Outage Detected ({stats.downList.length})</h6>
          </div>
          <div className="d-flex flex-wrap gap-2">
            {stats.downList.map((m) => (
              <Link key={m.id} to={`/monitors/${m.id}`}
                className="badge bg-danger text-decoration-none py-2 px-3">
                <i className="bi bi-x-circle me-1"></i> {m.name} {m.type && `(${m.type})`}
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Live Chart & Recent Incidents */}
      <div className="row g-4 mb-4">
        <div className="col-lg-8">
          <div className="table-card h-100">
            <div className="card-header d-flex justify-content-between align-items-center">
              <span>
                <i className="bi bi-graph-up me-2 text-primary"></i>
                Response Time — Live
              </span>
              <span className="badge bg-light text-muted border">Milliseconds</span>
            </div>
            <div className="p-3" style={{ height: '240px' }}>
              <Line data={chartData} options={chartOptions} />
            </div>
          </div>
        </div>
        <div className="col-lg-4">
          <div className="table-card h-100">
            <div className="card-header d-flex justify-content-between align-items-center">
              <span>
                <i className="bi bi-shield-exclamation me-2 text-danger"></i>Recent Incidents
              </span>
              <Link to="/incidents" className="btn btn-sm btn-link text-decoration-none p-0">
                View all
              </Link>
            </div>
            <div className="p-3">
              {!stats?.recentIncidents?.length ? (
                <div className="empty-state py-4">
                  <i className="bi bi-check-circle text-success fs-2"></i>
                  <p className="text-muted small mt-2 mb-0">No recent incidents. All systems operational!</p>
                </div>
              ) : (
                <div className="list-group list-group-flush">
                  {stats.recentIncidents.slice(0, 5).map((inc) => (
                    <Link key={inc.id} to={`/incidents/${inc.id}`}
                      className="list-group-item list-group-item-action px-0 py-2 border-0">
                      <div className="d-flex justify-content-between align-items-center">
                        <strong className="small text-truncate" style={{ maxWidth: '180px' }}>
                          {inc.monitorName}
                        </strong>
                        <span className={`badge ${
                          inc.status === 'OPEN' ? 'bg-danger' :
                          inc.status === 'ACKNOWLEDGED' ? 'bg-warning text-dark' : 'bg-success'
                        }`}>{inc.status}</span>
                      </div>
                      <p className="text-muted small mb-0 text-truncate">{inc.cause || 'Service outage'}</p>
                    </Link>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Live Health Checks Table */}
      <div className="table-card">
        <div className="card-header d-flex justify-content-between align-items-center">
          <span>
            <i className="bi bi-activity me-2 text-primary"></i>
            Live Health Checks
            {liveChecks.length > 0 && (
              <span className="badge bg-primary bg-opacity-10 text-primary border ms-2">
                {liveChecks.length} live
              </span>
            )}
          </span>
          <Link to="/monitors" className="btn btn-sm btn-outline-primary">
            Manage Monitors
          </Link>
        </div>
        <div className="table-responsive">
          <table className="table table-hover mb-0">
            <thead>
              <tr>
                <th>Status</th>
                <th>Monitor</th>
                <th>Response Time</th>
                <th>HTTP</th>
                <th>Checked At</th>
                <th>Message</th>
              </tr>
            </thead>
            <tbody>
              {!tableChecks.length ? (
                <tr>
                  <td colSpan="6" className="text-center py-4 text-muted">
                    <i className="bi bi-wifi-off fs-3 d-block mb-2"></i>
                    Waiting for first check (runs every 15 s)…
                  </td>
                </tr>
              ) : (
                tableChecks.map((check, idx) => (
                  <tr key={idx} className={idx === 0 && liveChecks.length > 0 ? 'table-active' : ''}>
                    <td><StatusBadge status={check.status} /></td>
                    <td>
                      <Link to={`/monitors/${check.monitorId}`} className="text-decoration-none fw-semibold">
                        {check.monitorName || check.monitorId}
                      </Link>
                    </td>
                    <td><span className="fw-semibold">{check.responseTimeMs} ms</span></td>
                    <td>
                      {check.httpStatusCode != null ? (
                        <span className={`badge border ${
                          check.httpStatusCode >= 200 && check.httpStatusCode < 300
                            ? 'bg-success bg-opacity-10 text-success'
                            : 'bg-danger bg-opacity-10 text-danger'
                        }`}>{check.httpStatusCode}</span>
                      ) : <span className="text-muted">—</span>}
                    </td>
                    <td className="text-muted small">
                      {check.checkedAt
                        ? new Date(check.checkedAt).toLocaleTimeString()
                        : '—'}
                    </td>
                    <td className="text-muted small text-truncate" style={{ maxWidth: '250px' }}>
                      {check.error || check.errorMessage || 'Healthy'}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pulse animation style */}
      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.3; }
        }
      `}</style>
    </div>
  );
};
