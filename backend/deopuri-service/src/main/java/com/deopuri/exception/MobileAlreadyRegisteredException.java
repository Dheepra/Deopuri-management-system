package com.deopuri.exception;

public class MobileAlreadyRegisteredException extends RuntimeException {

    public MobileAlreadyRegisteredException(String message) {
        super(message);
    }
}