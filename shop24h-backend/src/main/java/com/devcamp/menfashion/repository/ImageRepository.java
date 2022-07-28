package com.devcamp.menfashion.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import com.devcamp.menfashion.model.Image;

public interface ImageRepository extends JpaRepository<Image, Long> {

}
