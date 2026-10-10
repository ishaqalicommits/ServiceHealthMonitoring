import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../services/api';

export const IncidentDetailPage = () => {
  const { id } = useParams();
  const [incident, setIncident] = useState(null);
  const [updates, setUpdates] = useState([]);
  const [updateMessage, setUpdateMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [posting, setPosting] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  const fetchIncident = async () => {
    try {
      const res = await api.get(`/incidents/${id}`);
      setIncident(res.data.incident);
      setUpdates(res.data.updates || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchIncident();
  }, [id]);

  const handleAcknowledge = async () => {
    try {
      await api.post(`/incidents/${id}/acknowledge`);
      setMessage({ type: 'success', text: 'Incident acknowledged.' });
      fetchIncident();
    } catch (err) {
      setMessage({ type: 'danger', text: 'Failed to acknowledge.' });
    }
  };

  const handleResolve = async () => {
    try {
      await api.post(`/incidents/${id}/resolve`);
      setMessage({ type: 'success', text: 'Incident resolved.' });
      fetchIncident();
    } catch (err) {
      setMessage({ type: 'danger', text: 'Failed to resolve.' });
    }
  };

  const handlePostUpdate = async (e) => {
    e.preventDefault();
    if (!updateMessage.trim()) return;
    setPosting(true);
    try {
      await api.post(`/incidents/${id}/update`, { message: updateMessage });
      setUpdateMessage('');
      setMessage({ type: 'success', text: 'Incident update posted.' });
      fetchIncident();
    } catch (err) {
      setMessage({ type: 'danger', text: 'Failed to post update.' });
    } finally {
      setPosting(false);
    }
  };

  if (loading && !incident) {
    return (
      <div className="d-flex justify-content-center py-5">
        <div className="spinner-border text-primary" role="status"></div>
      </div>
    );
  }

  return (
    <div className="row justify-content-center">
      <div className="col-lg-9">
        {message.text && (
          <div className={`alert alert-${message.type} alert-dismissible fade show mb-4`} role="alert">
            {message.text}
            <button type="button" className="btn-close" onClick={() => setMessage({ type: '', text: '' })}></button>
          </div>
        )}

        {/* Incident Header Card */}
        <div className="table-card p-4 mb-4">
          <div className="d-flex justify-content-between align-items-center pb-3 mb-3 border-bottom">
            <div className="d-flex align-items-center gap-3">
              <Link to="/incidents" className="btn btn-outline-secondary btn-sm">
                <i className="bi bi-arrow-left"></i>
              </Link>
              <div>
                <h5 className="fw-bold mb-0">Outage on {incident?.monitorName}</h5>
                <p className="text-muted small mb-0">Started at: {incident?.startedAt}</p>
              </div>
            </div>
            <div className="d-flex align-items-center gap-2">
              <span
                className={`badge ${
                  incident?.status === 'OPEN'
                    ? 'bg-danger'
                    : incident?.status === 'ACKNOWLEDGED'
                    ? 'bg-warning text-dark'
                    : 'bg-success'
                } fs-6 py-2 px-3`}
              >
                {incident?.status}
              </span>
              {incident?.status === 'OPEN' && (
                <button onClick={handleAcknowledge} className="btn btn-warning btn-sm">
                  Acknowledge
                </button>
              )}
              {incident?.status !== 'RESOLVED' && (
                <button onClick={handleResolve} className="btn btn-success btn-sm">
                  Mark Resolved
                </button>
              )}
            </div>
          </div>

          <div className="row g-3">
            <div className="col-md-6">
              <p className="mb-1 text-muted small fw-semibold">Root Cause / Error Message:</p>
              <p className="fw-bold text-danger">{incident?.cause || 'Unknown connection fault'}</p>
            </div>
            <div className="col-md-3">
              <p className="mb-1 text-muted small fw-semibold">Last Healthy Check:</p>
              <p className="fw-semibold">{incident?.lastHealthyCheckAt || 'N/A'}</p>
            </div>
            <div className="col-md-3">
              <p className="mb-1 text-muted small fw-semibold">Outage Duration:</p>
              <p className="fw-semibold">
                {incident?.durationSeconds != null ? (
                  `${Math.round(incident.durationSeconds / 60)} minutes`
                ) : (
                  <span className="text-danger">Ongoing</span>
                )}
              </p>
            </div>
          </div>
        </div>

        {/* Updates Timeline */}
        <div className="table-card p-4 mb-4">
          <h6 className="fw-bold mb-4">
            <i className="bi bi-chat-left-dots text-primary me-2"></i>Investigation Updates Timeline
          </h6>

          {!updates?.length ? (
            <p className="text-muted small">No updates posted yet for this incident.</p>
          ) : (
            <div className="position-relative ps-4 border-start border-2 border-primary-subtle mb-4">
              {updates.map((u) => (
                <div key={u.id} className="mb-4 position-relative">
                  <span
                    className="position-absolute top-0 start-0 translate-middle p-1 bg-primary rounded-circle"
                    style={{ left: '-17px' }}
                  ></span>
                  <div className="d-flex justify-content-between align-items-center">
                    <strong className="small text-dark">{u.authorName}</strong>
                    <span className="text-muted small">{u.createdAt}</span>
                  </div>
                  <p className="text-secondary small mt-1 mb-0">{u.message}</p>
                </div>
              ))}
            </div>
          )}

          {/* Post Update Form */}
          <form onSubmit={handlePostUpdate} className="mt-3">
            <div className="mb-3">
              <label className="form-label small fw-semibold">Post Investigation Update</label>
              <textarea
                className="form-control"
                rows="3"
                placeholder="e.g. Identified network route flap. Applying fix..."
                value={updateMessage}
                onChange={(e) => setUpdateMessage(e.target.value)}
                required
              ></textarea>
            </div>
            <div className="text-end">
              <button type="submit" className="btn btn-primary btn-sm px-3" disabled={posting}>
                {posting ? 'Posting...' : 'Post Update'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
