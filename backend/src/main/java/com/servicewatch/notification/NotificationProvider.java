package com.servicewatch.notification;

import com.servicewatch.enums.NotificationEvent;
import com.servicewatch.enums.NotificationType;
import com.servicewatch.model.NotificationChannel;

/**
 * Interface for notification delivery providers.
 * Add new providers (Email, Webhook, Slack, Discord) by implementing this interface.
 * The NotificationService discovers all implementations automatically.
 */
public interface NotificationProvider {
    /** The notification channel type this provider handles */
    NotificationType getType();

    /**
     * Sends a notification via this provider.
     * Must throw an exception on failure (do not silently swallow errors).
     * @param channel The notification channel destination
     * @param message Text payload
     * @param event The event type triggering notification
     * @throws Exception if delivery fails
     */
    void send(NotificationChannel channel, String message, NotificationEvent event) throws Exception;
}
