package com.servicewatch.notification;

import com.servicewatch.enums.NotificationEvent;
import com.servicewatch.enums.NotificationType;
import com.servicewatch.model.NotificationChannel;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Component;

/**
 * Sends notifications via email using Spring Boot Mail.
 * SMTP credentials are read from configuration or environment variables.
 */
@Component
public class EmailNotificationProvider implements NotificationProvider {

    private static final Logger log = LoggerFactory.getLogger(EmailNotificationProvider.class);

    private final JavaMailSender mailSender;

    @Value("${spring.mail.username:}")
    private String fromEmail;

    @Autowired
    public EmailNotificationProvider(@Autowired(required = false) JavaMailSender mailSender) {
        this.mailSender = mailSender;
    }

    @Override
    public NotificationType getType() {
        return NotificationType.EMAIL;
    }

    @Override
    public void send(NotificationChannel channel, String message, NotificationEvent event) throws Exception {
        if (channel.getEmail() == null || channel.getEmail().isBlank()) {
            throw new IllegalArgumentException("Email channel has no recipient email configured");
        }

        if (mailSender == null || fromEmail == null || fromEmail.isBlank()) {
            log.warn("SMTP credentials not set. Simulated email to: {}", channel.getEmail());
            throw new IllegalStateException("Real email sending requires SMTP credentials! Set MAIL_USERNAME and MAIL_PASSWORD (e.g. Gmail App Password) in application.properties or environment variables.");
        }

        SimpleMailMessage mail = new SimpleMailMessage();
        mail.setFrom(fromEmail);
        mail.setTo(channel.getEmail());
        mail.setSubject(buildSubject(event));
        mail.setText(buildBody(message, event));

        mailSender.send(mail);
        log.info("Email sent to {} for event {}", channel.getEmail(), event);
    }

    private String buildSubject(NotificationEvent event) {
        return switch (event) {
            case DOWN_ALERT -> "[ServiceWatch] Service Down Alert";
            case RECOVERY_ALERT -> "[ServiceWatch] Service Recovered";
            case SSL_EXPIRY_WARNING -> "[ServiceWatch] SSL Certificate Expiry Warning";
            case INCIDENT_UPDATE -> "[ServiceWatch] Incident Update";
            case TEST -> "[ServiceWatch] Test Notification";
        };
    }

    private String buildBody(String message, NotificationEvent event) {
        return "ServiceWatch Notification\n" +
               "========================\n" +
               "Event: " + event.name() + "\n\n" +
               message + "\n\n" +
               "---\nSent by ServiceWatch Real-Time Monitoring System\n";
    }
}
