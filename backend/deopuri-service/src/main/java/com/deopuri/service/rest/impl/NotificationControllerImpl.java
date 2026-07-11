package com.deopuri.service.rest.impl;

import com.deopuri.api.model.Notification;
import com.deopuri.api.rest.NotificationController;
import com.deopuri.service.service.NotificationService;

import java.util.List;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.RestController;

@RestController
@CrossOrigin(origins = "http://localhost:5173")
public class NotificationControllerImpl
        implements NotificationController {

    private static final Logger log =
            LoggerFactory.getLogger(NotificationControllerImpl.class);

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

        log.debug("GET notifications userId={}", userId);

        List<Notification> result =
                notificationService.getNotifications(userId);

        log.debug(
                "GET notifications userId={} returning count={}",
                userId,
                result.size());

        return result;
    }

    // MARK ALL READ
    //
    // INFO level here (not DEBUG) because this is a one-shot user action; the
    // log volume is fine and operators will want to see the trail when a user
    // reports "I clicked the bell but my notifications didn't clear."
    @Override
    public ResponseEntity<String> markAllRead(
            Integer userId
    ) {

        log.info("PUT mark-all-read userId={}", userId);

        notificationService.markAllNotificationsAsRead(userId);

        return ResponseEntity.ok(
                "Notifications marked as read"
        );
    }
}