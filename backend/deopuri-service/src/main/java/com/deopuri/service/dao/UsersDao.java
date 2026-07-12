package com.deopuri.service.dao;

import com.deopuri.api.model.UserRole;
import com.deopuri.api.model.UserStatus;
import com.deopuri.api.model.Users;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface UsersDao extends JpaRepository<Users, Integer> {

    Optional<Users> findByEmail(String email);

    boolean existsByEmail(String email);
    
    Optional<Users> findByMobileNo(String mobileNo);

    boolean existsByRoleAndStatus(UserRole role, UserStatus status);

    List<Users> findByFirstNameStartingWithIgnoreCase(String firstName);

    List<Users> findByRole(UserRole role);

    List<Users> findByStatus(UserStatus status);

    Optional<Users> findByInvitationToken(String invitationToken);

    Optional<Users> findByResetToken(String resetToken);

}
