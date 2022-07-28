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
public class OrderDetailsController {
	@Autowired
	IOrderDetailsRepository gOrderDetailsRepository;

	@Autowired
	IOrderRepository gOrderRepository;

	@Autowired
	IProductRepository gProductRepository;

	/**
	 * Hàm lấy danh sách order detail by orderId
	 * 
	 * @param orderId
	 * @return
	 */
	@GetMapping("/order-details/{orderId}")
	public ResponseEntity<List<OrderDetails>> getOrderDetailsByOrderId(@PathVariable Long orderId) {
		try {
			List<OrderDetails> vOrderDetails = new ArrayList<OrderDetails>();
			gOrderDetailsRepository.findByOrderId(orderId).forEach(vOrderDetails::add);
			return new ResponseEntity<>(vOrderDetails, HttpStatus.OK);
		} catch (Exception e) {
			return new ResponseEntity<>(null, HttpStatus.INTERNAL_SERVER_ERROR);
		}
	}

	/**
	 * Hàm thêm một order detail mới
	 * 
	 * @param orderId       server trả về cho người dùng chọn
	 * @param productId     người dùng chọn
	 * @param pOrderDetails người dùng nhập
	 * @return order detail thêm thành công
	 */
	@PostMapping("/order-details/{orderId}/{productId}")
	public ResponseEntity<Object> createOrderDetails(@PathVariable Long orderId, @PathVariable Long productId,
			@Valid @RequestBody OrderDetails pOrderDetails) {
		Optional<Order> vOrder = gOrderRepository.findById(orderId);
		Optional<Product> vProduct = gProductRepository.findById(productId);
		if (vOrder.isPresent()) {
			if (vProduct.isPresent()) {
				try {
					OrderDetails vOrderDetails = new OrderDetails();
					vOrderDetails.setProduct(vProduct.get());
					vOrderDetails.setOrder(vOrder.get());
					vOrderDetails.setQuantityOrder(pOrderDetails.getQuantityOrder());
					vOrderDetails.setPriceEach(pOrderDetails.getPriceEach());
					OrderDetails vOrderDetailsSave = gOrderDetailsRepository.save(vOrderDetails);
					return new ResponseEntity<>(vOrderDetailsSave, HttpStatus.CREATED);
				} catch (Exception e) {
					return ResponseEntity.unprocessableEntity()
							.body("Failed to Insert specified Order detail: " + e.getCause().getCause().getMessage());
				}
			} else {
				Product vProductNull = new Product();
				return new ResponseEntity<>(vProductNull, HttpStatus.NOT_FOUND);
			}
		} else {
			Order vOrderNull = new Order();
			return new ResponseEntity<>(vOrderNull, HttpStatus.NOT_FOUND);
		}
	}

	/**
	 * Hàm cập nhật tồn kho của sản phầm khi xác nhận đơn hàng
	 * 
	 * @param orderId người dùng nhập
	 * @return xác nhận tồn kho đã trừ
	 */
	@PutMapping("/order-details/{orderId}")
	public ResponseEntity<List<OrderDetails>> minusQuantityInStock(@PathVariable Long orderId) {
		try {
			List<OrderDetails> vOrderDetailsData = gOrderDetailsRepository.findByOrderId(orderId);
			for (OrderDetails orderDetails : vOrderDetailsData) {
				Optional<Product> vProductData = gProductRepository.findById(orderDetails.getIdProduct());
				Product vProduct = vProductData.get();
				vProduct.setQuantityInStock(vProductData.get().getQuantityInStock() - orderDetails.getQuantityOrder());
				gProductRepository.save(vProduct);
			}
			return new ResponseEntity<>(vOrderDetailsData, HttpStatus.OK);
		} catch (Exception e) {
			return new ResponseEntity<>(null, HttpStatus.INTERNAL_SERVER_ERROR);
		}

	}

	/**
	 * Hàm get info chi tiết của 1 order khi biết orderCode
	 * 
	 * @param orderId server trả về và người dùng gửi đi
	 * @return list một order chi tiết
	 */
	@GetMapping("/order-details/success/{orderCode}")
	public ResponseEntity<List<IOrderDetailByOrder>> getOrderSuccess(@PathVariable String orderCode) {
		try {
			return new ResponseEntity<>(gOrderDetailsRepository.findOrderByOrderCode(orderCode), HttpStatus.OK);
		} catch (Exception e) {
			return new ResponseEntity<>(null, HttpStatus.INTERNAL_SERVER_ERROR);
		}
	}
	
	/**
	 * Hàm get info chi tiết của 1 order khi biết orderCode
	 * 
	 * @param orderId server trả về và người dùng gửi đi
	 * @return list một order chi tiết
	 */
	@GetMapping("/order-details/history/{orderCode}")
	@PreAuthorize("hasAnyRole('ROLE_CUSTOMER', 'ROLE_STAFF', 'ROLE_ADMIN')")
	public ResponseEntity<List<IOrderDetailByOrder>> getOrderHistory(@PathVariable String orderCode) {
		try {
			return new ResponseEntity<>(gOrderDetailsRepository.findOrderByOrderCode(orderCode), HttpStatus.OK);
		} catch (Exception e) {
			return new ResponseEntity<>(null, HttpStatus.INTERNAL_SERVER_ERROR);
		}
	}

}
