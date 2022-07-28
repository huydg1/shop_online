package com.devcamp.menfashion.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import com.devcamp.menfashion.model.Category;

public interface ICategoryRepository extends JpaRepository<Category, Long> {

}
