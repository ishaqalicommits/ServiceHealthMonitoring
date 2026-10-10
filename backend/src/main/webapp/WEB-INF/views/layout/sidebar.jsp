<%@ page contentType="text/html;charset=UTF-8" language="java" %>
<%@ taglib prefix="c" uri="jakarta.tags.core" %>
<%@ taglib prefix="sec" uri="http://www.springframework.org/security/tags" %>
<aside class="app-sidebar d-flex flex-column flex-shrink-0">
    <div class="sidebar-brand">
        <i class="bi bi-shield-check text-primary fs-4"></i>
        <span>ServiceWatch</span>
    </div>
    <ul class="sidebar-nav flex-grow-1">
        <li class="nav-item">
            <a href="${pageContext.request.contextPath}/dashboard" class="nav-link ${pageContext.request.requestURI.endsWith('dashboard') || pageContext.request.requestURI.endsWith('/') ? 'active' : ''}">
                <i class="bi bi-speedometer2"></i>
                <span>Overview</span>
            </a>
        </li>
        <li class="nav-item">
            <a href="${pageContext.request.contextPath}/monitors" class="nav-link ${pageContext.request.requestURI.contains('/monitors') ? 'active' : ''}">
                <i class="bi bi-activity"></i>
                <span>Monitors</span>
            </a>
        </li>
        <li class="nav-item">
            <a href="${pageContext.request.contextPath}/incidents" class="nav-link ${pageContext.request.requestURI.contains('/incidents') ? 'active' : ''}">
                <i class="bi bi-exclamation-octagon"></i>
                <span>Incidents</span>
            </a>
        </li>
        <li class="nav-item">
            <a href="${pageContext.request.contextPath}/analytics" class="nav-link ${pageContext.request.requestURI.contains('/analytics') ? 'active' : ''}">
                <i class="bi bi-graph-up"></i>
                <span>Analytics</span>
            </a>
        </li>
        <li class="nav-item">
            <a href="${pageContext.request.contextPath}/notifications/settings" class="nav-link ${pageContext.request.requestURI.contains('/notifications') ? 'active' : ''}">
                <i class="bi bi-bell"></i>
                <span>Notifications</span>
            </a>
        </li>
        <li class="nav-item">
            <a href="${pageContext.request.contextPath}/maintenance" class="nav-link ${pageContext.request.requestURI.contains('/maintenance') ? 'active' : ''}">
                <i class="bi bi-calendar-event"></i>
                <span>Maintenance</span>
            </a>
        </li>
        <li class="nav-item">
            <a href="${pageContext.request.contextPath}/status-pages" class="nav-link ${pageContext.request.requestURI.contains('/status-pages') ? 'active' : ''}">
                <i class="bi bi-broadcast"></i>
                <span>Status Pages</span>
            </a>
        </li>
        <sec:authorize access="hasRole('ADMIN')">
            <li class="nav-item">
                <a href="${pageContext.request.contextPath}/team" class="nav-link ${pageContext.request.requestURI.contains('/team') ? 'active' : ''}">
                    <i class="bi bi-people"></i>
                    <span>Team Members</span>
                </a>
            </li>
            <li class="nav-item">
                <a href="${pageContext.request.contextPath}/settings" class="nav-link ${pageContext.request.requestURI.contains('/settings') ? 'active' : ''}">
                    <i class="bi bi-sliders"></i>
                    <span>Settings</span>
                </a>
            </li>
        </sec:authorize>
    </ul>
    <div class="p-3 border-top border-secondary border-opacity-25">
        <form action="${pageContext.request.contextPath}/logout" method="post" class="m-0">
            <input type="hidden" name="${_csrf.parameterName}" value="${_csrf.token}"/>
            <button type="submit" class="btn btn-outline-light btn-sm w-100 d-flex align-items-center justify-content-center gap-2">
                <i class="bi bi-box-arrow-right"></i>
                <span>Logout</span>
            </button>
        </form>
    </div>
</aside>
