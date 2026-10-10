<%@ page contentType="text/html;charset=UTF-8" language="java" %>
<%@ taglib prefix="c" uri="jakarta.tags.core" %>
<c:set var="pageTitle" value="${monitor.name} - Monitor Details" scope="request"/>
<jsp:include page="../layout/header.jsp"/>

<!-- Top Actions Bar -->
<div class="d-flex justify-content-between align-items-center mb-4">
    <div class="d-flex align-items-center gap-3">
        <a href="${pageContext.request.contextPath}/monitors" class="btn btn-outline-secondary btn-sm">
            <i class="bi bi-arrow-left"></i>
        </a>
        <div>
            <h4 class="fw-bold mb-0 d-flex align-items-center gap-2">
                ${monitor.name}
                <c:choose>
                    <c:when test="${monitor.status == 'UP'}">
                        <span class="badge-status badge-status-up fs-6"><span class="status-dot status-dot-up"></span> OPERATIONAL</span>
                    </c:when>
                    <c:when test="${monitor.status == 'DOWN'}">
                        <span class="badge-status badge-status-down fs-6"><span class="status-dot status-dot-down"></span> DOWN</span>
                    </c:when>
                    <c:when test="${monitor.status == 'PAUSED'}">
                        <span class="badge-status badge-status-paused fs-6">PAUSED</span>
                    </c:when>
                    <c:otherwise>
                        <span class="badge-status badge-status-unknown fs-6">UNKNOWN</span>
                    </c:otherwise>
                </c:choose>
            </h4>
            <p class="text-muted small mb-0 mt-1">
                <code>${monitor.url != null ? monitor.url : monitor.hostname.concat(':').concat(monitor.port != null ? monitor.port : '')}</code>
                • Type: <strong>${monitor.type}</strong> • Checked every <strong>${monitor.checkIntervalSeconds}s</strong>
            </p>
        </div>
    </div>
    <div class="d-flex align-items-center gap-2">
        <form action="${pageContext.request.contextPath}/monitors/${monitor.id}/check-now" method="post" class="m-0">
            <input type="hidden" name="${_csrf.parameterName}" value="${_csrf.token}"/>
            <button type="submit" class="btn btn-outline-primary btn-sm d-flex align-items-center gap-1">
                <i class="bi bi-arrow-repeat"></i> Check Now
            </button>
        </form>
        <c:choose>
            <c:when test="${monitor.paused}">
                <form action="${pageContext.request.contextPath}/monitors/${monitor.id}/resume" method="post" class="m-0">
                    <input type="hidden" name="${_csrf.parameterName}" value="${_csrf.token}"/>
                    <button type="submit" class="btn btn-outline-success btn-sm"><i class="bi bi-play-fill me-1"></i>Resume</button>
                </form>
            </c:when>
            <c:otherwise>
                <form action="${pageContext.request.contextPath}/monitors/${monitor.id}/pause" method="post" class="m-0">
                    <input type="hidden" name="${_csrf.parameterName}" value="${_csrf.token}"/>
                    <button type="submit" class="btn btn-outline-warning btn-sm"><i class="bi bi-pause-fill me-1"></i>Pause</button>
                </form>
            </c:otherwise>
        </c:choose>
        <a href="${pageContext.request.contextPath}/monitors/${monitor.id}/edit" class="btn btn-outline-secondary btn-sm">
            <i class="bi bi-pencil me-1"></i>Edit
        </a>
        <button type="button" class="btn btn-outline-danger btn-sm" data-bs-toggle="modal" data-bs-target="#deleteModal">
            <i class="bi bi-trash"></i>
        </button>
    </div>
</div>

<!-- Metrics Cards -->
<div class="row g-3 mb-4">
    <div class="col-md-3 col-sm-6">
        <div class="metric-card">
            <div class="metric-title">24h Uptime</div>
            <div class="metric-value text-info">${String.format("%.2f", analytics.uptimePercentage)}%</div>
            <div class="metric-subtext">${analytics.upChecks} UP / ${analytics.totalChecks} checks</div>
        </div>
    </div>
    <div class="col-md-3 col-sm-6">
        <div class="metric-card">
            <div class="metric-title">Average Response</div>
            <div class="metric-value text-primary">${Math.round(analytics.averageResponseTimeMs)}<span class="fs-6 text-muted ms-1">ms</span></div>
            <div class="metric-subtext">Min: ${analytics.minResponseTimeMs}ms / Max: ${analytics.maxResponseTimeMs}ms</div>
        </div>
    </div>
    <div class="col-md-3 col-sm-6">
        <div class="metric-card">
            <div class="metric-title">Total Incidents</div>
            <div class="metric-value text-warning">${analytics.incidentCount}</div>
            <div class="metric-subtext">Threshold: ${monitor.failureThreshold} failures</div>
        </div>
    </div>
    <div class="col-md-3 col-sm-6">
        <div class="metric-card">
            <div class="metric-title">SSL Expiry</div>
            <div class="metric-value ${monitor.sslExpiryDays != null && monitor.sslExpiryDays < 30 ? 'text-danger' : 'text-success'}">
                ${monitor.sslExpiryDays != null ? monitor.sslExpiryDays : 'N/A'}<span class="fs-6 text-muted ms-1">days</span>
            </div>
            <div class="metric-subtext">${monitor.url != null && monitor.url.startsWith('https://') ? 'Inspected via TLS' : 'Not HTTPS'}</div>
        </div>
    </div>
</div>

<!-- Response Time Trend Chart -->
<div class="table-card mb-4">
    <div class="card-header d-flex justify-content-between align-items-center">
        <span><i class="bi bi-graph-up me-2 text-primary"></i>Response Time History (24 Hours)</span>
        <span class="badge bg-light text-muted border">Milliseconds</span>
    </div>
    <div class="p-3">
        <canvas id="monitorRtChart" height="90"></canvas>
    </div>
</div>

<!-- Detailed Check History Table -->
<div class="table-card mb-4">
    <div class="card-header d-flex justify-content-between align-items-center">
        <span><i class="bi bi-clock-history me-2 text-primary"></i>Recent Check Logs</span>
        <span class="badge bg-secondary bg-opacity-10 text-secondary">Page ${checkResults.number + 1} of ${checkResults.totalPages}</span>
    </div>
    <div class="table-responsive">
        <table class="table table-hover mb-0">
            <thead>
                <tr>
                    <th>Status</th>
                    <th>Checked At (UTC)</th>
                    <th>Response Time</th>
                    <th>HTTP Status</th>
                    <th>Keyword Result</th>
                    <th>Error Detail</th>
                </tr>
            </thead>
            <tbody>
                <c:choose>
                    <c:when test="${empty checkResults.content}">
                        <tr>
                            <td colspan="6" class="text-center py-4 text-muted">No check logs recorded yet.</td>
                        </tr>
                    </c:when>
                    <c:otherwise>
                        <c:forEach var="cr" items="${checkResults.content}">
                            <tr>
                                <td>
                                    <c:choose>
                                        <c:when test="${cr.status == 'UP'}">
                                            <span class="badge-status badge-status-up"><span class="status-dot status-dot-up"></span> UP</span>
                                        </c:when>
                                        <c:otherwise>
                                            <span class="badge-status badge-status-down"><span class="status-dot status-dot-down"></span> DOWN</span>
                                        </c:otherwise>
                                    </c:choose>
                                </td>
                                <td class="text-muted small">${cr.checkedAt}</td>
                                <td><strong>${cr.responseTimeMs} ms</strong></td>
                                <td>
                                    <c:choose>
                                        <c:when test="${cr.httpStatusCode != null}">
                                            <span class="badge ${cr.httpStatusCode >= 200 && cr.httpStatusCode < 300 ? 'bg-success bg-opacity-10 text-success' : 'bg-danger bg-opacity-10 text-danger'} border">
                                                ${cr.httpStatusCode}
                                            </span>
                                        </c:when>
                                        <c:otherwise><span class="text-muted">-</span></c:otherwise>
                                    </c:choose>
                                </td>
                                <td>
                                    <c:choose>
                                        <c:when test="${cr.keywordFound != null}">
                                            <span class="badge ${cr.keywordFound ? 'bg-info bg-opacity-10 text-info' : 'bg-secondary bg-opacity-10 text-secondary'} border">
                                                ${cr.keywordFound ? 'Found' : 'Not Found'}
                                            </span>
                                        </c:when>
                                        <c:otherwise><span class="text-muted">-</span></c:otherwise>
                                    </c:choose>
                                </td>
                                <td class="text-muted small text-truncate" style="max-width: 300px;">
                                    ${cr.errorMessage != null ? cr.errorMessage : 'Success'}
                                </td>
                            </tr>
                        </c:forEach>
                    </c:otherwise>
                </c:choose>
            </tbody>
        </table>
    </div>
    <!-- Pagination -->
    <c:if test="${checkResults.totalPages > 1}">
        <div class="p-3 border-top d-flex justify-content-between align-items-center">
            <span class="text-muted small">Showing ${checkResults.numberOfElements} entries</span>
            <div class="btn-group btn-group-sm">
                <a href="?page=${checkResults.number - 1}" class="btn btn-outline-secondary ${checkResults.first ? 'disabled' : ''}">Previous</a>
                <a href="?page=${checkResults.number + 1}" class="btn btn-outline-secondary ${checkResults.last ? 'disabled' : ''}">Next</a>
            </div>
        </div>
    </c:if>
</div>

<!-- Delete Confirmation Modal -->
<div class="modal fade" id="deleteModal" tabindex="-1">
    <div class="modal-dialog">
        <div class="modal-content">
            <div class="modal-header">
                <h5 class="modal-title fw-bold">Delete Monitor</h5>
                <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
            </div>
            <div class="modal-body">
                <p>Are you sure you want to delete monitor <strong>${monitor.name}</strong>?</p>
                <p class="text-muted small mb-0">This will stop all health checks for this service.</p>
            </div>
            <div class="modal-footer">
                <button type="button" class="btn btn-light" data-bs-dismiss="modal">Cancel</button>
                <form action="${pageContext.request.contextPath}/monitors/${monitor.id}/delete" method="post">
                    <input type="hidden" name="${_csrf.parameterName}" value="${_csrf.token}"/>
                    <button type="submit" class="btn btn-danger">Yes, Delete Monitor</button>
                </form>
            </div>
        </div>
    </div>
</div>

<script>
document.addEventListener("DOMContentLoaded", function () {
    const ctx = document.getElementById("monitorRtChart");
    if (!ctx) return;

    const labels = [<c:forEach var="l" items="${chartLabels}" varStatus="status">'${l}'${!status.last ? ',' : ''}</c:forEach>];
    const data = [<c:forEach var="d" items="${chartData}" varStatus="status">${d}${!status.last ? ',' : ''}</c:forEach>];

    new Chart(ctx, {
        type: 'line',
        data: {
            labels: labels.length > 0 ? labels : ['No Data'],
            datasets: [{
                label: 'Response Time (ms)',
                data: data.length > 0 ? data : [0],
                borderColor: '#10b981',
                backgroundColor: 'rgba(16, 185, 129, 0.08)',
                fill: true,
                tension: 0.35,
                borderWidth: 2,
                pointRadius: 3
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: { callback: value => value + ' ms' }
                }
            },
            plugins: {
                legend: { display: false }
            }
        }
    });
});
</script>

<jsp:include page="../layout/footer.jsp"/>
