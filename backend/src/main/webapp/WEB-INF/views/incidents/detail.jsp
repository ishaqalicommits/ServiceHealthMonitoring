<%@ page contentType="text/html;charset=UTF-8" language="java" %>
<%@ taglib prefix="c" uri="jakarta.tags.core" %>
<c:set var="pageTitle" value="Incident Detail - ${incident.monitorName}" scope="request"/>
<jsp:include page="../layout/header.jsp"/>

<div class="row justify-content-center">
    <div class="col-lg-9">
        <!-- Incident Header Card -->
        <div class="table-card p-4 mb-4">
            <div class="d-flex justify-content-between align-items-center pb-3 mb-3 border-bottom">
                <div class="d-flex align-items-center gap-3">
                    <a href="${pageContext.request.contextPath}/incidents" class="btn btn-outline-secondary btn-sm">
                        <i class="bi bi-arrow-left"></i>
                    </a>
                    <div>
                        <h5 class="fw-bold mb-0">Outage on ${incident.monitorName}</h5>
                        <p class="text-muted small mb-0">Started at: ${incident.startedAt}</p>
                    </div>
                </div>
                <div class="d-flex align-items-center gap-2">
                    <span class="badge ${incident.status == 'OPEN' ? 'bg-danger' : incident.status == 'ACKNOWLEDGED' ? 'bg-warning text-dark' : 'bg-success'} fs-6 py-2 px-3">
                        ${incident.status}
                    </span>
                    <c:if test="${incident.status == 'OPEN'}">
                        <form action="${pageContext.request.contextPath}/incidents/${incident.id}/acknowledge" method="post" class="m-0">
                            <input type="hidden" name="${_csrf.parameterName}" value="${_csrf.token}"/>
                            <button type="submit" class="btn btn-warning btn-sm">Acknowledge</button>
                        </form>
                    </c:if>
                    <c:if test="${incident.status != 'RESOLVED'}">
                        <form action="${pageContext.request.contextPath}/incidents/${incident.id}/resolve" method="post" class="m-0">
                            <input type="hidden" name="${_csrf.parameterName}" value="${_csrf.token}"/>
                            <button type="submit" class="btn btn-success btn-sm">Mark Resolved</button>
                        </form>
                    </c:if>
                </div>
            </div>

            <!-- Details Overview -->
            <div class="row g-3">
                <div class="col-md-6">
                    <p class="mb-1 text-muted small fw-semibold">Root Cause / Error Message:</p>
                    <p class="fw-bold text-danger">${incident.cause != null ? incident.cause : 'Unknown connection fault'}</p>
                </div>
                <div class="col-md-3">
                    <p class="mb-1 text-muted small fw-semibold">Last Healthy Check:</p>
                    <p class="fw-semibold">${incident.lastHealthyCheckAt != null ? incident.lastHealthyCheckAt : 'N/A'}</p>
                </div>
                <div class="col-md-3">
                    <p class="mb-1 text-muted small fw-semibold">Outage Duration:</p>
                    <p class="fw-semibold">
                        <c:choose>
                            <c:when test="${incident.durationSeconds != null}">
                                ${Math.round(incident.durationSeconds / 60)} minutes
                            </c:when>
                            <c:otherwise><span class="text-danger">Ongoing</span></c:otherwise>
                        </c:choose>
                    </p>
                </div>
            </div>
        </div>

        <!-- Updates Timeline -->
        <div class="table-card p-4 mb-4">
            <h6 class="fw-bold mb-4"><i class="bi bi-chat-left-dots text-primary me-2"></i>Investigation Updates Timeline</h6>

            <c:choose>
                <c:when test="${empty updates}">
                    <p class="text-muted small">No updates posted yet for this incident.</p>
                </c:when>
                <c:otherwise>
                    <div class="position-relative ps-4 border-start border-2 border-primary-subtle mb-4">
                        <c:forEach var="u" items="${updates}">
                            <div class="mb-4 position-relative">
                                <span class="position-absolute top-0 start-0 translate-middle p-1 bg-primary rounded-circle" style="left: -17px !important;"></span>
                                <div class="d-flex justify-content-between align-items-center">
                                    <strong class="small text-dark">${u.authorName}</strong>
                                    <span class="text-muted small">${u.createdAt}</span>
                                </div>
                                <p class="text-secondary small mt-1 mb-0">${u.message}</p>
                            </div>
                        </c:forEach>
                    </div>
                </c:otherwise>
            </c:choose>

            <!-- Post New Update Form -->
            <form action="${pageContext.request.contextPath}/incidents/${incident.id}/update" method="post" class="mt-3">
                <input type="hidden" name="${_csrf.parameterName}" value="${_csrf.token}"/>
                <div class="mb-3">
                    <label class="form-label small fw-semibold">Post Investigation Update</label>
                    <textarea name="message" class="form-control" rows="3" placeholder="e.g. Identified issue with database connection pool. Applying patch..." required></textarea>
                </div>
                <div class="text-end">
                    <button type="submit" class="btn btn-primary btn-sm px-3">Post Update</button>
                </div>
            </form>
        </div>
    </div>
</div>

<jsp:include page="../layout/footer.jsp"/>
