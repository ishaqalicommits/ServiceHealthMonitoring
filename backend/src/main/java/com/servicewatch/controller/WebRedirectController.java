package com.servicewatch.controller;

import jakarta.servlet.http.HttpServletRequest;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.servlet.view.RedirectView;

/**
 * Redirects direct browser requests on port 8080 (such as /dashboard, /monitors, /login)
 * to the React dev server running at http://localhost:5173.
 */
@Controller
public class WebRedirectController {

    @GetMapping(value = {
        "/",
        "/dashboard",
        "/login",
        "/monitors",
        "/monitors/**",
        "/incidents",
        "/incidents/**",
        "/analytics",
        "/notifications",
        "/maintenance",
        "/status-pages",
        "/profile",
        "/team",
        "/settings"
    })
    public RedirectView redirectToFrontend(HttpServletRequest request) {
        String uri = request.getRequestURI();
        return new RedirectView("http://localhost:5173" + uri);
    }
}
