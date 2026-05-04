package com.backend.deopuri.service.service.impl;




import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import com.backend.deopuri.api.model.Users;
import com.backend.deopuri.service.dao.UsersDao;
import com.backend.deopuri.service.service.UserServices;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;



@Service
public class UserServicesImpl implements UserServices {

    private static final Logger logger = LoggerFactory.getLogger(UserServicesImpl.class);

    @Autowired
    private UsersDao dao;
   

    // ✅ REGISTER
    @Override
    public String register(Users user) {

        logger.info("Register service started for email: {}", user.getEmail());

        Users existingUser = dao.findByEmail(user.getEmail());

        if (existingUser != null) {
            logger.warn("User already exists with email: {}", user.getEmail());
            return "Email already registered";
        }

        if (user.getRoleBase() == null || user.getRoleBase().isEmpty()) {
            user.setRoleBase("MEDICAL");
        }

        dao.save(user);

        logger.info("User saved successfully with email: {}", user.getEmail());

        return "Registration Successful";
    }

    // ✅ LOGIN
    @Override
    public Users login(String email, String password) {

        logger.info("Login service called for email: {}", email);

        Users user = dao.findByEmail(email);

        if (user != null && user.getPassword().equals(password)) {
            logger.info("Login successful for email: {}", email);
            return user;
        }

        logger.error("Login failed for email: {}", email);
        return null;
    }

    // ✅ GET ALL USERS
    @Override
    public List<Users> getAllUsers() {

        logger.info("Fetching all users");

        List<Users> users = dao.findAll();

        logger.info("Total users found: {}", users.size());

        return users;
    }

    // ✅ GET USER BY ID
    @Override
    public Users getUserById(int id) {

        logger.info("Fetching user with id: {}", id);

        Users user = dao.findById(id).orElse(null);

        if (user != null) {
            logger.info("User found with id: {}", id);
        } else {
            logger.warn("User not found with id: {}", id);
        }

        return user;
    }

    //search by name users
  

    @Override
    public List<Users> getUserssearchByFirstName(String name) {
    	 return dao.findByFirstNameStartingWithIgnoreCase(name);
    }
    
    // ✅ UPDATE USER
    @Override
    public Users updateUser(int id, Users user) {

        logger.info("Updating user with id: {}", id);

        Users existing = dao.findById(id).orElse(null);

        if (existing == null) {
            logger.error("User not found for update with id: {}", id);
            return null;
        }

        if(user.getFirstName() != null)
            existing.setFirstName(user.getFirstName());

        if(user.getLastName() != null)
            existing.setLastName(user.getLastName());

        if(user.getEmail() != null)
            existing.setEmail(user.getEmail());

        if(user.getPassword() != null)
            existing.setPassword(user.getPassword());

        if(user.getMobileNo() != null)
            existing.setMobileNo(user.getMobileNo());

        if(user.getAddress() != null)
            existing.setAddress(user.getAddress());

        if(user.getShopName() != null)
            existing.setShopName(user.getShopName());

        if(user.getRoleBase() != null)
            existing.setRoleBase(user.getRoleBase());

        Users updatedUser = dao.save(existing);

        logger.info("User updated successfully with id: {}", id);

        return updatedUser;
    }

    // ✅ DELETE USER
    @Override
    public String deleteUser(int id) {

        logger.info("Deleting user with id: {}", id);

        if (dao.existsById(id)) {
            dao.deleteById(id);
            logger.info("User deleted successfully with id: {}", id);
            return "Deleted Successfully";
        }

        logger.warn("User not found for delete with id: {}", id);
        return "User Not Found";
    }

    @Override
    public void save(Users existingUser) {
        dao.save(existingUser);   // 🔥 yahi main kaam hai
    }

	
}