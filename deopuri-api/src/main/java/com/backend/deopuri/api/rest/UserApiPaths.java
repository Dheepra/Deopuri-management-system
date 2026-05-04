package com.backend.deopuri.api.rest;

public final class UserApiPaths {

    private UserApiPaths() {}

    public static final String BASE = "/api";

    public static final String REGISTER = "/register";
    public static final String LOGIN = "/login";

    public static final String GET_ALL = "/users";
    public static final String GET_BY_ID = "/user/{id}";

    public static final String SEARCH = "/search/{name}";

    public static final String UPDATE = "/user/{id}";
    public static final String DELETE = "/user/{id}";
}