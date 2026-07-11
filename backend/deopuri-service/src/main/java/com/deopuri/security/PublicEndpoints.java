package com.deopuri.security;

import jakarta.servlet.http.HttpServletRequest;
import org.springframework.http.HttpMethod;
import org.springframework.security.web.servlet.util.matcher.PathPatternRequestMatcher;
import org.springframework.security.web.util.matcher.OrRequestMatcher;
import org.springframework.security.web.util.matcher.RequestMatcher;
import org.springframework.stereotype.Component;

@Component
public class PublicEndpoints {

    private final RequestMatcher matcher;

    public PublicEndpoints() {

        PathPatternRequestMatcher.Builder builder = PathPatternRequestMatcher.withDefaults();

        this.matcher = new OrRequestMatcher(

                // auth apis
                builder.matcher(
                        HttpMethod.POST,
                        "/api/auth/login"),

                builder.matcher(
                        HttpMethod.POST,
                        "/api/auth/register"),

                builder.matcher(
                        HttpMethod.POST,
                         "/api/auth/create-password/**"),

                // product public api
                builder.matcher(
                        HttpMethod.GET,
                        "/api/products/**"),

                // cart apis are authenticated (IDOR fix — acting user is derived
                // from the JWT principal, not the request body/path).

                // default
                builder.matcher("/error"),

                builder.matcher("/actuator/health"));
    }

    public boolean matches(HttpServletRequest request) {

        return matcher.matches(request);
    }

    public RequestMatcher matcher() {

        return matcher;
    }

}
