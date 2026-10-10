<%@ page contentType="text/html;charset=UTF-8" language="java" %>
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>Error - ServiceWatch</title>
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css" rel="stylesheet">
    <link href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.3/font/bootstrap-icons.min.css" rel="stylesheet">
    <style>
        body { background: #0f172a; height: 100vh; display: flex; align-items: center; justify-content: center; }
        .card { max-width: 480px; border-radius: 1rem; border: none; padding: 2rem; }
    </style>
</head>
<body>
<div class="card text-center shadow-lg">
    <div class="text-warning mb-3"><i class="bi bi-exclamation-octagon fs-1"></i></div>
    <h3 class="fw-bold mb-2">Something Went Wrong</h3>
    <p class="text-muted small">${errorMessage != null ? errorMessage : 'The server encountered an internal issue processing your request.'}</p>
    <p class="text-secondary small">For security, internal execution traces are omitted.</p>
    <div class="mt-3">
        <a href="${pageContext.request.contextPath}/dashboard" class="btn btn-primary">Return to Dashboard</a>
    </div>
</div>
</body>
</html>
