<%@ page contentType="text/html;charset=UTF-8" language="java" %>
<%@ taglib prefix="c" uri="jakarta.tags.core" %>
<c:set var="pageTitle" value="Edit Monitor" scope="request"/>
<jsp:include page="../layout/header.jsp"/>

<div class="row justify-content-center">
    <div class="col-lg-8">
        <div class="table-card p-4">
            <div class="d-flex align-items-center justify-content-between pb-3 mb-4 border-bottom">
                <div>
                    <h5 class="fw-bold mb-1">Edit Monitor: ${monitor.name}</h5>
                    <p class="text-muted small mb-0">Update endpoint configuration and health rules</p>
                </div>
                <a href="${pageContext.request.contextPath}/monitors/${monitor.id}" class="btn btn-sm btn-outline-secondary">
                    <i class="bi bi-arrow-left me-1"></i> Cancel
                </a>
            </div>

            <form action="${pageContext.request.contextPath}/monitors/${monitor.id}/edit" method="post">
                <input type="hidden" name="${_csrf.parameterName}" value="${_csrf.token}"/>

                <div class="row g-3 mb-4">
                    <div class="col-md-8">
                        <label class="form-label fw-semibold">Monitor Friendly Name</label>
                        <input type="text" name="name" class="form-control" value="${monitor.name}" required>
                    </div>
                    <div class="col-md-4">
                        <label class="form-label fw-semibold">Monitor Type</label>
                        <select name="type" id="monitorTypeSelect" class="form-select" required onchange="toggleTypeFields()">
                            <c:forEach var="t" items="${types}">
                                <option value="${t}" ${t == monitor.type ? 'selected' : ''}>${t}</option>
                            </c:forEach>
                        </select>
                    </div>
                </div>

                <div id="httpFields" class="mb-4" style="${monitor.type == 'TCP' || monitor.type == 'PING' ? 'display: none;' : ''}">
                    <label class="form-label fw-semibold">Target URL</label>
                    <input type="url" name="url" class="form-control" value="${monitor.url}">
                </div>

                <div id="tcpFields" class="row g-3 mb-4" style="${monitor.type == 'TCP' || monitor.type == 'PING' ? '' : 'display: none;'}">
                    <div class="col-md-8">
                        <label class="form-label fw-semibold">Hostname or IP</label>
                        <input type="text" name="hostname" class="form-control" value="${monitor.hostname}">
                    </div>
                    <div class="col-md-4">
                        <label class="form-label fw-semibold">Port</label>
                        <input type="number" name="port" class="form-control" value="${monitor.port}">
                    </div>
                </div>

                <div class="card bg-light border-0 p-3 mb-4">
                    <h6 class="fw-bold mb-3">Execution Settings</h6>
                    <div class="row g-3">
                        <div class="col-md-3 col-6">
                            <label class="form-label small fw-semibold">Check Interval (sec)</label>
                            <input type="number" name="checkIntervalSeconds" class="form-control" value="${monitor.checkIntervalSeconds}" min="10" required>
                        </div>
                        <div class="col-md-3 col-6">
                            <label class="form-label small fw-semibold">Timeout (sec)</label>
                            <input type="number" name="timeoutSeconds" class="form-control" value="${monitor.timeoutSeconds}" min="1" max="60" required>
                        </div>
                        <div class="col-md-3 col-6">
                            <label class="form-label small fw-semibold">Retry Count</label>
                            <input type="number" name="retryCount" class="form-control" value="${monitor.retryCount}" min="0" max="5" required>
                        </div>
                        <div class="col-md-3 col-6">
                            <label class="form-label small fw-semibold">Failure Threshold</label>
                            <input type="number" name="failureThreshold" class="form-control" value="${monitor.failureThreshold}" min="1" max="10" required>
                        </div>
                    </div>
                </div>

                <div class="mb-4">
                    <h6 class="fw-bold mb-3">Validation Criteria</h6>
                    <div class="row g-3">
                        <div class="col-md-6">
                            <label class="form-label small fw-semibold">Expected HTTP Status Codes</label>
                            <input type="text" name="expectedCodesInput" class="form-control" value="${codesString}">
                        </div>
                        <div class="col-md-6">
                            <label class="form-label small fw-semibold">Response Keyword Check</label>
                            <input type="text" name="keyword" class="form-control" value="${monitor.keyword}">
                            <div class="form-check mt-2">
                                <input class="form-check-input" type="checkbox" name="keywordAbsent" value="true" id="keywordAbsent" ${monitor.keywordAbsent ? 'checked' : ''}>
                                <label class="form-check-label small" for="keywordAbsent">
                                    Fail if keyword is present
                                </label>
                            </div>
                        </div>
                    </div>
                </div>

                <div class="row g-3 mb-4">
                    <div class="col-md-8">
                        <label class="form-label small fw-semibold">Organizational Tags</label>
                        <input type="text" name="tagsInput" class="form-control" value="${tagsString}">
                    </div>
                    <div class="col-md-4 d-flex align-items-center pt-3">
                        <div class="form-check">
                            <input class="form-check-input" type="checkbox" name="followRedirects" value="true" id="followRedirects" ${monitor.followRedirects ? 'checked' : ''}>
                            <label class="form-check-label small" for="followRedirects">
                                Follow 3xx Redirects
                            </label>
                        </div>
                    </div>
                </div>

                <div class="d-flex justify-content-end gap-2 border-top pt-3">
                    <a href="${pageContext.request.contextPath}/monitors/${monitor.id}" class="btn btn-light border">Cancel</a>
                    <button type="submit" class="btn btn-primary px-4"><i class="bi bi-check-lg me-1"></i> Update Monitor</button>
                </div>
            </form>
        </div>
    </div>
</div>

<script>
function toggleTypeFields() {
    const type = document.getElementById("monitorTypeSelect").value;
    const httpFields = document.getElementById("httpFields");
    const tcpFields = document.getElementById("tcpFields");

    if (type === "TCP" || type === "PING") {
        httpFields.style.display = "none";
        tcpFields.style.display = "flex";
    } else {
        httpFields.style.display = "block";
        tcpFields.style.display = "none";
    }
}
</script>

<jsp:include page="../layout/footer.jsp"/>
