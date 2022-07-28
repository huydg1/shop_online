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

import com.devcamp.menfashion.model.Status;
import com.devcamp.menfashion.repository.IStatusRepository;

@RestController
@CrossOrigin
@RequestMapping("/")
public class StatusController {

	@Autowired
	IStatusRepository gStatusRepository;

	// Hàm lấy danh sách status
	@GetMapping("/status")
	public ResponseEntity<List<Status>> getStatus() {
		try {
			List<Status> vStatus = new ArrayList<Status>();
			gStatusRepository.findAll().forEach(vStatus::add);
			return new ResponseEntity<>(vStatus, HttpStatus.OK);
		} catch (Exception e) {
			return new ResponseEntity<>(null, HttpStatus.INTERNAL_SERVER_ERROR);
		}
	}

}
