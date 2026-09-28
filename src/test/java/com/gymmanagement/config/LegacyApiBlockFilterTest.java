package com.gymmanagement.config;

import static org.junit.jupiter.api.Assertions.assertEquals;
import org.junit.jupiter.api.Test;
import org.springframework.mock.web.MockFilterChain;
import org.springframework.mock.web.MockHttpServletRequest;
import org.springframework.mock.web.MockHttpServletResponse;

class LegacyApiBlockFilterTest {
    private final LegacyApiBlockFilter filter = new LegacyApiBlockFilter();

    @Test
    void legacyAdminAndPasswordResetAreUnavailable() throws Exception {
        assertEquals(410, status("POST", "/api/admin/register"));
        assertEquals(410, status("GET", "/api/admin/allcustomer"));
        assertEquals(410, status("POST", "/api/customer/forgetPassword"));
        assertEquals(410, status("POST", "/api/customer/update"));
        assertEquals(410, status("POST", "/api/membership/add"));
        assertEquals(410, status("POST", "/api/package/add"));
    }

    @Test
    void currentApisAndSafeImagesRemainAvailable() throws Exception {
        assertEquals(200, status("POST", "/api/auth/login"));
        assertEquals(200, status("GET", "/api/customer/avatar.png"));
        assertEquals(410, status("GET", "/api/customer/forgetPassword"));
        assertEquals(410, status("GET", "/api/customer/..%2Fsecret.png"));
    }

    private int status(String method, String path) throws Exception {
        MockHttpServletRequest request = new MockHttpServletRequest(method, path);
        request.setServletPath(path);
        MockHttpServletResponse response = new MockHttpServletResponse();
        filter.doFilter(request, response, new MockFilterChain());
        return response.getStatus();
    }
}
