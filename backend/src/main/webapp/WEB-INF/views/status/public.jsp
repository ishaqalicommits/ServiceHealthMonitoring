<%@ page contentType="text/html;charset=UTF-8" language="java" %>
<%@ taglib prefix="c" uri="jakarta.tags.core" %>
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${page.title} - Operational Status</title>
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css" rel="stylesheet">
    <link href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.3/font/bootstrap-icons.min.css" rel="stylesheet">
    <style>
        body {
            background-color: #f8fafc;
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
            color: #0f172a;
        }
        .status-header {
            border-bottom: 2px solid ${page.brandingColor != null ? page.brandingColor : '#2563eb'};
            background: #ffffff;
            padding: 2.5rem 0;
            box-shadow: 0 1px 3px rgba(0,0,0,0.05);
        }
        .banner-operational {
            background: #ecfdf5;
            border: 1px solid #a7f3d0;
            color: #065f46;
            border-radius: 0.75rem;
            padding: 1.25rem;
        }
        .banner-outage {
            background: #fef2f2;
            border: 1px solid #fecaca;
            color: #991b1b;
            border-radius: 0.75rem;
            padding: 1.25rem;
        }
        .service-card {
            background: #ffffff;
            border: 1px solid #e2e8f0;
            border-radius: 0.75rem;
            padding: 1.25rem 1.5rem;
            margin-bottom: 0.75rem;
            display: flex;
            align-items: center;
            justify-content: space-between;
        }
    </style>
</head>
<body>

<header class="status-header mb-5">
    <div class="container">
        <h2 class="fw-bold mb-1">${page.title}</h2>
        <c:if test="${not empty page.description}">
            <p class="text-muted mb-0">${page.description}</p>
        </c:if>
    </div>
</header>

<main class="container pb-5">
    <!-- Overall Status Banner -->
    <div class="mb-4">
        <c:choose>
            <c:when test="${allOperational}">
                <div class="banner-operational d-flex align-items-center gap-3">
                    <i class="bi bi-check-circle-fill fs-3 text-success"></i>
                    <div>
                        <h5 class="fw-bold mb-0">All Systems Operational</h5>
                        <p class="small mb-0 opacity-75">All monitored external services and APIs are responding normally.</p>
                    </div>
                </div>
            </c:when>
            <c:otherwise>
                <div class="banner-outage d-flex align-items-center gap-3">
                    <i class="bi bi-exclamation-triangle-fill fs-3 text-danger"></i>
                    <div>
                        <h5 class="fw-bold mb-0">Active Service Disruption</h5>
                        <p class="small mb-0 opacity-75">One or more monitored endpoints are experiencing degraded performance or an outage.</p>
                    </div>
                </div>
            </c:otherwise>
        </c:choose>
    </div>

    <!-- Active Incidents Section -->
    <c:if test="${not empty openIncidents}">
        <div class="card border-danger mb-4 shadow-sm">
            <div class="card-header bg-danger text-white fw-bold">
                <i class="bi bi-exclamation-octagon-fill me-2"></i> Active Incidents (${openIncidents.size()})
            </div>
            <div class="card-body">
                <c:forEach var="inc" items="${openIncidents}">
                    <div class="border-bottom pb-3 mb-3">
                        <div class="d-flex justify-content-between align-items-center">
                            <h6 class="fw-bold text-danger mb-1">${inc.monitorName}</h6>
                            <span class="badge bg-danger">OUTAGE</span>
                        </div>
                        <p class="small text-muted mb-1">Detected at: ${inc.startedAt}</p>
                        <p class="small mb-0">${inc.cause != null ? inc.cause : 'Engineers are investigating service connectivity issues.'}</p>
                    </div>
                </c:forEach>
            </div>
        </div>
    </c:if>

    <!-- Services List -->
    <h5 class="fw-bold mb-3">Monitored Services</h5>
    <c:choose>
        <c:when test="${empty monitors}">
            <p class="text-muted">No services published on this status page.</p>
        </c:when>
        <c:otherwise>
            <c:forEach var="m" items="${monitors}">
                <div class="service-card shadow-sm">
                    <div>
                        <h6 class="fw-bold mb-0">${m.name}</h6>
                        <small class="text-muted">Service Type: ${m.type}</small>
                    </div>
                    <div>
                        <c:choose>
                            <c:when test="${m.status == 'UP'}">
                                <span class="badge bg-success bg-opacity-10 text-success border border-success px-3 py-2">
                                    <i class="bi bi-check2 me-1"></i> Operational
                                </span>
                            </c:when>
                            <c:when test="${m.status == 'DOWN'}">
                                <span class="badge bg-danger bg-opacity-10 text-danger border border-danger px-3 py-2">
                                    <i class="bi bi-x-lg me-1"></i> Outage
                                </span>
                            </c:when>
                            <c:otherwise>
                                <span class="badge bg-secondary px-3 py-2">Under Maintenance</span>
                            </c:otherwise>
                        </c:choose>
                    </div>
                </div>
            </c:forEach>
        </c:otherwise>
    </c:choose>

    <footer class="mt-5 pt-4 text-center text-muted small border-top">
        Powered by <strong>ServiceWatch</strong> Real-Time Service Health Monitoring System
    </footer>
</main>

</body>
</html>
