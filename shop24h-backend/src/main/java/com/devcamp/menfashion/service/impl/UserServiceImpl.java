package com.devcamp.menfashion.service.impl;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.devcamp.menfashion.model.User;
import com.devcamp.menfashion.repository.IUserRepositoty;
import com.devcamp.menfashion.security.UserPrincipal;
import com.devcamp.menfashion.service.UserService;

import java.util.HashSet;
import java.util.Set;

@Service
public class UserServiceImpl implements UserService {

	@Autowired
	private IUserRepositoty userRepository;

	@Override
	public User createUser(User user) {
		return userRepository.saveAndFlush(user);
	}

	@Override
	public UserPrincipal findByUsername(String username) {
		User user = userRepository.findByUsername(username);
		UserPrincipal userPrincipal = new UserPrincipal();
		if (null != user) {
			Set<String> authorities = new HashSet<>();
			if (null != user.getUserRoles())
				user.getUserRoles().forEach(r -> {
					authorities.add(r.getRole().getRoleKey());
					r.getRole().getPermissions().forEach(p -> authorities.add(p.getPermissionKey()));
				});

			userPrincipal.setUserId(user.getId());
			userPrincipal.setUsername(user.getUsername());
			userPrincipal.setPassword(user.getPassword());
			userPrincipal.setAuthorities(authorities);
		}
		return userPrincipal;
	}

}
