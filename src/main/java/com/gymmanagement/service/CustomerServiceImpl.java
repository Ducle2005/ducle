package com.gymmanagement.service;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import com.gymmanagement.dao.CustomerDao;
import com.gymmanagement.entity.Customer;
import com.gymmanagement.utility.StorageService;

@Service
public class CustomerServiceImpl implements CustomerService {

	@Autowired
	private CustomerDao customerDao;
	
	@Autowired
	private StorageService storageService;

	@Autowired
	private PasswordEncoder passwordEncoder;
	
	@Override
	public void registerCustomer(Customer customer, MultipartFile customerPic) {
        String customerImageName = storageService.store(customerPic);
		if (customer.getPassword() != null && !customer.getPassword().trim().isEmpty()) {
			customer.setPassword(passwordEncoder.encode(customer.getPassword()));
		}
        customer.setPic(customerImageName);
		this.customerDao.save(customer);
	}

	@Override
	public List<Customer> getAllCustomer() {
		return this.customerDao.findAll();
	}

	@Override
	public Customer loginCustomer(String emailId, String password) {
		Customer customer = this.customerDao.findByEmailId(emailId);
		if (customer == null || customer.getPassword() == null) {
			return null;
		}
		return passwordEncoder.matches(password, customer.getPassword()) ? customer : null;
	}

	@Override
	public List<Customer> getCustomerByClientId(String clientId) {
		return this.customerDao.findByClientId(clientId);
	}

	@Override
	public List<Customer> getCustomerByName(String name) {
		return this.customerDao.findByNameContainingIgnoreCase(name);
	}

	@Override
	public Customer getCustomerByContact(String contact) {
		return this.customerDao.findByContact(contact);
	}

}
