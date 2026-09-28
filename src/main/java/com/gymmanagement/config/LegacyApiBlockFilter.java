package com.gymmanagement.config;

import java.io.IOException;
import javax.servlet.FilterChain;
import javax.servlet.ServletException;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import org.springframework.core.Ordered;
import org.springframework.core.annotation.Order;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

/** Blocks legacy routes that have no user or administrator authorization model. */
@Component
@Order(Ordered.HIGHEST_PRECEDENCE + 10)
public class LegacyApiBlockFilter extends OncePerRequestFilter {

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain chain)
            throws ServletException, IOException {
        response.setHeader("X-Content-Type-Options", "nosniff");
        response.setHeader("Referrer-Policy", "no-referrer");
        String path = request.getServletPath();
        if ("OPTIONS".equals(request.getMethod())) {
            chain.doFilter(request, response);
            return;
        }
        boolean legacyRoute = under(path, "/api/admin") || under(path, "/api/membership")
                || (under(path, "/api/customer") && !publicImage(request, path, "/api/customer/"))
                || (under(path, "/api/trainer") && !publicImage(request, path, "/api/trainer/"))
                || (under(path, "/api/package") && !"/api/package/all".equals(path));
        if (legacyRoute) {
            response.sendError(HttpServletResponse.SC_GONE, "Legacy API disabled");
            return;
        }
        chain.doFilter(request, response);
    }

    private boolean under(String path, String prefix) {
        return path.equals(prefix) || path.startsWith(prefix + "/");
    }

    private boolean publicImage(HttpServletRequest request, String path, String prefix) {
        if (!"GET".equals(request.getMethod()) || !path.startsWith(prefix)) return false;
        String name = path.substring(prefix.length());
        return name.matches("(?i)[a-z0-9_-]{1,128}\\.(png|jpe?g|gif|webp)");
    }
}
