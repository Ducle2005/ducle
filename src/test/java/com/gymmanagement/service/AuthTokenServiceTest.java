package com.gymmanagement.service;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNull;
import static org.junit.jupiter.api.Assertions.assertThrows;
import java.nio.charset.StandardCharsets;
import java.util.Base64;
import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;
import org.junit.jupiter.api.Test;
import org.springframework.test.util.ReflectionTestUtils;

class AuthTokenServiceTest {
    private static final String SECRET = "test-secret-for-isolated-tests-only-32-bytes";

    @Test
    void secretIsMandatoryAndStrong() {
        AuthTokenService tokens = new AuthTokenService();
        ReflectionTestUtils.setField(tokens, "tokenSecret", "short");
        assertThrows(IllegalStateException.class, tokens::validateSecret);
    }

    @Test
    void rejectsExpiredFutureAndTamperedTokens() throws Exception {
        AuthTokenService tokens = new AuthTokenService();
        ReflectionTestUtils.setField(tokens, "tokenSecret", SECRET);
        tokens.validateSecret();

        String valid = tokens.createToken("member@example.com");
        assertEquals("member@example.com", tokens.getEmailFromAuthorizationHeader("Bearer " + valid));
        assertNull(tokens.getEmailFromAuthorizationHeader("Bearer " + signed("member@example.com", 0)));
        assertNull(tokens.getEmailFromAuthorizationHeader("Bearer " + signed("member@example.com", Long.MAX_VALUE)));
        assertNull(tokens.getEmailFromAuthorizationHeader("Bearer " + valid + "tampered"));
    }

    private String signed(String email, long time) throws Exception {
        String payload = email + ":" + time;
        Mac mac = Mac.getInstance("HmacSHA256");
        mac.init(new SecretKeySpec(SECRET.getBytes(StandardCharsets.UTF_8), "HmacSHA256"));
        Base64.Encoder encoder = Base64.getUrlEncoder().withoutPadding();
        return encoder.encodeToString(payload.getBytes(StandardCharsets.UTF_8)) + "."
                + encoder.encodeToString(mac.doFinal(payload.getBytes(StandardCharsets.UTF_8)));
    }
}
