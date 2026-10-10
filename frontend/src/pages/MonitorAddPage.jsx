import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../services/api';

export const MonitorAddPage = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '',
    type: 'HTTP',
    url: '',
    hostname: '',
    port: '',
    checkIntervalSeconds: 60,
    timeoutSeconds: 10,
    retryCount: 1,
    failureThreshold: 2,
    expectedStatusCodesInput: '',
    keyword: '',
    keywordAbsent: false,
    followRedirects: true,
    tagsInput: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const expectedStatusCodes = formData.expectedStatusCodesInput
      ? formData.expectedStatusCodesInput
          .split(',')
          .map((s) => parseInt(s.trim()))
          .filter((n) => !isNaN(n))
      : []; // empty = backend default: accept any 2xx

    const tags = formData.tagsInput
      ? formData.tagsInput
          .split(',')
          .map((s) => s.trim())
          .filter((s) => s.length > 0)
      : [];

    const payload = {
      name: formData.name,
      type: formData.type,
      url: formData.url || null,
      hostname: formData.hostname || null,
      port: formData.port ? parseInt(formData.port) : null,
      checkIntervalSeconds: parseInt(formData.checkIntervalSeconds),
      timeoutSeconds: parseInt(formData.timeoutSeconds),
      retryCount: parseInt(formData.retryCount),
      failureThreshold: parseInt(formData.failureThreshold),
      expectedStatusCodes,
      keyword: formData.keyword || null,
      keywordAbsent: formData.keywordAbsent,
      followRedirects: formData.followRedirects,
      tags
    };

    try {
      const res = await api.post('/monitors', payload);
      navigate(`/monitors/${res.data.id}`);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to create monitor.');
    } finally {
      setLoading(false);
    }
  };

  const isHttpType = formData.type === 'HTTP' || formData.type === 'KEYWORD' || formData.type === 'API';

  return (
    <div className="row justify-content-center">
      <div className="col-lg-8">
        <div className="table-card p-4">
          <div className="d-flex align-items-center justify-content-between pb-3 mb-4 border-bottom">
            <div>
              <h5 className="fw-bold mb-1">Create Service Monitor</h5>
              <p className="text-muted small mb-0">Configure endpoint checks, validation rules, and alert thresholds</p>
            </div>
            <Link to="/monitors" className="btn btn-sm btn-outline-secondary">
              <i className="bi bi-arrow-left me-1"></i> Cancel
            </Link>
          </div>

          {error && <div className="alert alert-danger py-2 small mb-4">{error}</div>}

          <form onSubmit={handleSubmit}>
            <div className="row g-3 mb-4">
              <div className="col-md-8">
                <label className="form-label fw-semibold">
                  Monitor Friendly Name <span className="text-danger">*</span>
                </label>
                <input
                  type="text"
                  name="name"
                  className="form-control"
                  placeholder="e.g. Production API Gateway"
                  value={formData.name}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="col-md-4">
                <label className="form-label fw-semibold">
                  Monitor Type <span className="text-danger">*</span>
                </label>
                <select name="type" className="form-select" value={formData.type} onChange={handleChange} required>
                  <option value="HTTP">HTTP</option>
                  <option value="KEYWORD">KEYWORD</option>
                  <option value="TCP">TCP</option>
                  <option value="PING">PING</option>
                  <option value="API">API</option>
                </select>
              </div>
            </div>

            {isHttpType ? (
              <div className="mb-4">
                <label className="form-label fw-semibold">
                  Target URL <span className="text-danger">*</span>
                </label>
                <input
                  type="url"
                  name="url"
                  className="form-control"
                  placeholder="https://api.example.com/health"
                  value={formData.url}
                  onChange={handleChange}
                  required
                />
                <div className="form-text">Must be a valid HTTP or HTTPS URL. SSRF protection applies.</div>
              </div>
            ) : (
              <div className="row g-3 mb-4">
                <div className="col-md-8">
                  <label className="form-label fw-semibold">
                    Hostname or IP <span className="text-danger">*</span>
                  </label>
                  <input
                    type="text"
                    name="hostname"
                    className="form-control"
                    placeholder="db.example.com or 198.51.100.1"
                    value={formData.hostname}
                    onChange={handleChange}
                    required
                  />
                </div>
                {formData.type === 'TCP' && (
                  <div className="col-md-4">
                    <label className="form-label fw-semibold">
                      Port <span className="text-danger">*</span>
                    </label>
                    <input
                      type="number"
                      name="port"
                      className="form-control"
                      placeholder="5432"
                      min="1"
                      max="65535"
                      value={formData.port}
                      onChange={handleChange}
                      required
                    />
                  </div>
                )}
              </div>
            )}

            <div className="card bg-light border-0 p-3 mb-4">
              <h6 className="fw-bold mb-3">
                <i className="bi bi-stopwatch me-1 text-primary"></i> Execution Settings
              </h6>
              <div className="row g-3">
                <div className="col-md-3 col-6">
                  <label className="form-label small fw-semibold">Check Interval (sec)</label>
                  <input
                    type="number"
                    name="checkIntervalSeconds"
                    className="form-control"
                    value={formData.checkIntervalSeconds}
                    min="10"
                    onChange={handleChange}
                    required
                  />
                </div>
                <div className="col-md-3 col-6">
                  <label className="form-label small fw-semibold">Timeout (sec)</label>
                  <input
                    type="number"
                    name="timeoutSeconds"
                    className="form-control"
                    value={formData.timeoutSeconds}
                    min="1"
                    max="60"
                    onChange={handleChange}
                    required
                  />
                </div>
                <div className="col-md-3 col-6">
                  <label className="form-label small fw-semibold">Retry Count</label>
                  <input
                    type="number"
                    name="retryCount"
                    className="form-control"
                    value={formData.retryCount}
                    min="0"
                    max="5"
                    onChange={handleChange}
                    required
                  />
                </div>
                <div className="col-md-3 col-6">
                  <label className="form-label small fw-semibold">Failure Threshold</label>
                  <input
                    type="number"
                    name="failureThreshold"
                    className="form-control"
                    value={formData.failureThreshold}
                    min="1"
                    max="10"
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>
            </div>

            {isHttpType && (
              <div className="mb-4">
                <h6 className="fw-bold mb-3">
                  <i className="bi bi-check2-circle me-1 text-primary"></i> Success Criteria
                </h6>
                <div className="row g-3">
                  <div className="col-md-6">
                    <label className="form-label small fw-semibold">
                      Expected HTTP Status Codes <span className="text-muted fw-normal">(optional)</span>
                    </label>
                    <input
                      type="text"
                      name="expectedStatusCodesInput"
                      className="form-control"
                      value={formData.expectedStatusCodesInput}
                      onChange={handleChange}
                      placeholder="Leave empty to accept any 2xx (200–299)"
                    />
                    <div className="form-text">
                      <i className="bi bi-info-circle me-1 text-primary"></i>
                      Empty = any 2xx response is UP. Or specify codes: <code>200, 201, 204</code>
                    </div>
                  </div>
                  <div className="col-md-6">
                    <label className="form-label small fw-semibold">Response Keyword Check</label>
                    <input
                      type="text"
                      name="keyword"
                      className="form-control"
                      value={formData.keyword}
                      onChange={handleChange}
                      placeholder="e.g. status: OK"
                    />
                    <div className="form-check mt-2">
                      <input
                        className="form-check-input"
                        type="checkbox"
                        name="keywordAbsent"
                        id="keywordAbsent"
                        checked={formData.keywordAbsent}
                        onChange={handleChange}
                      />
                      <label className="form-check-label small" htmlFor="keywordAbsent">
                        Fail if keyword is present
                      </label>
                    </div>
                  </div>
                </div>
              </div>
            )}

            <div className="row g-3 mb-4">
              <div className="col-md-8">
                <label className="form-label small fw-semibold">Organizational Tags</label>
                <input
                  type="text"
                  name="tagsInput"
                  className="form-control"
                  value={formData.tagsInput}
                  onChange={handleChange}
                  placeholder="production, api, payments"
                />
                <div className="form-text">Comma-separated tags for filtering.</div>
              </div>
              {isHttpType && (
                <div className="col-md-4 d-flex align-items-center pt-3">
                  <div className="form-check">
                    <input
                      className="form-check-input"
                      type="checkbox"
                      name="followRedirects"
                      id="followRedirects"
                      checked={formData.followRedirects}
                      onChange={handleChange}
                    />
                    <label className="form-check-label small" htmlFor="followRedirects">
                      Follow 3xx Redirects
                    </label>
                  </div>
                </div>
              )}
            </div>

            <div className="d-flex justify-content-end gap-2 border-top pt-3">
              <Link to="/monitors" className="btn btn-light border">
                Cancel
              </Link>
              <button type="submit" className="btn btn-primary px-4" disabled={loading}>
                {loading ? 'Saving...' : 'Save & Start Monitoring'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
