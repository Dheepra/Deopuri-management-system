package com.deopuri.security;

import com.deopuri.api.model.Users;
import com.deopuri.service.dao.UsersDao;

import java.util.Optional;

import org.springframework.data.domain.AuditorAware;
import org.springframework.stereotype.Component;

/**
 * Supplies the current user's id to JPA auditing so BaseEntity's {@code creatorId}/{@code modifierId}
 * are stamped automatically. Returns empty for system / unauthenticated writes (creator stays null).
 */
@Component
public class AuditorAwareImpl implements AuditorAware<Integer> {

    private final UsersDao usersDao;

    public AuditorAwareImpl(UsersDao usersDao) {
        this.usersDao = usersDao;
    }

    @Override
    public Optional<Integer> getCurrentAuditor() {
        try {
            String email = SecurityUtils.currentUserEmail();
            return usersDao.findByEmail(email).map(Users::getId);
        } catch (Exception e) {
            return Optional.empty();
        }
    }
}
