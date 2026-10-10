<%@ page contentType="text/html;charset=UTF-8" language="java" %>
<%@ taglib prefix="c" uri="jakarta.tags.core" %>
<c:set var="pageTitle" value="Add New Monitor" scope="request"/>
<jsp:include page="../layout/header.jsp"/>

<div class="row justify-content-center">
    <div class="col-lg-8">
        <div class="table-card p-4">
            <div class="d-flex align-items-center justify-content-between pb-3 mb-4 border-bottom">
                <div>
                    <h5 class="fw-bold mb-1">Create Service Monitor</h5>
                    <p class="text-muted small mb-0">Configure endpoint checks, validation rules, and alert thresholds</p>
                </div>
                <a href="${pageContext.request.contextPath}/monitors" class="btn btn-sm btn-outline-secondary">
                    <i class="bi bi-arrow-left me-1"></i> Cancel
                </a>
            </div>

            <form action="${pageContext.request.contextPath}/monitors/add" method="post">
                <input type="hidden" name="${_csrf.parameterName}" value="${_csrf.token}"/>

                <!-- Basic Info -->
                <div class="row g-3 mb-4">
                    <div class="col-md-8">
                        <label class="form-label fw-semibold">Monitor Friendly Name <span class="text-danger">*</span></label>
                        <input type="text" name="name" class="form-control" placeholder="e.g. Production API Gateway" required>
                    </div>
                    <div class="col-md-4">
                        <label class="form-label fw-semibold">Monitor Type <span class="text-danger">*</span></label>
                        <select name="type" id="monitorTypeSelect" class="form-select" required onchange="toggleTypeFields()">
                            <c:forEach var="t" items="${types}">
                                <option value="${t}">${t}</option>
                            </c:forEach>
                        </select>
                    </div>
                </div>

                <!-- HTTP / URL Target -->
                <div id="httpFields" class="mb-4">
                    <label class="form-label fw-semibold">Target URL <span class="text-danger">*</span></label>
                    <input type="url" name="url" id="urlInput" class="form-control" placeholder="https://api.example.com/health">
                    <div class="form-text">Must be a valid HTTP or HTTPS URL. SSRF protection applies.</div>
                </div>

                <!-- TCP / Hostname Target -->
                <div id="tcpFields" class="row g-3 mb-4" style="display: none;">
                    <div class="col-md-8">
                        <label class="form-label fw-semibold">Hostname or IP <span class="text-danger">*</span></label>
                        <input type="text" name="hostname" id="hostnameInput" class="form-control" placeholder="db.internal.net or 198.51.100.1">
                    </div>
                    <div class="col-md-4">
                        <label class="form-label fw-semibold">Port <span class="text-danger">*</span></label>
                        <input type="number" name="port" id="portInput" class="form-control" placeholder="5432" min="1" max="65535">
                    </div>
                </div>

                <!-- Timing & Scheduling -->
                <div class="card bg-light border-0 p-3 mb-4">
                    <h6 class="fw-bold mb-3"><i class="bi bi-stopwatch me-1 text-primary"></i> Execution Settings</h6>
                    <div class="row g-3">
                        <div class="col-md-3 col-6">
                            <label class="form-label small fw-semibold">Check Interval (sec)</label>
                            <input type="number" name="checkIntervalSeconds" class="form-control" value="60" min="10" required>
                        </div>
                        <div class="col-md-3 col-6">
                            <label class="form-label small fw-semibold">Timeout (sec)</label>
                            <input type="number" name="timeoutSeconds" class="form-control" value="10" min="1" max="60" required>
                        </div>
                        <div class="col-md-3 col-6">
                            <label class="form-label small fw-semibold">Retry Count</label>
                            <input type="number" name="retryCount" class="form-control" value="1" min="0" max="5" required>
                        </div>
                        <div class="col-md-3 col-6">
                            <label class="form-label small fw-semibold">Failure Threshold</label>
                            <input type="number" name="failureThreshold" class="form-control" value="2" min="1" max="10" required>
                        </div>
                    </div>
                </div>

                <!-- Advanced Validation Criteria -->
                <div class="mb-4">
                    <h6 class="fw-bold mb-3"><i class="bi bi-check2-circle me-1 text-primary"></i> Success Criteria</h6>
                    <div class="row g-3">
                        <div class="col-md-6">
                            <label class="form-label small fw-semibold">Expected HTTP Status Codes</label>
                            <input type="text" name="expectedCodesInput" class="form-control" value="200" placeholder="200, 201, 204">
                            <div class="form-text">Comma-separated acceptable HTTP status codes.</div>
                        </div>
                        <div class="col-md-6">
                            <label class="form-label small fw-semibold">Response Keyword Check</label>
                            <input type="text" name="keyword" class="form-control" placeholder="e.g. status: OK">
                            <div class="form-check mt-2">
                                <input class="form-check-input" type="checkbox" name="keywordAbsent" value="true" id="keywordAbsent">
                                <label class="form-check-label small" for="keywordAbsent">
                                    Fail if keyword is present (keyword absence check)
                                </label>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Tags & Redirects -->
                <div class="row g-3 mb-4">
                    <div class="col-md-8">
                        <label class="form-label small fw-semibold">Organizational Tags</label>
                        <input type="text" name="tagsInput" class="form-control" placeholder="production, api, payments">
                        <div class="form-text">Comma-separated tags for filtering and grouping.</div>
                    </div>
                    <div class="col-md-4 d-flex align-items-center pt-3">
                        <div class="form-check">
                            <input class="form-check-input" type="checkbox" name="followRedirects" value="true" id="followRedirects" checked>
                            <label class="form-check-label small" for="followRedirects">
                                Follow 3xx Redirects
                            </label>
                        </div>
                    </div>
                </div>

                <div class="d-flex justify-content-end gap-2 border-top pt-3">
                    <a href="${pageContext.request.contextPath}/monitors" class="btn btn-light border">Cancel</a>
                    <button type="submit" class="btn btn-primary px-4"><i class="bi bi-save me-1"></i> Save & Start Monitoring</button>
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
