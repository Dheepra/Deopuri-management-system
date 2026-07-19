package com.deopuri.security;

import com.deopuri.api.model.Users;
import com.deopuri.service.dao.UsersDao;

import jakarta.persistence.EntityManager;
import jakarta.persistence.FlushModeType;
import jakarta.persistence.PersistenceContext;

import java.util.Optional;

import org.springframework.data.domain.AuditorAware;
import org.springframework.stereotype.Component;

/**
 * Supplies the current user's id to JPA auditing so BaseEntity's {@code creatorId}/{@code modifierId}
 * are stamped automatically. Returns empty for system / unauthenticated writes (creator stays null).
 *
 * <p><b>Why the flush-mode guard below matters.</b> Spring Data JPA auditing invokes this method from
 * {@code AuditingEntityListener} during the {@code @PrePersist}/{@code @PreUpdate} of <em>every</em>
 * entity — i.e. while Hibernate is in the middle of flushing. The {@code findByEmail} lookup is itself
 * a JPA query, and under the default {@link FlushModeType#AUTO} Hibernate auto-flushes all pending
 * changes before running a query. Doing that <em>inside</em> an ongoing flush re-enters the flush and
 * re-issues the not-yet-committed INSERTs. For a parent saved with a cascaded, versioned child
 * collection (Product → ProductVariant) this meant every audit callback re-inserted the same variant
 * rows, so a single create fired hundreds of {@code product_variants} inserts and every repeat hit the
 * {@code (product_id, size)} unique constraint — surfacing as a 409 that had nothing to do with the
 * request payload. Running this lookup with {@link FlushModeType#COMMIT} suppresses the nested
 * auto-flush, so the audit read no longer perturbs the in-flight flush.
 */
@Component
public class AuditorAwareImpl implements AuditorAware<Integer> {

    private final UsersDao usersDao;

    @PersistenceContext
    private EntityManager entityManager;

    public AuditorAwareImpl(UsersDao usersDao) {
        this.usersDao = usersDao;
    }

    @Override
    public Optional<Integer> getCurrentAuditor() {
        try {
            String email = SecurityUtils.currentUserEmail();
            return lookupUserIdWithoutAutoFlush(email);
        } catch (Exception e) {
            return Optional.empty();
        }
    }

    /**
     * Resolves the user id for {@code email} without letting the read auto-flush the current
     * persistence context (see the class-level note). The prior flush mode is always restored.
     */
    private Optional<Integer> lookupUserIdWithoutAutoFlush(String email) {
        // No shared EntityManager available (e.g. a write outside a JPA transaction) — fall back to a
        // plain lookup; there is no in-flight flush to protect in that case.
        if (entityManager == null) {
            return usersDao.findByEmail(email).map(Users::getId);
        }
        FlushModeType previous = entityManager.getFlushMode();
        entityManager.setFlushMode(FlushModeType.COMMIT);
        try {
            return usersDao.findByEmail(email).map(Users::getId);
        } finally {
            entityManager.setFlushMode(previous);
        }
    }
}
