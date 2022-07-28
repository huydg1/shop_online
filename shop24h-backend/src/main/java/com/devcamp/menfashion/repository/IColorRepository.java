package com.devcamp.menfashion.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import com.devcamp.menfashion.model.Color;

public interface IColorRepository extends JpaRepository<Color, Long> {

}
