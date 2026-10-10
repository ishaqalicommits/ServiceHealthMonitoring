package com.servicewatch.controller;

import jakarta.servlet.RequestDispatcher;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.boot.web.servlet.error.ErrorController;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.servlet.view.RedirectView;

import java.util.LinkedHashMap;
import java.util.Map;

@Controller
public class CustomErrorController implements ErrorController {

    @RequestMapping("/error")
    public Object handleError(HttpServletRequest request) {
        String uri = request.getRequestURI();
        Object status = request.getAttribute(RequestDispatcher.ERROR_STATUS_CODE);
        int statusCode = status != null ? Integer.parseInt(status.toString()) : 500;

        // If it's an API request, return clean JSON
        if (uri != null && uri.startsWith("/api/")) {
            Map<String, Object> body = new LinkedHashMap<>();
            body.put("error", HttpStatus.valueOf(statusCode).getReasonPhrase());
            body.put("status", statusCode);
            Object message = request.getAttribute(RequestDispatcher.ERROR_MESSAGE);
            body.put("message", message != null ? message.toString() : "An unexpected error occurred.");
            return ResponseEntity.status(statusCode).body(body);
        }

        // For direct browser navigation errors, redirect to the React frontend
        return new RedirectView("http://localhost:5173");
    }
}
