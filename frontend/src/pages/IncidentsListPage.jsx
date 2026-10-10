import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';

export const IncidentsListPage = () => {
  const [incidents, setIncidents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(1);

  const fetchIncidents = async () => {
    setLoading(true);
    try {
      const res = await api.get('/incidents', {
        params: { status: statusFilter, page, size: 15 }
      });
      if (res.data.content) {
        setIncidents(res.data.content);
        setTotalPages(res.data.totalPages);
      } else {
        setIncidents(res.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchIncidents();
  }, [statusFilter, page]);

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h4 className="fw-bold mb-1">Incidents</h4>
          <p className="text-muted small mb-0">Track service outages, acknowledge ongoing issues, and review recovery logs</p>
        </div>
      </div>

      {/* Status Tabs */}
      <div className="d-flex gap-2 mb-3">
        <button
          className={`btn btn-sm ${statusFilter === 'ALL' ? 'btn-primary' : 'btn-outline-secondary'}`}
          onClick={() => {
            setStatusFilter('ALL');
            setPage(0);
          }}
        >
          All Incidents
        </button>
        <button
          className={`btn btn-sm ${statusFilter === 'OPEN' ? 'btn-danger' : 'btn-outline-danger'}`}
          onClick={() => {
            setStatusFilter('OPEN');
            setPage(0);
          }}
        >
          <i className="bi bi-exclamation-circle me-1"></i> Open Outages
        </button>
        <button
          className={`btn btn-sm ${statusFilter === 'ACKNOWLEDGED' ? 'btn-warning text-dark' : 'btn-outline-warning text-dark'}`}
          onClick={() => {
            setStatusFilter('ACKNOWLEDGED');
            setPage(0);
          }}
        >
          Acknowledged
        </button>
        <button
          className={`btn btn-sm ${statusFilter === 'RESOLVED' ? 'btn-success' : 'btn-outline-success'}`}
          onClick={() => {
            setStatusFilter('RESOLVED');
            setPage(0);
          }}
        >
          Resolved
        </button>
      </div>

      {/* Incidents Table */}
      <div className="table-card">
        <div className="table-responsive">
          <table className="table table-hover align-middle mb-0">
            <thead>
              <tr>
                <th>Status</th>
                <th>Affected Monitor</th>
                <th>Outage Reason / Cause</th>
                <th>Started At (UTC)</th>
                <th>Duration</th>
                <th>Acknowledged By</th>
                <th className="text-end">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="7" className="text-center py-5">
                    <div className="spinner-border text-primary" role="status"></div>
                  </td>
                </tr>
              ) : incidents.length === 0 ? (
                <tr>
                  <td colSpan="7">
                    <div className="empty-state">
                      <i className="bi bi-shield-check text-success"></i>
                      <h5>No incidents found</h5>
                      <p className="text-muted">No service outages recorded matching the selected filter.</p>
                    </div>
                  </td>
                </tr>
              ) : (
                incidents.map((inc) => (
                  <tr key={inc.id}>
                    <td>
                      <span
                        className={`badge ${
                          inc.status === 'OPEN'
                            ? 'bg-danger'
                            : inc.status === 'ACKNOWLEDGED'
                            ? 'bg-warning text-dark'
                            : 'bg-success'
                        } py-2 px-3`}
                      >
                        {inc.status}
                      </span>
                    </td>
                    <td>
                      <Link to={`/monitors/${inc.monitorId}`} className="fw-bold text-dark text-decoration-none">
                        {inc.monitorName}
                      </Link>
                    </td>
                    <td className="text-muted small text-truncate" style={{ maxWidth: '250px' }}>
                      {inc.cause || 'Service down'}
                    </td>
                    <td className="text-muted small">{inc.startedAt}</td>
                    <td>
                      {inc.durationSeconds != null ? (
                        `${Math.round(inc.durationSeconds / 60)} mins`
                      ) : (
                        <span className="text-danger fw-semibold">Ongoing</span>
                      )}
                    </td>
                    <td className="text-muted small">{inc.acknowledgedBy || '-'}</td>
                    <td className="text-end">
                      <Link to={`/incidents/${inc.id}`} className="btn btn-sm btn-outline-primary">
                        View Details
                      </Link>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
