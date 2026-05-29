package com.deopuri.service.rest.impl;

import com.deopuri.api.model.Notification;
import com.deopuri.api.rest.NotificationController;
import com.deopuri.service.service.NotificationService;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.RestController;

@RestController
@CrossOrigin(origins = "http://localhost:5173")
public class NotificationControllerImpl
        implements NotificationController {

    private final NotificationService notificationService;

    public NotificationControllerImpl(
            NotificationService notificationService
    ) {
        this.notificationService = notificationService;
    }

    // GET NOTIFICATIONS
    @Override
    public List<Notification> getNotifications(
            Integer userId
    ) {

        return notificationService
                .getNotifications(userId);
    }

    // MARK ALL READ
    @Override
    public ResponseEntity<String> markAllRead(
            Integer userId
    ) {

        notificationService
                .markAllNotificationsAsRead(userId);

        return ResponseEntity.ok(
                "Notifications marked as read"
        );
    }
}