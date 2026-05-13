package com.backend.deopuri.api.rest;

public class OrdersApiPaths {

    private OrdersApiPaths() {
    }

    public static final String BASE = "/api/orders";

    // Place Order
    public static final String PLACE_ORDER = "/place";

       public static final String TOTAl_AMOUNT ="/{id}/amount";

    // Get All Orders
    public static final String GET_ALL = "/all";

    // Get User Orders
    public static final String GET_USER_ORDERS = "/user/{userId}";

    // Update Order Status
    public static final String UPDATE_STATUS = "/status/{id}";

    // Delete Order
    public static final String DELETE_ORDER = "/delete/{id}";
}