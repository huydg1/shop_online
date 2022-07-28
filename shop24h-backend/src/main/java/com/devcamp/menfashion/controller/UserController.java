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
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.web.bind.annotation.*;

import com.devcamp.menfashion.model.*;
import com.devcamp.menfashion.repository.*;
import com.devcamp.menfashion.security.JwtUtil;
import com.devcamp.menfashion.security.UserPrincipal;
import com.devcamp.menfashion.service.TokenService;
import com.devcamp.menfashion.service.UserCountOrderExcelExporter;
import com.devcamp.menfashion.service.UserService;
import com.devcamp.menfashion.service.UserSumMoneyExcelExporter;

@RestController
@CrossOrigin
@RequestMapping("/")
public class UserController {
	private static final Long ROLE_CUSTOMER = (long) 3;

	@Autowired
	private UserService userService;

	@Autowired
	private TokenService tokenService;

	@Autowired
	private JwtUtil jwtUtil;

	@Autowired
	private IUserRepositoty gUserRepositoty;

	@Autowired
	private IUserRoleRepository gUserRoleRepository;

	@Autowired
	private IRoleRepository gRoleRepository;

	/**
	 * Function register user
	 * 
	 * @param pUser user input
	 * @return register user success
	 */
	@PostMapping("/register")
	public ResponseEntity<Object> register(@Valid @RequestBody User pUser) {
		try {
			// create User
			pUser.setPassword(new BCryptPasswordEncoder().encode(pUser.getPassword()));
			User vUser = userService.createUser(pUser);

			// set role user default = CUSTOMER
			Optional<User> vOptionalUser = Optional.of(vUser);
			Optional<Role> vRole = gRoleRepository.findById(ROLE_CUSTOMER);
			UserRole vUserRole = new UserRole();
			vUserRole.setUser(vOptionalUser.get());
			vUserRole.setRole(vRole.get());
			gUserRoleRepository.save(vUserRole);

			return new ResponseEntity<>(vUser, HttpStatus.CREATED);
		} catch (Exception e) {
			return ResponseEntity.unprocessableEntity()
					.body("Failed to register user: " + e.getCause().getCause().getMessage());
		}
	}

	/**
	 * Function login
	 * 
	 * @param user user input
	 * @return token if login success, else show error
	 */
	@PostMapping("/login")
	public ResponseEntity<Object> login(@RequestBody User user) {
		try {
			UserPrincipal userPrincipal = userService.findByUsername(user.getUsername());
			if (null == user || !new BCryptPasswordEncoder().matches(user.getPassword(), userPrincipal.getPassword())) {
				return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("Tài khoản hoặc mật khẩu không chính xác");
			} else {
				Token token = new Token();
				token.setToken(jwtUtil.generateToken(userPrincipal));
				token.setTokenExpDate(jwtUtil.generateExpirationDate());
				token.setCreatedBy(userPrincipal.getUserId());
				tokenService.createToken(token);
				return ResponseEntity.ok(token.getToken());
			}
		} catch (Exception e) {
			return ResponseEntity.unprocessableEntity()
					.body("Failed to login user: " + e.getCause().getCause().getMessage());
		}
	}

	/**
	 * Function change password
	 * 
	 * @param userId user when login
	 * @param pUser  user input
	 * @return change password success
	 */
	@PutMapping("/users/change-password/{userId}")
	@PreAuthorize("hasAnyAuthority('USER_UPDATE')")
	public ResponseEntity<Object> changePassword(@PathVariable Long userId, @RequestBody User pUser) {
		try {
			Optional<User> vOptionalUser = gUserRepositoty.findById(userId);
			if (vOptionalUser.isPresent()) {
				User vUser = vOptionalUser.get();
				// check pass old and new
				UserPrincipal vUserPrincipal = userService.findByUsername(vUser.getUsername());
				if (!new BCryptPasswordEncoder().matches(pUser.getPassword(), vUserPrincipal.getPassword())) {
					return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Mật khẩu cũ của bạn không chính xác");
				} else {
					vUser.setPassword(new BCryptPasswordEncoder().encode(pUser.getPasswordNew()));
				}
				User vSaveUser = gUserRepositoty.save(vUser);
				return new ResponseEntity<>(vSaveUser, HttpStatus.OK);
			} else {
				return new ResponseEntity<>(null, HttpStatus.NOT_FOUND);
			}
		} catch (Exception e) {
			return ResponseEntity.unprocessableEntity()
					.body("Failed to update password user: " + e.getCause().getCause().getMessage());
		}
	}

	/**
	 * Function get list customer (admmin and staff)
	 * 
	 * @return list customer
	 */
	@GetMapping("/users/customer")
	@PreAuthorize("hasAnyRole('ROLE_ADMIN', 'ROLE_STAFF')")
	public ResponseEntity<Page<User>> getCustomer(
			@RequestParam(name = "page", required = false, defaultValue = "0") Integer page,
			@RequestParam(value = "fullName", required = false, defaultValue = "") String fullName,
			@RequestParam(value = "phone", required = false, defaultValue = "") String phone) {
		try {
			Page<User> vUsers = gUserRepositoty.findCustomerByFullNameAndPhone(fullName, phone,
					PageRequest.of(page, 5, Sort.by(Sort.Direction.DESC, "id")));
			return new ResponseEntity<>(vUsers, HttpStatus.OK);
		} catch (Exception e) {
			return new ResponseEntity<>(null, HttpStatus.INTERNAL_SERVER_ERROR);
		}
	}

	/**
	 * Function get list user (only admin) with filter fullName or phone
	 * 
	 * @param page     user input
	 * @param fullName user input
	 * @param phone    user input
	 * @return list user
	 */
	@GetMapping("/users")
	@PreAuthorize("hasAnyRole('ROLE_ADMIN')")
	public ResponseEntity<Page<IUserRole>> getUsersByFullName2(
			@RequestParam(name = "page", required = false, defaultValue = "0") Integer page,
			@RequestParam(value = "fullName", required = false, defaultValue = "") String fullName,
			@RequestParam(value = "phone", required = false, defaultValue = "") String phone) {
		try {
			Page<IUserRole> vUsers = gUserRepositoty.findUserByFullNameAndPhone(fullName, phone,
					PageRequest.of(page, 5, Sort.by(Sort.Direction.DESC, "id")));
			return new ResponseEntity<>(vUsers, HttpStatus.OK);
		} catch (Exception e) {
			return new ResponseEntity<>(null, HttpStatus.INTERNAL_SERVER_ERROR);
		}
	}

	/**
	 * Function get info user by token when login success (ROLE_CUSTOMER,
	 * ROLE_STAFF, ROLE_ADMIN)
	 * 
	 * @return info user
	 */
	@GetMapping("/users/me")
	@PreAuthorize("hasAnyRole('ROLE_CUSTOMER', 'ROLE_STAFF', 'ROLE_ADMIN')")
	public ResponseEntity<Object> getUserMe() {
		try {
			Authentication vAuthentication = SecurityContextHolder.getContext().getAuthentication();
			UserPrincipal vUserPrincipal = (UserPrincipal) vAuthentication.getPrincipal();
			Optional<User> vUser = gUserRepositoty.findById(vUserPrincipal.getUserId());
			if (vUser.isPresent()) {
				return new ResponseEntity<>(vUser.get(), HttpStatus.OK);
			} else {
				User vUserNull = new User();
				return new ResponseEntity<>(vUserNull, HttpStatus.NOT_FOUND);
			}
		} catch (Exception e) {
			return new ResponseEntity<>(null, HttpStatus.INTERNAL_SERVER_ERROR);
		}
	}

	/**
	 * Function check exists phone (any one)
	 * 
	 * @param phone user input
	 * @return true if exists, else return false
	 */
	@GetMapping("/users/exists/phone/{phone}")
	public ResponseEntity<Object> isExistsByPphone(@PathVariable String phone) {
		try {
			boolean vPhone = gUserRepositoty.existsByPhone(phone);
			ExistsData vExistsData = new ExistsData();
			if (vPhone) {
				vExistsData.setName(phone);
				vExistsData.setExists(true);
			} else {
				vExistsData.setName(phone);
				vExistsData.setExists(false);
			}
			return new ResponseEntity<>(vExistsData, HttpStatus.OK);
		} catch (Exception e) {
			return new ResponseEntity<>(null, HttpStatus.INTERNAL_SERVER_ERROR);
		}
	}

	/**
	 * Function check exists id and phone (any one)
	 * 
	 * @param userId user input
	 * @param phone  user input
	 * @return true if exists, else return false (ignore yourself)
	 */
	@GetMapping("/users/exists/id-phone/{userId}/{phone}")
	public ResponseEntity<Object> isExistsByIdAndPhone(@PathVariable Long userId, @PathVariable String phone) {
		try {
			Optional<User> vUser = gUserRepositoty.findByIdAndPhone(userId, phone);
			ExistsData vExistsData = new ExistsData();
			if (vUser.isPresent()) {
				vExistsData.setName(phone);
				vExistsData.setExists(true);
			} else {
				vExistsData.setName(phone);
				vExistsData.setExists(false);
			}
			return new ResponseEntity<>(vExistsData, HttpStatus.OK);
		} catch (Exception e) {
			return new ResponseEntity<>(null, HttpStatus.INTERNAL_SERVER_ERROR);
		}
	}

	/**
	 * Function check exists email (any one)
	 * 
	 * @param email user input
	 * @return true if exists, else return false
	 */
	@GetMapping("/users/exists/email/{email}")
	public ResponseEntity<Object> isExistsByEmail(@PathVariable String email) {
		try {
			boolean vEmail = gUserRepositoty.existsByEmail(email);
			ExistsData vExistsData = new ExistsData();
			if (vEmail) {
				vExistsData.setName(email);
				vExistsData.setExists(true);
			} else {
				vExistsData.setName(email);
				vExistsData.setExists(false);
			}
			return new ResponseEntity<>(vExistsData, HttpStatus.OK);
		} catch (Exception e) {
			return new ResponseEntity<>(null, HttpStatus.INTERNAL_SERVER_ERROR);
		}
	}

	/**
	 * Function check exists id and email (any one)
	 * 
	 * @param userId user input
	 * @param email  user input
	 * @return true if exists, else return false (ignore yourself)
	 */
	@GetMapping("/users/exists/id-email/{userId}/{email}")
	public ResponseEntity<Object> isExistsByIdAndEmail(@PathVariable Long userId, @PathVariable String email) {
		try {
			Optional<User> vUser = gUserRepositoty.findByIdAndEmail(userId, email);
			ExistsData vExistsData = new ExistsData();
			if (vUser.isPresent()) {
				vExistsData.setName(email);
				vExistsData.setExists(true);
			} else {
				vExistsData.setName(email);
				vExistsData.setExists(false);
			}
			return new ResponseEntity<>(vExistsData, HttpStatus.OK);
		} catch (Exception e) {
			return new ResponseEntity<>(null, HttpStatus.INTERNAL_SERVER_ERROR);
		}
	}

	/**
	 * Function check exists email and phone (any one)
	 * 
	 * @param phone user input
	 * @param email user input
	 * @return true if exists, else return false
	 */
	@GetMapping("/users/exists/phone-email/{phone}/{email}")
	public ResponseEntity<Object> isExistsByPhoneAndEmail(@PathVariable String phone, @PathVariable String email) {
		try {
			Optional<User> vUser = gUserRepositoty.findByPhoneAndEmail(phone, email);
			ExistsData vExistsData = new ExistsData();
			if (vUser.isPresent()) {
				vExistsData.setName(email);
				vExistsData.setExists(true);
			} else {
				vExistsData.setName(email);
				vExistsData.setExists(false);
			}
			return new ResponseEntity<>(vExistsData, HttpStatus.OK);
		} catch (Exception e) {
			return new ResponseEntity<>(null, HttpStatus.INTERNAL_SERVER_ERROR);
		}
	}

	/**
	 * Function get info user by phone (anyone)
	 * 
	 * @param phone người dùng nhập
	 * @return info user
	 */
	@GetMapping("/users/info/phone/{phone}")
	public ResponseEntity<Object> getUserByPphone(@PathVariable String phone) {
		Optional<User> vUser = gUserRepositoty.findByPhone(phone);
		try {
			if (vUser.isPresent()) {
				return new ResponseEntity<>(vUser.get(), HttpStatus.OK);
			} else {
				User vUserNull = new User();
				return new ResponseEntity<>(vUserNull, HttpStatus.NOT_FOUND);
			}
		} catch (Exception e) {
			return new ResponseEntity<>(null, HttpStatus.INTERNAL_SERVER_ERROR);
		}

	}

	/**
	 * Function get info user by userId (user have permission is USER_READ)
	 * 
	 * @param userId user select
	 * @return info user
	 */
	@GetMapping("/users/info/id/{userId}")
	public ResponseEntity<Object> getUserById(@PathVariable Long userId) {
		try {
			Optional<User> vUser = gUserRepositoty.findById(userId);
			if (vUser.isPresent()) {
				return new ResponseEntity<>(vUser.get(), HttpStatus.OK);
			} else {
				User vUserNull = new User();
				return new ResponseEntity<>(vUserNull, HttpStatus.NOT_FOUND);
			}
		} catch (Exception e) {
			return new ResponseEntity<>(null, HttpStatus.INTERNAL_SERVER_ERROR);
		}
	}

	/**
	 * Funntio create user new (any one)
	 * 
	 * @param pUser any one
	 * @return info user insert success
	 */
	@PostMapping("/users")
	public ResponseEntity<Object> createCustomer(@Valid @RequestBody User pUser) {
		try {
			User vUser = new User();
			vUser.setUsername(pUser.getPhone());
			vUser.setFullName(pUser.getFullName());
			vUser.setPhone(pUser.getPhone());
			vUser.setEmail(pUser.getEmail());
			vUser.setAddress(pUser.getAddress());
			vUser.setBirthday(pUser.getBirthday());
			vUser.setGender(pUser.getGender());
			vUser.setHeight(pUser.getHeight());
			vUser.setWeight(pUser.getWeight());

			// set password defaul phone@customer
			vUser.setPassword(new BCryptPasswordEncoder().encode(pUser.getPhone() + "@customer"));
			User vUserSave = gUserRepositoty.save(vUser);

			// set user role default = ROLE_CUSTOMER
			Optional<User> vOptionalUser = Optional.of(vUserSave);
			Optional<Role> vRole = gRoleRepository.findById(ROLE_CUSTOMER);
			UserRole vUserRole = new UserRole();
			vUserRole.setUser(vOptionalUser.get());
			vUserRole.setRole(vRole.get());
			gUserRoleRepository.save(vUserRole);

			return new ResponseEntity<>(vUserSave, HttpStatus.CREATED);
		} catch (Exception e) {
			return ResponseEntity.unprocessableEntity()
					.body("Failed to create specified user: " + e.getCause().getCause().getMessage());
		}
	}

	/**
	 * Function update user (any one)
	 * 
	 * @param userId CUSTOMER or STAFF input
	 * @param pUser  CUSTOMER or STAFF input
	 * @return info user update success
	 */
	@PutMapping("/users/{userId}")
	public ResponseEntity<Object> updateCustomer(@PathVariable Long userId, @Valid @RequestBody User pUser) {
		try {
			Optional<User> vUserData = gUserRepositoty.findById(userId);
			if (vUserData.isPresent()) {
				User vUser = vUserData.get();
				vUser.setFullName(pUser.getFullName());
				vUser.setPhone(pUser.getPhone());
				vUser.setEmail(pUser.getEmail());
				vUser.setAddress(pUser.getAddress());
				vUser.setBirthday(pUser.getBirthday());
				vUser.setGender(pUser.getGender());
				vUser.setHeight(pUser.getHeight());
				vUser.setWeight(pUser.getWeight());
				User vUserSave = gUserRepositoty.save(vUser);
				return new ResponseEntity<>(vUserSave, HttpStatus.OK);
			} else {
				User vUserNull = new User();
				return new ResponseEntity<>(vUserNull, HttpStatus.NOT_FOUND);
			}
		} catch (Exception e) {
			return ResponseEntity.unprocessableEntity()
					.body("Failed to update specified user: " + e.getCause().getCause().getMessage());
		}
	}

	/**
	 * Function create user (only admin create)
	 * 
	 * @param pUser admin input
	 * @return info user create success
	 */
	@PostMapping("/users/admin")
	@PreAuthorize("hasAnyRole('ROLE_ADMIN')")
	public ResponseEntity<Object> createUser(@Valid @RequestBody User pUser) {
		try {
			User vUser = new User();
			vUser.setUsername(pUser.getPhone());
			vUser.setFullName(pUser.getFullName());
			vUser.setPhone(pUser.getPhone());
			vUser.setEmail(pUser.getEmail());
			vUser.setAddress(pUser.getAddress());
			vUser.setBirthday(pUser.getBirthday());
			vUser.setGender(pUser.getGender());
			vUser.setHeight(pUser.getHeight());
			vUser.setWeight(pUser.getWeight());
			// set password defaul phone@user
			vUser.setPassword(new BCryptPasswordEncoder().encode(pUser.getPhone() + "@user"));
			User vUserSave = gUserRepositoty.save(vUser);
			return new ResponseEntity<>(vUserSave, HttpStatus.CREATED);
		} catch (Exception e) {
			return ResponseEntity.unprocessableEntity()
					.body("Failed to create specified user: " + e.getCause().getCause().getMessage());
		}
	}

	/**
	 * Function update user (only admin update)
	 * 
	 * @param userId admin select
	 * @param pUser  admin input
	 * @return info user update success
	 */
	@PutMapping("/users/admin/{userId}")
	@PreAuthorize("hasAnyRole('ROLE_ADMIN', 'ROLE_STAFF')")
	public ResponseEntity<Object> updateUser(@PathVariable Long userId, @Valid @RequestBody User pUser) {
		try {
			Optional<User> vUserData = gUserRepositoty.findById(userId);
			if (vUserData.isPresent()) {
				User vUser = vUserData.get();
				vUser.setFullName(pUser.getFullName());
				vUser.setPhone(pUser.getPhone());
				vUser.setEmail(pUser.getEmail());
				vUser.setAddress(pUser.getAddress());
				vUser.setBirthday(pUser.getBirthday());
				vUser.setGender(pUser.getGender());
				vUser.setHeight(pUser.getHeight());
				vUser.setWeight(pUser.getWeight());
				User vUserSave = gUserRepositoty.save(vUser);
				return new ResponseEntity<>(vUserSave, HttpStatus.OK);
			} else {
				User vUserNull = new User();
				return new ResponseEntity<>(vUserNull, HttpStatus.NOT_FOUND);
			}
		} catch (Exception e) {
			return ResponseEntity.unprocessableEntity()
					.body("Failed to update specified user: " + e.getCause().getCause().getMessage());
		}
	}

	/**
	 * Function delete user (only admin delete)
	 * 
	 * @param userId admin select
	 * @return delete success
	 */
	@DeleteMapping("/users/admin/{userId}")
	@PreAuthorize("hasAnyRole('ROLE_ADMIN')")
	public ResponseEntity<Object> deleteUser(@PathVariable Long userId) {
		try {
			Optional<User> vUserData = gUserRepositoty.findById(userId);
			Optional<UserRole> vUserRoleData = gUserRoleRepository.findByUserId(userId);
			if (vUserData.isPresent() || vUserRoleData.isPresent()) {
				// delete role of user
				gUserRoleRepository.deleteById(vUserRoleData.get().getId());
				// delete user
				gUserRepositoty.deleteById(userId);
				return new ResponseEntity<>(null, HttpStatus.NO_CONTENT);
			} else {
				return new ResponseEntity<>(null, HttpStatus.NOT_FOUND);
			}
		} catch (Exception e) {
			return new ResponseEntity<>(null, HttpStatus.INTERNAL_SERVER_ERROR);
		}

	}

	/**
	 * function get role of user by token
	 * 
	 * @return
	 */
	@GetMapping("/users/role")
	public ResponseEntity<String> getRoleUser() {
		try {
			Authentication vAuthentication = SecurityContextHolder.getContext().getAuthentication();
			UserPrincipal vUserPrincipal = (UserPrincipal) vAuthentication.getPrincipal();
			String vRole = gUserRepositoty.findRoleByUserId(vUserPrincipal.getUserId());
			return new ResponseEntity<>(vRole, HttpStatus.OK);
		} catch (Exception e) {
			return new ResponseEntity<>(null, HttpStatus.INTERNAL_SERVER_ERROR);
		}
	}

	// ------------ Function report ------------------------------------------
	/**
	 * function get list count order of each user
	 * 
	 * @return
	 */
	@GetMapping("/users/count/order")
	@PreAuthorize("hasAnyRole('ROLE_ADMIN', 'ROLE_STAFF')")
	public ResponseEntity<List<IUserCountOrder>> getCountOrderEachUser(
			@RequestParam(value = "dateMin", required = false) String dateMin,
			@RequestParam(value = "dateMax", required = false) String dateMax) {
		try {
			return new ResponseEntity<>(gUserRepositoty.countOrderByUser(dateMin, dateMax), HttpStatus.OK);
		} catch (Exception e) {
			return new ResponseEntity<>(null, HttpStatus.INTERNAL_SERVER_ERROR);
		}
	}

	/**
	 * function get list user have sum money by level money
	 * 
	 * @param money người dùng nhập
	 * @return danh sách user
	 */
	@GetMapping("/users/sum/{money}")
	@PreAuthorize("hasAnyRole('ROLE_ADMIN', 'ROLE_STAFF')")
	public ResponseEntity<List<IUserSumMoney>> getUserSumMoney(
			@RequestParam(value = "dateMin", required = false) String dateMin,
			@RequestParam(value = "dateMax", required = false) String dateMax, @PathVariable Integer money) {
		try {
			return new ResponseEntity<>(gUserRepositoty.sumMoneyByUser(dateMin, dateMax, money), HttpStatus.OK);
		} catch (Exception e) {
			return new ResponseEntity<>(null, HttpStatus.INTERNAL_SERVER_ERROR);
		}
	}

	// -------------- Function export excel --------------------------------
	/**
	 * function export excel get list count order of each user
	 * 
	 * @param response
	 * @throws IOException
	 */
	@GetMapping("/users/export/excel/count")
	public void exportCountOrderToExcel(@RequestParam(value = "dateMin", required = false) String dateMin,
			@RequestParam(value = "dateMax", required = false) String dateMax, HttpServletResponse response)
			throws IOException {
		response.setContentType("application/octet-stream");

		DateFormat vDateFormatter = new SimpleDateFormat("yyyy-MM-dd_HH:mm:ss");
		String vCurrentDateTime = vDateFormatter.format(new Date());

		String vHeaderKey = "Content-Disposition";
		String vHeaderValue = "attachment; filename=customers" + vCurrentDateTime + ".xlsx";
		response.setHeader(vHeaderKey, vHeaderValue);

		List<IUserCountOrder> vReports = new ArrayList<IUserCountOrder>();
		gUserRepositoty.countOrderByUser(dateMin, dateMax).forEach(vReports::add);

		UserCountOrderExcelExporter countOrderExcelExporter = new UserCountOrderExcelExporter(vReports);
		countOrderExcelExporter.export(response);
	}

	/**
	 * function export excel get list user have sum money by level money
	 * 
	 * @param money
	 * @param response
	 * @throws IOException
	 */
	@GetMapping("/users/export/excel/sum/{money}")
	public void exportSumMoneyToExcel(@RequestParam(value = "dateMin", required = false) String dateMin,
			@RequestParam(value = "dateMax", required = false) String dateMax, @PathVariable Integer money,
			HttpServletResponse response) throws IOException {
		response.setContentType("application/octet-stream");

		DateFormat vDateFormatter = new SimpleDateFormat("yyyy-MM-dd_HH:mm:ss");
		String vCurrentDateTime = vDateFormatter.format(new Date());

		String vHeaderKey = "Content-Disposition";
		String vHeaderValue = "attachment; filename=customers" + vCurrentDateTime + ".xlsx";
		response.setHeader(vHeaderKey, vHeaderValue);

		List<IUserSumMoney> vReports = new ArrayList<IUserSumMoney>();
		gUserRepositoty.sumMoneyByUser(dateMin, dateMax, money).forEach(vReports::add);

		UserSumMoneyExcelExporter excelExporter = new UserSumMoneyExcelExporter(vReports);
		excelExporter.export(response);
	}

}
