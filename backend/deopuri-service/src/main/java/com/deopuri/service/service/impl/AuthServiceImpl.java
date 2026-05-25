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
import org.springframework.transaction.annotation.Transactional;
import java.util.List;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
public class AuthServiceImpl implements AuthService {

        @Autowired
        private UsersDao usersDao;

        @Autowired
        private EmailService emailService;

        @Autowired
        private JwtUtil jwtUtil;

        @Autowired
        private PasswordEncoder passwordEncoder;

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

                System.out.println("ROLE = " + dto.role());
                System.out.println("EMAIL = " + dto.email());

                Users savedUser = usersDao.save(user);
                try {

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

                        List<Users> admins = usersDao.findByRole(UserRole.ADMIN);

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

                        for (Users admin : admins) {

                                emailService.sendEmail(
                                                admin.getEmail(),
                                                "New User Approval Request",
                                                adminBody);
                        }

                } catch (Exception e) {

                        e.printStackTrace();

                        throw e;
                }

                return "User Registered Successfully. Waiting for Admin Approval.";
        }

        @Override
        public LoginResponse login(
                        LoginRequest dto) {

                Users user = usersDao.findByEmail(
                                dto.email())
                                .orElseThrow(
                                                () -> new RuntimeException(
                                                                "User not found"));

                if (user.getRole() != UserRole.ADMIN
                                &&
                                user.getStatus() == UserStatus.PENDING) {

                        throw new RuntimeException(
                                        "Account not approved by admin");
                }

                if (!passwordEncoder.matches(
                                dto.password(),
                                user.getPassword())) {
                        throw new RuntimeException(
                                        "Invalid password");
                }

                String token = jwtUtil.generateToken(
                                user.getEmail(),
                                user.getRole().name());

                return LoginResponse.bearer(
                                token,
                                jwtUtil.getExpiration().getSeconds(),
                                user.getRole());
        }
}