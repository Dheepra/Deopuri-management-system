package com.deopuri.api.model;

import jakarta.persistence.*;

@Entity
@Table(name = "staff")
public class Staff extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id")
    private Long id;

    @Column(name = "name", nullable = false)
    private String name;

    @Column(name = "role", nullable = false)
    private String role;

    @Column(name = "department", nullable = false)
    private String department;

    @Column(name = "shift", nullable = false)
    private String shift;

    @Column(name = "status", nullable = false)
    private String status;

    @ManyToOne
    @JoinColumn(name = "hospital_admin_id", nullable = false)
    private Users hospitalAdmin;

    // Login identity for this staff member (role STAFF). Created alongside the Staff record so the
    // person can sign in to the staff portal (attendance / leave). Nullable for legacy rows.
    @ManyToOne
    @JoinColumn(name = "user_id")
    private Users user;

    public Staff() {
    }

    public Long getId() {
        return id;
    }

    public Users getUser() {
        return user;
    }

    public void setUser(Users user) {
        this.user = user;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getRole() {
        return role;
    }

    public void setRole(String role) {
        this.role = role;
    }

    public String getDepartment() {
        return department;
    }

    public void setDepartment(String department) {
        this.department = department;
    }

    public String getShift() {
        return shift;
    }

    public void setShift(String shift) {
        this.shift = shift;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public Users getHospitalAdmin() {
        return hospitalAdmin;
    }

    public void setHospitalAdmin(Users hospitalAdmin) {
        this.hospitalAdmin = hospitalAdmin;
    }

    @Override
    public String toString() {
        return "Staff [id=" + id
                + ", name=" + name
                + ", role=" + role
                + ", department=" + department
                + ", shift=" + shift
                + ", status=" + status
                + "]";
    }
}
