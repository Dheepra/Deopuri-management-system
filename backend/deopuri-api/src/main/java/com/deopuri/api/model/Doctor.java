package com.deopuri.api.model;



import jakarta.persistence.*;

@Entity
@Table(name = "doctors")
public class Doctor {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id")
    private Long id;

    @OneToOne
    @JoinColumn(name = "user_id", nullable = false)
    private Users user;

    @ManyToOne
    @JoinColumn(name = "hospital_admin_id", nullable = false)
    private Users hospitalAdmin;

    @Column(name = "qualification", nullable = false)
    private String qualification;

    @Column(name = "specialization", nullable = false)
    private String specialization;

    @Column(name = "experience_years")
    private Integer experienceYears;

    @Column(name = "registration_number")
    private String registrationNumber;

    public Doctor() {
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

    public Users getHospitalAdmin() {
        return hospitalAdmin;
    }

    public void setHospitalAdmin(Users hospitalAdmin) {
        this.hospitalAdmin = hospitalAdmin;
    }

    public String getQualification() {
        return qualification;
    }

    public void setQualification(String qualification) {
        this.qualification = qualification;
    }

    public String getSpecialization() {
        return specialization;
    }

    public void setSpecialization(String specialization) {
        this.specialization = specialization;
    }

    public Integer getExperienceYears() {
        return experienceYears;
    }

    public void setExperienceYears(Integer experienceYears) {
        this.experienceYears = experienceYears;
    }

    public String getRegistrationNumber() {
        return registrationNumber;
    }

    public void setRegistrationNumber(String registrationNumber) {
        this.registrationNumber = registrationNumber;
    }

    @Override
    public String toString() {
        return "Doctor [id=" + id
                + ", qualification=" + qualification
                + ", specialization=" + specialization
                + ", experienceYears=" + experienceYears
                + "]";
    }
}