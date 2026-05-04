package com.backend.deopuri.service.service;

import java.util.List;
import com.backend.deopuri.api.model.Users;


public interface UserServices {

	String register(Users user);

	Users login(String email, String password);

	List<Users> getAllUsers();

	Users getUserById(int id);

	Users updateUser(int id, Users user);

	String deleteUser(int id);

	

	void save(Users existingUser);



	List<Users> getUserssearchByFirstName(String name);

	

}
