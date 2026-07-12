package com.deopuri.api.dto;

import java.time.Instant;
import java.util.List;

// Client-facing error body. Intentionally does NOT include the request path — we never expose the
// real endpoint to callers. The actual URI is kept in server logs only.
public record ErrorResponse(
        Instant timestamp,
        int status,
        String error,
        String message,
        List<FieldError> fieldErrors) {

    public record FieldError(String field, String message) {
    }

    public static ErrorResponse of(int status, String error, String message) {
        return new ErrorResponse(Instant.now(), status, error, message, List.of());
    }

    public static ErrorResponse withFieldErrors(int status, String error, String message,
                                                List<FieldError> fieldErrors) {
        return new ErrorResponse(Instant.now(), status, error, message, fieldErrors);
    }
}
