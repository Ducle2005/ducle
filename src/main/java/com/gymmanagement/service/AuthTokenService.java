package com.gymmanagement.service;

import java.nio.charset.StandardCharsets;
import java.util.Base64;

import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

@Service
public class AuthTokenService {

	private static final String HMAC_ALGORITHM = "HmacSHA256";

	@Value("${app.auth.token-secret:aura-fitness-dev-secret-change-me}")
	private String tokenSecret;

	public String createToken(String email) {
		String normalizedEmail = normalizeEmail(email);
		String payload = normalizedEmail + ":" + System.currentTimeMillis();
		return encode(payload.getBytes(StandardCharsets.UTF_8)) + "." + sign(payload);
	}

	public String getEmailFromAuthorizationHeader(String authorizationHeader) {
		if (authorizationHeader == null || !authorizationHeader.startsWith("Bearer ")) {
			return null;
		}

		String token = authorizationHeader.substring("Bearer ".length()).trim();
		String[] parts = token.split("\\.");
		if (parts.length != 2) {
			return null;
		}

		try {
			String payload = new String(Base64.getUrlDecoder().decode(parts[0]), StandardCharsets.UTF_8);
			if (!sign(payload).equals(parts[1])) {
				return null;
			}

			int separator = payload.lastIndexOf(':');
			if (separator <= 0) {
				return null;
			}
			return payload.substring(0, separator);
		} catch (IllegalArgumentException ex) {
			return null;
		}
	}

	private String sign(String payload) {
		try {
			Mac mac = Mac.getInstance(HMAC_ALGORITHM);
			SecretKeySpec key = new SecretKeySpec(tokenSecret.getBytes(StandardCharsets.UTF_8), HMAC_ALGORITHM);
			mac.init(key);
			return encode(mac.doFinal(payload.getBytes(StandardCharsets.UTF_8)));
		} catch (Exception ex) {
			throw new IllegalStateException("Could not sign auth token", ex);
		}
	}

	private String encode(byte[] bytes) {
		return Base64.getUrlEncoder().withoutPadding().encodeToString(bytes);
	}

	private String normalizeEmail(String email) {
		return email == null ? "" : email.trim().toLowerCase();
	}
}
