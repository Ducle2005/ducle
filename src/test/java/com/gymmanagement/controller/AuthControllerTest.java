package com.gymmanagement.controller;

import static org.hamcrest.Matchers.hasItem;
import static org.hamcrest.Matchers.not;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import com.gymmanagement.dao.CustomerDao;
import com.gymmanagement.entity.Customer;
import com.gymmanagement.service.CurrentUserService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.test.util.ReflectionTestUtils;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;

import static org.mockito.Mockito.mock;

class AuthControllerTest {

    private final CustomerDao customerDao = mock(CustomerDao.class);
    private final CurrentUserService currentUserService = mock(CurrentUserService.class);
    private MockMvc mvc;

    @BeforeEach
    void setUp() {
        AuthController controller = new AuthController();
        ReflectionTestUtils.setField(controller, "customerDao", customerDao);
        ReflectionTestUtils.setField(controller, "currentUserService", currentUserService);
        mvc = MockMvcBuilders.standaloneSetup(controller).build();
    }

    @Test
    void upgradeRequiresAuthenticationAndCannotSelfGrantPremium() throws Exception {
        Customer customer = customer(false);
        when(currentUserService.getCurrentCustomer("Bearer valid")).thenReturn(customer);

        mvc.perform(post("/api/auth/upgrade"))
                .andExpect(status().isUnauthorized());
        mvc.perform(post("/api/auth/upgrade").header("Authorization", "Bearer invalid"))
                .andExpect(status().isUnauthorized());
        mvc.perform(post("/api/auth/upgrade").header("Authorization", "Bearer valid"))
                .andExpect(status().isForbidden())
                .andExpect(jsonPath("$.message").value("Payment verification required"));

        org.junit.jupiter.api.Assertions.assertEquals(false, customer.getPremium());
        verify(customerDao, never()).save(any(Customer.class));
    }

    @Test
    void downgradeOnlyUpdatesAuthenticatedCustomerAndReturnsNonPremiumRole() throws Exception {
        Customer customer = customer(true);
        when(currentUserService.getCurrentCustomer("Bearer valid")).thenReturn(customer);

        mvc.perform(post("/api/auth/downgrade").header("Authorization", "Bearer valid"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.roles", hasItem("ROLE_USER")))
                .andExpect(jsonPath("$.roles", not(hasItem("ROLE_PREMIUM"))));

        org.junit.jupiter.api.Assertions.assertEquals(false, customer.getPremium());
        verify(customerDao).save(customer);
    }

    @Test
    void downgradeRejectsMissingOrInvalidTokenWithoutSaving() throws Exception {
        mvc.perform(post("/api/auth/downgrade"))
                .andExpect(status().isUnauthorized());
        mvc.perform(post("/api/auth/downgrade").header("Authorization", "Bearer invalid"))
                .andExpect(status().isUnauthorized());
        verify(customerDao, never()).save(any(Customer.class));
    }

    private Customer customer(boolean premium) {
        Customer customer = new Customer();
        customer.setEmailId("member@example.com");
        customer.setName("Member");
        customer.setPremium(premium);
        return customer;
    }
}
