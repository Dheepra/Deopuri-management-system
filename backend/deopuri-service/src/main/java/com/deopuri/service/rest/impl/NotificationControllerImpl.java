package com.deopuri.service.rest.impl;

import com.deopuri.api.model.Notification;
import com.deopuri.api.model.Users;
import com.deopuri.api.rest.NotificationController;
import com.deopuri.security.SecurityUtils;
import com.deopuri.service.dao.UsersDao;
import com.deopuri.service.service.NotificationService;

import java.util.List;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.RestController;

@RestController
@CrossOrigin(origins = "http://localhost:5173")
public class NotificationControllerImpl
        implements NotificationController {

    private static final Logger log =
            LoggerFactory.getLogger(NotificationControllerImpl.class);

    private final NotificationService notificationService;
    private final UsersDao usersDao;

    public NotificationControllerImpl(
            NotificationService notificationService,
            UsersDao usersDao
    ) {
        this.notificationService = notificationService;
        this.usersDao = usersDao;
    }

    // The acting user ALWAYS comes from the JWT — the path {userId} is ignored. This stops one user
    // from reading or clearing another user's notifications by passing someone else's id (IDOR).
    private Integer currentUserId() {
        return usersDao.findByEmail(SecurityUtils.currentUserEmail())
                .map(Users::getId)
                .orElseThrow(() -> new AccessDeniedException("Authenticated user no longer exists"));
    }

    // GET NOTIFICATIONS
    @Override
    public List<Notification> getNotifications(
            Integer userId
    ) {
        Integer me = currentUserId();
        List<Notification> result = notificationService.getNotifications(me);
        log.debug("GET notifications userId={} returning count={}", me, result.size());
        return result;
    }

    // MARK ALL READ
    @Override
    public ResponseEntity<String> markAllRead(
            Integer userId
    ) {
        Integer me = currentUserId();
        log.info("PUT mark-all-read userId={}", me);
        notificationService.markAllNotificationsAsRead(me);
        return ResponseEntity.ok("Notifications marked as read");
    }
}
