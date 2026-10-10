// ServiceWatch Dashboard Interactive Enhancements

document.addEventListener("DOMContentLoaded", function () {
    // Theme toggle initialization
    const themeToggleBtn = document.getElementById("themeToggleBtn");
    const currentTheme = localStorage.getItem("servicewatch-theme") || "light";
    document.documentElement.setAttribute("data-bs-theme", currentTheme);

    if (themeToggleBtn) {
        themeToggleBtn.addEventListener("click", function () {
            const activeTheme = document.documentElement.getAttribute("data-bs-theme");
            const newTheme = activeTheme === "dark" ? "light" : "dark";
            document.documentElement.setAttribute("data-bs-theme", newTheme);
            localStorage.setItem("servicewatch-theme", newTheme);
        });
    }

    // Auto-dismiss alerts after 5 seconds
    const alerts = document.querySelectorAll(".alert-dismissible");
    alerts.forEach(function (alert) {
        setTimeout(function () {
            const bsAlert = new bootstrap.Alert(alert);
            bsAlert.close();
        }, 5000);
    });
});
