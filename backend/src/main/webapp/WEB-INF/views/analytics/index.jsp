<%@ page contentType="text/html;charset=UTF-8" language="java" %>
<%@ taglib prefix="c" uri="jakarta.tags.core" %>
<c:set var="pageTitle" value="Performance Analytics & Reports" scope="request"/>
<jsp:include page="../layout/header.jsp"/>

<div class="d-flex justify-content-between align-items-center mb-4">
    <div>
        <h4 class="fw-bold mb-1">Analytics & Observability</h4>
        <p class="text-muted small mb-0">Evaluate historical latency, reliability metrics, and uptime trends</p>
    </div>
    <c:if test="${not empty selectedMonitor}">
        <a href="${pageContext.request.contextPath}/analytics/export-csv?monitorId=${selectedMonitor.id}&period=${period}" class="btn btn-outline-secondary btn-sm d-flex align-items-center gap-1">
            <i class="bi bi-download"></i> Export CSV Report
        </a>
    </c:if>
</div>

<!-- Controls: Monitor select & Period -->
<div class="table-card p-3 mb-4">
    <form method="get" action="${pageContext.request.contextPath}/analytics" class="row g-3 align-items-center">
        <div class="col-md-6">
            <label class="form-label small fw-semibold text-muted mb-1">Select Service Monitor:</label>
            <select name="monitorId" class="form-select" onchange="this.form.submit()">
                <c:forEach var="m" items="${monitors}">
                    <option value="${m.id}" ${selectedMonitor.id == m.id ? 'selected' : ''}>${m.name} (${m.type})</option>
                </c:forEach>
            </select>
        </div>
        <div class="col-md-6">
            <label class="form-label small fw-semibold text-muted mb-1">Reporting Period:</label>
            <div class="btn-group w-100">
                <button type="submit" name="period" value="24h" class="btn ${period == '24h' ? 'btn-primary' : 'btn-outline-secondary'} btn-sm">Last 24 Hours</button>
                <button type="submit" name="period" value="7d" class="btn ${period == '7d' ? 'btn-primary' : 'btn-outline-secondary'} btn-sm">Last 7 Days</button>
                <button type="submit" name="period" value="30d" class="btn ${period == '30d' ? 'btn-primary' : 'btn-outline-secondary'} btn-sm">Last 30 Days</button>
            </div>
        </div>
    </form>
</div>

<c:choose>
    <c:when test="${empty selectedMonitor}">
        <div class="table-card p-5 text-center">
            <i class="bi bi-bar-chart-line fs-1 text-muted mb-3 d-block"></i>
            <h5>No monitors available for analytics</h5>
            <p class="text-muted">Create a monitor to start collecting health metrics.</p>
        </div>
    </c:when>
    <c:otherwise>
        <!-- Metric Cards -->
        <div class="row g-3 mb-4">
            <div class="col-md-3 col-6">
                <div class="metric-card">
                    <div class="metric-title">Period Uptime</div>
                    <div class="metric-value text-success">${String.format("%.2f", analytics.uptimePercentage)}%</div>
                    <div class="metric-subtext">${analytics.upChecks} successful checks</div>
                </div>
            </div>
            <div class="col-md-3 col-6">
                <div class="metric-card">
                    <div class="metric-title">Average Latency</div>
                    <div class="metric-value text-primary">${Math.round(analytics.averageResponseTimeMs)}<span class="fs-6 text-muted ms-1">ms</span></div>
                    <div class="metric-subtext">Across healthy checks</div>
                </div>
            </div>
            <div class="col-md-3 col-6">
                <div class="metric-card">
                    <div class="metric-title">Min / Max Latency</div>
                    <div class="metric-value text-dark">${analytics.minResponseTimeMs} / ${analytics.maxResponseTimeMs}<span class="fs-6 text-muted ms-1">ms</span></div>
                    <div class="metric-subtext">Range variance</div>
                </div>
            </div>
            <div class="col-md-3 col-6">
                <div class="metric-card">
                    <div class="metric-title">Outages Recorded</div>
                    <div class="metric-value text-danger">${analytics.downChecks}</div>
                    <div class="metric-subtext">${analytics.incidentCount} incidents opened</div>
                </div>
            </div>
        </div>

        <!-- Latency Trend Graph -->
        <div class="table-card p-4 mb-4">
            <div class="d-flex justify-content-between align-items-center mb-3">
                <h6 class="fw-bold mb-0"><i class="bi bi-graph-up text-primary me-2"></i>Response Latency Trend</h6>
                <span class="badge bg-light text-muted border">Period: ${period}</span>
            </div>
            <canvas id="analyticsChart" height="90"></canvas>
        </div>
    </c:otherwise>
</c:choose>

<script>
document.addEventListener("DOMContentLoaded", function () {
    const ctx = document.getElementById("analyticsChart");
    if (!ctx) return;

    const labels = [<c:forEach var="l" items="${chartLabels}" varStatus="status">'${l}'${!status.last ? ',' : ''}</c:forEach>];
    const data = [<c:forEach var="d" items="${chartData}" varStatus="status">${d}${!status.last ? ',' : ''}</c:forEach>];

    new Chart(ctx, {
        type: 'line',
        data: {
            labels: labels.length > 0 ? labels : ['No checks recorded in this period'],
            datasets: [{
                label: 'Response Time (ms)',
                data: data.length > 0 ? data : [0],
                borderColor: '#2563eb',
                backgroundColor: 'rgba(37, 99, 235, 0.08)',
                fill: true,
                tension: 0.3,
                borderWidth: 2,
                pointRadius: 2
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
            }
        }
    });
});
</script>

<jsp:include page="../layout/footer.jsp"/>
