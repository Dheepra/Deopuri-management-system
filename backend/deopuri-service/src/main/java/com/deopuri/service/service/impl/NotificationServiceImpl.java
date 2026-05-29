package com.deopuri.service.service.impl;

import com.deopuri.api.model.Notification;
import com.deopuri.service.dao.NotificationDao;
import com.deopuri.service.service.NotificationService;

import java.util.List;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class NotificationServiceImpl
        implements NotificationService {

    private final NotificationDao notificationDao;

    public NotificationServiceImpl(
            NotificationDao notificationDao
    ) {
        this.notificationDao = notificationDao;
    }

    // SAVE NOTIFICATION
    @Override
    public void saveNotification(
            String title,
            String message,
            Integer userId
    ) {

        Notification n = new Notification();

        n.setTitle(title);
        n.setMessage(message);
        n.setIsRead(false);
        n.setIsActive(true);
        n.setUserId(userId);

        notificationDao.save(n);
    }

    // GET NOTIFICATIONS
    @Override
    public List<Notification> getNotifications(
            Integer userId
    ) {

        return notificationDao
                .findByUserIdAndIsActiveTrue(userId);
    }

    // MARK ALL AS READ
    @Override
    @Transactional
    public void markAllNotificationsAsRead(
            Integer userId
    ) {

        List<Notification> list =
                notificationDao
                        .findByUserIdAndIsReadFalse(userId);

        for (Notification n : list) {

            n.setIsRead(true);
        }

        notificationDao.saveAll(list);
    }
}