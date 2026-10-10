package com.servicewatch.enums;

public enum UserRole {
    ADMIN,    // Full access: manage users, settings, all monitors
    OPERATOR, // Can manage monitors and incidents
    VIEWER    // Read-only access
}
