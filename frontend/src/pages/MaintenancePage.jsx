import React, { useState, useEffect } from 'react';
import api from '../services/api';

export const MaintenancePage = () => {
  const [windows, setWindows] = useState([]);
  const [monitors, setMonitors] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    startTimeStr: '',
    endTimeStr: '',
    monitorIds: [],
    suppressAlerts: true
  });
  const [message, setMessage] = useState({ type: '', text: '' });
  const [loading, setLoading] = useState(true);

  const fetchWindows = async () => {
    try {
      const res = await api.get('/maintenance');
      setWindows(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchMonitors = async () => {
    try {
      const res = await api.get('/monitors?size=100');
      setMonitors(res.data.content || res.data || []);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    Promise.all([fetchWindows(), fetchMonitors()]).finally(() => setLoading(false));
  }, []);

  const handleDelete = async (id) => {
    try {
      await api.delete(`/maintenance/${id}`);
      setMessage({ type: 'success', text: 'Maintenance window deleted.' });
      fetchWindows();
    } catch (err) {
      setMessage({ type: 'danger', text: 'Failed to delete window.' });
    }
  };

  const handleAddSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.post('/maintenance', formData);
      setShowModal(false);
      setFormData({
        title: '',
        description: '',
        startTimeStr: '',
        endTimeStr: '',
        monitorIds: [],
        suppressAlerts: true
      });
      setMessage({ type: 'success', text: 'Maintenance window scheduled.' });
      fetchWindows();
    } catch (err) {
      setMessage({ type: 'danger', text: err.response?.data?.error || 'Failed to schedule.' });
    }
  };

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h4 className="fw-bold mb-1">Maintenance Windows</h4>
          <p className="text-muted small mb-0">Schedule planned maintenance periods to automatically suppress downtime alerts</p>
        </div>
        <button className="btn btn-primary btn-sm" onClick={() => setShowModal(true)}>
          <i className="bi bi-calendar-plus me-1"></i> Schedule Maintenance
        </button>
      </div>

      {message.text && (
        <div className={`alert alert-${message.type} alert-dismissible fade show mb-4`} role="alert">
          {message.text}
          <button type="button" className="btn-close" onClick={() => setMessage({ type: '', text: '' })}></button>
        </div>
      )}

      <div className="table-card">
        <div className="table-responsive">
          <table className="table table-hover align-middle mb-0">
            <thead>
              <tr>
                <th>Status</th>
                <th>Title & Description</th>
                <th>Start Time (UTC)</th>
                <th>End Time (UTC)</th>
                <th>Affected Monitors</th>
                <th>Alerts Suppressed</th>
                <th className="text-end">Actions</th>
              </tr>
            </thead>
            <tbody>
              {!windows.length ? (
                <tr>
                  <td colSpan="7">
                    <div className="empty-state">
                      <i className="bi bi-calendar2-check text-muted"></i>
                      <h5>No maintenance windows scheduled</h5>
                      <p className="text-muted">Plan upcoming maintenance to prevent unnecessary alerts.</p>
                      <button className="btn btn-primary btn-sm" onClick={() => setShowModal(true)}>
                        Schedule Maintenance
                      </button>
                    </div>
                  </td>
                </tr>
              ) : (
                windows.map((w) => (
                  <tr key={w.id}>
                    <td>
                      <span
                        className={`badge ${
                          w.status === 'ACTIVE'
                            ? 'bg-warning text-dark'
                            : w.status === 'UPCOMING'
                            ? 'bg-info bg-opacity-10 text-info border'
                            : 'bg-secondary bg-opacity-10 text-secondary border'
                        }`}
                      >
                        {w.status}
                      </span>
                    </td>
                    <td>
                      <div className="fw-bold text-dark">{w.title}</div>
                      <div className="text-muted small text-truncate" style={{ maxWidth: '200px' }}>
                        {w.description}
                      </div>
                    </td>
                    <td className="text-muted small">{w.startTime}</td>
                    <td className="text-muted small">{w.endTime}</td>
                    <td>
                      {!w.monitorIds?.length ? (
                        <span className="badge bg-light text-dark border">All Monitors</span>
                      ) : (
                        <span className="badge bg-primary bg-opacity-10 text-primary border">
                          {w.monitorIds.length} Monitors
                        </span>
                      )}
                    </td>
                    <td>
                      <i
                        className={`bi ${w.suppressAlerts ? 'bi-bell-slash text-warning' : 'bi-bell text-secondary'} fs-5`}
                      ></i>
                    </td>
                    <td className="text-end">
                      <button
                        onClick={() => handleDelete(w.id)}
                        className="btn btn-sm btn-outline-danger"
                        title="Delete Window"
                      >
                        <i className="bi bi-trash"></i>
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Schedule Modal */}
      {showModal && (
        <div className="modal fade show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title fw-bold">Schedule Maintenance Window</h5>
                <button type="button" className="btn-close" onClick={() => setShowModal(false)}></button>
              </div>
              <form onSubmit={handleAddSubmit}>
                <div className="modal-body">
                  <div className="mb-3">
                    <label className="form-label fw-semibold">Window Title</label>
                    <input
                      type="text"
                      className="form-control"
                      placeholder="e.g. Database OS Upgrades"
                      value={formData.title}
                      onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                      required
                    />
                  </div>
                  <div className="mb-3">
                    <label className="form-label fw-semibold">Description</label>
                    <textarea
                      className="form-control"
                      rows="2"
                      placeholder="Explain the maintenance scope..."
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    ></textarea>
                  </div>
                  <div className="row g-2 mb-3">
                    <div className="col-6">
                      <label className="form-label small fw-semibold">Start Time (UTC)</label>
                      <input
                        type="datetime-local"
                        className="form-control"
                        value={formData.startTimeStr}
                        onChange={(e) => setFormData({ ...formData, startTimeStr: e.target.value })}
                        required
                      />
                    </div>
                    <div className="col-6">
                      <label className="form-label small fw-semibold">End Time (UTC)</label>
                      <input
                        type="datetime-local"
                        className="form-control"
                        value={formData.endTimeStr}
                        onChange={(e) => setFormData({ ...formData, endTimeStr: e.target.value })}
                        required
                      />
                    </div>
                  </div>
                  <div className="mb-3">
                    <label className="form-label fw-semibold">Affects Specific Monitors</label>
                    <select
                      className="form-select"
                      multiple
                      size="4"
                      value={formData.monitorIds}
                      onChange={(e) => {
                        const selected = Array.from(e.target.selectedOptions, (option) => option.value);
                        setFormData({ ...formData, monitorIds: selected });
                      }}
                    >
                      {monitors.map((m) => (
                        <option key={m.id} value={m.id}>
                          {m.name} ({m.type})
                        </option>
                      ))}
                    </select>
                    <div className="form-text">Hold Ctrl/Cmd to select multiple. Leave empty for all.</div>
                  </div>
                  <div className="form-check">
                    <input
                      className="form-check-input"
                      type="checkbox"
                      id="suppressAlerts"
                      checked={formData.suppressAlerts}
                      onChange={(e) => setFormData({ ...formData, suppressAlerts: e.target.checked })}
                    />
                    <label className="form-check-label small" htmlFor="suppressAlerts">
                      Suppress downtime notifications during this window
                    </label>
                  </div>
                </div>
                <div className="modal-footer">
                  <button type="button" className="btn btn-light" onClick={() => setShowModal(false)}>
                    Cancel
                  </button>
                  <button type="submit" className="btn btn-primary">
                    Save Window
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
