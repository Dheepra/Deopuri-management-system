package com.deopuri.observability;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

import java.io.IOException;
import java.util.UUID;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.slf4j.MDC;
import org.springframework.core.Ordered;
import org.springframework.core.annotation.Order;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

/**
 * One log line in, one log line out, with a short UUID propagated through MDC.
 *
 * <p>Every request gets an 8-character {@code requestId} put into the SLF4J
 * {@link MDC} before the request enters the controller layer. The log pattern
 * defined in {@code application.properties} prints that value as
 * {@code [%X{requestId}]} on every line, so logs from controllers, services,
 * and DAOs that participate in the same request all share the same trace key
 * — making it trivial to follow a single failure end-to-end.
 *
 * <p>Runs at {@link Ordered#HIGHEST_PRECEDENCE} so it bookends the entire
 * filter chain, including authentication. Skips {@code /actuator/*} to keep
 * health-probe noise out of the log.
 *
 * <p>Failure modes are intentionally invisible to the client:
 * {@code MDC.clear()} runs in a {@code finally} so the trace key never leaks
 * across thread-pool requests.
 */
@Component
@Order(Ordered.HIGHEST_PRECEDENCE)
public class RequestLoggingFilter extends OncePerRequestFilter {

    private static final Logger log = LoggerFactory.getLogger(RequestLoggingFilter.class);

    /** MDC key — referenced from the log pattern in application.properties. */
    public static final String REQUEST_ID_MDC_KEY = "requestId";

    /** UUIDs are 32 chars without dashes; 8 is plenty for grepping logs. */
    private static final int REQUEST_ID_LENGTH = 8;

    @Override
    protected boolean shouldNotFilter(HttpServletRequest request) {
        // Health probes / metrics endpoints — high frequency, low value.
        String path = request.getRequestURI();
        return path.startsWith("/actuator/");
    }

    @Override
    protected void doFilterInternal(HttpServletRequest request,
                                    HttpServletResponse response,
                                    FilterChain chain) throws ServletException, IOException {

        String requestId = UUID.randomUUID().toString().replace("-", "")
                .substring(0, REQUEST_ID_LENGTH);

        MDC.put(REQUEST_ID_MDC_KEY, requestId);
        long start = System.currentTimeMillis();

        try {
            log.info(">> {} {}", request.getMethod(), request.getRequestURI());
            chain.doFilter(request, response);
        } finally {
            long durationMs = System.currentTimeMillis() - start;
            log.info("<< {} {} status={} durationMs={}",
                    request.getMethod(),
                    request.getRequestURI(),
                    response.getStatus(),
                    durationMs);
            MDC.remove(REQUEST_ID_MDC_KEY);
        }
    }
}
