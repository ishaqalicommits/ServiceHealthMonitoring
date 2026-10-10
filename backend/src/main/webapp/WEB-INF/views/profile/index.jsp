<%@ page contentType="text/html;charset=UTF-8" language="java" %>
<%@ taglib prefix="c" uri="jakarta.tags.core" %>
<c:set var="pageTitle" value="User Profile & Security" scope="request"/>
<jsp:include page="../layout/header.jsp"/>

<div class="row justify-content-center">
    <div class="col-lg-8">
        <h4 class="fw-bold mb-1">My Account & Preferences</h4>
        <p class="text-muted small mb-4">Manage your profile credentials, theme, and authentication settings</p>

        <!-- Profile Information Card -->
        <div class="table-card p-4 mb-4">
            <h5 class="fw-bold mb-3"><i class="bi bi-person me-2 text-primary"></i> Profile Information</h5>
            <form action="${pageContext.request.contextPath}/profile/update" method="post">
                <input type="hidden" name="${_csrf.parameterName}" value="${_csrf.token}"/>
                <div class="mb-3">
                    <label class="form-label small fw-semibold">Email Address (Login ID)</label>
                    <input type="email" class="form-control" value="${user.email}" disabled>
                    <div class="form-text">Email address cannot be changed directly.</div>
                </div>
                <div class="mb-3">
                    <label class="form-label small fw-semibold">Username</label>
                    <input type="text" name="username" class="form-control" value="${user.username}" required>
                </div>
                <div class="row g-2 mb-3">
                    <div class="col-md-6">
                        <label class="form-label small fw-semibold">Preferred Timezone</label>
                        <select name="timezone" class="form-select">
                            <option value="UTC" ${user.timezone == 'UTC' ? 'selected' : ''}>UTC (Coordinated Universal Time)</option>
                            <option value="Asia/Kolkata" ${user.timezone == 'Asia/Kolkata' ? 'selected' : ''}>Asia/Kolkata (IST +5:30)</option>
                            <option value="America/New_York" ${user.timezone == 'America/New_York' ? 'selected' : ''}>America/New_York (EST)</option>
                            <option value="Europe/London" ${user.timezone == 'Europe/London' ? 'selected' : ''}>Europe/London (GMT/BST)</option>
                        </select>
                    </div>
                    <div class="col-md-6">
                        <label class="form-label small fw-semibold">Dashboard Theme</label>
                        <select name="themePreference" class="form-select">
                            <option value="light" ${user.themePreference == 'light' ? 'selected' : ''}>Light Theme</option>
                            <option value="dark" ${user.themePreference == 'dark' ? 'selected' : ''}>Dark Theme</option>
                        </select>
                    </div>
                </div>
                <div class="text-end">
                    <button type="submit" class="btn btn-primary btn-sm px-3">Save Preferences</button>
                </div>
            </form>
        </div>

        <!-- Change Password Card -->
        <div class="table-card p-4">
            <h5 class="fw-bold mb-3"><i class="bi bi-key me-2 text-warning"></i> Change Password</h5>
            <form action="${pageContext.request.contextPath}/profile/password" method="post">
                <input type="hidden" name="${_csrf.parameterName}" value="${_csrf.token}"/>
                <div class="mb-3">
                    <label class="form-label small fw-semibold">Current Password</label>
                    <input type="password" name="currentPassword" class="form-control" placeholder="••••••••" required>
                </div>
                <div class="row g-2 mb-3">
                    <div class="col-md-6">
                        <label class="form-label small fw-semibold">New Password</label>
                        <input type="password" name="newPassword" class="form-control" placeholder="••••••••" required>
                    </div>
                    <div class="col-md-6">
                        <label class="form-label small fw-semibold">Confirm New Password</label>
                        <input type="password" name="confirmPassword" class="form-control" placeholder="••••••••" required>
                    </div>
                </div>
                <div class="text-end">
                    <button type="submit" class="btn btn-warning btn-sm px-3">Update Password</button>
                </div>
            </form>
        </div>
    </div>
</div>

<jsp:include page="../layout/footer.jsp"/>
