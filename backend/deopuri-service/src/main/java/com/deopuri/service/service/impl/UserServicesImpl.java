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

import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import com.deopuri.service.service.EmailService;
import org.springframework.beans.factory.annotation.Autowired;
import java.util.List;
import java.util.Locale;

@Service
@Transactional
public class UserServicesImpl implements UserServices {

    private static final Logger log = LoggerFactory.getLogger(UserServicesImpl.class);

    private final UsersDao dao;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtil jwtUtil;

    @Autowired
    private EmailService emailService;

    public UserServicesImpl(UsersDao dao, PasswordEncoder passwordEncoder, JwtUtil jwtUtil) {
        this.dao = dao;
        this.passwordEncoder = passwordEncoder;
        this.jwtUtil = jwtUtil;
    }

    // Public registration is locked to these two roles. ADMIN (Company Admin)
    // is intentionally excluded — that account is seeded directly in the DB.
    private static final java.util.Set<UserRole> PUBLIC_ROLES = java.util.EnumSet.of(UserRole.HOSPITAL_ADMIN,
            UserRole.MEDICAL_ADMIN);

    @Override
    public UserResponse register(UserRegisterRequest request) {

        String email = normalizeEmail(request.email());

        if (dao.existsByEmail(email)) {
            throw new RuntimeException("Email already registered");
        }

        Users user = new Users();
        user.setFirstName(request.firstName());
        user.setLastName(request.lastName());
        user.setEmail(email);
        user.setPassword(passwordEncoder.encode(request.password()));
        user.setMobileNo(request.mobileNo());
        user.setAddress(request.address());
        user.setShopName(request.shopName());

        UserRole role = UserRole.valueOf(
                request.role().trim().toUpperCase());

        if (!PUBLIC_ROLES.contains(role)) {
            throw new RuntimeException("Invalid role selected");
        }

        user.setRole(role);

        user.setStatus(UserStatus.PENDING);

        Users saved = dao.save(user);

        // USER MAIL (REGISTRATION CONFIRMATION)
        try {
            emailService.sendEmail(
                    saved.getEmail(),
                    "Registration Received - Deopuri Herbal Drugs",
                    """
                            Hello %s,

                            Your registration has been received successfully.

                            Status: PENDING APPROVAL

                            You will receive email after admin approval.

                            Email: %s

                            Thank You,
                            Deopuri Team
                            """.formatted(saved.getFirstName(), saved.getEmail()));
        } catch (Exception e) {
            log.error("User mail failed", e);
        }

        // ADMIN NOTIFICATION MAIL
        List<Users> admins = dao.findByRole(UserRole.ADMIN);

        String adminMsg = "New User Registration\n\n" +
                "Name: " + saved.getFirstName() + " " + saved.getLastName() + "\n" +
                "Email: " + saved.getEmail() + "\n" +
                "Shop: " + saved.getShopName() + "\n\n" +
                "Please approve from dashboard.";

        for (Users admin : admins) {
            emailService.sendEmail(
                    admin.getEmail(),
                    "New User Approval Request",
                    adminMsg);
        }

        return UserMapper.toResponse(saved);
    }

    @Override
    public LoginResponse login(LoginRequest request) {

        Users user = dao.findByEmail(normalizeEmail(request.email()))
                .orElseThrow(() -> new RuntimeException("Invalid credentials"));

        if (!passwordEncoder.matches(request.password(), user.getPassword())) {
            throw new RuntimeException("Invalid credentials");
        }

        if (user.getStatus() != UserStatus.APPROVED) {
            throw new RuntimeException("Account not approved by admin");
        }

        String token = jwtUtil.generateToken(user.getEmail(), user.getRole().name());

        return LoginResponse.bearer(token, jwtUtil.getExpiration().toSeconds(), user.getRole());
    }

    @Override
    public UserResponse approveUser(int id) {

        Users user = dao.findById(id)
                .orElseThrow(() -> new RuntimeException("User not found"));

        user.setStatus(UserStatus.APPROVED);

        Users updated = dao.save(user);

        // USER APPROVAL MAIL
        try {
            emailService.sendEmail(
                    updated.getEmail(),
                    "Account Approved - Deopuri Herbal Drugs and Pharmaceuticals",
                    """

                            <div style="text-align:center; font-family:Arial,sans-serif; padding:20px;">

                            ```
                            <img src='cid:logoImage'
                                 width='120'
                                 style="margin-bottom:10px;"/>

                            <h2 style="color:#2e7d32;">
                                Deopuri Herbal Drugs and Pharmaceuticals
                            </h2>

                            <hr style="width:60%%; margin:15px auto;"/>

                            <h2 style="color:green;">
                                🎉 Account Approved Successfully
                            </h2>

                            <p>Hello <b>%s</b> 👋</p>

                            <p>
                                Congratulations! Your account has been
                                <b style="color:green;">APPROVED</b>.
                            </p>

                            <p>
                                You can now access and login to the system.
                            </p>

                            <div style="
                                background:#f5f5f5;
                                padding:15px;
                                border-radius:8px;
                                margin:20px auto;
                                width:80%%;">

                                <p><b>Email:</b> %s</p>
                                <p><b>Role:</b> %s</p>
                                <p><b>Status:</b> APPROVED</p>

                            </div>

                            <p style="font-size:17px;">
                                Welcome to the
                                <b>Deopuri Family ❤️</b>
                            </p>

                            <p>
                                We are excited to have you with us and look forward
                                to growing together.
                            </p>

                            <br/>

                            <p>
                                Regards,<br/>
                                <b>Admin Team</b><br/>
                                Deopuri Herbal Drugs and Pharmaceuticals
                            </p>
                            ```

                            </div>
                            """.formatted(
                            updated.getFirstName(),
                            updated.getEmail(),
                             updated.getRole().name()));

        } catch (Exception e) {
            log.error("Approve mail failed", e);
        }
        System.out.println("USER EMAIL = " + updated.getEmail());
        System.out.println("USER STATUS = " + updated.getStatus());

        return UserMapper.toResponse(updated);
    }

    @Override
    public UserResponse rejectUser(int id) {

        Users user = dao.findById(id)
                .orElseThrow(() -> new RuntimeException("User not found"));

        user.setStatus(UserStatus.REJECTED);

        Users updated = dao.save(user);

        // USER REJECTION MAIL
        try {
            emailService.sendEmail(
                    updated.getEmail(),
                    "Account Rejected - Deopuri Herbal Drugs",
                    """
                            Hello %s,

                            ❌ Your registration request has been REJECTED.

                            If this is a mistake, contact admin.

                            Email: %s

                            Regards,
                            Deopuri Team
                            """.formatted(updated.getFirstName(), updated.getEmail()));
        } catch (Exception e) {
            log.error("Reject mail failed", e);
        }

        return UserMapper.toResponse(updated);
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

        if (request.firstName() != null)
            user.setFirstName(request.firstName());
        if (request.lastName() != null)
            user.setLastName(request.lastName());
        if (request.email() != null) {
            String newEmail = normalizeEmail(request.email());
            if (dao.existsByEmail(newEmail)) {
                throw new EmailAlreadyRegisteredException("Email already in use");
            }
            user.setEmail(newEmail);
        }
        if (request.password() != null)
            user.setPassword(passwordEncoder.encode(request.password()));
        if (request.mobileNo() != null)
            user.setMobileNo(request.mobileNo());
        if (request.address() != null)
            user.setAddress(request.address());
        if (request.shopName() != null)
            user.setShopName(request.shopName());

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
