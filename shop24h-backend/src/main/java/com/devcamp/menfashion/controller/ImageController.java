package com.devcamp.menfashion.controller;

import java.util.*;

import javax.validation.Valid;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.*;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import com.devcamp.menfashion.model.*;
import com.devcamp.menfashion.repository.*;

@RestController
@CrossOrigin
@RequestMapping("/")
public class ImageController {

	@Autowired
	ImageRepository gImageRepository;

	@Autowired
	IProductRepository gProductRepository;

	/**
	 * Hàm thêm một ảnh cho một sản phẩm
	 * 
	 * @param productId người dùng chọn
	 * @param pImage    người dùng nhập
	 * @return thêm 1 ảnh thành công
	 */
	@PostMapping("/images/{productId}")
	@PreAuthorize("hasAnyRole('ROLE_STAFF', 'ROLE_ADMIN')")
	public ResponseEntity<Object> createImage(@PathVariable Long productId, @Valid @RequestBody Image pImage) {
		Optional<Product> vProductData = gProductRepository.findById(productId);
		if (vProductData.isPresent()) {
			try {
				Image vImage = new Image();
				vImage.setProduct(vProductData.get());
				vImage.setUrl(pImage.getUrl());
				return new ResponseEntity<>(gImageRepository.save(vImage), HttpStatus.OK);
			} catch (Exception e) {
				return ResponseEntity.unprocessableEntity()
						.body("Failed to Insert specified Image: " + e.getCause().getCause().getMessage());
			}
		} else {
			return new ResponseEntity<>(null, HttpStatus.NOT_FOUND);
		}
	}
}
