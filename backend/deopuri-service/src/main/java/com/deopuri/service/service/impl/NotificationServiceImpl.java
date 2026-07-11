package com.deopuri.service.service.impl;

import com.deopuri.api.model.Notification;
import com.deopuri.service.dao.NotificationDao;
import com.deopuri.service.service.NotificationService;

import java.util.List;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class NotificationServiceImpl
        implements NotificationService {

    private static final Logger log =
            LoggerFactory.getLogger(NotificationServiceImpl.class);

    private final NotificationDao notificationDao;

    public NotificationServiceImpl(
            NotificationDao notificationDao
    ) {
        this.notificationDao = notificationDao;
    }

    // SAVE NOTIFICATION
    //
    // INFO because each notification corresponds to a business event the
    // operator may want to trace (e.g. "why did user 42 not get the
    // registration mail" -> "did we even create the notification row?"). We
    // log only the title and target userId; the message body can contain
    // user-facing copy / templated text we don't want spraying through logs.
    @Override
    public void saveNotification(
            String title,
            String message,
            Integer userId
    ) {
        saveNotification(title, message, userId, null);
    }

    @Override
    public void saveNotification(
            String title,
            String message,
            Integer userId,
            Integer refUserId
    ) {

        Notification n = new Notification();

        n.setTitle(title);
        n.setMessage(message);
        n.setIsRead(false);
        n.setIsActive(true);
        n.setUserId(userId);
        n.setRefUserId(refUserId);

        Notification saved = notificationDao.save(n);

        log.info(
                "Notification created id={} title='{}' userId={} refUserId={}",
                saved.getId(),
                title,
                userId,
                refUserId);
    }

    // RESOLVE (soft-delete) all active notifications ABOUT a given user.
    @Override
    @Transactional
    public void resolveNotificationsForUser(
            Integer refUserId
    ) {
        if (refUserId == null) {
            return;
        }

        List<Notification> list =
                notificationDao.findByRefUserIdAndIsActiveTrue(refUserId);

        if (list.isEmpty()) {
            return;
        }

        for (Notification n : list) {
            n.setIsActive(false);
        }

        notificationDao.saveAll(list);

        log.info("Resolved {} notification(s) about refUserId={}", list.size(), refUserId);
    }

    // GET NOTIFICATIONS
    @Override
    public List<Notification> getNotifications(
            Integer userId
    ) {

        List<Notification> result =
                notificationDao.findByUserIdAndIsActiveTrue(userId);

        log.debug(
                "Notifications fetched userId={} count={}",
                userId,
                result.size());

        return result;
    }

    // MARK ALL AS READ
    //
    // Policy: opening the notification panel clears it.
    //
    // We deliberately operate on EVERY active row for the user — not just the
    // unread ones — because the original query (findByUserIdAndIsReadFalse)
    // left already-read-but-still-active rows in the list endpoint's result
    // forever. Users saw 18 stale items the next time they opened the panel
    // even after marking everything read once.
    //
    // Soft-delete (isActive=false) is preferred over hard-delete so the rows
    // stay around for audit / analytics / a future "notification history"
    // page. The list endpoint already filters by findByUserIdAndIsActiveTrue,
    // so flipping isActive is enough to make them invisible.
    @Override
    @Transactional
    public void markAllNotificationsAsRead(
            Integer userId
    ) {

        List<Notification> list =
                notificationDao
                        .findByUserIdAndIsActiveTrue(userId);

        if (list.isEmpty()) {
            log.debug("Mark-all-read no-op userId={} (nothing active)", userId);
            return;
        }

        for (Notification n : list) {

            n.setIsRead(true);
            n.setIsActive(false);
        }

        notificationDao.saveAll(list);

        log.info(
                "Mark-all-read soft-deleted userId={} cleared={}",
                userId,
                list.size());
    }
}