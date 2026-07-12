package com.deopuri.api.model;

import jakarta.persistence.*;

import java.time.LocalDate;

@Entity
@Table(name = "leave_application")
public class LeaveApplication extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id")
    private Long id;

    // Leaves are applied by any hospital worker (staff OR doctor), so the applicant is a Users login
    // rather than a Staff row. hospitalAdmin scopes the request to the approving admin.
    @ManyToOne
    @JoinColumn(name = "applicant_user_id", nullable = false)
    private Users applicantUser;

    @ManyToOne
    @JoinColumn(name = "hospital_admin_id", nullable = false)
    private Users hospitalAdmin;

    @Column(name = "applicant_name")
    private String applicantName;

    @Enumerated(EnumType.STRING)
    @Column(name = "type")
    private LeaveType type;

    @Column(name = "from_date")
    private LocalDate fromDate;

    @Column(name = "to_date")
    private LocalDate toDate;

    @Column(name = "days")
    private int days;

    @Column(name = "reason", columnDefinition = "TEXT")
    private String reason;

    @Enumerated(EnumType.STRING)
    @Column(name = "status")
    private LeaveStatus status;

    public LeaveApplication() {
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Users getApplicantUser() {
        return applicantUser;
    }

    public void setApplicantUser(Users applicantUser) {
        this.applicantUser = applicantUser;
    }

    public Users getHospitalAdmin() {
        return hospitalAdmin;
    }

    public void setHospitalAdmin(Users hospitalAdmin) {
        this.hospitalAdmin = hospitalAdmin;
    }

    public String getApplicantName() {
        return applicantName;
    }

    public void setApplicantName(String applicantName) {
        this.applicantName = applicantName;
    }

    public LeaveType getType() {
        return type;
    }

    public void setType(LeaveType type) {
        this.type = type;
    }

    public LocalDate getFromDate() {
        return fromDate;
    }

    public void setFromDate(LocalDate fromDate) {
        this.fromDate = fromDate;
    }

    public LocalDate getToDate() {
        return toDate;
    }

    public void setToDate(LocalDate toDate) {
        this.toDate = toDate;
    }

    public int getDays() {
        return days;
    }

    public void setDays(int days) {
        this.days = days;
    }

    public String getReason() {
        return reason;
    }

    public void setReason(String reason) {
        this.reason = reason;
    }

    public LeaveStatus getStatus() {
        return status;
    }

    public void setStatus(LeaveStatus status) {
        this.status = status;
    }
}
