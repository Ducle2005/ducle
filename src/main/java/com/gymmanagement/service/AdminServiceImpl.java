package com.gymmanagement.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import com.gymmanagement.dao.AdminDao;
import com.gymmanagement.entity.Admin;

@Service
public class AdminServiceImpl implements AdminService {
	
	@Autowired
	private AdminDao adminDao;

	@Autowired
	private PasswordEncoder passwordEncoder;

	@Override
	public Admin registerAdmin(Admin admin) {
		if (admin.getPassword() != null && !admin.getPassword().trim().isEmpty()) {
			admin.setPassword(passwordEncoder.encode(admin.getPassword()));
		}
		return adminDao.save(admin);
	}

	@Override
	public Admin loginAdmin(String username, String password) {
		Admin admin = adminDao.findByUsername(username);
		if (admin == null || admin.getPassword() == null) {
			return null;
		}
		return passwordEncoder.matches(password, admin.getPassword()) ? admin : null;
	}

}
