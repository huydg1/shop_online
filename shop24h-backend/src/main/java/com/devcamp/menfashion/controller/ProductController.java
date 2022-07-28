package com.devcamp.menfashion.controller;

import java.math.BigDecimal;
import java.util.*;

import javax.validation.Valid;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.http.*;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import com.devcamp.menfashion.model.Category;
import com.devcamp.menfashion.model.Color;
import com.devcamp.menfashion.model.ErrorData;
import com.devcamp.menfashion.model.ExistsData;
import com.devcamp.menfashion.model.Material;
import com.devcamp.menfashion.model.Product;
import com.devcamp.menfashion.repository.ICategoryRepository;
import com.devcamp.menfashion.repository.IColorRepository;
import com.devcamp.menfashion.repository.IMaterialRepository;
import com.devcamp.menfashion.repository.IProductRepository;

@RestController
@CrossOrigin
@RequestMapping("/")
public class ProductController {
	private static final String ERROR = "Error";

	@Autowired
	IProductRepository gProductRepository;

	@Autowired
	ICategoryRepository gCategoryRepository;

	@Autowired
	IMaterialRepository gMaterialRepository;

	@Autowired
	IColorRepository gColorRepository;

	/**
	 * function get list product by categoryId and colorId
	 * 
	 * @param categoryId
	 * @param colorId
	 * @return list product
	 */
	@GetMapping("/products")
	public ResponseEntity<List<Product>> getProducts(
			@RequestParam(value = "categoryId", required = false, defaultValue = "0") Long categoryId,
			@RequestParam(value = "colorId", required = false, defaultValue = "0") Long colorId) {
		try {
			List<Product> vProducts = new ArrayList<Product>();
			if (categoryId == 0 && colorId == 0) {
				gProductRepository.findAll().forEach(vProducts::add);
			}
			if (categoryId != 0 && colorId == 0) {
				gProductRepository.findByCategoryId(categoryId).forEach(vProducts::add);
			}
			if (colorId != 0 && categoryId == 0) {
				gProductRepository.findByColorId(colorId).forEach(vProducts::add);
			}
			if (categoryId != 0 && colorId != 0) {
				gProductRepository.findByColorIdAndCategoryId(colorId, categoryId).forEach(vProducts::add);
			}
			return new ResponseEntity<>(vProducts, HttpStatus.OK);
		} catch (Exception e) {
			return new ResponseEntity<>(null, HttpStatus.INTERNAL_SERVER_ERROR);
		}
	}

	/**
	 * function get list product by productName or price or category
	 * 
	 * @param page        user input
	 * @param productName user input
	 * @param priceMin    user input
	 * @param priceMax    user input
	 * @param category    user input
	 * @return list product filter
	 */
	@GetMapping("/products/filter")
	public ResponseEntity<Page<Product>> getProductsFilter(
			@RequestParam(name = "page", required = false, defaultValue = "0") Integer page,
			@RequestParam(value = "productName", required = false, defaultValue = "") String productName,
			@RequestParam(value = "priceMin", required = false, defaultValue = "") BigDecimal priceMin,
			@RequestParam(value = "priceMax", required = false, defaultValue = "") BigDecimal priceMax,
			@RequestParam(value = "category", required = false, defaultValue = "0") Long category) {
		try {
			Page<Product> vProducts = null;
			// TH1: No filter
			if (productName == null && category == 0 && priceMin == null && priceMax == null) {
				vProducts = gProductRepository.findAll(PageRequest.of(page, 6, Sort.by(Sort.Direction.DESC, "id")));
			}
			// TH2: filter productName
			if (productName != null) {
				vProducts = gProductRepository.findByProductName(productName,
						PageRequest.of(page, 6, Sort.by(Sort.Direction.DESC, "id")));
			}
			// TH3: filter productName and price
			if (productName != null && priceMin != null && priceMax != null) {
				vProducts = gProductRepository.findByProductNameAndPrice(productName, priceMin, priceMax,
						PageRequest.of(page, 6, Sort.by(Sort.Direction.DESC, "id")));
			}
			// TH4: filter productName and category
			if (productName != null && category != 0) {
				vProducts = gProductRepository.findByProductNameAndCategory(productName, category,
						PageRequest.of(page, 6, Sort.by(Sort.Direction.DESC, "id")));
			}
			// TH4: filter price and category
			if (priceMin != null && priceMax != null && category != 0) {
				vProducts = gProductRepository.findByCategoryAndPrice(category, priceMin, priceMax,
						PageRequest.of(page, 6, Sort.by(Sort.Direction.DESC, "id")));
			}
			// TH5: filter all
			if (productName != null && category != 0 && priceMin != null && priceMax != null) {
				vProducts = gProductRepository.findByProductNameAndCategoryAndPrice(productName, category, priceMin,
						priceMax, PageRequest.of(page, 6, Sort.by(Sort.Direction.DESC, "id")));
			}
			return new ResponseEntity<>(vProducts, HttpStatus.OK);
		} catch (Exception e) {
			return new ResponseEntity<>(null, HttpStatus.INTERNAL_SERVER_ERROR);
		}
	}

	/**
	 * function get info product by id
	 * 
	 * @param id user input
	 * @return info product
	 */
	@GetMapping("/products/{id}")
	public ResponseEntity<Product> getProductById(@PathVariable Long id) {
		Optional<Product> vProductData = gProductRepository.findById(id);
		if (vProductData.isPresent()) {
			try {
				Product vProduct = vProductData.get();
				return new ResponseEntity<>(vProduct, HttpStatus.OK);
			} catch (Exception e) {
				return new ResponseEntity<>(null, HttpStatus.INTERNAL_SERVER_ERROR);
			}
		} else {
			return new ResponseEntity<>(null, HttpStatus.NOT_FOUND);
		}
	}

	/**
	 * function check exists productCode
	 * 
	 * @param productCode user input
	 * @return true if exists, else return false
	 */
	@GetMapping("/products/exists/{productCode}")
	public ResponseEntity<Object> isExistsByProductCode(@PathVariable String productCode) {
		try {
			boolean vProductCode = gProductRepository.existsByProductCode(productCode);
			ExistsData vExistsData = new ExistsData();
			if (vProductCode) {
				vExistsData.setName(productCode);
				vExistsData.setExists(true);
			} else {
				vExistsData.setName(productCode);
				vExistsData.setExists(false);
			}
			return new ResponseEntity<>(vExistsData, HttpStatus.OK);
		} catch (Exception e) {
			return new ResponseEntity<>(null, HttpStatus.INTERNAL_SERVER_ERROR);
		}
	}

	/**
	 * function check exists id and productCode
	 * 
	 * @param id          user input
	 * @param productCode user input
	 * @return true if exists, else return false (ignore yourself)
	 */
	@GetMapping("/products/exists/{id}/{productCode}")
	public ResponseEntity<Object> isExistsByIdAndProductCode(@PathVariable Long id, @PathVariable String productCode) {
		try {
			Optional<Product> vProduct = gProductRepository.findByIdAndProductCode(id, productCode);
			ExistsData vExistsData = new ExistsData();
			if (vProduct.isPresent()) {
				vExistsData.setName(productCode);
				vExistsData.setExists(true);
			} else {
				vExistsData.setName(productCode);
				vExistsData.setExists(false);
			}
			return new ResponseEntity<>(vExistsData, HttpStatus.OK);
		} catch (Exception e) {
			return new ResponseEntity<>(null, HttpStatus.INTERNAL_SERVER_ERROR);
		}
	}

	/**
	 * function create product
	 * 
	 * @param categoryId   user input
	 * @param materialId   user input
	 * @param colorId      user input
	 * @param paramProduct user input
	 * @return info product insert success
	 */
	@PostMapping("/products/{categoryId}/{materialId}/{colorId}")
	@PreAuthorize("hasAnyRole('ROLE_STAFF', 'ROLE_ADMIN')")
	public ResponseEntity<Object> createProduct(@PathVariable Long categoryId, @PathVariable Long materialId,
			@PathVariable Long colorId, @Valid @RequestBody Product paramProduct) {
		Optional<Category> vCategoryData = gCategoryRepository.findById(categoryId);
		Optional<Material> vMaterialData = gMaterialRepository.findById(materialId);
		Optional<Color> vColorData = gColorRepository.findById(colorId);

		if (vCategoryData.isPresent() && vMaterialData.isPresent() && vColorData.isPresent()) {
			try {
				Product vProduct = new Product();
				vProduct.setProductCode(paramProduct.getProductCode());
				vProduct.setProductName(paramProduct.getProductName());
				vProduct.setColor(vColorData.get());
				vProduct.setCategory(vCategoryData.get());
				vProduct.setMaterial(vMaterialData.get());
				vProduct.setPrice(paramProduct.getPrice());
				vProduct.setPriceDiscount(paramProduct.getPriceDiscount());
				vProduct.setQuantityInStock(paramProduct.getQuantityInStock());
				vProduct.setImageUrl(paramProduct.getImageUrl());
				return new ResponseEntity<>(gProductRepository.save(vProduct), HttpStatus.OK);
			} catch (Exception e) {
				return ResponseEntity.unprocessableEntity()
						.body("Failed to Insert specified Product: " + e.getCause().getCause().getMessage());
			}
		} else {
			return new ResponseEntity<>(null, HttpStatus.NOT_FOUND);
		}
	}

	/**
	 * function update info product
	 * 
	 * @param id           user input
	 * @param categoryId   user input
	 * @param materialId   user input
	 * @param colorId      user input
	 * @param paramProduct user input
	 * @return info product update successF
	 */
	@PutMapping("/products/{id}/{categoryId}/{materialId}/{colorId}")
	@PreAuthorize("hasAnyRole('ROLE_STAFF', 'ROLE_ADMIN')")
	public ResponseEntity<Object> updateProduct(@PathVariable Long id, @PathVariable Long categoryId,
			@PathVariable Long materialId, @PathVariable Long colorId, @Valid @RequestBody Product paramProduct) {
		Optional<Product> vProductData = gProductRepository.findById(id);
		Optional<Category> vCategoryData = gCategoryRepository.findById(categoryId);
		Optional<Material> vMaterialData = gMaterialRepository.findById(materialId);
		Optional<Color> vColorData = gColorRepository.findById(colorId);
		if (vProductData.isPresent() && vCategoryData.isPresent() && vMaterialData.isPresent()
				&& vColorData.isPresent()) {
			try {
				Product vProduct = vProductData.get();
				vProduct.setProductCode(paramProduct.getProductCode());
				vProduct.setProductName(paramProduct.getProductName());
				vProduct.setColor(vColorData.get());
				vProduct.setCategory(vCategoryData.get());
				vProduct.setMaterial(vMaterialData.get());
				vProduct.setPrice(paramProduct.getPrice());
				vProduct.setPriceDiscount(paramProduct.getPriceDiscount());
				vProduct.setQuantityInStock(paramProduct.getQuantityInStock());
				vProduct.setImageUrl(paramProduct.getImageUrl());
				return new ResponseEntity<>(gProductRepository.save(vProduct), HttpStatus.OK);
			} catch (Exception e) {
				return ResponseEntity.unprocessableEntity()
						.body("Failed to Update specified Product: " + e.getCause().getCause().getMessage());
			}
		} else {
			return new ResponseEntity<>(null, HttpStatus.NOT_FOUND);
		}
	}

	/**
	 * function delete product
	 * 
	 * @param id user input
	 * @return delete success, show error if have transaction
	 */
	@DeleteMapping("/products/{id}")
	@PreAuthorize("hasAnyRole('ROLE_STAFF', 'ROLE_ADMIN')")
	public ResponseEntity<Object> deleteProduct(@PathVariable Long id) {
		try {
			Optional<Product> vProductData = gProductRepository.findById(id);
			if (vProductData.isPresent()) {
				gProductRepository.deleteById(id);
				return new ResponseEntity<>(null, HttpStatus.NO_CONTENT);
			} else {
				return new ResponseEntity<>(null, HttpStatus.NOT_FOUND);
			}
		} catch (Exception e) {
			ErrorData vErrorData = new ErrorData();
			vErrorData.setStatus(ERROR);
			vErrorData.setNotification("Không thể xóa sản phẩm mã: " + id + " vì đã có giao dịch");
			return new ResponseEntity<>(vErrorData, HttpStatus.UNPROCESSABLE_ENTITY);
		}

	}

}
