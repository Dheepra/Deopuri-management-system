package com.deopuri.service.service.impl;

import com.deopuri.api.dto.LoginRequest;
import com.deopuri.api.dto.LoginResponse;
import com.deopuri.api.dto.UserRegisterRequest;
import com.deopuri.api.dto.UserResponse;
import com.deopuri.api.dto.UserUpdateRequest;
import com.deopuri.api.model.UserRole;
import com.deopuri.api.model.UserStatus;
import com.deopuri.api.model.Users;
import com.deopuri.exception.EmailAlreadyRegisteredException;
import com.deopuri.exception.ResourceNotFoundException;
import com.deopuri.security.jwt.JwtUtil;
import com.deopuri.service.dao.UsersDao;
import com.deopuri.service.service.UserServices;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.DisabledException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Locale;

@Service
@Transactional
public class UserServicesImpl implements UserServices {

    private static final Logger log = LoggerFactory.getLogger(UserServicesImpl.class);

    private final UsersDao dao;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtil jwtUtil;

    public UserServicesImpl(UsersDao dao, PasswordEncoder passwordEncoder, JwtUtil jwtUtil) {
        this.dao = dao;
        this.passwordEncoder = passwordEncoder;
        this.jwtUtil = jwtUtil;
    }

    // Public registration is locked to these two roles. ADMIN (Company Admin)
    // is intentionally excluded — that account is seeded directly in the DB.
    private static final java.util.Set<UserRole> PUBLIC_ROLES =
            java.util.EnumSet.of(UserRole.HOSPITAL_ADMIN, UserRole.MEDICAL);

    @Override
    public UserResponse register(UserRegisterRequest request) {
        String email = normalizeEmail(request.email());

        UserRole requestedRole = request.role();
        if (requestedRole == null) {
            throw new IllegalArgumentException("Role is required");
        }
        if (!PUBLIC_ROLES.contains(requestedRole)) {
            throw new IllegalArgumentException(
                    "Public registration is only available for HOSPITAL_ADMIN and MEDICAL roles");
        }

        if (dao.existsByEmail(email)) {
            throw new EmailAlreadyRegisteredException("Email is already registered");
        }

        Users user = new Users();
        user.setFirstName(request.firstName());
        user.setLastName(request.lastName());
        user.setEmail(email);
        user.setPassword(passwordEncoder.encode(request.password()));
        user.setMobileNo(request.mobileNo());
        user.setAddress(request.address());
        user.setShopName(request.shopName());
        user.setRole(requestedRole);
        user.setStatus(UserStatus.PENDING);

        Users saved = dao.save(user);
        log.info("User registered id={} role={} status=PENDING", saved.getId(), requestedRole);
        return UserMapper.toResponse(saved);
    }

    @Override
    public LoginResponse login(LoginRequest request) {
        String email = normalizeEmail(request.email());

        Users user = dao.findByEmail(email)
                .orElseThrow(() -> new BadCredentialsException("Invalid email or password"));

        if (!passwordEncoder.matches(request.password(), user.getPassword())) {
            log.debug("Failed login for {}", email);
            throw new BadCredentialsException("Invalid email or password");
        }

        if (user.getStatus() != UserStatus.APPROVED) {
            throw new DisabledException("User has not been approved by admin");
        }

        String token = jwtUtil.generateToken(user.getEmail(), user.getRole().name());
        log.info("Login successful id={}", user.getId());
        return LoginResponse.bearer(token, jwtUtil.getExpiration().toSeconds(), user.getRole());
    }

    @Override
    public UserResponse approveUser(int userId) {
        Users user = findById(userId);
        user.setStatus(UserStatus.APPROVED);
        log.info("User approved id={}", userId);
        return UserMapper.toResponse(user);
    }

    @Override
    public UserResponse rejectUser(int userId) {
        Users user = findById(userId);
        user.setStatus(UserStatus.REJECTED);
        log.info("User rejected id={}", userId);
        return UserMapper.toResponse(user);
    }

    @Override
    @Transactional(readOnly = true)
    public List<UserResponse> getPendingUsers() {
        return dao.findByStatus(UserStatus.PENDING).stream().map(UserMapper::toResponse).toList();
    }

    @Override
    @Transactional(readOnly = true)
    public List<UserResponse> getAllUsers() {
        return dao.findAll().stream().map(UserMapper::toResponse).toList();
    }

    @Override
    @Transactional(readOnly = true)
    public UserResponse getUserById(int id) {
        return UserMapper.toResponse(findById(id));
    }

    @Override
    @Transactional(readOnly = true)
    public List<UserResponse> searchByFirstName(String name) {
        return dao.findByFirstNameStartingWithIgnoreCase(name).stream()
                .map(UserMapper::toResponse)
                .toList();
    }

    @Override
    public UserResponse updateOwnProfile(int id, UserUpdateRequest request) {
        Users user = findById(id);

        if (request.firstName() != null) user.setFirstName(request.firstName());
        if (request.lastName() != null) user.setLastName(request.lastName());
        if (request.email() != null) user.setEmail(normalizeEmail(request.email()));
        if (request.password() != null) user.setPassword(passwordEncoder.encode(request.password()));
        if (request.mobileNo() != null) user.setMobileNo(request.mobileNo());
        if (request.address() != null) user.setAddress(request.address());
        if (request.shopName() != null) user.setShopName(request.shopName());

        log.info("User profile updated id={}", id);
        return UserMapper.toResponse(user);
    }

    @Override
    public UserResponse updateRole(int id, UserRole role) {
        Users user = findById(id);
        user.setRole(role);
        log.info("User role updated id={} role={}", id, role);
        return UserMapper.toResponse(user);
    }

    @Override
    public void deleteUser(int id) {
        Users user = findById(id);
        dao.delete(user);
        log.info("User deleted id={}", id);
    }

    private Users findById(int id) {
        return dao.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id " + id));
    }

    private static String normalizeEmail(String email) {
        return email == null ? null : email.trim().toLowerCase(Locale.ROOT);
    }
}
