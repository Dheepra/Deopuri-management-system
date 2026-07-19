package com.deopuri.service.service.impl;

import com.deopuri.api.dto.UserDto;
import com.deopuri.api.dto.LoginRequest;
import com.deopuri.api.dto.LoginResponse;
import com.deopuri.api.model.Users;
import com.deopuri.exception.BusinessException;
import com.deopuri.exception.ResourceNotFoundException;
import com.deopuri.security.jwt.JwtUtil;
import com.deopuri.api.model.UserRole;
import com.deopuri.api.model.UserStatus;
import com.deopuri.service.service.AuthService;
import com.deopuri.service.service.EmailService;
import com.deopuri.service.dao.UsersDao;
import com.deopuri.service.service.NotificationService;


import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.transaction.annotation.Transactional;
import java.util.List;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.DisabledException;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
public class AuthServiceImpl implements AuthService {

        private static final Logger log = LoggerFactory.getLogger(AuthServiceImpl.class);

        @Autowired
        private UsersDao usersDao;

        @Autowired
        private EmailService emailService;

        @Autowired
        private JwtUtil jwtUtil;

        @Autowired
        private PasswordEncoder passwordEncoder;

        @Autowired
        private NotificationService notificationService; // ✅ ADDED

        @Transactional
        @Override
        public String register(UserDto dto) {

                Users user = new Users();

                user.setFirstName(dto.firstName());
                user.setLastName(dto.lastName());
                user.setEmail(dto.email());
                user.setPassword(passwordEncoder.encode(dto.password()));
                user.setMobileNo(dto.mobileNo());
                user.setAddress(dto.address());
                user.setShopName(dto.shopName());

                // Never trust the client for privilege. Public self-registration may ONLY create
                // HOSPITAL_ADMIN or MEDICAL_ADMIN. ADMIN is seeded manually; DOCTOR is created by a
                // hospital admin. Anything else (incl. "ADMIN") is rejected.
                UserRole requestedRole;
                try {
                        requestedRole = UserRole.valueOf(dto.role().trim().toUpperCase());
                } catch (IllegalArgumentException | NullPointerException ex) {
                        throw new BusinessException("invalid_role", "Invalid role");
                }
                if (requestedRole != UserRole.HOSPITAL_ADMIN
                                && requestedRole != UserRole.MEDICAL_ADMIN) {
                        throw new BusinessException("role_not_allowed",
                                        "This role cannot be self-registered");
                }
                user.setRole(requestedRole);

                user.setStatus(UserStatus.PENDING);

                // INFO at "registration started" — operators correlate this
                // with the later "Email sent" / "Notification created" lines
                // to confirm the full flow ran. Role is fine to log; the
                // email is PII and intentionally not logged here (the old
                // System.out.println leaked it on every signup).
                log.info("Registration started role={}", dto.role());

                // Check duplicate email
                if (usersDao.findByEmail(dto.email()).isPresent()) {
                        throw new BusinessException(
                                        "email_exists",
                                        "Email is already registered");
                }

                if (usersDao.findByMobileNo(dto.mobileNo()).isPresent()) {
                        throw new BusinessException(
                                        "mobile_exists",
                                        "Mobile number is already registered");
                }

                // Address must be unique across hospital/medical shops — the NAME can repeat,
                // but two shops cannot register at the same address.
                String trimmedAddress = user.getAddress() != null ? user.getAddress().trim() : null;
                user.setAddress(trimmedAddress);
                if (trimmedAddress != null && !trimmedAddress.isBlank()
                                && usersDao.existsByAddressIgnoreCaseAndRoleIn(
                                                trimmedAddress,
                                                java.util.List.of(UserRole.HOSPITAL_ADMIN, UserRole.MEDICAL_ADMIN))) {
                        throw new BusinessException(
                                        "address_exists",
                                        "This address is already registered for another shop");
                }

                Users savedUser = usersDao.save(user);

                // GET ADMINS
                List<Users> admins = usersDao.findByRole(UserRole.ADMIN);

                try {

                        // ================= USER EMAIL =================

                        String userBody = """
                                        <div style="max-width:650px;margin:auto;
                                        font-family:Arial;padding:30px;
                                        border:1px solid #ddd;
                                        border-radius:10px;
                                        text-align:center;">

                                        <img src='cid:logoImage'
                                        width='120'
                                        style="margin-bottom:10px;"/>

                                        <h2 style="color:#1f7a1f;">
                                        Deopuri Herbal Drugs and Pharmaceuticals
                                        </h2>

                                        <hr>

                                        <p>
                                        Hello <b>%s</b> 👋
                                        </p>

                                        <p>
                                        Your registration has been received successfully.
                                        </p>

                                        <p>
                                        Current Status:
                                        <b style="color:orange;">
                                        PENDING APPROVAL
                                        </b>
                                        </p>

                                        <p>
                                        Email:
                                        <b>%s</b>
                                        </p>

                                        <br>

                                        <p>
                                        You will receive another email
                                        after admin approval.
                                        </p>

                                        <br>

                                        <p>
                                        Thank You
                                        <br>
                                        Team Deopuri
                                        </p>

                                        </div>
                                        """.formatted(
                                        savedUser.getFirstName(),
                                        savedUser.getEmail());

                        emailService.sendEmail(
                                        savedUser.getEmail(),
                                        "Registration Received - Deopuri Herbal Drugs",
                                        userBody);

                        // ================= ADMIN EMAIL =================

                        String adminBody = """
                                        <div style="max-width:650px;
                                        margin:auto;
                                        padding:30px;
                                        font-family:Arial;
                                        border:1px solid #ddd;
                                        border-radius:10px;">

                                        <div style="text-align:center">

                                        <img src='cid:logoImage'
                                        width='120'/>

                                        <h2>
                                        Deopuri Herbal Drugs and Pharmaceuticals
                                        </h2>

                                        <hr>

                                        <h3 style="color:red;">
                                        New Registration Request
                                        </h3>

                                        </div>

                                        <p><b>Name:</b> %s %s</p>

                                        <p><b>Email:</b> %s</p>

                                        <p><b>Role:</b> %s</p>

                                        <p><b>Address:</b> %s</p>

                                        <p><b>Shop:</b> %s</p>

                                        <br>

                                        <p>
                                        Please approve user from dashboard.
                                        </p>

                                        </div>
                                        """.formatted(
                                        savedUser.getFirstName(),
                                        savedUser.getLastName(),
                                        savedUser.getEmail(),
                                        savedUser.getRole().name(),
                                        savedUser.getAddress(),
                                        savedUser.getShopName());

                        // ================= ADMIN LOOP =================

                        for (Users admin : admins) {

                                // EMAIL TO ADMIN
                                emailService.sendEmail(
                                                admin.getEmail(),
                                                "New User Approval Request",
                                                adminBody);

                                // 🔔 NOTIFICATION TO ADMIN — tagged with the registrant so it can be
                                // auto-cleared from every admin's panel once this user is approved.
                                notificationService.saveNotification(
                                                "New Registration Request",
                                                savedUser.getEmail()
                                                                + " requested registration",
                                                admin.getId(),
                                                savedUser.getId());
                        }

                } catch (Exception e) {

                        // Was e.printStackTrace() — that prints to stderr
                        // with no logger context (timestamp, MDC, request
                        // URI), and also gets duplicated by
                        // GlobalExceptionHandler's catch-all. Use the logger
                        // so the stack lands in the same stream as the rest
                        // of the request's logs, then rethrow so the original
                        // behaviour (transaction rollback + 500 to caller)
                        // is preserved.
                        log.error(
                                        "Registration follow-up failed userId={}",
                                        savedUser.getId(),
                                        e);
                        throw e;
                }

                return "User Registered Successfully. Waiting for Admin Approval.";
        }

        @Override
        public LoginResponse login(LoginRequest dto) {

                Users user = usersDao.findByEmail(dto.email())
                                .orElseThrow(() -> new BadCredentialsException("Email not registered"));

                // status check
                if (user.getStatus() != UserStatus.APPROVED) {
                        throw new DisabledException("Account not active");
                }

                // 🔥 FIRST TIME LOGIN CHECK
                // Any admin-invited account (staff, doctor, or future roles) is created with a temp
                // password + a single-use invitation token and passwordCreated=false. Until they set
                // their own password, force them through the create-password flow. Self-registered
                // users (hospital/medical admins) never get an invitation token, so they log in
                // normally. Once the password is created the token is burned → normal login.
                boolean invited = user.getInvitationToken() != null
                                && !user.getInvitationToken().isBlank();
                if (invited && !Boolean.TRUE.equals(user.getPasswordCreated())) {

                        boolean match = passwordEncoder.matches(dto.password(), user.getPassword());

                        if (!match) {
                                throw new BadCredentialsException("Invalid temporary password");
                        }

                        log.info("First time login detected role={}", user.getRole());

                        return LoginResponse.firstTimeLogin(user.getId(), user.getInvitationToken());
                }

                // 🔥 NORMAL LOGIN
                boolean passwordMatch = passwordEncoder.matches(dto.password(), user.getPassword());

                if (!passwordMatch) {
                        throw new BadCredentialsException("Incorrect password");
                }

                String token = jwtUtil.generateToken(user.getEmail(), user.getRole().name());

                return LoginResponse.bearer(
                                token,
                                jwtUtil.getExpiration().getSeconds(),
                                user.getRole(),
                                user.getId());
        }

        @Override
        public LoginResponse refresh() {
                Authentication auth = SecurityContextHolder.getContext().getAuthentication();
                if (auth == null || !auth.isAuthenticated() || auth.getName() == null) {
                        // No valid token reached this point — treat as unauthenticated.
                        throw new BadCredentialsException("Not authenticated");
                }

                Users user = usersDao.findByEmail(auth.getName())
                                .orElseThrow(() -> new ResourceNotFoundException("User does not exist"));

                String token = jwtUtil.generateToken(user.getEmail(), user.getRole().name());

                return LoginResponse.bearer(
                                token,
                                jwtUtil.getExpiration().getSeconds(),
                                user.getRole(),
                                user.getId());
        }

        private static final java.security.SecureRandom OTP_RANDOM = new java.security.SecureRandom();

        @Transactional
        @Override
        public void forgotPassword(String email) {
                if (email == null || email.isBlank()) {
                        throw new BusinessException("email_required", "Email is required");
                }

                // Per the requirement: tell the user explicitly when the email is not registered.
                Users user = usersDao.findByEmail(email.trim().toLowerCase())
                                .orElseThrow(() -> new ResourceNotFoundException("User does not exist"));

                // 6-digit OTP, valid for 10 minutes.
                String otp = String.format("%06d", OTP_RANDOM.nextInt(1_000_000));
                user.setResetToken(otp);
                user.setResetTokenExpiry(java.time.LocalDateTime.now().plusMinutes(10));
                usersDao.save(user);

                try {
                        emailService.sendEmail(
                                        user.getEmail(),
                                        "Your password reset OTP - Deopuri",
                                        """
                                        <div style="font-family:Arial,sans-serif; padding:20px; text-align:center;">
                                          <div style="max-width:600px; margin:0 auto; border:1px solid #ddd; border-radius:10px; padding:20px; background:#ffffff;">
                                            <img src='cid:logoImage' width='120' style="margin-bottom:15px;"/>
                                            <h2 style="color:#2e7d32;">Deopuri Herbal Drugs and Pharmaceuticals</h2>
                                            <hr style="width:60%%; margin:15px auto;"/>
                                            <h2>Password reset OTP 🔑</h2>
                                            <p>Hello <b>%s</b>,</p>
                                            <p>Use this One-Time Password to reset your password. It is valid for 10 minutes.</p>
                                            <p style="font-size:32px; font-weight:bold; letter-spacing:8px; color:#2e7d32; margin:20px 0;">%s</p>
                                            <p style="color:#777; font-size:13px;">If you didn't request this, you can safely ignore this email.</p>
                                            <p>Regards,<br/><b>Deopuri Team</b></p>
                                          </div>
                                        </div>
                                        """.formatted(user.getFirstName(), otp));
                } catch (Exception e) {
                        log.error("Forgot-password OTP mail failed userId={}", user.getId(), e);
                        throw new BusinessException("mail_failed", "Could not send the OTP email. Please try again.");
                }
        }

        @Transactional
        @Override
        public void resetPassword(String email, String otp, String newPassword) {
                if (email == null || email.isBlank() || otp == null || otp.isBlank()) {
                        throw new BusinessException("invalid_otp", "Email and OTP are required");
                }
                if (newPassword == null || newPassword.trim().length() < 6) {
                        throw new BusinessException("weak_password", "Password must be at least 6 characters");
                }

                Users user = usersDao.findByEmail(email.trim().toLowerCase())
                                .orElseThrow(() -> new ResourceNotFoundException("User does not exist"));

                if (user.getResetToken() == null || !user.getResetToken().equals(otp.trim())) {
                        throw new BusinessException("invalid_otp", "Invalid OTP");
                }
                if (user.getResetTokenExpiry() == null
                                || user.getResetTokenExpiry().isBefore(java.time.LocalDateTime.now())) {
                        throw new BusinessException("expired_otp", "This OTP has expired. Please request a new one.");
                }

                user.setPassword(passwordEncoder.encode(newPassword.trim()));
                user.setPasswordCreated(true);
                // Single-use: burn the OTP (and any pending invite token).
                user.setResetToken(null);
                user.setResetTokenExpiry(null);
                user.setInvitationToken(null);
                usersDao.save(user);

                log.info("Password reset via OTP success userId={}", user.getId());
        }
}