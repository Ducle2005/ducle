package com.gymmanagement.controller;

import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.gymmanagement.entity.Customer;
import com.gymmanagement.service.CurrentUserService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.test.util.ReflectionTestUtils;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;

class MvpDashboardSecurityTest {
    private final CurrentUserService users = mock(CurrentUserService.class);
    private MockMvc mvc;

    @BeforeEach
    void setUp() {
        MvpDashboardController controller = new MvpDashboardController();
        ReflectionTestUtils.setField(controller, "currentUserService", users);
        mvc = MockMvcBuilders.standaloneSetup(controller).build();
    }

    @Test
    void vipEndpointsRequirePremiumInBackend() throws Exception {
        Customer free = customer(1, false);
        when(users.getCurrentCustomer("Bearer free")).thenReturn(free);
        mvc.perform(get("/api/vip/insights").header("Authorization", "Bearer free"))
                .andExpect(status().isForbidden());
        mvc.perform(get("/api/vip/body-scan/history").header("Authorization", "Bearer free"))
                .andExpect(status().isForbidden());
        mvc.perform(post("/api/vip/roadmap").header("Authorization", "Bearer free")
                .contentType("application/json").content("{}"))
                .andExpect(status().isForbidden());
    }

    @Test
    void anotherUserCannotModifyOrCompleteWorkoutSession() throws Exception {
        when(users.getCurrentCustomer("Bearer owner")).thenReturn(customer(1, false));
        when(users.getCurrentCustomer("Bearer other")).thenReturn(customer(2, false));
        String response = mvc.perform(post("/api/workouts/sessions/start").header("Authorization", "Bearer owner"))
                .andExpect(status().isOk()).andReturn().getResponse().getContentAsString();
        long id = new ObjectMapper().readTree(response).get("id").asLong();

        mvc.perform(put("/api/workouts/sessions/" + id + "/sets").header("Authorization", "Bearer other")
                .contentType("application/json").content("{\"sets\":[]}"))
                .andExpect(status().isNotFound());
        mvc.perform(post("/api/workouts/sessions/" + id + "/complete").header("Authorization", "Bearer other"))
                .andExpect(status().isNotFound());
    }

    private Customer customer(int id, boolean premium) {
        Customer customer = new Customer();
        customer.setId(id);
        customer.setEmailId("user" + id + "@example.com");
        customer.setPremium(premium);
        return customer;
    }
}
