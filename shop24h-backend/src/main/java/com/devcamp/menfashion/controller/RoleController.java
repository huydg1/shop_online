package com.devcamp.menfashion.controller;

import java.util.*;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.*;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import com.devcamp.menfashion.model.*;
import com.devcamp.menfashion.repository.*;

@RestController
@CrossOrigin
@RequestMapping("/")
public class RoleController {
	@Autowired
	IRoleRepository gRoleRepository;

	// Hàm lấy danh sách role
	@GetMapping("/roles")
	@PreAuthorize("hasAnyRole('ROLE_ADMIN')")
	public ResponseEntity<List<Role>> getRoles() {
		try {
			List<Role> vRoles = new ArrayList<Role>();
			gRoleRepository.findAll().forEach(vRoles::add);
			return new ResponseEntity<>(vRoles, HttpStatus.OK);
		} catch (Exception e) {
			return new ResponseEntity<>(null, HttpStatus.INTERNAL_SERVER_ERROR);
		}
	}
}
