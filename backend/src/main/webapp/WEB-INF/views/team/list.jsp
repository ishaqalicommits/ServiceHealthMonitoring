<%@ page contentType="text/html;charset=UTF-8" language="java" %>
<%@ taglib prefix="c" uri="jakarta.tags.core" %>
<c:set var="pageTitle" value="Team & Role Management" scope="request"/>
<jsp:include page="../layout/header.jsp"/>

<div class="d-flex justify-content-between align-items-center mb-4">
    <div>
        <h4 class="fw-bold mb-1">Team Members</h4>
        <p class="text-muted small mb-0">Control team permissions, assign user roles (ADMIN, OPERATOR, VIEWER), and manage access</p>
    </div>
    <button type="button" class="btn btn-primary btn-sm" data-bs-toggle="modal" data-bs-target="#addUserModal">
        <i class="bi bi-person-plus me-1"></i> Add Team Member
    </button>
</div>

<div class="table-card">
    <div class="table-responsive">
        <table class="table table-hover align-middle mb-0">
            <thead>
                <tr>
                    <th>User</th>
                    <th>Email Address</th>
                    <th>Assigned Role</th>
                    <th>Account Status</th>
                    <th>Joined</th>
                    <th class="text-end">Actions</th>
                </tr>
            </thead>
            <tbody>
                <c:forEach var="u" items="${users}">
                    <tr>
                        <td>
                            <div class="d-flex align-items-center gap-2">
                                <div class="bg-primary bg-opacity-10 text-primary rounded-circle p-2 text-center" style="width: 36px; height: 36px; line-height: 20px;">
                                    <i class="bi bi-person-fill"></i>
                                </div>
                                <span class="fw-bold text-dark">${u.username}</span>
                            </div>
                        </td>
                        <td>${u.email}</td>
                        <td>
                            <form action="${pageContext.request.contextPath}/team/${u.id}/role" method="post" class="d-inline">
                                <input type="hidden" name="${_csrf.parameterName}" value="${_csrf.token}"/>
                                <select name="role" class="form-select form-select-sm d-inline-block w-auto" onchange="this.form.submit()">
                                    <c:forEach var="r" items="${roles}">
                                        <option value="${r}" ${r == u.role ? 'selected' : ''}>${r}</option>
                                    </c:forEach>
                                </select>
                            </form>
                        </td>
                        <td>
                            <span class="badge ${u.active ? 'bg-success' : 'bg-danger'}">${u.active ? 'Active' : 'Disabled'}</span>
                        </td>
                        <td class="text-muted small">${u.createdAt}</td>
                        <td class="text-end">
                            <form action="${pageContext.request.contextPath}/team/${u.id}/toggle-active" method="post" class="d-inline">
                                <input type="hidden" name="${_csrf.parameterName}" value="${_csrf.token}"/>
                                <button type="submit" class="btn btn-sm btn-outline-warning" title="${u.active ? 'Disable' : 'Enable'}">
                                    <i class="bi ${u.active ? 'bi-person-slash' : 'bi-person-check'}"></i>
                                </button>
                            </form>
                            <form action="${pageContext.request.contextPath}/team/${u.id}/delete" method="post" class="d-inline">
                                <input type="hidden" name="${_csrf.parameterName}" value="${_csrf.token}"/>
                                <button type="submit" class="btn btn-sm btn-outline-danger" title="Delete Member">
                                    <i class="bi bi-trash"></i>
                                </button>
                            </form>
                        </td>
                    </tr>
                </c:forEach>
            </tbody>
        </table>
    </div>
</div>

<!-- Add User Modal -->
<div class="modal fade" id="addUserModal" tabindex="-1">
    <div class="modal-dialog">
        <div class="modal-content">
            <div class="modal-header">
                <h5 class="modal-title fw-bold">Add Team Member</h5>
                <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
            </div>
            <form action="${pageContext.request.contextPath}/team/add" method="post">
                <input type="hidden" name="${_csrf.parameterName}" value="${_csrf.token}"/>
                <div class="modal-body">
                    <div class="mb-3">
                        <label class="form-label fw-semibold">Username</label>
                        <input type="text" name="username" class="form-control" placeholder="john_doe" required>
                    </div>
                    <div class="mb-3">
                        <label class="form-label fw-semibold">Email Address</label>
                        <input type="email" name="email" class="form-control" placeholder="john@example.com" required>
                    </div>
                    <div class="mb-3">
                        <label class="form-label fw-semibold">Temporary Password</label>
                        <input type="password" name="password" class="form-control" placeholder="••••••••" required>
                    </div>
                    <div class="mb-3">
                        <label class="form-label fw-semibold">Role</label>
                        <select name="role" class="form-select" required>
                            <option value="OPERATOR">OPERATOR (Can manage monitors & incidents)</option>
                            <option value="VIEWER">VIEWER (Read-only access)</option>
                            <option value="ADMIN">ADMIN (Full access)</option>
                        </select>
                    </div>
                </div>
                <div class="modal-footer">
                    <button type="button" class="btn btn-light" data-bs-dismiss="modal">Cancel</button>
                    <button type="submit" class="btn btn-primary">Create User</button>
                </div>
            </form>
        </div>
    </div>
</div>

<jsp:include page="../layout/footer.jsp"/>
