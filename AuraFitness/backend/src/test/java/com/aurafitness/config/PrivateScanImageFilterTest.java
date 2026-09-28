package com.aurafitness.config;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;
import com.aurafitness.repository.BodyScanRepository;
import org.junit.jupiter.api.Test;
import org.springframework.mock.web.MockFilterChain;
import org.springframework.mock.web.MockHttpServletRequest;
import org.springframework.mock.web.MockHttpServletResponse;

class PrivateScanImageFilterTest {
    @Test
    void oldBodyScanIsHiddenButAvatarStillLoads() throws Exception {
        String path = "/uploads/01234567-89ab-cdef-0123-456789abcdef.png";
        BodyScanRepository repository = mock(BodyScanRepository.class);
        PrivateScanImageFilter filter = new PrivateScanImageFilter(repository);
        when(repository.existsByImageUrl(path)).thenReturn(true);

        assertEquals(404, status(filter, path));
        when(repository.existsByImageUrl(path)).thenReturn(false);
        assertEquals(200, status(filter, path));
        assertEquals(404, status(filter, "/uploads/%2e%2e%2fsecret.png"));
    }

    private int status(PrivateScanImageFilter filter, String path) throws Exception {
        MockHttpServletRequest request = new MockHttpServletRequest("GET", path);
        request.setServletPath(path);
        MockHttpServletResponse response = new MockHttpServletResponse();
        filter.doFilter(request, response, new MockFilterChain());
        return response.getStatus();
    }
}
