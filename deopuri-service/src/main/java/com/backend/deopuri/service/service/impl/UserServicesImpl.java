package com.backend.deopuri.service.service.impl;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import com.backend.deopuri.api.model.Users;
import com.backend.deopuri.exception.ResourceNotFoundException;
import com.backend.deopuri.security.jwt.JwtUtil;
import com.backend.deopuri.service.dao.UsersDao;
import com.backend.deopuri.service.service.UserServices;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

@Service
public class UserServicesImpl implements UserServices {

    private static final Logger logger =
            LoggerFactory.getLogger(UserServicesImpl.class);

    @Autowired
    private UsersDao dao;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private JwtUtil jwtUtil;

    // ================= REGISTER =================
    @Override
    public String register(Users user) {

        logger.info("========== USER REGISTER START ==========");

        Users existingUser = dao.findByEmail(user.getEmail());

        if (existingUser != null) {

            logger.warn("EMAIL ALREADY REGISTERED : {}",
                    user.getEmail());

            return "Email already registered";
        }

        user.setPassword(
                passwordEncoder.encode(user.getPassword()));

        if (user.getRoleBase() == null
                || user.getRoleBase().isEmpty()) {

            user.setRoleBase("MEDICAL");
        }

        user.setStatus("PENDING");

        dao.save(user);

        logger.info("USER REGISTERED SUCCESSFULLY");

        return "Registration Successful";
    }

    // ================= LOGIN =================
    @Override
    public String login(String email, String password) {

        logger.info("========== USER LOGIN START ==========");

        Users user = dao.findByEmail(email);

        if (user == null) {

            logger.warn("USER NOT FOUND : {}", email);

            throw new ResourceNotFoundException(
                    "User not found");
        }

        if (!passwordEncoder.matches(
                password,
                user.getPassword())) {

            logger.warn("INVALID PASSWORD FOR : {}", email);

            return "Invalid password";
        }

        if (!"APPROVED".equals(user.getStatus())) {

            logger.warn("USER NOT APPROVED : {}", email);

            return "User not approved by admin";
        }

        logger.info("LOGIN SUCCESSFUL : {}", email);

        return jwtUtil.generateToken(
                email,
                user.getRoleBase());
    }

    // ================= APPROVE USER =================
    @Override
    public String approveUser(int userId, String adminEmail) {

        logger.info("========== APPROVE USER START ==========");

        Users admin = dao.findByEmail(adminEmail);

        if (admin == null
                || !"ADMIN".equals(admin.getRoleBase())) {

            logger.warn("NON ADMIN TRYING TO APPROVE USER");

            return "Only admin can approve users";
        }

        Users user = dao.findById(userId)
                .orElseThrow(() -> {

                    logger.warn(
                            "USER NOT FOUND WITH ID : {}",
                            userId);

                    return new ResourceNotFoundException(
                            "User not found");
                });

        user.setStatus("APPROVED");

        dao.save(user);

        logger.info("USER APPROVED SUCCESSFULLY");

        return "User approved successfully";
    }

    // ================= REJECT USER =================
    @Override
    public String rejectUser(int userId, String adminEmail) {

        logger.info("========== REJECT USER START ==========");

        Users admin = dao.findByEmail(adminEmail);

        if (admin == null
                || !"ADMIN".equals(admin.getRoleBase())) {

            logger.warn("NON ADMIN TRYING TO REJECT USER");

            return "Only admin can reject users";
        }

        Users user = dao.findById(userId)
                .orElseThrow(() -> {

                    logger.warn(
                            "USER NOT FOUND WITH ID : {}",
                            userId);

                    return new ResourceNotFoundException(
                            "User not found");
                });

        user.setStatus("REJECTED");

        dao.save(user);

        logger.info("USER REJECTED SUCCESSFULLY");

        return "User rejected successfully";
    }

    // ================= GET PENDING USERS =================
    @Override
    public List<Users> getPendingUsers() {

        logger.info("GETTING ALL PENDING USERS");

        return dao.findByStatus("PENDING");
    }

    // ================= GET ALL USERS =================
    @Override
    public List<Users> getAllUsers() {

        logger.info("GETTING ALL USERS");

        return dao.findAll();
    }

    // ================= GET USER BY ID =================
    @Override
    public Users getUserById(int id) {

        logger.info("GET USER BY ID : {}", id);

        return dao.findById(id)
                .orElseThrow(() -> {

                    logger.warn(
                            "USER NOT FOUND WITH ID : {}",
                            id);

                    return new ResourceNotFoundException(
                            "User not found");
                });
    }

    // ================= SEARCH USER =================
    @Override
    public List<Users> getUserssearchByFirstName(String name) {

        logger.info("SEARCH USER BY NAME : {}", name);

        return dao.findByFirstNameStartingWithIgnoreCase(name);
    }

    // ================= UPDATE USER =================
    @Override
    public Users updateUser(int id, Users user) {

        logger.info("========== UPDATE USER START ==========");

        Users existing = dao.findById(id)
                .orElseThrow(() -> {

                    logger.warn(
                            "USER NOT FOUND WITH ID : {}",
                            id);

                    return new ResourceNotFoundException(
                            "User not found");
                });

        if (user.getFirstName() != null)
            existing.setFirstName(user.getFirstName());

        if (user.getLastName() != null)
            existing.setLastName(user.getLastName());

        if (user.getEmail() != null)
            existing.setEmail(user.getEmail());

        if (user.getPassword() != null)
            existing.setPassword(
                    passwordEncoder.encode(
                            user.getPassword()));

        if (user.getMobileNo() != null)
            existing.setMobileNo(user.getMobileNo());

        if (user.getAddress() != null)
            existing.setAddress(user.getAddress());

        if (user.getShopName() != null)
            existing.setShopName(user.getShopName());

        Users updatedUser = dao.save(existing);

        logger.info("USER UPDATED SUCCESSFULLY");

        return updatedUser;
    }

    // ================= DELETE USER =================
    @Override
    public String deleteUser(int id) {

        logger.info("========== DELETE USER START ==========");

        Users user = dao.findById(id)
                .orElseThrow(() -> {

                    logger.warn(
                            "USER NOT FOUND WITH ID : {}",
                            id);

                    return new ResourceNotFoundException(
                            "User not found");
                });

        dao.delete(user);

        logger.info("USER DELETED SUCCESSFULLY");

        return "Deleted Successfully";
    }

    // ================= SAVE =================
    @Override
    public void save(Users user) {

        dao.save(user);
    }
}