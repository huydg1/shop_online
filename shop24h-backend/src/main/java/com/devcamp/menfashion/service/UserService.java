package com.devcamp.menfashion.service;

import java.util.Optional;

import com.devcamp.menfashion.model.User;
import com.devcamp.menfashion.security.UserPrincipal;

public interface UserService {
	User createUser(User user);

	UserPrincipal findByUsername(String username);
}
