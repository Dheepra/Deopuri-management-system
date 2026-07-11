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

    // SAVE NOTIFICATION tagged with the user it is ABOUT (for auto-resolve on approval, etc.)
    void saveNotification(
            String title,
            String message,
            Integer userId,
            Integer refUserId
    );

    // Soft-delete every active notification that is ABOUT this user (e.g. clear the pending
    // "X requested registration" notice once X is approved/rejected).
    void resolveNotificationsForUser(
            Integer refUserId
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