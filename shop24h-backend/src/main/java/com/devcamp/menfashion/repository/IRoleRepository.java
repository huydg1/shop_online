package com.devcamp.menfashion.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import com.devcamp.menfashion.model.Role;

public interface IRoleRepository extends JpaRepository<Role, Long> {
}
