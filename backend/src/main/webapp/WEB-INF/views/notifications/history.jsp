<%@ page contentType="text/html;charset=UTF-8" language="java" %>
<%@ taglib prefix="c" uri="jakarta.tags.core" %>
<c:set var="pageTitle" value="Notification Delivery History" scope="request"/>
<jsp:include page="../layout/header.jsp"/>

<div class="d-flex justify-content-between align-items-center mb-4">
    <div>
        <h4 class="fw-bold mb-1">Notification Audit Logs</h4>
        <p class="text-muted small mb-0">Complete audit trail of all alerts sent, failed, or suppressed by deduplication</p>
    </div>
    <a href="${pageContext.request.contextPath}/notifications/settings" class="btn btn-outline-secondary btn-sm">
        <i class="bi bi-gear me-1"></i> Manage Channels
    </a>
</div>

<div class="table-card">
    <div class="table-responsive">
        <table class="table table-hover align-middle mb-0">
            <thead>
                <tr>
                    <th>Delivery Status</th>
                    <th>Event Type</th>
                    <th>Message</th>
                    <th>Sent At (UTC)</th>
                    <th>Error Details</th>
                </tr>
            </thead>
            <tbody>
                <c:choose>
                    <c:when test="${empty logs}">
                        <tr>
                            <td colspan="5">
                                <div class="empty-state">
                                    <i class="bi bi-inbox text-muted"></i>
                                    <h5>No notification logs found</h5>
                                    <p class="text-muted">Notification events will appear here once triggered.</p>
                                </div>
                            </td>
                        </tr>
                    </c:when>
                    <c:otherwise>
                        <c:forEach var="log" items="${logs}">
                            <tr>
                                <td>
                                    <c:choose>
                                        <c:when test="${log.status == 'SENT'}">
                                            <span class="badge bg-success bg-opacity-10 text-success border">SENT</span>
                                        </c:when>
                                        <c:when test="${log.status == 'SUPPRESSED'}">
                                            <span class="badge bg-secondary bg-opacity-10 text-secondary border">SUPPRESSED</span>
                                        </c:when>
                                        <c:otherwise>
                                            <span class="badge bg-danger bg-opacity-10 text-danger border">FAILED</span>
                                        </c:otherwise>
                                    </c:choose>
                                </td>
                                <td><span class="badge bg-light text-dark border">${log.event}</span></td>
                                <td class="text-truncate" style="max-width: 350px;">${log.message}</td>
                                <td class="text-muted small">${log.sentAt}</td>
                                <td class="text-muted small">${log.errorMessage != null ? log.errorMessage : '-'}</td>
                            </tr>
                        </c:forEach>
                    </c:otherwise>
                </c:choose>
            </tbody>
        </table>
    </div>
</div>

<jsp:include page="../layout/footer.jsp"/>
