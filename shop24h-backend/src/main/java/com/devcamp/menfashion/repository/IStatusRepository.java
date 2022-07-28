package com.devcamp.menfashion.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import com.devcamp.menfashion.model.Status;

public interface IStatusRepository extends JpaRepository<Status, Long> {

}
