<%@ page contentType="text/html;charset=UTF-8" language="java" %>
<%@ taglib prefix="c" uri="jakarta.tags.core" %>
<c:set var="pageTitle" value="Maintenance Windows" scope="request"/>
<jsp:include page="../layout/header.jsp"/>

<div class="d-flex justify-content-between align-items-center mb-4">
    <div>
        <h4 class="fw-bold mb-1">Maintenance Windows</h4>
        <p class="text-muted small mb-0">Schedule planned maintenance periods to automatically suppress downtime alerts</p>
    </div>
    <button type="button" class="btn btn-primary btn-sm" data-bs-toggle="modal" data-bs-target="#addWindowModal">
        <i class="bi bi-calendar-plus me-1"></i> Schedule Maintenance
    </button>
</div>

<div class="table-card">
    <div class="table-responsive">
        <table class="table table-hover align-middle mb-0">
            <thead>
                <tr>
                    <th>Status</th>
                    <th>Title & Description</th>
                    <th>Start Time (UTC)</th>
                    <th>End Time (UTC)</th>
                    <th>Affected Monitors</th>
                    <th>Alerts Suppressed</th>
                    <th class="text-end">Actions</th>
                </tr>
            </thead>
            <tbody>
                <c:choose>
                    <c:when test="${empty windows}">
                        <tr>
                            <td colspan="7">
                                <div class="empty-state">
                                    <i class="bi bi-calendar2-check text-muted"></i>
                                    <h5>No maintenance windows scheduled</h5>
                                    <p class="text-muted">Plan upcoming maintenance to prevent unnecessary alerts.</p>
                                    <button class="btn btn-primary btn-sm" data-bs-toggle="modal" data-bs-target="#addWindowModal">Schedule Maintenance</button>
                                </div>
                            </td>
                        </tr>
                    </c:when>
                    <c:otherwise>
                        <c:forEach var="w" items="${windows}">
                            <tr>
                                <td>
                                    <span class="badge ${w.status == 'ACTIVE' ? 'bg-warning text-dark' : w.status == 'UPCOMING' ? 'bg-info bg-opacity-10 text-info border' : 'bg-secondary bg-opacity-10 text-secondary border'}">
                                        ${w.status}
                                    </span>
                                </td>
                                <td>
                                    <div class="fw-bold text-dark">${w.title}</div>
                                    <div class="text-muted small text-truncate" style="max-width: 200px;">${w.description}</div>
                                </td>
                                <td class="text-muted small">${w.startTime}</td>
                                <td class="text-muted small">${w.endTime}</td>
                                <td>
                                    <c:choose>
                                        <c:when test="${empty w.monitorIds}">
                                            <span class="badge bg-light text-dark border">All Monitors</span>
                                        </c:when>
                                        <c:otherwise>
                                            <span class="badge bg-primary bg-opacity-10 text-primary border">${w.monitorIds.size()} Monitors</span>
                                        </c:otherwise>
                                    </c:choose>
                                </td>
                                <td>
                                    <i class="bi ${w.suppressAlerts ? 'bi-bell-slash text-warning' : 'bi-bell text-secondary'} fs-5"></i>
                                </td>
                                <td class="text-end">
                                    <form action="${pageContext.request.contextPath}/maintenance/${w.id}/delete" method="post" class="d-inline">
                                        <input type="hidden" name="${_csrf.parameterName}" value="${_csrf.token}"/>
                                        <button type="submit" class="btn btn-sm btn-outline-danger" title="Delete Window">
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

<!-- Schedule Modal -->
<div class="modal fade" id="addWindowModal" tabindex="-1">
    <div class="modal-dialog">
        <div class="modal-content">
            <div class="modal-header">
                <h5 class="modal-title fw-bold">Schedule Maintenance Window</h5>
                <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
            </div>
            <form action="${pageContext.request.contextPath}/maintenance/add" method="post">
                <input type="hidden" name="${_csrf.parameterName}" value="${_csrf.token}"/>
                <div class="modal-body">
                    <div class="mb-3">
                        <label class="form-label fw-semibold">Window Title</label>
                        <input type="text" name="title" class="form-control" placeholder="e.g. Database OS Upgrades" required>
                    </div>
                    <div class="mb-3">
                        <label class="form-label fw-semibold">Description</label>
                        <textarea name="description" class="form-control" rows="2" placeholder="Explain the maintenance scope..."></textarea>
                    </div>
                    <div class="row g-2 mb-3">
                        <div class="col-6">
                            <label class="form-label small fw-semibold">Start Time (UTC)</label>
                            <input type="datetime-local" name="startTimeStr" class="form-control" required>
                        </div>
                        <div class="col-6">
                            <label class="form-label small fw-semibold">End Time (UTC)</label>
                            <input type="datetime-local" name="endTimeStr" class="form-control" required>
                        </div>
                    </div>
                    <div class="mb-3">
                        <label class="form-label fw-semibold">Affects Specific Monitors</label>
                        <select name="monitorIds" class="form-select" multiple size="4">
                            <c:forEach var="m" items="${monitors}">
                                <option value="${m.id}">${m.name} (${m.type})</option>
                            </c:forEach>
                        </select>
                        <div class="form-text">Hold Ctrl/Cmd to select multiple. Leave unselected for all monitors.</div>
                    </div>
                    <div class="form-check">
                        <input class="form-check-input" type="checkbox" name="suppressAlerts" value="true" id="suppressAlerts" checked>
                        <label class="form-check-label small" for="suppressAlerts">
                            Suppress downtime notifications during this window
                        </label>
                    </div>
                </div>
                <div class="modal-footer">
                    <button type="button" class="btn btn-light" data-bs-dismiss="modal">Cancel</button>
                    <button type="submit" class="btn btn-primary">Save Window</button>
                </div>
            </form>
        </div>
    </div>
</div>

<jsp:include page="../layout/footer.jsp"/>
