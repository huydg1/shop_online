package com.devcamp.menfashion.controller;

import java.util.*;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.*;
import org.springframework.web.bind.annotation.*;
import com.devcamp.menfashion.model.*;
import com.devcamp.menfashion.repository.*;

@RestController
@CrossOrigin
@RequestMapping("/")
public class ColorController {

	@Autowired
	IColorRepository gColorRepository;

	// Hàm lấy danh sách color
	@GetMapping("/colors")
	public ResponseEntity<List<Color>> getColors() {
		try {
			List<Color> vColor = new ArrayList<Color>();
			gColorRepository.findAll().forEach(vColor::add);
			return new ResponseEntity<>(vColor, HttpStatus.OK);
		} catch (Exception e) {
			return new ResponseEntity<>(null, HttpStatus.INTERNAL_SERVER_ERROR);
		}
	}

}
