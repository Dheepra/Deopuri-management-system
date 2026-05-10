package com.backend.deopuri.service.service.impl;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import com.backend.deopuri.api.model.Users;
import com.backend.deopuri.service.dao.UsersDao;
import com.backend.deopuri.service.service.UserServices;

import com.backend.deopuri.security.jwt.JwtUtil;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

@Service
public class UserServicesImpl implements UserServices {

    private static final Logger logger = LoggerFactory.getLogger(UserServicesImpl.class);

    @Autowired
    private UsersDao dao;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private JwtUtil jwtUtil;

    // ================= REGISTER =================
    @Override
    public String register(Users user) {

        Users existingUser = dao.findByEmail(user.getEmail());

        if (existingUser != null) {
            return "Email already registered";
        }

        // 🔥 IMPORTANT: encode password
        user.setPassword(passwordEncoder.encode(user.getPassword()));

        if (user.getRoleBase() == null || user.getRoleBase().isEmpty()) {
            user.setRoleBase("MEDICAL");
        }

        user.setStatus("PENDING");

        dao.save(user);

        return "Registration Successful";
    }

    // ================= LOGIN =================
    @Override
    public String login(String email, String password) {

        Users user = dao.findByEmail(email);

        if (user == null) {
            return "User not found";
        }

        // 🔥 password match FIX
        if (!passwordEncoder.matches(password, user.getPassword())) {
            return "Invalid password";
        }

        if (!"APPROVED".equals(user.getStatus())) {
            return "User not approved by admin";
        }

        return jwtUtil.generateToken(email, user.getRoleBase());
    }

    // ================= APPROVE USER =================
    @Override
    public String approveUser(int userId, String adminEmail) {

        Users admin = dao.findByEmail(adminEmail);

        if (admin == null || !"ADMIN".equals(admin.getRoleBase())) {
            return "Only admin can approve users";
        }

        Users user = dao.findById(userId).orElse(null);

        if (user == null) {
            return "User not found";
        }

        user.setStatus("APPROVED");

        dao.save(user);

        return "User approved successfully";
    }

    // ================= REJECT USER =================
    @Override
    public String rejectUser(int userId, String adminEmail) {

        Users admin = dao.findByEmail(adminEmail);

        if (admin == null || !"ADMIN".equals(admin.getRoleBase())) {
            return "Only admin can reject users";
        }

        Users user = dao.findById(userId).orElse(null);

        if (user == null) {
            return "User not found";
        }

        user.setStatus("REJECTED");

        dao.save(user);

        return "User rejected successfully";
    }

    @Override
    public List<Users> getPendingUsers() {
        return dao.findByStatus("PENDING");
    }

    // ================= GET ALL USERS =================
    @Override
    public List<Users> getAllUsers() {
        return dao.findAll();
    }

    // ================= GET USER BY ID =================
    @Override
    public Users getUserById(int id) {
        return dao.findById(id).orElse(null);
    }

    // ================= SEARCH USER =================
    @Override
    public List<Users> getUserssearchByFirstName(String name) {
        return dao.findByFirstNameStartingWithIgnoreCase(name);
    }

    // ================= UPDATE USER =================
    @Override
    public Users updateUser(int id, Users user) {

        Users existing = dao.findById(id).orElse(null);

        if (existing == null) {
            return null;
        }

        if (user.getFirstName() != null)
            existing.setFirstName(user.getFirstName());

        if (user.getLastName() != null)
            existing.setLastName(user.getLastName());

        if (user.getEmail() != null)
            existing.setEmail(user.getEmail());

        if (user.getPassword() != null)
            existing.setPassword(passwordEncoder.encode(user.getPassword()));

        if (user.getMobileNo() != null)
            existing.setMobileNo(user.getMobileNo());

        if (user.getAddress() != null)
            existing.setAddress(user.getAddress());

        if (user.getShopName() != null)
            existing.setShopName(user.getShopName());

        // ❌ ROLE UPDATE BLOCK (security safe)
        // existing.setRoleBase(user.getRoleBase());

        return dao.save(existing);
    }

    // ================= DELETE USER =================
    @Override
    public String deleteUser(int id) {

        if (dao.existsById(id)) {
            dao.deleteById(id);
            return "Deleted Successfully";
        }

        return "User Not Found";
    }

    // ================= SAVE (helper) =================
    @Override
    public void save(Users user) {
        dao.save(user);
    }
}
