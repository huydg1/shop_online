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

import com.devcamp.menfashion.model.*;
import com.devcamp.menfashion.repository.*;

@RestController
@CrossOrigin
@RequestMapping("/")
public class RateController {

	private static final String ERROR = "Error";
	private static final long CHUA_DUYET = 1;
	private static final long DUOC_DUYET = 2;

	@Autowired
	IRateRepository gRateRepository;

	@Autowired
	IUserRepositoty gUserRepositoty;

	@Autowired
	IProductRepository gProductRepository;

	@Autowired
	IStatusRateRepository gStatusRateRepository;

	/**
	 * Hàm tính điểm đánh giá trung bình của một sản phẩm
	 * 
	 * @param producId user input
	 * @return điểm trung bình đánh giá của sản phẩm được chọn
	 */
	@GetMapping("/rates/product/avg/{producId}")
	public ResponseEntity<BigDecimal> avgRateByProductId(@PathVariable BigDecimal producId) {
		try {
			BigDecimal vAvgRate = gRateRepository.avgRateByProductId(producId);
			return new ResponseEntity<>(vAvgRate, HttpStatus.OK);
		} catch (Exception e) {
			return new ResponseEntity<>(null, HttpStatus.INTERNAL_SERVER_ERROR);
		}
	}

	/**
	 * Hàm lấy danh sách rate by productId
	 * 
	 * @param producId user input
	 * @param page     user input
	 * @return list rate by productId
	 */
	@GetMapping("/rates/product/{producId}")
	public ResponseEntity<Page<Rate>> getRatesByProductId(@PathVariable Long producId, @RequestParam Integer page) {
		try {
			Page<Rate> vRates = gRateRepository.findByProductId(producId,
					PageRequest.of(page, 10, Sort.by(Sort.Direction.DESC, "id")));
			return new ResponseEntity<>(vRates, HttpStatus.OK);
		} catch (Exception e) {
			return new ResponseEntity<>(null, HttpStatus.INTERNAL_SERVER_ERROR);
		}
	}

	/**
	 * function get list rate by userId
	 * 
	 * @param userId user input
	 * @param page   user input
	 * @return list rate by userId
	 */
	@GetMapping("/rates/{userId}")
	@PreAuthorize("hasAnyRole('ROLE_CUSTOMER', 'ROLE_ADMIN', 'ROLE_STAFF')")
	public ResponseEntity<Page<IRateByUser>> getRatebyUserId(@PathVariable Long userId, @RequestParam Integer page) {
		try {
			Page<IRateByUser> vRates = gRateRepository.findByUserId(userId,
					PageRequest.of(page, 5, Sort.by(Sort.Direction.DESC, "id")));
			return new ResponseEntity<>(vRates, HttpStatus.OK);
		} catch (Exception e) {
			return new ResponseEntity<>(null, HttpStatus.INTERNAL_SERVER_ERROR);
		}
	}

	/**
	 * function get list rate by filter productName, status rate
	 * 
	 * @param page        user input
	 * @param productName user input
	 * @param statusId    user input
	 * @return list rate
	 */
	@GetMapping("/rates")
	@PreAuthorize("hasAnyRole('ROLE_ADMIN', 'ROLE_STAFF')")
	public ResponseEntity<Page<Rate>> getRates(
			@RequestParam(name = "page", required = false, defaultValue = "0") Integer page,
			@RequestParam(value = "productName", required = false, defaultValue = "") String productName,
			@RequestParam(value = "statusId", required = false, defaultValue = "0") Long statusId) {
		try {
			Page<Rate> vRates = null;
			if (productName == null && statusId == 0) {
				vRates = gRateRepository.findAll(PageRequest.of(page, 5, Sort.by(Sort.Direction.DESC, "id")));
			}
			if (productName != null && statusId == 0) {
				vRates = gRateRepository.findByProductName(productName,
						PageRequest.of(page, 5, Sort.by(Sort.Direction.DESC, "id")));
			}
			if (productName != null && statusId != 0) {
				vRates = gRateRepository.findByProductNameAndStatusId(productName, statusId,
						PageRequest.of(page, 5, Sort.by(Sort.Direction.DESC, "id")));
			}
			return new ResponseEntity<>(vRates, HttpStatus.OK);
		} catch (Exception e) {
			return new ResponseEntity<>(null, HttpStatus.INTERNAL_SERVER_ERROR);
		}
	}

	/**
	 * function create rate by customer
	 * 
	 * @param userId    user input
	 * @param productId user input
	 * @param pRate     user input
	 * @return create rate success
	 */
	@PostMapping("/rates/{userId}/{productId}")
	@PreAuthorize("hasAnyRole('ROLE_CUSTOMER')")
	public ResponseEntity<Object> createRate(@PathVariable Long userId, @PathVariable Long productId,
			@Valid @RequestBody Rate pRate) {
		try {
			Optional<User> vOptionalUser = gUserRepositoty.findById(userId);
			Optional<Product> vOptionalProduct = gProductRepository.findById(productId);
			if (vOptionalUser.isPresent() || vOptionalProduct.isPresent()) {
				Rate vRate = new Rate();
				vRate.setCommentDate(new Date());
				vRate.setComment(pRate.getComment());
				vRate.setRate(pRate.getRate());
				vRate.setProduct(vOptionalProduct.get());
				vRate.setUser(vOptionalUser.get());
				Optional<StatusRate> vOptional = gStatusRateRepository.findById(CHUA_DUYET);
				vRate.setStatusRate(vOptional.get());
				Rate vRateSave = gRateRepository.save(vRate);
				return new ResponseEntity<>(vRateSave, HttpStatus.CREATED);
			} else {
				return new ResponseEntity<>(null, HttpStatus.NOT_FOUND);
			}

		} catch (Exception e) {
			return new ResponseEntity<>(e.getCause().getCause().getMessage(), HttpStatus.INTERNAL_SERVER_ERROR);
		}
	}

	/**
	 * function update rate by customer
	 * 
	 * @param id    user input
	 * @param pRate user input
	 * @return update rate success
	 */
	@PutMapping("/rates/{id}")
	@PreAuthorize("hasAnyRole('ROLE_CUSTOMER')")
	public ResponseEntity<Object> updateRate(@PathVariable Long id, @Valid @RequestBody Rate pRate) {
		try {
			Optional<Rate> vOptionalRate = gRateRepository.findById(id);
			if (vOptionalRate.isPresent()) {
				Rate vRate = vOptionalRate.get();
				vRate.setCommentDate(new Date());
				vRate.setComment(pRate.getComment());
				vRate.setRate(pRate.getRate());
				vRate.setStatusRate(vOptionalRate.get().getStatusRate());
				Rate vRateSave = gRateRepository.save(vRate);
				return new ResponseEntity<>(vRateSave, HttpStatus.OK);
			} else {
				return new ResponseEntity<>(null, HttpStatus.NOT_FOUND);
			}

		} catch (Exception e) {
			return new ResponseEntity<>(e.getCause().getCause().getMessage(), HttpStatus.INTERNAL_SERVER_ERROR);
		}
	}

	/**
	 * function update status rate by admin or staff
	 * 
	 * @param id admin or staff input
	 * @return update status success
	 */
	@PutMapping("/rates/status/{id}")
	@PreAuthorize("hasAnyRole('ROLE_ADMIN', 'ROLE_STAFF')")
	public ResponseEntity<Object> updateStatusRate(@PathVariable Long id) {
		try {
			Optional<Rate> vOptionalRate = gRateRepository.findById(id);
			if (vOptionalRate.isPresent()) {
				Rate vRate = vOptionalRate.get();
				vRate.setCommentDate(vOptionalRate.get().getCommentDate());
				vRate.setComment(vOptionalRate.get().getComment());
				vRate.setRate(vOptionalRate.get().getRate());
				Optional<StatusRate> vOptional = gStatusRateRepository.findById(DUOC_DUYET);
				vRate.setStatusRate(vOptional.get());
				Rate vRateSave = gRateRepository.save(vRate);
				return new ResponseEntity<>(vRateSave, HttpStatus.OK);
			} else {
				return new ResponseEntity<>(null, HttpStatus.NOT_FOUND);
			}

		} catch (Exception e) {
			return new ResponseEntity<>(e.getCause().getCause().getMessage(), HttpStatus.INTERNAL_SERVER_ERROR);
		}
	}

	/**
	 * function delete rate by admin or staff
	 * 
	 * @param id admin or staff input
	 * @return delete success
	 */
	@DeleteMapping("/rates/{id}")
	@PreAuthorize("hasAnyRole('ROLE_ADMIN', 'ROLE_STAFF')")
	public ResponseEntity<Object> deleteRate(@PathVariable Long id) {
		try {
			Optional<Rate> vOptionalRate = gRateRepository.findById(id);
			if (vOptionalRate.isPresent()) {
				gRateRepository.deleteById(id);
				return new ResponseEntity<>(null, HttpStatus.NO_CONTENT);
			} else {
				return new ResponseEntity<>(null, HttpStatus.NOT_FOUND);
			}
		} catch (Exception e) {
			ErrorData vErrorData = new ErrorData();
			vErrorData.setStatus(ERROR);
			vErrorData.setNotification("Không thể xóa đánh giá: " + id + " vì đã được trả lời từ admin");
			return new ResponseEntity<>(vErrorData, HttpStatus.UNPROCESSABLE_ENTITY);
		}
	}
}
