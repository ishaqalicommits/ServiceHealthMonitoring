<%@ page contentType="text/html;charset=UTF-8" language="java" %>
<%@ taglib prefix="c" uri="jakarta.tags.core" %>
<c:set var="pageTitle" value="Notification Channels & Alerts" scope="request"/>
<jsp:include page="../layout/header.jsp"/>

<div class="d-flex justify-content-between align-items-center mb-4">
    <div>
        <h4 class="fw-bold mb-1">Notification Channels</h4>
        <p class="text-muted small mb-0">Manage alert destinations (Email, Webhooks) and delivery preferences</p>
    </div>
    <div class="d-flex gap-2">
        <a href="${pageContext.request.contextPath}/notifications/history" class="btn btn-outline-secondary btn-sm">
            <i class="bi bi-clock-history me-1"></i> Delivery Audit Logs
        </a>
        <button type="button" class="btn btn-primary btn-sm" data-bs-toggle="modal" data-bs-target="#addChannelModal">
            <i class="bi bi-plus-lg me-1"></i> Add Channel
        </button>
    </div>
</div>

<!-- Configured Channels List -->
<div class="table-card mb-4">
    <div class="table-responsive">
        <table class="table table-hover align-middle mb-0">
            <thead>
                <tr>
                    <th>Channel Name</th>
                    <th>Type</th>
                    <th>Destination</th>
                    <th>Events Subscribed</th>
                    <th>Status</th>
                    <th class="text-end">Actions</th>
                </tr>
            </thead>
            <tbody>
                <c:choose>
                    <c:when test="${empty channels}">
                        <tr>
                            <td colspan="6">
                                <div class="empty-state">
                                    <i class="bi bi-bell-slash text-muted"></i>
                                    <h5>No notification channels configured</h5>
                                    <p class="text-muted">Set up an Email or Webhook channel to receive alerts when services fail or recover.</p>
                                    <button class="btn btn-primary btn-sm" data-bs-toggle="modal" data-bs-target="#addChannelModal">Add Channel</button>
                                </div>
                            </td>
                        </tr>
                    </c:when>
                    <c:otherwise>
                        <c:forEach var="ch" items="${channels}">
                            <tr>
                                <td class="fw-bold">${ch.name}</td>
                                <td><span class="badge bg-secondary bg-opacity-10 text-secondary border">${ch.type}</span></td>
                                <td class="text-truncate" style="max-width: 250px;">
                                    <code>${ch.email != null ? ch.email : ch.webhookUrl}</code>
                                </td>
                                <td>
                                    <div class="d-flex gap-1 flex-wrap">
                                        <c:if test="${ch.notifyOnDown}"><span class="badge bg-danger bg-opacity-10 text-danger border">Down</span></c:if>
                                        <c:if test="${ch.notifyOnRecovery}"><span class="badge bg-success bg-opacity-10 text-success border">Recovery</span></c:if>
                                        <c:if test="${ch.notifyOnSslExpiry}"><span class="badge bg-warning bg-opacity-10 text-warning border">SSL Expiry</span></c:if>
                                    </div>
                                </td>
                                <td>
                                    <span class="badge ${ch.enabled ? 'bg-success' : 'bg-secondary'}">${ch.enabled ? 'Active' : 'Disabled'}</span>
                                </td>
                                <td class="text-end">
                                    <div class="btn-group btn-group-sm">
                                        <form action="${pageContext.request.contextPath}/notifications/channels/${ch.id}/test" method="post" class="d-inline">
                                            <input type="hidden" name="${_csrf.parameterName}" value="${_csrf.token}"/>
                                            <button type="submit" class="btn btn-outline-primary" title="Send Test Notification">
                                                <i class="bi bi-send"></i> Test
                                            </button>
                                        </form>
                                        <form action="${pageContext.request.contextPath}/notifications/channels/${ch.id}/delete" method="post" class="d-inline">
                                            <input type="hidden" name="${_csrf.parameterName}" value="${_csrf.token}"/>
                                            <button type="submit" class="btn btn-outline-danger" title="Delete Channel">
                                                <i class="bi bi-trash"></i>
                                            </button>
                                        </form>
                                    </div>
                                </td>
                            </tr>
                        </c:forEach>
                    </c:otherwise>
                </c:choose>
            </tbody>
        </table>
    </div>
</div>

<!-- Add Channel Modal -->
<div class="modal fade" id="addChannelModal" tabindex="-1">
    <div class="modal-dialog">
        <div class="modal-content">
            <div class="modal-header">
                <h5 class="modal-title fw-bold">Add Notification Channel</h5>
                <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
            </div>
            <form action="${pageContext.request.contextPath}/notifications/channels/add" method="post">
                <input type="hidden" name="${_csrf.parameterName}" value="${_csrf.token}"/>
                <div class="modal-body">
                    <div class="mb-3">
                        <label class="form-label fw-semibold">Channel Friendly Name</label>
                        <input type="text" name="name" class="form-control" placeholder="e.g. DevOps Email or Slack Alert" required>
                    </div>
                    <div class="mb-3">
                        <label class="form-label fw-semibold">Channel Type</label>
                        <select name="type" id="channelTypeSelect" class="form-select" onchange="toggleChannelInputs()" required>
                            <option value="EMAIL">EMAIL</option>
                            <option value="WEBHOOK">WEBHOOK (Slack, Discord, Custom)</option>
                        </select>
                    </div>
                    <div class="mb-3" id="emailInputDiv">
                        <label class="form-label fw-semibold">Recipient Email Address</label>
                        <input type="email" name="email" class="form-control" placeholder="devops@company.com">
                    </div>
                    <div class="mb-3" id="webhookInputDiv" style="display: none;">
                        <label class="form-label fw-semibold">Webhook URL</label>
                        <input type="url" name="webhookUrl" class="form-control" placeholder="https://hooks.slack.com/services/...">
                    </div>
                    <div class="mb-3">
                        <label class="form-label fw-semibold">Trigger Notifications On</label>
                        <div class="form-check">
                            <input class="form-check-input" type="checkbox" name="notifyOnDown" value="true" id="notifyDown" checked>
                            <label class="form-check-label small" for="notifyDown">Service Outages (Down)</label>
                        </div>
                        <div class="form-check">
                            <input class="form-check-input" type="checkbox" name="notifyOnRecovery" value="true" id="notifyRec" checked>
                            <label class="form-check-label small" for="notifyRec">Service Recoveries (Back Up)</label>
                        </div>
                        <div class="form-check">
                            <input class="form-check-input" type="checkbox" name="notifyOnSslExpiry" value="true" id="notifySsl" checked>
                            <label class="form-check-label small" for="notifySsl">SSL Expiry Warnings (&le; 30 days)</label>
                        </div>
                    </div>
                </div>
                <div class="modal-footer">
                    <button type="button" class="btn btn-light" data-bs-dismiss="modal">Cancel</button>
                    <button type="submit" class="btn btn-primary">Create Channel</button>
                </div>
            </form>
        </div>
    </div>
</div>

<script>
function toggleChannelInputs() {
    const type = document.getElementById("channelTypeSelect").value;
    const emailDiv = document.getElementById("emailInputDiv");
    const webhookDiv = document.getElementById("webhookInputDiv");

    if (type === "WEBHOOK") {
        emailDiv.style.display = "none";
        webhookDiv.style.display = "block";
    } else {
        emailDiv.style.display = "block";
        webhookDiv.style.display = "none";
    }
}
</script>

<jsp:include page="../layout/footer.jsp"/>
