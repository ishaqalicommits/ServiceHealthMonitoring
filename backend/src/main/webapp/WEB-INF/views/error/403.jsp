<%@ page contentType="text/html;charset=UTF-8" language="java" %>
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>403 Forbidden - ServiceWatch</title>
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css" rel="stylesheet">
    <link href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.3/font/bootstrap-icons.min.css" rel="stylesheet">
    <style>
        body { background: #0f172a; height: 100vh; display: flex; align-items: center; justify-content: center; }
        .card { max-width: 460px; border-radius: 1rem; border: none; padding: 2rem; }
    </style>
</head>
<body>
<div class="card text-center shadow-lg">
    <div class="text-danger mb-3"><i class="bi bi-shield-x fs-1"></i></div>
    <h3 class="fw-bold mb-2">Access Denied</h3>
    <p class="text-muted small">You do not have permission to access this resource. This action requires Administrator privileges.</p>
    <div class="mt-3">
        <a href="${pageContext.request.contextPath}/dashboard" class="btn btn-primary">Return to Dashboard</a>
    </div>
</div>
</body>
</html>
