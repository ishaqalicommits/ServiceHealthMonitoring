<%@ page contentType="text/html;charset=UTF-8" language="java" %>
<%@ taglib prefix="c" uri="jakarta.tags.core" %>
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Login - ServiceWatch</title>
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css" rel="stylesheet">
    <link href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.3/font/bootstrap-icons.min.css" rel="stylesheet">
    <style>
        body {
            background-color: #0f172a;
            height: 100vh;
            display: flex;
            align-items: center;
            justify-content: center;
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
        }
        .login-card {
            width: 100%;
            max-width: 420px;
            background: #ffffff;
            border-radius: 1rem;
            padding: 2.5rem;
            box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.3), 0 10px 10px -5px rgba(0, 0, 0, 0.2);
        }
    </style>
</head>
<body>
<div class="login-card">
    <div class="text-center mb-4">
        <div class="d-inline-flex align-items-center justify-content-center bg-primary bg-opacity-10 text-primary p-3 rounded-circle mb-3">
            <i class="bi bi-shield-check fs-1"></i>
        </div>
        <h3 class="fw-bold text-dark mb-1">ServiceWatch</h3>
        <p class="text-muted small">Real-Time Service Health Monitoring</p>
    </div>

    <c:if test="${not empty errorMessage}">
        <div class="alert alert-danger py-2 small mb-3">
            <i class="bi bi-exclamation-triangle me-1"></i> ${errorMessage}
        </div>
    </c:if>
    <c:if test="${not empty successMessage}">
        <div class="alert alert-success py-2 small mb-3">
            <i class="bi bi-check-circle me-1"></i> ${successMessage}
        </div>
    </c:if>

    <form action="${pageContext.request.contextPath}/login" method="post">
        <input type="hidden" name="${_csrf.parameterName}" value="${_csrf.token}"/>
        <div class="mb-3">
            <label class="form-label small fw-semibold text-secondary">Email or Username</label>
            <div class="input-group">
                <span class="input-group-text bg-light text-muted"><i class="bi bi-envelope"></i></span>
                <input type="text" name="username" class="form-control" placeholder="admin@servicewatch.local" required autofocus>
            </div>
        </div>
        <div class="mb-4">
            <label class="form-label small fw-semibold text-secondary">Password</label>
            <div class="input-group">
                <span class="input-group-text bg-light text-muted"><i class="bi bi-lock"></i></span>
                <input type="password" name="password" class="form-control" placeholder="••••••••" required>
            </div>
        </div>
        <button type="submit" class="btn btn-primary w-100 py-2 fw-semibold">
            Sign In to Dashboard
        </button>
    </form>
    <div class="mt-4 text-center">
        <p class="text-muted small mb-0">Default Admin: <code>admin@servicewatch.local</code> / <code>Admin@12345</code></p>
    </div>
</div>
</body>
</html>
