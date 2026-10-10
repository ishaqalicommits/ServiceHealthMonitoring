<%@ page contentType="text/html;charset=UTF-8" language="java" %>
<%@ taglib prefix="c" uri="jakarta.tags.core" %>
<c:set var="pageTitle" value="Incidents & Outages" scope="request"/>
<jsp:include page="../layout/header.jsp"/>

<div class="d-flex justify-content-between align-items-center mb-4">
    <div>
        <h4 class="fw-bold mb-1">Incidents</h4>
        <p class="text-muted small mb-0">Track service outages, acknowledge ongoing issues, and review recovery logs</p>
    </div>
</div>

<!-- Status Tabs -->
<div class="d-flex gap-2 mb-3">
    <a href="${pageContext.request.contextPath}/incidents?status=ALL" class="btn btn-sm ${currentStatus == 'ALL' ? 'btn-primary' : 'btn-outline-secondary'}">
        All Incidents
    </a>
    <a href="${pageContext.request.contextPath}/incidents?status=OPEN" class="btn btn-sm ${currentStatus == 'OPEN' ? 'btn-danger' : 'btn-outline-danger'}">
        <i class="bi bi-exclamation-circle me-1"></i> Open Outages
    </a>
    <a href="${pageContext.request.contextPath}/incidents?status=ACKNOWLEDGED" class="btn btn-sm ${currentStatus == 'ACKNOWLEDGED' ? 'btn-warning text-dark' : 'btn-outline-warning text-dark'}">
        Acknowledged
    </a>
    <a href="${pageContext.request.contextPath}/incidents?status=RESOLVED" class="btn btn-sm ${currentStatus == 'RESOLVED' ? 'btn-success' : 'btn-outline-success'}">
        Resolved
    </a>
</div>

<!-- Incidents List -->
<div class="table-card">
    <div class="table-responsive">
        <table class="table table-hover align-middle mb-0">
            <thead>
                <tr>
                    <th>Status</th>
                    <th>Affected Monitor</th>
                    <th>Outage Reason / Cause</th>
                    <th>Started At (UTC)</th>
                    <th>Duration</th>
                    <th>Acknowledged By</th>
                    <th class="text-end">Actions</th>
                </tr>
            </thead>
            <tbody>
                <c:choose>
                    <c:when test="${empty incidentPage.content}">
                        <tr>
                            <td colspan="7">
                                <div class="empty-state">
                                    <i class="bi bi-shield-check text-success"></i>
                                    <h5>No incidents found</h5>
                                    <p class="text-muted">No service outages recorded matching the selected filter.</p>
                                </div>
                            </td>
                        </tr>
                    </c:when>
                    <c:otherwise>
                        <c:forEach var="inc" items="${incidentPage.content}">
                            <tr>
                                <td>
                                    <span class="badge ${inc.status == 'OPEN' ? 'bg-danger' : inc.status == 'ACKNOWLEDGED' ? 'bg-warning text-dark' : 'bg-success'} py-2 px-3">
                                        ${inc.status}
                                    </span>
                                </td>
                                <td>
                                    <a href="${pageContext.request.contextPath}/monitors/${inc.monitorId}" class="fw-bold text-dark text-decoration-none">
                                        ${inc.monitorName}
                                    </a>
                                </td>
                                <td class="text-muted small text-truncate" style="max-width: 250px;">
                                    ${inc.cause != null ? inc.cause : 'Service down'}
                                </td>
                                <td class="text-muted small">${inc.startedAt}</td>
                                <td>
                                    <c:choose>
                                        <c:when test="${inc.durationSeconds != null}">
                                            ${Math.round(inc.durationSeconds / 60)} mins
                                        </c:when>
                                        <c:otherwise>
                                            <span class="text-danger fw-semibold">Ongoing</span>
                                        </c:otherwise>
                                    </c:choose>
                                </td>
                                <td class="text-muted small">
                                    ${inc.acknowledgedBy != null ? inc.acknowledgedBy : '-'}
                                </td>
                                <td class="text-end">
                                    <a href="${pageContext.request.contextPath}/incidents/${inc.id}" class="btn btn-sm btn-outline-primary">
                                        View Details
                                    </a>
                                </td>
                            </tr>
                        </c:forEach>
                    </c:otherwise>
                </c:choose>
            </tbody>
        </table>
    </div>
</div>

<jsp:include page="../layout/footer.jsp"/>
