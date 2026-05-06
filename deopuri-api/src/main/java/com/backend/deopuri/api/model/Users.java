package com.backend.deopuri.api.model;

import jakarta.persistence.*;
import jakarta.validation.constraints.*;
import jakarta.validation.constraints.NotBlank;

@Entity
@Table(name = "Users")
public class Users {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id")
    private int id;

    @NotBlank(message = "First name is required")
    @Column(name = "first_name")
    private String firstName;

    @NotBlank(message = "Last name is required")
    @Column(name = "last_name")
    private String lastName;

    @NotBlank(message = "Email is required")
    @Email(message = "Invalid email format")
    @Column(name = "email", unique = true, nullable = false)
    private String email;

    @NotBlank(message = "Password is required")
    @Column(name = "password")
    private String password;

    @NotBlank(message = "Mobile number is required")
    @Size(min = 10, max = 10, message = "Mobile number must be 10 digits")
    @Column(name = "mobile_no", unique = true, nullable = false, length = 10)
    private String mobileNo;

    @NotBlank(message = "Address is required")
    @Column(name = "address")
    private String address;

    @NotBlank(message = "Shop name is required")
    @Column(name = "shop_name")
    private String shopName;

    @NotBlank(message = "Role is required")
    @Column(name = "role_base")
    private String roleBase;

    // ✅ NEW FIELD
    @Column(name = "status")
    private String status;

    // Default constructor
    public Users() {
        super();
    }

    // Parameterized constructor
    public Users(String firstName, String lastName, String email, String password, String mobileNo,
                 String address, String shopName, String roleBase, String status) {
        this.firstName = firstName;
        this.lastName = lastName;
        this.email = email;
        this.password = password;
        this.mobileNo = mobileNo;
        this.address = address;
        this.shopName = shopName;
        this.roleBase = roleBase;
        this.status = status;
    }

    // toString
    @Override
    public String toString() {
        return "Users [firstName=" + firstName + ", lastName=" + lastName +
                ", email=" + email + ", roleBase=" + roleBase + ", status=" + status + "]";
    }

    // Getters & Setters

    public int getId() {
        return id;
    }

    public String getFirstName() {
        return firstName;
    }

    public void setFirstName(String firstName) {
        this.firstName = firstName;
    }

    public String getLastName() {
        return lastName;
    }

    public void setLastName(String lastName) {
        this.lastName = lastName;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getPassword() {
        return password;
    }

    public void setPassword(String password) {
        this.password = password;
    }

    public String getMobileNo() {
        return mobileNo;
    }

    public void setMobileNo(String mobileNo) {
        this.mobileNo = mobileNo;
    }

    public String getAddress() {
        return address;
    }

    public void setAddress(String address) {
        this.address = address;
    }

    public String getShopName() {
        return shopName;
    }

    public void setShopName(String shopName) {
        this.shopName = shopName;
    }

    public String getRoleBase() {
        return roleBase;
    }

    public void setRoleBase(String roleBase) {
        this.roleBase = roleBase;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }
}