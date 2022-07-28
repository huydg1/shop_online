package com.devcamp.menfashion.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import com.devcamp.menfashion.model.Token;

public interface TokenRepository extends JpaRepository<Token, Long> {

	Token findByToken(String token);
}
