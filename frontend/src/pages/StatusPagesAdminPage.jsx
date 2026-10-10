import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';

export const StatusPagesAdminPage = () => {
  const [pages, setPages] = useState([]);
  const [monitors, setMonitors] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editingPage, setEditingPage] = useState(null); // null = create mode, object = edit mode
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    slug: '',
    brandingColor: '#2563eb',
    monitorIds: [],
    isPublic: true
  });
  const [message, setMessage] = useState({ type: '', text: '' });
  const [loading, setLoading] = useState(true);

  const fetchPages = async () => {
    try {
      const res = await api.get('/status-pages');
      setPages(res.data);
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
    Promise.all([fetchPages(), fetchMonitors()]).finally(() => setLoading(false));
  }, []);

  const openCreateModal = () => {
    setEditingPage(null);
    setFormData({ title: '', description: '', slug: '', brandingColor: '#2563eb', monitorIds: [], isPublic: true });
    setShowModal(true);
  };

  const openEditModal = (page) => {
    setEditingPage(page);
    setFormData({
      title: page.title || '',
      description: page.description || '',
      slug: page.slug || '',
      brandingColor: page.brandingColor || '#2563eb',
      monitorIds: page.monitorIds || [],
      isPublic: page.isPublic !== false
    });
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this status page?')) return;
    try {
      await api.delete(`/status-pages/${id}`);
      setMessage({ type: 'success', text: 'Status page deleted.' });
      fetchPages();
    } catch (err) {
      setMessage({ type: 'danger', text: 'Failed to delete status page.' });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingPage) {
        await api.put(`/status-pages/${editingPage.id}`, formData);
        setMessage({ type: 'success', text: 'Status page updated successfully.' });
      } else {
        await api.post('/status-pages', formData);
        setMessage({ type: 'success', text: 'Status page created successfully.' });
      }
      setShowModal(false);
      setEditingPage(null);
      setFormData({ title: '', description: '', slug: '', brandingColor: '#2563eb', monitorIds: [], isPublic: true });
      fetchPages();
    } catch (err) {
      setMessage({ type: 'danger', text: err.response?.data?.error || 'Failed to save status page.' });
    }
  };

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h4 className="fw-bold mb-1">Status Pages</h4>
          <p className="text-muted small mb-0">Build shareable, branded public status pages for your users and stakeholders</p>
        </div>
        <button className="btn btn-primary btn-sm" onClick={openCreateModal}>
          <i className="bi bi-plus-lg me-1"></i> New Status Page
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
                <th>Title</th>
                <th>Public URL / Slug</th>
                <th>Monitors</th>
                <th>Visibility</th>
                <th>Brand Color</th>
                <th className="text-end">Actions</th>
              </tr>
            </thead>
            <tbody>
              {!pages.length ? (
                <tr>
                  <td colSpan="6">
                    <div className="empty-state">
                      <i className="bi bi-broadcast text-muted"></i>
                      <h5>No status pages created</h5>
                      <p className="text-muted">Publish your uptime and incidents publicly or to customers.</p>
                      <button className="btn btn-primary btn-sm" onClick={openCreateModal}>
                        New Status Page
                      </button>
                    </div>
                  </td>
                </tr>
              ) : (
                pages.map((p) => (
                  <tr key={p.id}>
                    <td className="fw-bold">{p.title}</td>
                    <td>
                      <Link to={`/status/${p.slug}`} target="_blank" className="text-decoration-none">
                        <code>/status/{p.slug}</code> <i className="bi bi-box-arrow-up-right small"></i>
                      </Link>
                    </td>
                    <td>
                      <span className="badge bg-secondary bg-opacity-10 text-secondary border">
                        {p.monitorIds?.length
                          ? `${p.monitorIds.length} Selected`
                          : <span className="text-success fw-semibold">All Monitors</span>
                        }
                      </span>
                    </td>
                    <td>
                      <span className={`badge ${p.isPublic ? 'bg-success' : 'bg-secondary'}`}>
                        {p.isPublic ? 'Public' : 'Hidden'}
                      </span>
                    </td>
                    <td>
                      <span
                        className="d-inline-block rounded-circle me-1"
                        style={{ width: '12px', height: '12px', backgroundColor: p.brandingColor || '#3B82F6' }}
                      ></span>
                      <span className="text-muted small">{p.brandingColor || '#3B82F6'}</span>
                    </td>
                    <td className="text-end">
                      <Link to={`/status/${p.slug}`} target="_blank" className="btn btn-sm btn-outline-primary me-1">
                        <i className="bi bi-eye me-1"></i>View Live
                      </Link>
                      <button
                        onClick={() => openEditModal(p)}
                        className="btn btn-sm btn-outline-secondary me-1"
                        title="Edit Status Page"
                      >
                        <i className="bi bi-pencil"></i>
                      </button>
                      <button
                        onClick={() => handleDelete(p.id)}
                        className="btn btn-sm btn-outline-danger"
                        title="Delete Status Page"
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

      {/* Create / Edit Modal */}
      {showModal && (
        <div className="modal fade show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-lg">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title fw-bold">
                  {editingPage ? (
                    <><i className="bi bi-pencil-square me-2"></i>Edit Status Page</>
                  ) : (
                    <><i className="bi bi-broadcast me-2"></i>Create Public Status Page</>
                  )}
                </h5>
                <button type="button" className="btn-close" onClick={() => setShowModal(false)}></button>
              </div>
              <form onSubmit={handleSubmit}>
                <div className="modal-body">
                  <div className="row g-3 mb-3">
                    <div className="col-md-8">
                      <label className="form-label fw-semibold">Status Page Title <span className="text-danger">*</span></label>
                      <input
                        type="text"
                        className="form-control"
                        placeholder="e.g. Acme Cloud Operational Status"
                        value={formData.title}
                        onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                        required
                      />
                    </div>
                    <div className="col-md-4">
                      <label className="form-label fw-semibold">Brand Color</label>
                      <input
                        type="color"
                        className="form-control form-control-color w-100"
                        value={formData.brandingColor}
                        onChange={(e) => setFormData({ ...formData, brandingColor: e.target.value })}
                      />
                    </div>
                  </div>

                  <div className="mb-3">
                    <label className="form-label fw-semibold">Description</label>
                    <textarea
                      className="form-control"
                      rows="2"
                      placeholder="Real-time and historical operational status..."
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    ></textarea>
                  </div>

                  <div className="mb-3">
                    <label className="form-label fw-semibold">
                      URL Slug <span className="text-danger">*</span>
                    </label>
                    <div className="input-group">
                      <span className="input-group-text bg-light text-muted small">/status/</span>
                      <input
                        type="text"
                        className="form-control"
                        placeholder="acme-services"
                        pattern="[a-zA-Z0-9-_]+"
                        value={formData.slug}
                        onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                        required
                        disabled={!!editingPage} // can't change slug when editing
                      />
                    </div>
                    {editingPage && <div className="form-text text-warning"><i className="bi bi-lock me-1"></i>Slug cannot be changed after creation.</div>}
                  </div>

                  <div className="mb-3">
                    <label className="form-label fw-semibold">Monitors to Display</label>
                    <div className="form-text mb-2">
                      <i className="bi bi-info-circle text-primary me-1"></i>
                      <strong>Leave empty = show ALL monitors</strong> (including new ones added in future). Or select specific monitors to pin them.
                    </div>
                    <select
                      className="form-select"
                      multiple
                      size={Math.min(monitors.length + 1, 6)}
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
                    <div className="form-text">
                      Hold <kbd>Ctrl</kbd> / <kbd>Cmd</kbd> to select multiple. 
                      {formData.monitorIds.length > 0 && (
                        <button
                          type="button"
                          className="btn btn-link btn-sm p-0 ms-2 text-danger"
                          onClick={() => setFormData({ ...formData, monitorIds: [] })}
                        >
                          Clear selection (show all)
                        </button>
                      )}
                    </div>
                  </div>

                  <div className="form-check">
                    <input
                      className="form-check-input"
                      type="checkbox"
                      id="isPublic"
                      checked={formData.isPublic}
                      onChange={(e) => setFormData({ ...formData, isPublic: e.target.checked })}
                    />
                    <label className="form-check-label small" htmlFor="isPublic">
                      Enable public access (available without authentication)
                    </label>
                  </div>
                </div>
                <div className="modal-footer">
                  <button type="button" className="btn btn-light" onClick={() => setShowModal(false)}>
                    Cancel
                  </button>
                  <button type="submit" className="btn btn-primary">
                    {editingPage ? <><i className="bi bi-check2 me-1"></i>Save Changes</> : <><i className="bi bi-broadcast me-1"></i>Publish Status Page</>}
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
