package com.devcamp.menfashion.controller;

import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.devcamp.menfashion.model.Role;
import com.devcamp.menfashion.model.User;
import com.devcamp.menfashion.model.UserRole;
import com.devcamp.menfashion.repository.IRoleRepository;
import com.devcamp.menfashion.repository.IUserRepositoty;
import com.devcamp.menfashion.repository.IUserRoleRepository;

@RestController
@CrossOrigin
@RequestMapping("/")
public class UserRoleController {

	@Autowired
	private IUserRepositoty gUserRepositoty;

	@Autowired
	private IUserRoleRepository gUserRoleRepository;

	@Autowired
	private IRoleRepository gRoleRepository;

	/**
	 * Function create role for user (only admin set role)
	 * 
	 * @param userId admin select
	 * @param roleId admin select
	 * @return
	 */
	@PostMapping("/user-roles/{userId}/{roleId}")
	@PreAuthorize("hasAnyRole('ROLE_ADMIN')")
	public ResponseEntity<Object> createUserRole(@PathVariable Long userId, @PathVariable Long roleId) {
		try {
			Optional<User> vUserData = gUserRepositoty.findById(userId);
			Optional<Role> vRoleData = gRoleRepository.findById(roleId);
			UserRole vUserRole = new UserRole();
			vUserRole.setUser(vUserData.get());
			vUserRole.setRole(vRoleData.get());
			return new ResponseEntity<>(gUserRoleRepository.save(vUserRole), HttpStatus.CREATED);
		} catch (Exception e) {
			return ResponseEntity.unprocessableEntity()
					.body("Failed to create specified user role: " + e.getCause().getCause().getMessage());
		}
	}

	/**
	 * Function update role for user (only admin set role)
	 * 
	 * @param userId admin select
	 * @param roleId admin select
	 * @return
	 */
	@PutMapping("/user-roles/{userId}/{roleId}")
	@PreAuthorize("hasAnyRole('ROLE_ADMIN')")
	public ResponseEntity<Object> updateUserRole(@PathVariable Long userId, @PathVariable Long roleId) {
		try {
			Optional<UserRole> vUserRoleData = gUserRoleRepository.findByUserId(userId);
			Optional<Role> vRoleData = gRoleRepository.findById(roleId);
			UserRole vUserRole = vUserRoleData.get();
			vUserRole.setUser(vUserRoleData.get().getUser());
			vUserRole.setRole(vRoleData.get());
			return new ResponseEntity<>(gUserRoleRepository.save(vUserRole), HttpStatus.OK);
		} catch (Exception e) {
			return ResponseEntity.unprocessableEntity()
					.body("Failed to create specified user role: " + e.getCause().getCause().getMessage());
		}
	}

	@DeleteMapping("/user-roles/{userId}")
	@PreAuthorize("hasAnyRole('ROLE_ADMIN')")
	public ResponseEntity<Object> deleteUser(@PathVariable Long userId) {
		try {
			Optional<UserRole> vUserRoleData = gUserRoleRepository.findByUserId(userId);
			if (vUserRoleData.isPresent()) {
				// delete role of user
				gUserRoleRepository.deleteById(vUserRoleData.get().getId());
				return new ResponseEntity<>(null, HttpStatus.NO_CONTENT);
			} else {
				UserRole vUserRole = new UserRole();
				return new ResponseEntity<>(vUserRole, HttpStatus.NOT_FOUND);
			}
		} catch (Exception e) {
			return new ResponseEntity<>(null, HttpStatus.INTERNAL_SERVER_ERROR);
		}
	}
}
