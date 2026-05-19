package com.gymmanagement.controller;

import java.io.IOException;
import java.io.InputStream;
import java.util.Optional;
import java.util.List;

import javax.servlet.ServletOutputStream;
import javax.servlet.http.HttpServletResponse;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.io.Resource;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.util.FileCopyUtils;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.gymmanagement.dao.CustomerDao;
import com.gymmanagement.dto.AddCustomerRequestDto;
import com.gymmanagement.dto.ChangePasswordDto;
import com.gymmanagement.dto.UserLoginRequest;
import com.gymmanagement.entity.Customer;
import com.gymmanagement.service.CustomerService;
import com.gymmanagement.utility.Helper;
import com.gymmanagement.utility.StorageService;

@RestController
@RequestMapping("api/customer/")
@CrossOrigin(origins = "${app.cors.allowed-origin}")
public class CustomerController {
	
	@Autowired
	private CustomerService customerService;
	
	@Autowired
	private StorageService storageService;
	
	@Autowired
	private CustomerDao customerDao;

	@Autowired
	private PasswordEncoder passwordEncoder;
	
	ObjectMapper objectMapper = new ObjectMapper();
	
	@PostMapping("register")
	public ResponseEntity<?> addProduct(AddCustomerRequestDto addCustomerRequestDto) {
		String clientId = Helper.getAlphaNumericId();
		
		Customer customer= AddCustomerRequestDto.toEntity(addCustomerRequestDto);
		customer.setClientId(clientId);
		
		customerService.registerCustomer(customer, addCustomerRequestDto.getPic());
		return ResponseEntity.ok(customer);
		
	}
	

	@PostMapping("login")
	public ResponseEntity<?> loginAdmin(@RequestBody UserLoginRequest loginRequest) {
		Customer customer = customerService.loginCustomer(loginRequest.getEmailId(), loginRequest.getPassword());
		if (customer == null) {
			return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Invalid email or password");
		}
		return ResponseEntity.ok(customer);
		
	}
	
	@GetMapping(value="/{customerPic}", produces = "image/*")
	public void fetchProductImage(@PathVariable("customerPic") String customerPic, HttpServletResponse resp) {
		System.out.println("request came for fetching customer pic");
		System.out.println("Loading file: " + customerPic);
		Resource resource = storageService.load(customerPic);
		if(resource != null) {
			try(InputStream in = resource.getInputStream()) {
				ServletOutputStream out = resp.getOutputStream();
				FileCopyUtils.copy(in, out);
			} catch (IOException e) {
				e.printStackTrace();
			}
		}
		
		System.out.println("response sent!");
	}
	
	@PostMapping("update")
	public ResponseEntity<?> updateCustomer(AddCustomerRequestDto addCustomerRequestDto) {
		Customer customer= AddCustomerRequestDto.toEntity(addCustomerRequestDto);
		
		List<Customer> customers = customerService.getCustomerByClientId(customer.getClientId());
		if (customers.isEmpty()) {
			return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Customer not found with Client ID: " + customer.getClientId());
		}
		
		Customer fetchCustomerFromDb = customers.get(0);
		customer.setPic(fetchCustomerFromDb.getPic());
		customer.setPassword(fetchCustomerFromDb.getPassword());
		customer.setId(fetchCustomerFromDb.getId()); // Ensure the ID is set for update
		
		//this will update the Customer details
		Customer updatedCustomer = customerDao.save(customer);
		
		return ResponseEntity.ok(updatedCustomer);
		
	}
	
	@PostMapping("update/profile")
	public ResponseEntity<?> updateCustomerProfile(AddCustomerRequestDto addCustomerRequestDto) {
		List<Customer> customers = customerService.getCustomerByClientId(addCustomerRequestDto.getClientId());
		if (customers.isEmpty()) {
			return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Customer not found with Client ID: " + addCustomerRequestDto.getClientId());
		}
		
		Customer fetchCustomerFromDb = customers.get(0);
		
		Customer customer= AddCustomerRequestDto.toEntity(addCustomerRequestDto);
		
		String customerImageName = storageService.store(addCustomerRequestDto.getPic());
        customer.setPic(customerImageName);
        customer.setPassword(fetchCustomerFromDb.getPassword());
        customer.setId(fetchCustomerFromDb.getId()); // Ensure the ID is set for update
		this.customerDao.save(customer);
		
		return ResponseEntity.ok(customer);
		
	}
	
	@PostMapping("forgetPassword")
	public ResponseEntity<?> forgetPassword(@RequestBody ChangePasswordDto dto) {
		Customer customer = customerService.getCustomerByContact(dto.getMobileNo());
		
		if(customer != null) {
			customer.setPassword(passwordEncoder.encode(dto.getNewPassword()));
			customerDao.save(customer);
		}
		
		else {
			System.out.println("customer not found with this mobile no");
			return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Customer not found with mobile no: " + dto.getMobileNo());
		}
		
		return ResponseEntity.ok(customer);
		
	}
	
	@PostMapping("changePassword")
	public ResponseEntity<?> changePassword(@RequestBody ChangePasswordDto dto) {
		Optional<Customer> customerOptional = customerDao.findById(dto.getCustomerId());
		if (!customerOptional.isPresent()) {
			return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Customer not found with id: " + dto.getCustomerId());
		}

		Customer customer = customerOptional.get();
		if (!passwordEncoder.matches(dto.getOldPassword(), customer.getPassword())) {
			return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("Old password is incorrect");
		}

		customer.setPassword(passwordEncoder.encode(dto.getNewPassword()));
		customerDao.save(customer);
		return ResponseEntity.ok(customer);
		
	}

}
