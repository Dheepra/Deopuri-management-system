package com.deopuri.exception;

/**
 * Thrown when a request is well-formed and authorized but cannot be processed
 * because of a domain rule — e.g. "cart is empty", "quantity must be greater
 * than zero", "admin cannot add to cart". Mapped to HTTP 422 Unprocessable
 * Entity by {@link GlobalExceptionHandler}.
 *
 * <p>Carries a stable {@code errorCode} (snake-case, machine-readable) in
 * addition to the human message. The frontend can switch on the code to
 * localise / route the message, while the message itself is what the
 * exception handler returns when no localisation is needed.
 *
 * <p><strong>When to use this vs. other exceptions:</strong>
 * <ul>
 *   <li>{@link ResourceNotFoundException} — the entity literally doesn't
 *       exist (returns 404).</li>
 *   <li>{@link EmailAlreadyRegisteredException} — uniqueness collision on
 *       a specific field (returns 409).</li>
 *   <li>{@link InsufficientStockException} — specialised stock case
 *       (returns 409).</li>
 *   <li>{@code BusinessException} — everything else that is "request is
 *       valid but we can't do it" (returns 422). This used to be
 *       {@code new RuntimeException(...)} which silently degraded to 500.</li>
 * </ul>
 */
public class BusinessException extends RuntimeException {

    private final String errorCode;

    public BusinessException(String errorCode, String message) {
        super(message);
        this.errorCode = errorCode;
    }

    public BusinessException(String errorCode, String message, Throwable cause) {
        super(message, cause);
        this.errorCode = errorCode;
    }

    public String getErrorCode() {
        return errorCode;
    }
}
