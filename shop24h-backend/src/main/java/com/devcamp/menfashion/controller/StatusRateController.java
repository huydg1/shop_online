package com.devcamp.menfashion.controller;

import java.util.ArrayList;
import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.devcamp.menfashion.model.StatusRate;
import com.devcamp.menfashion.repository.IStatusRateRepository;

@RestController
@CrossOrigin
@RequestMapping("/")
public class StatusRateController {
	@Autowired
	IStatusRateRepository gStatusRateRepository;

	// Hàm lấy danh sách tất cả sản phẩm sắp xếp giảm dần theo id
	@GetMapping("/status-rates")
	public ResponseEntity<List<StatusRate>> getStatusRates() {
		try {
			List<StatusRate> vStatusRates = new ArrayList<StatusRate>();
			gStatusRateRepository.findAll().forEach(vStatusRates::add);
			return new ResponseEntity<>(vStatusRates, HttpStatus.OK);
		} catch (Exception e) {
			return new ResponseEntity<>(null, HttpStatus.INTERNAL_SERVER_ERROR);
		}
	}

}
