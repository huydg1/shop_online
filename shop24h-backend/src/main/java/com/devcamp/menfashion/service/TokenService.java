package com.devcamp.menfashion.service;

import com.devcamp.menfashion.model.Token;

public interface TokenService {

	Token createToken(Token token);

	Token findByToken(String token);
}
