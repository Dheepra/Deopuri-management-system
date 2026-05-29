package com.deopuri.service.dao;

import com.deopuri.api.model.Notification;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface NotificationDao
        extends JpaRepository<Notification, Long> {

    List<Notification> findByIsActiveTrue();

    List<Notification> findByUserId(Integer userId);

    List<Notification> findByUserIdAndIsActiveTrue(
            Integer userId
    );
List<Notification>findByUserIdAndIsReadFalse(
            Integer userId
    );

    List<Notification> findByUserIdAndIsRead(
            Integer userId,
            Boolean isRead
    );
}