<%@ page contentType="text/html;charset=UTF-8" language="java" %>
<%@ taglib prefix="c" uri="jakarta.tags.core" %>
<%@ taglib prefix="fmt" uri="jakarta.tags.fmt" %>
<c:set var="pageTitle" value="System Health Overview" scope="request"/>
<jsp:include page="layout/header.jsp"/>

<!-- Summary Metrics Cards -->
<div class="row g-3 mb-4">
    <div class="col-xl-2 col-md-4 col-sm-6">
        <div class="metric-card">
            <div class="metric-title">Total Monitors</div>
            <div class="metric-value text-primary">${totalMonitors}</div>
            <div class="metric-subtext">Configured endpoints</div>
        </div>
    </div>
    <div class="col-xl-2 col-md-4 col-sm-6">
        <div class="metric-card">
            <div class="metric-title">Operational</div>
            <div class="metric-value text-success">${upMonitors}</div>
            <div class="metric-subtext"><span class="status-dot status-dot-up me-1"></span>Responding normally</div>
        </div>
    </div>
    <div class="col-xl-2 col-md-4 col-sm-6">
        <div class="metric-card">
            <div class="metric-title">Outages</div>
            <div class="metric-value text-danger">${downMonitors}</div>
            <div class="metric-subtext"><span class="status-dot status-dot-down me-1"></span>Requires attention</div>
        </div>
    </div>
    <div class="col-xl-2 col-md-4 col-sm-6">
        <div class="metric-card">
            <div class="metric-title">Paused</div>
            <div class="metric-value text-secondary">${pausedMonitors}</div>
            <div class="metric-subtext">Disabled checks</div>
        </div>
    </div>
    <div class="col-xl-2 col-md-4 col-sm-6">
        <div class="metric-card">
            <div class="metric-title">Avg Response</div>
            <div class="metric-value text-dark">${avgResponseTime}<span class="fs-6 fw-normal text-muted ms-1">ms</span></div>
            <div class="metric-subtext">Last 24 hours</div>
        </div>
    </div>
    <div class="col-xl-2 col-md-4 col-sm-6">
        <div class="metric-card">
            <div class="metric-title">Overall Uptime</div>
            <div class="metric-value text-info">${overallUptime}<span class="fs-6 fw-normal text-muted ms-1">%</span></div>
            <div class="metric-subtext">Last 24 hours</div>
        </div>
    </div>
</div>

<!-- Active Outages Alert Banner (if any) -->
<c:if test="${not empty downList}">
    <div class="alert alert-danger border-danger shadow-sm mb-4">
        <div class="d-flex align-items-center gap-2 mb-2">
            <i class="bi bi-exclamation-triangle-fill fs-5"></i>
            <h6 class="mb-0 fw-bold">Active Outage Detected (${downList.size()})</h6>
        </div>
        <div class="d-flex flex-wrap gap-2">
            <c:forEach var="m" items="${downList}">
                <a href="${pageContext.request.contextPath}/monitors/${m.id}" class="badge bg-danger text-decoration-none py-2 px-3">
                    <i class="bi bi-x-circle me-1"></i> ${m.name} (${m.type})
                </a>
            </c:forEach>
        </div>
    </div>
</c:if>

<!-- Charts & Trends Section -->
<div class="row g-4 mb-4">
    <div class="col-lg-8">
        <div class="table-card h-100">
            <div class="card-header d-flex justify-content-between align-items-center">
                <span><i class="bi bi-graph-up me-2 text-primary"></i>Response Time Trend (Latest Checks)</span>
                <span class="badge bg-light text-muted border">Milliseconds</span>
            </div>
            <div class="p-3">
                <canvas id="responseTrendChart" height="110"></canvas>
            </div>
        </div>
    </div>
    <div class="col-lg-4">
        <div class="table-card h-100">
            <div class="card-header d-flex justify-content-between align-items-center">
                <span><i class="bi bi-shield-exclamation me-2 text-danger"></i>Recent Incidents</span>
                <a href="${pageContext.request.contextPath}/incidents" class="btn btn-sm btn-link text-decoration-none p-0">View all</a>
            </div>
            <div class="p-3">
                <c:choose>
                    <c:when test="${empty recentIncidents}">
                        <div class="empty-state py-4">
                            <i class="bi bi-check-circle text-success fs-2"></i>
                            <p class="text-muted small mt-2 mb-0">No recent incidents. All systems operational!</p>
                        </div>
                    </c:when>
                    <c:otherwise>
                        <div class="list-group list-group-flush">
                            <c:forEach var="inc" items="${recentIncidents}">
                                <a href="${pageContext.request.contextPath}/incidents/${inc.id}" class="list-group-item list-group-item-action px-0 py-2 border-0">
                                    <div class="d-flex justify-content-between align-items-center">
                                        <strong class="small text-truncate" style="max-width: 180px;">${inc.monitorName}</strong>
                                        <span class="badge ${inc.status == 'OPEN' ? 'bg-danger' : inc.status == 'ACKNOWLEDGED' ? 'bg-warning text-dark' : 'bg-success'}">
                                            ${inc.status}
                                        </span>
                                    </div>
                                    <p class="text-muted small mb-0 text-truncate">${inc.cause != null ? inc.cause : 'Service outage'}</p>
                                </a>
                            </c:forEach>
                        </div>
                    </c:otherwise>
                </c:choose>
            </div>
        </div>
    </div>
</div>

<!-- Latest Monitoring Checks Table -->
<div class="table-card">
    <div class="card-header d-flex justify-content-between align-items-center">
        <span><i class="bi bi-clock-history me-2 text-primary"></i>Latest Health Checks</span>
        <a href="${pageContext.request.contextPath}/monitors" class="btn btn-sm btn-outline-primary">Manage Monitors</a>
    </div>
    <div class="table-responsive">
        <table class="table table-hover mb-0">
            <thead>
                <tr>
                    <th>Status</th>
                    <th>Monitor ID</th>
                    <th>Response Time</th>
                    <th>HTTP Status</th>
                    <th>Check Time (UTC)</th>
                    <th>Message / Error</th>
                </tr>
            </thead>
            <tbody>
                <c:choose>
                    <c:when test="${empty recentChecks}">
                        <tr>
                            <td colspan="6" class="text-center py-4 text-muted">
                                <i class="bi bi-inbox fs-3 d-block mb-2"></i>
                                No checks recorded yet. Waiting for scheduled runner...
                            </td>
                        </tr>
                    </c:when>
                    <c:otherwise>
                        <c:forEach var="check" items="${recentChecks}">
                            <tr>
                                <td>
                                    <c:choose>
                                        <c:when test="${check.status == 'UP'}">
                                            <span class="badge-status badge-status-up"><span class="status-dot status-dot-up"></span> UP</span>
                                        </c:when>
                                        <c:otherwise>
                                            <span class="badge-status badge-status-down"><span class="status-dot status-dot-down"></span> DOWN</span>
                                        </c:otherwise>
                                    </c:choose>
                                </td>
                                <td>
                                    <a href="${pageContext.request.contextPath}/monitors/${check.monitorId}" class="text-decoration-none fw-semibold">
                                        ${check.monitorId}
                                    </a>
                                </td>
                                <td>
                                    <span class="fw-semibold">${check.responseTimeMs} ms</span>
                                </td>
                                <td>
                                    <c:choose>
                                        <c:when test="${check.httpStatusCode != null}">
                                            <span class="badge ${check.httpStatusCode >= 200 && check.httpStatusCode < 300 ? 'bg-success bg-opacity-10 text-success' : 'bg-danger bg-opacity-10 text-danger'} border">
                                                ${check.httpStatusCode}
                                            </span>
                                        </c:when>
                                        <c:otherwise><span class="text-muted">-</span></c:otherwise>
                                    </c:choose>
                                </td>
                                <td class="text-muted small">${check.checkedAt}</td>
                                <td class="text-muted small text-truncate" style="max-width: 250px;">
                                    ${check.errorMessage != null ? check.errorMessage : 'Healthy'}
                                </td>
                            </tr>
                        </c:forEach>
                    </c:otherwise>
                </c:choose>
            </tbody>
        </table>
    </div>
</div>

<script>
document.addEventListener("DOMContentLoaded", function () {
    const ctx = document.getElementById("responseTrendChart");
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
                borderColor: '#3b82f6',
                backgroundColor: 'rgba(59, 130, 246, 0.08)',
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

<jsp:include page="layout/footer.jsp"/>
