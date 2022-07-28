package com.devcamp.menfashion.controller;

import java.io.IOException;
import java.text.DateFormat;
import java.text.SimpleDateFormat;
import java.util.*;

import javax.servlet.http.HttpServletResponse;
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
import com.devcamp.menfashion.service.DateExcelExporter;
import com.devcamp.menfashion.service.MonthExcelExporter;
import com.devcamp.menfashion.service.WeekExcelExporter;

@RestController
@CrossOrigin
@RequestMapping("/")
public class OrderController {

	@Autowired
	IOrderRepository gOrderRepository;

	@Autowired
	IUserRepositoty gUserRepositoty;

	@Autowired
	IStatusRepository gStatusRepository;

	/**
	 * function get list order sort des
	 * 
	 * @param page is number user select
	 * @return list order with paging
	 */
	@GetMapping("/orders")
	@PreAuthorize("hasAnyRole('ROLE_ADMIN', 'ROLE_STAFF')")
	public ResponseEntity<Page<IOrder>> getOrders(
			@RequestParam(name = "page", required = false, defaultValue = "0") Integer page,
			@RequestParam(value = "fullName", required = false, defaultValue = "") String fullName,
			@RequestParam(value = "phone", required = false, defaultValue = "") String phone,
			@RequestParam(value = "orderDate", required = false, defaultValue = "") String orderDate,
			@RequestParam(value = "statusId", required = false, defaultValue = "0") Long statusId) {
		try {
			Page<IOrder> vOrders = null;
			// TH1: status = 0
			if (statusId == 0) {
				vOrders = gOrderRepository.findByFullNameAndPhoneAndOrderDate(fullName, phone, orderDate,
						PageRequest.of(page, 6, Sort.by(Sort.Direction.DESC, "id")));
			}
			// TH2: status <> 0
			if (statusId != 0) {
				vOrders = gOrderRepository.findByFullNameAndPhoneAndOrderDateAndStatusId(fullName, phone, orderDate,
						statusId, PageRequest.of(page, 6, Sort.by(Sort.Direction.DESC, "id")));
			}
			return new ResponseEntity<>(vOrders, HttpStatus.OK);
		} catch (Exception e) {
			return new ResponseEntity<>(null, HttpStatus.INTERNAL_SERVER_ERROR);
		}
	}

	/**
	 * function get list order of user
	 * 
	 * @param userId user input
	 * @return list order by user
	 */
	@GetMapping("/orders/history/{userId}")
	@PreAuthorize("hasAnyRole('ROLE_CUSTOMER', 'ROLE_STAFF', 'ROLE_ADMIN')")
	public ResponseEntity<Page<IOrderByUser>> getOrdersByUserId(@PathVariable Long userId, @RequestParam Integer page) {
		try {
			Page<IOrderByUser> vOrderByUsers = gOrderRepository.findOrderByUserId(userId,
					PageRequest.of(page, 5, Sort.by(Sort.Direction.DESC, "id")));
			return new ResponseEntity<>(vOrderByUsers, HttpStatus.OK);
		} catch (Exception e) {
			return new ResponseEntity<>(null, HttpStatus.INTERNAL_SERVER_ERROR);
		}
	}

	/**
	 * function create order
	 * 
	 * @param userId   user input
	 * @param statusId user input
	 * @param pOrder   user input
	 * @return create order success
	 */
	@SuppressWarnings("deprecation")
	@PostMapping("/orders/{userId}/{statusId}")
	public ResponseEntity<Object> createOrder(@PathVariable Long userId, @PathVariable Long statusId,
			@Valid @RequestBody Order pOrder) {
		try {
			Optional<User> vUserData = gUserRepositoty.findById(userId);
			if (vUserData.isPresent()) {
				Order vOrder = new Order();
				vOrder.setOrderCode(randomOrderId());
				vOrder.setOrderDate(new Date());
				Date vDate = new Date();
				vDate.setDate(vDate.getDate() + 5);
				vOrder.setExpectedShippedDate(vDate);
				vOrder.setVoucherCode(pOrder.getVoucherCode());
				vOrder.setDiscount(pOrder.getDiscount());
				vOrder.setPriceShipped(pOrder.getPriceShipped());
				vOrder.setNote(pOrder.getNote());
				Optional<Status> vStatus = gStatusRepository.findById(statusId);
				vOrder.setStatus(vStatus.get());
				vOrder.setUser(vUserData.get());
				Order vOrderSave = gOrderRepository.save(vOrder);
				return new ResponseEntity<>(vOrderSave, HttpStatus.CREATED);
			} else {
				User vUserNull = new User();
				return new ResponseEntity<>(vUserNull, HttpStatus.NOT_FOUND);
			}
		} catch (Exception e) {
			return ResponseEntity.unprocessableEntity()
					.body("Failed to Insert specified Order: " + e.getCause().getCause().getMessage());
		}

	}

	/**
	 * function set random order code
	 * 
	 * @return code random
	 */
	public String randomOrderId() {
		int leftLimit = 97; // letter 'a'
		int rightLimit = 122; // letter 'z'
		int targetStringLength = 10;
		Random random = new Random();
		StringBuilder buffer = new StringBuilder(targetStringLength);
		for (int i = 0; i < targetStringLength; i++) {
			int randomLimitedInt = leftLimit + (int) (random.nextFloat() * (rightLimit - leftLimit + 1));
			buffer.append((char) randomLimitedInt);
		}
		String generatedString = buffer.toString().toUpperCase();
		return generatedString;
	}

	/**
	 * function update status order
	 * 
	 * @param id       user select
	 * @param userId   user input
	 * @param statusId user input
	 * @param pOrder   user input
	 * @return update status order success
	 */
	@PutMapping("/orders/{id}/{statusId}")
	@PreAuthorize("hasAnyRole('ROLE_ADMIN', 'ROLE_STAFF')")
	public ResponseEntity<Object> updateOrder(@PathVariable Long id, @PathVariable Long statusId,
			@Valid @RequestBody Order pOrder) {
		try {
			Optional<Order> vOrderData = gOrderRepository.findById(id);
			if (vOrderData.isPresent()) {
				Order vOrder = vOrderData.get();
				Optional<Status> vStatus = gStatusRepository.findById(statusId);
				vOrder.setStatus(vStatus.get());
				Order vOrderSave = gOrderRepository.save(vOrder);
				return new ResponseEntity<>(vOrderSave, HttpStatus.OK);
			} else {
				Order vOrderNull = new Order();
				return new ResponseEntity<>(vOrderNull, HttpStatus.NOT_FOUND);
			}
		} catch (

		Exception e) {
			return ResponseEntity.unprocessableEntity()
					.body("Failed to Update specified Order: " + e.getCause().getCause().getMessage());
		}
	}

	/**
	 * function get info orderby id
	 * 
	 * @param id user input
	 * @return info order
	 */
	@GetMapping("/orders/{id}")
	public ResponseEntity<Object> getOrderById(@PathVariable Long id) {
		try {
			Optional<Order> vOrderData = gOrderRepository.findById(id);
			if (vOrderData.isPresent()) {
				Order vOrder = vOrderData.get();
				return new ResponseEntity<>(vOrder, HttpStatus.OK);
			} else {
				Order vOrderNull = new Order();
				return new ResponseEntity<>(vOrderNull, HttpStatus.NOT_FOUND);
			}

		} catch (Exception e) {
			return new ResponseEntity<>(null, HttpStatus.INTERNAL_SERVER_ERROR);
		}
	}

	/**
	 * function report revenue by date min và max
	 * 
	 * @param dateMin user input
	 * @param dateMax user input
	 * @return list revenue from date min và max
	 */
	@GetMapping("/orders/report/date")
	@PreAuthorize("hasAnyRole('ROLE_ADMIN', 'ROLE_STAFF')")
	public ResponseEntity<List<IDateReport>> getOrderDaterange(
			@RequestParam(value = "dateMin", required = false) String dateMin,
			@RequestParam(value = "dateMax", required = false) String dateMax) {
		try {
			return new ResponseEntity<>(gOrderRepository.reportOrderDate(dateMin, dateMax), HttpStatus.OK);
		} catch (Exception e) {
			return new ResponseEntity<>(null, HttpStatus.INTERNAL_SERVER_ERROR);
		}
	}

	/**
	 * function report revenue by week
	 * 
	 * @return list revenue by week
	 */
	@GetMapping("/orders/report/week")
	@PreAuthorize("hasAnyRole('ROLE_ADMIN', 'ROLE_STAFF')")
	public ResponseEntity<List<IWeekReport>> getOrderWeek(
			@RequestParam(value = "dateMin", required = false) String dateMin,
			@RequestParam(value = "dateMax", required = false) String dateMax) {
		try {
			return new ResponseEntity<>(gOrderRepository.reportOrderWeek(dateMin, dateMax), HttpStatus.OK);
		} catch (Exception e) {
			return new ResponseEntity<>(null, HttpStatus.INTERNAL_SERVER_ERROR);
		}
	}

	/**
	 * function report revenue by month
	 * 
	 * @return list revenue by month
	 */
	@GetMapping("/orders/report/month")
	@PreAuthorize("hasAnyRole('ROLE_ADMIN', 'ROLE_STAFF')")
	public ResponseEntity<List<IMonthReport>> getOrderMonth(
			@RequestParam(value = "dateMin", required = false) String dateMin,
			@RequestParam(value = "dateMax", required = false) String dateMax) {
		try {
			return new ResponseEntity<>(gOrderRepository.reportOrderMonth(dateMin, dateMax), HttpStatus.OK);
		} catch (Exception e) {
			return new ResponseEntity<>(null, HttpStatus.INTERNAL_SERVER_ERROR);
		}
	}

	/**
	 * function export excel report revenue by date min và max
	 * 
	 * @param dateMin  user input
	 * @param dateMax  user input
	 * @param response
	 * @throws IOException
	 */
	@GetMapping("/orders/export/excel/date")
	public void exportDateToExcel(@RequestParam(value = "dateMin", required = false) String dateMin,
			@RequestParam(value = "dateMax", required = false) String dateMax, HttpServletResponse response)
			throws IOException {
		response.setContentType("application/octet-stream");

		DateFormat vDateFormatter = new SimpleDateFormat("yyyy-MM-dd_HH:mm:ss");
		String vCurrentDateTime = vDateFormatter.format(new Date());

		String vHeaderKey = "Content-Disposition";
		String vHeaderValue = "attachment; filename=orders" + vCurrentDateTime + ".xlsx";
		response.setHeader(vHeaderKey, vHeaderValue);

		List<IDateReport> vReports = new ArrayList<IDateReport>();
		gOrderRepository.reportOrderDate(dateMin, dateMax).forEach(vReports::add);

		DateExcelExporter vDateExcelExporter = new DateExcelExporter(vReports);
		vDateExcelExporter.export(response);
	}

	/**
	 * function export excel report revenue by week
	 * 
	 * @param response
	 * @throws IOException
	 */
	@GetMapping("/orders/export/excel/week")
	public void exportWeekToExcel(@RequestParam(value = "dateMin", required = false) String dateMin,
			@RequestParam(value = "dateMax", required = false) String dateMax, HttpServletResponse response)
			throws IOException {
		response.setContentType("application/octet-stream");

		DateFormat vDateFormatter = new SimpleDateFormat("yyyy-MM-dd_HH:mm:ss");
		String vCurrentDateTime = vDateFormatter.format(new Date());

		String vHeaderKey = "Content-Disposition";
		String vHeaderValue = "attachment; filename=orders" + vCurrentDateTime + ".xlsx";
		response.setHeader(vHeaderKey, vHeaderValue);

		List<IWeekReport> vReports = new ArrayList<IWeekReport>();
		gOrderRepository.reportOrderWeek(dateMin, dateMax).forEach(vReports::add);

		WeekExcelExporter weekExcelExporter = new WeekExcelExporter(vReports);
		weekExcelExporter.export(response);
	}

	/**
	 * function export excel report revenue by month
	 * 
	 * @param response
	 * @throws IOException
	 */
	@GetMapping("/orders/export/excel/month")
	public void exportMonthToExcel(@RequestParam(value = "dateMin", required = false) String dateMin,
			@RequestParam(value = "dateMax", required = false) String dateMax, HttpServletResponse response)
			throws IOException {
		response.setContentType("application/octet-stream");

		DateFormat vDateFormatter = new SimpleDateFormat("yyyy-MM-dd_HH:mm:ss");
		String vCurrentDateTime = vDateFormatter.format(new Date());

		String vHeaderKey = "Content-Disposition";
		String vHeaderValue = "attachment; filename=orders" + vCurrentDateTime + ".xlsx";
		response.setHeader(vHeaderKey, vHeaderValue);

		List<IMonthReport> vReports = new ArrayList<IMonthReport>();
		gOrderRepository.reportOrderMonth(dateMin, dateMax).forEach(vReports::add);

		MonthExcelExporter monthExcelExporter = new MonthExcelExporter(vReports);
		monthExcelExporter.export(response);
	}

}
