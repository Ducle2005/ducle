package com.gymmanagement.controller;

import java.util.LinkedHashMap;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import com.gymmanagement.dao.CustomerDao;
import com.gymmanagement.entity.Customer;
import com.gymmanagement.service.CurrentUserService;
import com.gymmanagement.utility.StorageService;

@RestController
@RequestMapping("api/users")
public class UsersController {

	@Autowired
	private CurrentUserService currentUserService;

	@Autowired
	private CustomerDao customerDao;

	@Autowired
	private StorageService storageService;

	@PutMapping("me")
	public ResponseEntity<?> updateMe(
			@RequestHeader(value = "Authorization", required = false) String authorizationHeader,
			@RequestBody Map<String, Object> payload) {
		Customer customer = currentUserService.getCurrentCustomer(authorizationHeader);
		if (customer == null) {
			return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(error("Unauthorized"));
		}
		Object name = payload.get("name");
		if (name != null && !String.valueOf(name).trim().isEmpty()) {
			customer.setName(String.valueOf(name).trim());
			customerDao.save(customer);
		}
		return ResponseEntity.ok(AuthController.authUser(customer));
	}

	@PostMapping("me/avatar")
	public ResponseEntity<?> updateAvatar(
			@RequestHeader(value = "Authorization", required = false) String authorizationHeader,
			@RequestParam("file") MultipartFile file) {
		Customer customer = currentUserService.getCurrentCustomer(authorizationHeader);
		if (customer == null) {
			return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(error("Unauthorized"));
		}
		if (file == null || file.isEmpty()) {
			return ResponseEntity.badRequest().body(error("Avatar file is required"));
		}

		String fileName = storageService.store(file);
		customer.setPic(fileName);
		customerDao.save(customer);

		Map<String, Object> response = new LinkedHashMap<String, Object>();
		response.put("avatarUrl", AuthController.avatarUrl(customer));
		return ResponseEntity.ok(response);
	}

	private Map<String, String> error(String message) {
		Map<String, String> response = new LinkedHashMap<String, String>();
		response.put("message", message);
		return response;
	}
}
