package com.aurafitness.controller;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;

import com.aurafitness.entity.User;
import com.aurafitness.repository.BodyScanRepository;
import com.aurafitness.repository.ProfileRepository;
import com.aurafitness.repository.UserRepository;
import com.aurafitness.service.AICoachService;
import com.aurafitness.service.VIPIntelligenceService;
import java.util.Map;
import java.util.Optional;
import java.util.Set;
import org.junit.jupiter.api.Test;
import org.springframework.security.core.Authentication;
import org.springframework.web.server.ResponseStatusException;

class VIPAccessTest {
    @Test
    void freeUserCannotReadOrWriteVipData() {
        UserRepository users = mock(UserRepository.class);
        User free = new User();
        free.setRoles(Set.of("ROLE_USER"));
        when(users.findByEmail("free@example.com")).thenReturn(Optional.of(free));
        Authentication authentication = mock(Authentication.class);
        when(authentication.getName()).thenReturn("free@example.com");
        VIPController vip = new VIPController(mock(VIPIntelligenceService.class), users,
                mock(ProfileRepository.class), mock(BodyScanRepository.class), mock(AICoachService.class));

        assertForbidden(() -> vip.getVipInsights(authentication, null));
        assertForbidden(() -> vip.getBodyScanHistory(authentication));
        assertForbidden(() -> vip.saveBodyScan(authentication, 15.0, 90.0, 80.0, 95.0, 70.0));
        assertForbidden(() -> vip.generateRoadmap(Map.of(), authentication));
    }

    private void assertForbidden(org.junit.jupiter.api.function.Executable action) {
        ResponseStatusException error = assertThrows(ResponseStatusException.class, action);
        assertEquals(403, error.getStatusCode().value());
    }
}
