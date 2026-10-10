import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { MetricCard } from '../components/common/MetricCard';
import { Line } from 'react-chartjs-2';

export const AnalyticsPage = () => {
  const [monitors, setMonitors] = useState([]);
  const [selectedMonitorId, setSelectedMonitorId] = useState('');
  const [period, setPeriod] = useState('24h');
  const [analyticsData, setAnalyticsData] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchAnalytics = async () => {
    setLoading(true);
    try {
      const res = await api.get('/analytics', {
        params: {
          monitorId: selectedMonitorId || undefined,
          period
        }
      });
      setMonitors(res.data.monitors || []);
      if (res.data.selectedMonitor && !selectedMonitorId) {
        setSelectedMonitorId(res.data.selectedMonitor.id);
      }
      setAnalyticsData(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
  }, [selectedMonitorId, period]);

  const { analytics, chartLabels, chartData: rawData, selectedMonitor } = analyticsData || {};

  const chartData = {
    labels: chartLabels?.length ? chartLabels : ['No Data'],
    datasets: [
      {
        label: 'Response Time (ms)',
        data: rawData?.length ? rawData : [0],
        borderColor: '#2563eb',
        backgroundColor: 'rgba(37, 99, 235, 0.08)',
        fill: true,
        tension: 0.3,
        borderWidth: 2,
        pointRadius: 2
      }
    ]
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      y: {
        beginAtZero: true,
        ticks: { callback: (val) => val + ' ms' }
      }
    }
  };

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h4 className="fw-bold mb-1">Analytics & Observability</h4>
          <p className="text-muted small mb-0">Evaluate historical latency, reliability metrics, and uptime trends</p>
        </div>
        {selectedMonitor && (
          <a
            href={`/api/analytics/export-csv?monitorId=${selectedMonitor.id}&period=${period}`}
            className="btn btn-outline-secondary btn-sm d-flex align-items-center gap-1"
            download
          >
            <i className="bi bi-download"></i> Export CSV Report
          </a>
        )}
      </div>

      {/* Controls */}
      <div className="table-card p-3 mb-4">
        <div className="row g-3 align-items-center">
          <div className="col-md-6">
            <label className="form-label small fw-semibold text-muted mb-1">Select Service Monitor:</label>
            <select
              className="form-select"
              value={selectedMonitorId}
              onChange={(e) => setSelectedMonitorId(e.target.value)}
            >
              {monitors.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.name} ({m.type})
                </option>
              ))}
            </select>
          </div>
          <div className="col-md-6">
            <label className="form-label small fw-semibold text-muted mb-1">Reporting Period:</label>
            <div className="btn-group w-100">
              <button
                type="button"
                className={`btn btn-sm ${period === '24h' ? 'btn-primary' : 'btn-outline-secondary'}`}
                onClick={() => setPeriod('24h')}
              >
                Last 24 Hours
              </button>
              <button
                type="button"
                className={`btn btn-sm ${period === '7d' ? 'btn-primary' : 'btn-outline-secondary'}`}
                onClick={() => setPeriod('7d')}
              >
                Last 7 Days
              </button>
              <button
                type="button"
                className={`btn btn-sm ${period === '30d' ? 'btn-primary' : 'btn-outline-secondary'}`}
                onClick={() => setPeriod('30d')}
              >
                Last 30 Days
              </button>
            </div>
          </div>
        </div>
      </div>

      {!selectedMonitor ? (
        <div className="table-card p-5 text-center">
          <i className="bi bi-bar-chart-line fs-1 text-muted mb-3 d-block"></i>
          <h5>No monitors available for analytics</h5>
          <p className="text-muted">Create a monitor to start collecting health metrics.</p>
        </div>
      ) : (
        <>
          {/* Metrics Cards */}
          <div className="row g-3 mb-4">
            <div className="col-md-3 col-6">
              <MetricCard
                title="Period Uptime"
                value={analytics?.uptimePercentage != null ? analytics.uptimePercentage.toFixed(2) : 100}
                unit="%"
                subtext={`${analytics?.upChecks || 0} successful checks`}
                colorClass="text-success"
              />
            </div>
            <div className="col-md-3 col-6">
              <MetricCard
                title="Average Latency"
                value={Math.round(analytics?.averageResponseTimeMs || 0)}
                unit="ms"
                subtext="Across healthy checks"
                colorClass="text-primary"
              />
            </div>
            <div className="col-md-3 col-6">
              <MetricCard
                title="Min / Max Latency"
                value={`${analytics?.minResponseTimeMs || 0} / ${analytics?.maxResponseTimeMs || 0}`}
                unit="ms"
                subtext="Range variance"
                colorClass="text-dark"
              />
            </div>
            <div className="col-md-3 col-6">
              <MetricCard
                title="Outages Recorded"
                value={analytics?.downChecks || 0}
                subtext={`${analytics?.incidentCount || 0} incidents opened`}
                colorClass="text-danger"
              />
            </div>
          </div>

          {/* Latency Graph */}
          <div className="table-card p-4 mb-4">
            <div className="d-flex justify-content-between align-items-center mb-3">
              <h6 className="fw-bold mb-0">
                <i className="bi bi-graph-up text-primary me-2"></i>Response Latency Trend
              </h6>
              <span className="badge bg-light text-muted border">Period: {period}</span>
            </div>
            <div style={{ height: '260px' }}>
              <Line data={chartData} options={chartOptions} />
            </div>
          </div>
        </>
      )}
    </div>
  );
};
