<%@ page contentType="text/html;charset=UTF-8" language="java" %>
<%@ taglib prefix="c" uri="jakarta.tags.core" %>
<c:set var="pageTitle" value="Public Status Pages" scope="request"/>
<jsp:include page="../layout/header.jsp"/>

<div class="d-flex justify-content-between align-items-center mb-4">
    <div>
        <h4 class="fw-bold mb-1">Status Pages</h4>
        <p class="text-muted small mb-0">Build shareable, branded public status pages for your users and stakeholders</p>
    </div>
    <button type="button" class="btn btn-primary btn-sm" data-bs-toggle="modal" data-bs-target="#addPageModal">
        <i class="bi bi-plus-lg me-1"></i> New Status Page
    </button>
</div>

<div class="table-card">
    <div class="table-responsive">
        <table class="table table-hover align-middle mb-0">
            <thead>
                <tr>
                    <th>Title</th>
                    <th>Public URL / Slug</th>
                    <th>Selected Monitors</th>
                    <th>Visibility</th>
                    <th>Brand Color</th>
                    <th class="text-end">Actions</th>
                </tr>
            </thead>
            <tbody>
                <c:choose>
                    <c:when test="${empty pages}">
                        <tr>
                            <td colspan="6">
                                <div class="empty-state">
                                    <i class="bi bi-broadcast text-muted"></i>
                                    <h5>No status pages created</h5>
                                    <p class="text-muted">Publish your uptime and incidents publicly or to customers.</p>
                                    <button class="btn btn-primary btn-sm" data-bs-toggle="modal" data-bs-target="#addPageModal">New Status Page</button>
                                </div>
                            </td>
                        </tr>
                    </c:when>
                    <c:otherwise>
                        <c:forEach var="p" items="${pages}">
                            <tr>
                                <td class="fw-bold">${p.title}</td>
                                <td>
                                    <a href="${pageContext.request.contextPath}/status/${p.slug}" target="_blank" class="text-decoration-none">
                                        <code>/status/${p.slug}</code> <i class="bi bi-box-arrow-up-right small"></i>
                                    </a>
                                </td>
                                <td><span class="badge bg-secondary bg-opacity-10 text-secondary border">${p.monitorIds.size()} Monitors</span></td>
                                <td>
                                    <span class="badge ${p.isPublic ? 'bg-success' : 'bg-secondary'}">${p.isPublic ? 'Public' : 'Hidden'}</span>
                                </td>
                                <td>
                                    <span class="d-inline-block rounded-circle me-1" style="width: 12px; height: 12px; background-color: ${p.brandingColor != null ? p.brandingColor : '#3B82F6'};"></span>
                                    <span class="text-muted small">${p.brandingColor != null ? p.brandingColor : '#3B82F6'}</span>
                                </td>
                                <td class="text-end">
                                    <a href="${pageContext.request.contextPath}/status/${p.slug}" target="_blank" class="btn btn-sm btn-outline-primary me-1">
                                        View Live
                                    </a>
                                    <form action="${pageContext.request.contextPath}/status-pages/${p.id}/delete" method="post" class="d-inline">
                                        <input type="hidden" name="${_csrf.parameterName}" value="${_csrf.token}"/>
                                        <button type="submit" class="btn btn-sm btn-outline-danger" title="Delete Status Page">
                                            <i class="bi bi-trash"></i>
                                        </button>
                                    </form>
                                </td>
                            </tr>
                        </c:forEach>
                    </c:otherwise>
                </c:choose>
            </tbody>
        </table>
    </div>
</div>

<!-- Add Status Page Modal -->
<div class="modal fade" id="addPageModal" tabindex="-1">
    <div class="modal-dialog">
        <div class="modal-content">
            <div class="modal-header">
                <h5 class="modal-title fw-bold">Create Public Status Page</h5>
                <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
            </div>
            <form action="${pageContext.request.contextPath}/status-pages/add" method="post">
                <input type="hidden" name="${_csrf.parameterName}" value="${_csrf.token}"/>
                <div class="modal-body">
                    <div class="mb-3">
                        <label class="form-label fw-semibold">Status Page Title</label>
                        <input type="text" name="title" class="form-control" placeholder="e.g. Acme Cloud Operational Status" required>
                    </div>
                    <div class="mb-3">
                        <label class="form-label fw-semibold">Description</label>
                        <textarea name="description" class="form-control" rows="2" placeholder="Real-time and historical operational status..."></textarea>
                    </div>
                    <div class="mb-3">
                        <label class="form-label fw-semibold">URL Slug <span class="text-danger">*</span></label>
                        <div class="input-group">
                            <span class="input-group-text bg-light text-muted small">/status/</span>
                            <input type="text" name="slug" class="form-control" placeholder="acme-services" pattern="[a-zA-Z0-9-_]+" required>
                        </div>
                    </div>
                    <div class="mb-3">
                        <label class="form-label fw-semibold">Brand Color (Hex)</label>
                        <input type="color" name="brandingColor" class="form-control form-control-color w-100" value="#2563eb">
                    </div>
                    <div class="mb-3">
                        <label class="form-label fw-semibold">Monitors to Display</label>
                        <select name="monitorIds" class="form-select" multiple size="4">
                            <c:forEach var="m" items="${monitors}">
                                <option value="${m.id}">${m.name} (${m.type})</option>
                            </c:forEach>
                        </select>
                        <div class="form-text">Hold Ctrl/Cmd to select multiple monitors.</div>
                    </div>
                    <div class="form-check">
                        <input class="form-check-input" type="checkbox" name="isPublic" value="true" id="isPublic" checked>
                        <label class="form-check-label small" for="isPublic">
                            Enable public access (available without authentication)
                        </label>
                    </div>
                </div>
                <div class="modal-footer">
                    <button type="button" class="btn btn-light" data-bs-dismiss="modal">Cancel</button>
                    <button type="submit" class="btn btn-primary">Publish Status Page</button>
                </div>
            </form>
        </div>
    </div>
</div>

<jsp:include page="../layout/footer.jsp"/>
