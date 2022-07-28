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
public class MaterialController {
	@Autowired
	IMaterialRepository gMaterialRepository;

	// Hàm lấy danh sách material
	@GetMapping("/materials")
	public ResponseEntity<List<Material>> getMaterials() {
		try {
			List<Material> vMaterial = new ArrayList<Material>();
			gMaterialRepository.findAll().forEach(vMaterial::add);
			return new ResponseEntity<>(vMaterial, HttpStatus.OK);
		} catch (Exception e) {
			return new ResponseEntity<>(null, HttpStatus.INTERNAL_SERVER_ERROR);
		}
	}
}
