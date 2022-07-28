package com.devcamp.menfashion.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import com.devcamp.menfashion.model.Material;

public interface IMaterialRepository extends JpaRepository<Material, Long> {

}
