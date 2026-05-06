package com.backend.deopuri.service.service;

import java.util.List;
import com.backend.deopuri.api.model.Users;

public interface UserServices {

	String register(Users user);

	String approveUser(int userId, String adminEmail);

	String rejectUser(int userId, String adminEmail);

	List<Users> getPendingUsers();

	String login(String email, String password);

	List<Users> getAllUsers();

	Users getUserById(int id);

	List<Users> getUserssearchByFirstName(String name);

	Users updateUser(int id, Users user);

	String deleteUser(int id);

	void save(Users existingUser);

}
