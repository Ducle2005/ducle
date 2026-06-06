package com.gymmanagement.controller;

import java.util.Arrays;
import java.util.LinkedHashMap;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.gymmanagement.dao.CustomerDao;
import com.gymmanagement.entity.Customer;
import com.gymmanagement.service.AuthTokenService;
import com.gymmanagement.service.CurrentUserService;
import com.gymmanagement.utility.Helper;

@RestController
@RequestMapping("api/auth")
public class AuthController {

	@Autowired
	private CustomerDao customerDao;

	@Autowired
	private PasswordEncoder passwordEncoder;

	@Autowired
	private AuthTokenService authTokenService;

	@Autowired
	private CurrentUserService currentUserService;

	@PostMapping("register")
	public ResponseEntity<?> register(@RequestBody Map<String, Object> payload) {
		String email = stringValue(payload.get("email")).toLowerCase();
		String password = stringValue(payload.get("password"));
		String name = stringValue(payload.get("name"));

		if (email.isEmpty() || password.isEmpty()) {
			return ResponseEntity.badRequest().body(error("Email and password are required"));
		}
		if (customerDao.findByEmailId(email) != null) {
			return ResponseEntity.status(HttpStatus.CONFLICT).body(error("Email already registered"));
		}

		Customer customer = new Customer();
		customer.setClientId(Helper.getAlphaNumericId());
		customer.setName(name.isEmpty() ? email.substring(0, email.indexOf("@") > 0 ? email.indexOf("@") : email.length()) : name);
		customer.setEmailId(email);
		customer.setPassword(passwordEncoder.encode(password));
		customer.setTheme("DARK");
		customer.setWeightUnit("KG");
		customer.setHeightUnit("CM");
		customer.setGoal("MAINTAIN");
		customer.setCalorieTarget(2000);
		customer.setPremium(false);
		customerDao.save(customer);

		return ResponseEntity.ok("Registered successfully");
	}

	@PostMapping("login")
	public ResponseEntity<?> login(@RequestBody Map<String, Object> payload) {
		String email = stringValue(payload.get("email")).toLowerCase();
		String password = stringValue(payload.get("password"));
		Customer customer = customerDao.findByEmailId(email);

		if (customer == null || customer.getPassword() == null || !passwordEncoder.matches(password, customer.getPassword())) {
			return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(error("Invalid email or password"));
		}

		Map<String, Object> response = new LinkedHashMap<String, Object>();
		response.put("accessToken", authTokenService.createToken(email));
		response.put("tokenType", "Bearer");
		return ResponseEntity.ok(response);
	}

	@GetMapping("me")
	public ResponseEntity<?> me(@RequestHeader(value = "Authorization", required = false) String authorizationHeader) {
		Customer customer = currentUserService.getCurrentCustomer(authorizationHeader);
		if (customer == null) {
			return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(error("Unauthorized"));
		}
		return ResponseEntity.ok(authUser(customer));
	}

	@PostMapping("upgrade")
	public ResponseEntity<?> upgrade(@RequestHeader(value = "Authorization", required = false) String authorizationHeader) {
		Customer customer = currentUserService.getCurrentCustomer(authorizationHeader);
		if (customer == null) {
			return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(error("Unauthorized"));
		}
		customer.setPremium(true);
		customerDao.save(customer);
		return ResponseEntity.ok(authUser(customer));
	}

	@PostMapping("downgrade")
	public ResponseEntity<?> downgrade(@RequestHeader(value = "Authorization", required = false) String authorizationHeader) {
		Customer customer = currentUserService.getCurrentCustomer(authorizationHeader);
		if (customer == null) {
			return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(error("Unauthorized"));
		}
		customer.setPremium(false);
		customerDao.save(customer);
		return ResponseEntity.ok(authUser(customer));
	}

	@PutMapping("password")
	public ResponseEntity<?> updatePassword(
			@RequestHeader(value = "Authorization", required = false) String authorizationHeader,
			@RequestBody Map<String, Object> payload) {
		Customer customer = currentUserService.getCurrentCustomer(authorizationHeader);
		if (customer == null) {
			return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(error("Unauthorized"));
		}

		String currentPassword = stringValue(payload.get("currentPassword"));
		String newPassword = stringValue(payload.get("newPassword"));
		if (newPassword.isEmpty()) {
			return ResponseEntity.badRequest().body(error("New password is required"));
		}
		if (customer.getPassword() != null && !currentPassword.isEmpty()
				&& !passwordEncoder.matches(currentPassword, customer.getPassword())) {
			return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(error("Current password is incorrect"));
		}

		customer.setPassword(passwordEncoder.encode(newPassword));
		customerDao.save(customer);
		return ResponseEntity.ok("Password updated");
	}

	public static Map<String, Object> authUser(Customer customer) {
		Map<String, Object> user = new LinkedHashMap<String, Object>();
		user.put("email", customer.getEmailId());
		user.put("name", customer.getName());
		user.put("avatarUrl", avatarUrl(customer));
		user.put("roles", Boolean.TRUE.equals(customer.getPremium())
				? Arrays.asList("ROLE_USER", "ROLE_PREMIUM")
				: Arrays.asList("ROLE_USER"));
		return user;
	}

	public static String avatarUrl(Customer customer) {
		return customer.getPic() == null || customer.getPic().trim().isEmpty() ? null : "/api/customer/" + customer.getPic();
	}

	private Map<String, String> error(String message) {
		Map<String, String> response = new LinkedHashMap<String, String>();
		response.put("message", message);
		return response;
	}

	private String stringValue(Object value) {
		return value == null ? "" : String.valueOf(value).trim();
	}
}
