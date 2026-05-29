package com.deopuri.service.service.impl;

import com.deopuri.api.dto.UserDto;
import com.deopuri.api.dto.LoginRequest;
import com.deopuri.api.dto.LoginResponse;
import com.deopuri.api.model.Users;
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
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
public class AuthServiceImpl implements AuthService {

        private static final Logger log =
                LoggerFactory.getLogger(AuthServiceImpl.class);

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

                user.setRole(
                                UserRole.valueOf(
                                                dto.role()
                                                                .trim()
                                                                .toUpperCase()));

                user.setStatus(UserStatus.PENDING);

                // INFO at "registration started" — operators correlate this
                // with the later "Email sent" / "Notification created" lines
                // to confirm the full flow ran. Role is fine to log; the
                // email is PII and intentionally not logged here (the old
                // System.out.println leaked it on every signup).
                log.info("Registration started role={}", dto.role());

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

                                // 🔔 NOTIFICATION TO ADMIN
                                notificationService.saveNotification(
                                                "New Registration Request",
                                                savedUser.getEmail()
                                                                + " requested registration",
                                                admin.getId());
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
                                // BadCredentialsException (rather than 404)
                                // so we don't leak whether the email exists.
                                // GlobalExceptionHandler maps it to 401 with
                                // the generic "Invalid email or password"
                                // message — single response for both
                                // "wrong email" and "wrong password".
                                .orElseThrow(() -> {
                                        log.info("Login failed: unknown email");
                                        return new BadCredentialsException(
                                                        "Invalid email or password");
                                });

                if (user.getRole() != UserRole.ADMIN
                                && user.getStatus() == UserStatus.PENDING) {
                        log.info("Login blocked userId={} status=PENDING",
                                        user.getId());
                        throw new DisabledException(
                                        "Your account is awaiting admin approval.");
                }

                if (!passwordEncoder.matches(dto.password(), user.getPassword())) {
                        log.info("Login failed: bad password userId={}",
                                        user.getId());
                        throw new BadCredentialsException(
                                        "Invalid email or password");
                }

                String token = jwtUtil.generateToken(
                                user.getEmail(),
                                user.getRole().name());

                return LoginResponse.bearer(
                                token,
                                jwtUtil.getExpiration().getSeconds(),
                                user.getRole(),
                                user.getId());
        }
}