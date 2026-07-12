package com.deopuri.api.rest;

import com.deopuri.api.model.Notification;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RequestMapping("/deopuri/notifications")
public interface NotificationController {

    // GET NOTIFICATIONS
    @GetMapping("/{userId}")
    List<Notification> getNotifications(
            @PathVariable Integer userId
    );

    // MARK ALL READ
    @PutMapping("/read/{userId}")
    ResponseEntity<String> markAllRead(
            @PathVariable Integer userId
    );
}