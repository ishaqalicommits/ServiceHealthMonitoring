<%@ page contentType="text/html;charset=UTF-8" language="java" %>
<%@ taglib prefix="c" uri="jakarta.tags.core" %>
<c:set var="pageTitle" value="Monitored Services" scope="request"/>
<jsp:include page="../layout/header.jsp"/>

<div class="d-flex justify-content-between align-items-center mb-4">
    <div>
        <h4 class="fw-bold mb-1">Monitors</h4>
        <p class="text-muted small mb-0">Manage and inspect all website, API, and network endpoints</p>
    </div>
    <a href="${pageContext.request.contextPath}/monitors/add" class="btn btn-primary d-flex align-items-center gap-2">
        <i class="bi bi-plus-lg"></i> Add New Monitor
    </a>
</div>

<!-- Search & Filter Card -->
<div class="table-card mb-4">
    <div class="p-3">
        <form method="get" action="${pageContext.request.contextPath}/monitors" class="row g-2">
            <div class="col-md-6">
                <div class="input-group">
                    <span class="input-group-text bg-light text-muted"><i class="bi bi-search"></i></span>
                    <input type="text" name="search" value="${search}" class="form-control" placeholder="Search monitors by name...">
                    <button class="btn btn-outline-secondary" type="submit">Search</button>
                    <c:if test="${not empty search}">
                        <a href="${pageContext.request.contextPath}/monitors" class="btn btn-outline-danger">Clear</a>
                    </c:if>
                </div>
            </div>
        </form>
    </div>
</div>

<!-- Monitors Table -->
<div class="table-card">
    <div class="table-responsive">
        <table class="table table-hover align-middle mb-0">
            <thead>
                <tr>
                    <th>Status</th>
                    <th>Name</th>
                    <th>Type</th>
                    <th>Target / URL</th>
                    <th>Interval</th>
                    <th>SSL Expiry</th>
                    <th>Last Checked</th>
                    <th class="text-end">Actions</th>
                </tr>
            </thead>
            <tbody>
                <c:choose>
                    <c:when test="${empty monitorPage.content}">
                        <tr>
                            <td colspan="8">
                                <div class="empty-state">
                                    <i class="bi bi-shield-slash"></i>
                                    <h5>No monitors found</h5>
                                    <p class="text-muted">Start tracking your services by adding your first monitor.</p>
                                    <a href="${pageContext.request.contextPath}/monitors/add" class="btn btn-primary btn-sm">Add Monitor</a>
                                </div>
                            </td>
                        </tr>
                    </c:when>
                    <c:otherwise>
                        <c:forEach var="m" items="${monitorPage.content}">
                            <tr>
                                <td>
                                    <c:choose>
                                        <c:when test="${m.status == 'UP'}">
                                            <span class="badge-status badge-status-up"><span class="status-dot status-dot-up"></span> UP</span>
                                        </c:when>
                                        <c:when test="${m.status == 'DOWN'}">
                                            <span class="badge-status badge-status-down"><span class="status-dot status-dot-down"></span> DOWN</span>
                                        </c:when>
                                        <c:when test="${m.status == 'PAUSED'}">
                                            <span class="badge-status badge-status-paused">PAUSED</span>
                                        </c:when>
                                        <c:otherwise>
                                            <span class="badge-status badge-status-unknown">UNKNOWN</span>
                                        </c:otherwise>
                                    </c:choose>
                                </td>
                                <td>
                                    <a href="${pageContext.request.contextPath}/monitors/${m.id}" class="fw-bold text-dark text-decoration-none">
                                        ${m.name}
                                    </a>
                                    <c:if test="${not empty m.tags}">
                                        <div class="d-flex gap-1 mt-1">
                                            <c:forEach var="tag" items="${m.tags}">
                                                <span class="badge bg-light text-muted border" style="font-size: 0.65rem;">#${tag}</span>
                                            </c:forEach>
                                        </div>
                                    </c:if>
                                </td>
                                <td><span class="badge bg-secondary bg-opacity-10 text-secondary border">${m.type}</span></td>
                                <td class="text-truncate" style="max-width: 250px;">
                                    <code>${m.url != null ? m.url : m.hostname.concat(':').concat(m.port != null ? m.port : '')}</code>
                                </td>
                                <td>${m.checkIntervalSeconds}s</td>
                                <td>
                                    <c:choose>
                                        <c:when test="${m.sslExpiryDays != null}">
                                            <span class="badge ${m.sslExpiryDays < 30 ? 'bg-warning text-dark' : 'bg-light text-dark border'}">
                                                ${m.sslExpiryDays} days
                                            </span>
                                        </c:when>
                                        <c:otherwise><span class="text-muted">-</span></c:otherwise>
                                    </c:choose>
                                </td>
                                <td class="text-muted small">${m.lastCheckedAt != null ? m.lastCheckedAt : 'Never'}</td>
                                <td class="text-end">
                                    <div class="btn-group btn-group-sm">
                                        <form action="${pageContext.request.contextPath}/monitors/${m.id}/check-now" method="post" class="d-inline">
                                            <input type="hidden" name="${_csrf.parameterName}" value="${_csrf.token}"/>
                                            <button type="submit" class="btn btn-outline-primary" title="Trigger instant health check">
                                                <i class="bi bi-arrow-repeat"></i>
                                            </button>
                                        </form>
                                        <c:choose>
                                            <c:when test="${m.paused}">
                                                <form action="${pageContext.request.contextPath}/monitors/${m.id}/resume" method="post" class="d-inline">
                                                    <input type="hidden" name="${_csrf.parameterName}" value="${_csrf.token}"/>
                                                    <button type="submit" class="btn btn-outline-success" title="Resume"><i class="bi bi-play-fill"></i></button>
                                                </form>
                                            </c:when>
                                            <c:otherwise>
                                                <form action="${pageContext.request.contextPath}/monitors/${m.id}/pause" method="post" class="d-inline">
                                                    <input type="hidden" name="${_csrf.parameterName}" value="${_csrf.token}"/>
                                                    <button type="submit" class="btn btn-outline-warning" title="Pause"><i class="bi bi-pause-fill"></i></button>
                                                </form>
                                            </c:otherwise>
                                        </c:choose>
                                        <a href="${pageContext.request.contextPath}/monitors/${m.id}/edit" class="btn btn-outline-secondary" title="Edit">
                                            <i class="bi bi-pencil"></i>
                                        </a>
                                    </div>
                                </td>
                            </tr>
                        </c:forEach>
                    </c:otherwise>
                </c:choose>
            </tbody>
        </table>
    </div>
    <!-- Pagination -->
    <c:if test="${monitorPage.totalPages > 1}">
        <div class="p-3 border-top d-flex justify-content-between align-items-center">
            <span class="text-muted small">Page ${monitorPage.number + 1} of ${monitorPage.totalPages}</span>
            <div class="btn-group btn-group-sm">
                <a href="?page=${monitorPage.number - 1}" class="btn btn-outline-secondary ${monitorPage.first ? 'disabled' : ''}">Previous</a>
                <a href="?page=${monitorPage.number + 1}" class="btn btn-outline-secondary ${monitorPage.last ? 'disabled' : ''}">Next</a>
            </div>
        </div>
    </c:if>
</div>

<jsp:include page="../layout/footer.jsp"/>
