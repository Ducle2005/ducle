package com.aurafitness.config;

import com.aurafitness.repository.BodyScanRepository;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import java.io.IOException;
import org.springframework.core.Ordered;
import org.springframework.core.annotation.Order;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

/** Denies public access to body scans saved by the former public upload flow. */
@Component
@Order(Ordered.HIGHEST_PRECEDENCE + 5)
public class PrivateScanImageFilter extends OncePerRequestFilter {
    private final BodyScanRepository scans;

    public PrivateScanImageFilter(BodyScanRepository scans) {
        this.scans = scans;
    }

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain chain)
            throws ServletException, IOException {
        String path = request.getServletPath();
        if (path.startsWith("/uploads/")) {
            String name = path.substring("/uploads/".length());
            if (!name.matches("(?i)[0-9a-f-]{32,36}\\.(png|jpe?g|gif|webp)")
                    || scans.existsByImageUrl(path)) {
                response.sendError(HttpServletResponse.SC_NOT_FOUND);
                return;
            }
        }
        chain.doFilter(request, response);
    }
}
