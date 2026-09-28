package com.aurafitness.controller;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.verifyNoInteractions;

import com.aurafitness.repository.ProfileRepository;
import com.aurafitness.repository.UserRepository;
import com.aurafitness.service.AuthService;
import java.util.Map;
import org.junit.jupiter.api.Test;

class PaymentSecurityTest {

    @Test
    void customerCannotUpgradeSelf() {
        AuthService authService = mock(AuthService.class);
        AuthController controller = new AuthController(authService, mock(UserRepository.class), mock(ProfileRepository.class));

        assertEquals(403, controller.upgradeToPremium().getStatusCodeValue());
        verifyNoInteractions(authService);
    }

    @Test
    void unverifiedWebhookCannotGrantPremium() {
        AuthService authService = mock(AuthService.class);
        UserRepository users = mock(UserRepository.class);
        PaymentController controller = new PaymentController(authService, users);

        assertEquals(503, controller.handleBankWebhook(Map.of("content", "AuraVIP member@example.com monthly"))
                .getStatusCodeValue());
        verifyNoInteractions(authService, users);
    }
}
