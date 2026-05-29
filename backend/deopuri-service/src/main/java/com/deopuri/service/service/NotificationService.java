package com.deopuri.service.service;

import com.deopuri.api.model.Notification;

import java.util.List;

public interface NotificationService {

    // SAVE NOTIFICATION
    void saveNotification(
            String title,
            String message,
            Integer userId
    );

    // GET NOTIFICATIONS
    List<Notification> getNotifications(
            Integer userId
    );

    // MARK ALL AS READ
    void markAllNotificationsAsRead(
            Integer userId
    );
}