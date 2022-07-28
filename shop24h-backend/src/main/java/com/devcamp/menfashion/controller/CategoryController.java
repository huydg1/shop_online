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
public class CategoryController {

	@Autowired
	ICategoryRepository gCategoryRepository;

	// Hàm lấy danh sách category
	@GetMapping("/categories")
	public ResponseEntity<List<Category>> getCategories() {
		try {
			List<Category> vCategory = new ArrayList<Category>();
			gCategoryRepository.findAll().forEach(vCategory::add);
			return new ResponseEntity<>(vCategory, HttpStatus.OK);
		} catch (Exception e) {
			return new ResponseEntity<>(null, HttpStatus.INTERNAL_SERVER_ERROR);
		}
	}

}
