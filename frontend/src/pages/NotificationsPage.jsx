import React, { useState, useEffect } from 'react';
import api from '../services/api';

export const NotificationsPage = () => {
  const [channels, setChannels] = useState([]);
  const [logs, setLogs] = useState([]);
  const [activeTab, setActiveTab] = useState('channels');
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    type: 'WEBHOOK',
    email: '',
    webhookUrl: '',
    notifyOnDown: true,
    notifyOnRecovery: true,
    notifyOnSslExpiry: true
  });
  const [message, setMessage] = useState({ type: '', text: '' });
  const [loading, setLoading] = useState(true);

  const fetchChannels = async () => {
    try {
      const res = await api.get('/notifications/channels');
      setChannels(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchLogs = async () => {
    try {
      const res = await api.get('/notifications/logs?limit=50');
      setLogs(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    Promise.all([fetchChannels(), fetchLogs()]).finally(() => setLoading(false));
  }, []);

  const handleTestChannel = async (id) => {
    const ch = channels.find(c => c.id === id);
    const channelName = ch?.name || 'Channel';
    try {
      await api.post(`/notifications/channels/${id}/test`);
      if (ch?.type === 'EMAIL') {
        setMessage({
          type: 'success',
          text: `Test alert sent to "${channelName}" (${ch.email})! Check your email inbox or Audit Logs.`
        });
      } else {
        setMessage({
          type: 'success',
          text: `Test alert sent to "${channelName}"! Check your Discord/Webhook channel or Audit Logs.`
        });
      }
    } catch (err) {
      const errorText = err.response?.data?.error || err.response?.data?.message || 'Failed to deliver alert.';
      setMessage({ type: 'danger', text: errorText });
    } finally {
      fetchLogs();
    }
  };

  const handleDeleteChannel = async (id) => {
    try {
      await api.delete(`/notifications/channels/${id}`);
      setMessage({ type: 'success', text: 'Channel deleted.' });
      fetchChannels();
    } catch (err) {
      setMessage({ type: 'danger', text: 'Failed to delete channel.' });
    }
  };

  const handleAddSubmit = async (e) => {
    e.preventDefault();
    if (formData.type === 'WEBHOOK' && formData.webhookUrl.includes('discord.gg')) {
      setMessage({
        type: 'danger',
        text: 'Invalid Discord Webhook URL! You entered a Discord Invite link (discord.gg). Discord Webhook URLs start with https://discord.com/api/webhooks/...'
      });
      return;
    }

    try {
      await api.post('/notifications/channels', formData);
      setShowModal(false);
      setFormData({
        name: '',
        type: 'EMAIL',
        email: '',
        webhookUrl: '',
        notifyOnDown: true,
        notifyOnRecovery: true,
        notifyOnSslExpiry: true
      });
      setMessage({ type: 'success', text: 'Notification channel created.' });
      fetchChannels();
    } catch (err) {
      setMessage({ type: 'danger', text: err.response?.data?.error || 'Failed to create channel.' });
    }
  };

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h4 className="fw-bold mb-1">Notification Channels</h4>
          <p className="text-muted small mb-0">Manage alert destinations (Email, Webhooks) and delivery preferences</p>
        </div>
        <div className="d-flex gap-2">
          <button
            className={`btn btn-sm ${activeTab === 'logs' ? 'btn-secondary' : 'btn-outline-secondary'}`}
            onClick={() => setActiveTab(activeTab === 'channels' ? 'logs' : 'channels')}
          >
            <i className="bi bi-clock-history me-1"></i>
            {activeTab === 'channels' ? 'View Audit Logs' : 'View Channels'}
          </button>
          {activeTab === 'channels' && (
            <button className="btn btn-primary btn-sm" onClick={() => setShowModal(true)}>
              <i className="bi bi-plus-lg me-1"></i> Add Channel
            </button>
          )}
        </div>
      </div>

      {message.text && (
        <div className={`alert alert-${message.type} alert-dismissible fade show mb-4`} role="alert">
          {message.text}
          <button type="button" className="btn-close" onClick={() => setMessage({ type: '', text: '' })}></button>
        </div>
      )}

      {activeTab === 'channels' ? (
        <div className="table-card">
          <div className="table-responsive">
            <table className="table table-hover align-middle mb-0">
              <thead>
                <tr>
                  <th>Channel Name</th>
                  <th>Type</th>
                  <th>Destination</th>
                  <th>Events Subscribed</th>
                  <th>Status</th>
                  <th className="text-end">Actions</th>
                </tr>
              </thead>
              <tbody>
                {!channels.length ? (
                  <tr>
                    <td colSpan="6">
                      <div className="empty-state">
                        <i className="bi bi-bell-slash text-muted"></i>
                        <h5>No notification channels configured</h5>
                        <p className="text-muted">Set up an Email or Webhook channel to receive alerts.</p>
                        <button className="btn btn-primary btn-sm" onClick={() => setShowModal(true)}>
                          Add Channel
                        </button>
                      </div>
                    </td>
                  </tr>
                ) : (
                  channels.map((ch) => (
                    <tr key={ch.id}>
                      <td className="fw-bold">{ch.name}</td>
                      <td>
                        <span className="badge bg-secondary bg-opacity-10 text-secondary border">{ch.type}</span>
                      </td>
                      <td className="text-truncate" style={{ maxWidth: '250px' }}>
                        <code>{ch.email || ch.webhookUrl}</code>
                      </td>
                      <td>
                        <div className="d-flex gap-1 flex-wrap">
                          {ch.notifyOnDown && (
                            <span className="badge bg-danger bg-opacity-10 text-danger border">Down</span>
                          )}
                          {ch.notifyOnRecovery && (
                            <span className="badge bg-success bg-opacity-10 text-success border">Recovery</span>
                          )}
                          {ch.notifyOnSslExpiry && (
                            <span className="badge bg-warning bg-opacity-10 text-warning border">SSL Expiry</span>
                          )}
                        </div>
                      </td>
                      <td>
                        <span className={`badge ${ch.enabled ? 'bg-success' : 'bg-secondary'}`}>
                          {ch.enabled ? 'Active' : 'Disabled'}
                        </span>
                      </td>
                      <td className="text-end">
                        <div className="btn-group btn-group-sm">
                          <button
                            onClick={() => handleTestChannel(ch.id)}
                            className="btn btn-outline-primary"
                            title="Send Test Notification"
                          >
                            <i className="bi bi-send"></i> Test
                          </button>
                          <button
                            onClick={() => handleDeleteChannel(ch.id)}
                            className="btn btn-outline-danger"
                            title="Delete Channel"
                          >
                            <i className="bi bi-trash"></i>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="table-card">
          <div className="table-responsive">
            <table className="table table-hover align-middle mb-0">
              <thead>
                <tr>
                  <th>Delivery Status</th>
                  <th>Event Type</th>
                  <th>Message</th>
                  <th>Sent At (UTC)</th>
                  <th>Error Details</th>
                </tr>
              </thead>
              <tbody>
                {!logs.length ? (
                  <tr>
                    <td colSpan="5">
                      <div className="empty-state">
                        <i className="bi bi-inbox text-muted"></i>
                        <h5>No notification logs found</h5>
                        <p className="text-muted">Notification events will appear here once triggered.</p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  logs.map((log) => (
                    <tr key={log.id}>
                      <td>
                        <span
                          className={`badge ${
                            log.status === 'SENT'
                              ? 'bg-success bg-opacity-10 text-success border'
                              : log.status === 'SUPPRESSED'
                              ? 'bg-secondary bg-opacity-10 text-secondary border'
                              : 'bg-danger bg-opacity-10 text-danger border'
                          }`}
                        >
                          {log.status}
                        </span>
                      </td>
                      <td>
                        <span className="badge bg-light text-dark border">{log.event}</span>
                      </td>
                      <td className="text-truncate" style={{ maxWidth: '350px' }}>
                        {log.message}
                      </td>
                      <td className="text-muted small">{log.sentAt}</td>
                      <td className="text-muted small">{log.errorMessage || '-'}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Add Channel Modal */}
      {showModal && (
        <div className="modal fade show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title fw-bold">Add Notification Channel</h5>
                <button type="button" className="btn-close" onClick={() => setShowModal(false)}></button>
              </div>
              <form onSubmit={handleAddSubmit}>
                <div className="modal-body">
                  <div className="mb-3">
                    <label className="form-label fw-semibold">Channel Friendly Name</label>
                    <input
                      type="text"
                      className="form-control"
                      placeholder="e.g. Discord Alert Channel"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      required
                    />
                  </div>
                  <div className="mb-3">
                    <label className="form-label fw-semibold">Channel Type</label>
                    <select
                      className="form-select"
                      value={formData.type}
                      onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                      required
                    >
                      <option value="WEBHOOK">WEBHOOK (Discord, Slack, Custom)</option>
                    </select>
                  </div>
                  <div className="mb-3">
                    <label className="form-label fw-semibold">Webhook URL</label>
                    <input
                      type="url"
                      className="form-control"
                      placeholder="https://discord.com/api/webhooks/..."
                      value={formData.webhookUrl}
                      onChange={(e) => setFormData({ ...formData, webhookUrl: e.target.value })}
                      required
                    />
                  </div>
                  <div className="mb-3">
                    <label className="form-label fw-semibold">Trigger Notifications On</label>
                    <div className="form-check">
                      <input
                        className="form-check-input"
                        type="checkbox"
                        id="notifyDown"
                        checked={formData.notifyOnDown}
                        onChange={(e) => setFormData({ ...formData, notifyOnDown: e.target.checked })}
                      />
                      <label className="form-check-label small" htmlFor="notifyDown">
                        Service Outages (Down)
                      </label>
                    </div>
                    <div className="form-check">
                      <input
                        className="form-check-input"
                        type="checkbox"
                        id="notifyRec"
                        checked={formData.notifyOnRecovery}
                        onChange={(e) => setFormData({ ...formData, notifyOnRecovery: e.target.checked })}
                      />
                      <label className="form-check-label small" htmlFor="notifyRec">
                        Service Recoveries (Back Up)
                      </label>
                    </div>
                    <div className="form-check">
                      <input
                        className="form-check-input"
                        type="checkbox"
                        id="notifySsl"
                        checked={formData.notifyOnSslExpiry}
                        onChange={(e) => setFormData({ ...formData, notifyOnSslExpiry: e.target.checked })}
                      />
                      <label className="form-check-label small" htmlFor="notifySsl">
                        SSL Expiry Warnings (&le; 30 days)
                      </label>
                    </div>
                  </div>
                </div>
                <div className="modal-footer">
                  <button type="button" className="btn btn-light" onClick={() => setShowModal(false)}>
                    Cancel
                  </button>
                  <button type="submit" className="btn btn-primary">
                    Create Channel
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
