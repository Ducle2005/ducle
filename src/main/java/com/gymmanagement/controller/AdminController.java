package com.gymmanagement.controller;

import java.util.ArrayList;
import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.gymmanagement.entity.Admin;
import com.gymmanagement.entity.Customer;
import com.gymmanagement.service.AdminService;
import com.gymmanagement.service.CustomerService;

@RestController
@RequestMapping("api/admin/")
@CrossOrigin(origins = "${app.cors.allowed-origin}")
public class AdminController {
	
	@Autowired
	private AdminService adminService;
	
	@Autowired
	private CustomerService customerService;
	
	@PostMapping("register")
	public ResponseEntity<?> registerAdmin(Admin admin) {
		Admin savedAdmin = adminService.registerAdmin(admin);
		return ResponseEntity.ok(savedAdmin);
		
	}
	
	@PostMapping("login")
	public ResponseEntity<?> loginAdmin(@RequestParam("username") String username, @RequestParam("password") String password) {
		Admin admin = adminService.loginAdmin(username, password);
		if (admin == null) {
			return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Invalid username or password");
		}
		return ResponseEntity.ok(admin);
		
	}
	
	@GetMapping("allcustomer")
	public ResponseEntity<?> getAllCustomer() throws Exception {
		
		System.out.println("request came for getting all customer");
		
		List<Customer> customers = new ArrayList<Customer>();
		
		customers = customerService.getAllCustomer();
		
		System.out.println("response sent!!!");
		
		return ResponseEntity.ok(customers);
		
	}

	@GetMapping("search/customer/clientId")
	public ResponseEntity getCustomerByClientId(@RequestParam("clientId") String clientId) throws JsonProcessingException {

		System.out.println("request came for fetching cutomer by Client id " + clientId);

		List<Customer> customers = customerService.getCustomerByClientId(clientId);
		
		
		System.out.println("response sent !!!");

		return new ResponseEntity(customers, HttpStatus.OK);

	}
	
	@GetMapping("search/customer/name")
	public ResponseEntity getOrdersByOrderId(@RequestParam("customerName") String customerName) throws JsonProcessingException {

		System.out.println("request came for FETCH Customer BY Customer : " + customerName);

		List<Customer> customers = customerService.getCustomerByName(customerName);
		
		System.out.println("response sent !!!");

		return new ResponseEntity(customers, HttpStatus.OK);

	}

}
