<%@ page contentType="text/html;charset=UTF-8" language="java" %>
<%@ taglib prefix="c" uri="jakarta.tags.core" %>
<c:set var="pageTitle" value="System Settings & Maintenance" scope="request"/>
<jsp:include page="../layout/header.jsp"/>

<div class="row justify-content-center">
    <div class="col-lg-8">
        <h4 class="fw-bold mb-1">System Settings</h4>
        <p class="text-muted small mb-4">Manage global defaults, database retention policies, and security protections</p>

        <!-- Data Retention Card -->
        <div class="table-card p-4 mb-4">
            <h5 class="fw-bold mb-2"><i class="bi bi-database me-2 text-primary"></i> Historical Data Retention Policy</h5>
            <p class="text-muted small">
                Health check logs are saved for historical trends and uptime computations. Run periodic cleanup
                to ensure the MongoDB collections remain bounded and performant.
            </p>
            <form action="${pageContext.request.contextPath}/settings/retention/apply" method="post" class="mt-3">
                <input type="hidden" name="${_csrf.parameterName}" value="${_csrf.token}"/>
                <div class="row g-2 align-items-center">
                    <div class="col-auto">
                        <label class="form-label small fw-semibold mb-0">Purge checks older than:</label>
                    </div>
                    <div class="col-auto">
                        <select name="retentionDays" class="form-select form-select-sm">
                            <option value="15">15 Days</option>
                            <option value="30" selected>30 Days (Recommended)</option>
                            <option value="60">60 Days</option>
                            <option value="90">90 Days</option>
                        </select>
                    </div>
                    <div class="col-auto">
                        <button type="submit" class="btn btn-warning btn-sm">
                            <i class="bi bi-trash3 me-1"></i> Purge Expired Logs Now
                        </button>
                    </div>
                </div>
            </form>
        </div>

        <!-- Security & SSRF Policy Info -->
        <div class="table-card p-4 mb-4">
            <h5 class="fw-bold mb-2"><i class="bi bi-shield-lock me-2 text-success"></i> Security & SSRF Protections</h5>
            <p class="text-muted small">
                ServiceWatch includes active <strong>Server-Side Request Forgery (SSRF)</strong> defenses:
            </p>
            <ul class="text-secondary small mb-0">
                <li>Strict protocol filtering: Only <code>http://</code> and <code>https://</code> endpoints are checked.</li>
                <li>Loopback & local network blocking: Requests to <code>localhost</code>, <code>127.0.0.1</code>, <code>0.0.0.0</code>, and <code>::1</code> are rejected.</li>
                <li>RFC 1918 private network blocking: <code>10.0.0.0/8</code>, <code>172.16.0.0/12</code>, and <code>192.168.0.0/16</code> are blocked.</li>
                <li>Cloud metadata endpoint blocking: <code>169.254.169.254</code> (AWS/GCP/Azure IMDS) is strictly denied.</li>
            </ul>
        </div>

        <!-- Tech Stack Info -->
        <div class="table-card p-4">
            <h5 class="fw-bold mb-2"><i class="bi bi-cpu me-2 text-info"></i> Platform Environment</h5>
            <div class="row g-3 small">
                <div class="col-md-6">
                    <span class="text-muted">Application Framework:</span> <strong>Spring Boot 3.2.5</strong>
                </div>
                <div class="col-md-6">
                    <span class="text-muted">Runtime Platform:</span> <strong>Java 17 LTS</strong>
                </div>
                <div class="col-md-6">
                    <span class="text-muted">Primary Database:</span> <strong>MongoDB 8.x (Spring Data MongoDB)</strong>
                </div>
                <div class="col-md-6">
                    <span class="text-muted">Template Engine:</span> <strong>JSP / Embedded Tomcat</strong>
                </div>
            </div>
        </div>
    </div>
</div>

<jsp:include page="../layout/footer.jsp"/>
