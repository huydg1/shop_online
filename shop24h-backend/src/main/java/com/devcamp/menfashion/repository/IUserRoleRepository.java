package com.devcamp.menfashion.repository;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import com.devcamp.menfashion.model.UserRole;

public interface IUserRoleRepository extends JpaRepository<UserRole, Long> {

	/**
	 * function get info user role by userId
	 * 
	 * @param userId admin select
	 * @return infor user role
	 */
	Optional<UserRole> findByUserId(Long userId);

}
