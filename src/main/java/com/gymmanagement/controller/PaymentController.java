package com.gymmanagement.controller;

import java.util.LinkedHashMap;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.gymmanagement.entity.Customer;
import com.gymmanagement.service.CurrentUserService;

@RestController
@RequestMapping("api/payment")
public class PaymentController {

	@Autowired
	private CurrentUserService currentUserService;

	@GetMapping("check-status")
	public ResponseEntity<?> checkStatus(@RequestHeader(value = "Authorization", required = false) String authorizationHeader) {
		Customer customer = currentUserService.getCurrentCustomer(authorizationHeader);
		if (customer == null) {
			return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(error("Unauthorized"));
		}
		Map<String, Object> response = new LinkedHashMap<String, Object>();
		response.put("isPremium", Boolean.TRUE.equals(customer.getPremium()));
		return ResponseEntity.ok(response);
	}

	private Map<String, String> error(String message) {
		Map<String, String> response = new LinkedHashMap<String, String>();
		response.put("message", message);
		return response;
	}
}
