package com.gymmanagement.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.gymmanagement.dao.CustomerDao;
import com.gymmanagement.entity.Customer;

@Service
public class CurrentUserService {

	@Autowired
	private AuthTokenService authTokenService;

	@Autowired
	private CustomerDao customerDao;

	public Customer getCurrentCustomer(String authorizationHeader) {
		String email = authTokenService.getEmailFromAuthorizationHeader(authorizationHeader);
		if (email == null) {
			return null;
		}
		return customerDao.findByEmailId(email);
	}
}
