package com.deopuri.service.service.impl;

import com.deopuri.api.dto.CreateDoctorRequest;
import com.deopuri.api.dto.CreatePasswordRequest;
import com.deopuri.api.model.Doctor;
import com.deopuri.api.model.UserRole;
import com.deopuri.api.model.UserStatus;
import com.deopuri.api.model.Users;
import com.deopuri.service.dao.DoctorDao;
import com.deopuri.service.dao.UsersDao;
import com.deopuri.service.service.DoctorService;
import com.deopuri.service.service.EmailService;
import com.deopuri.exception.ResourceNotFoundException;
import org.springframework.http.ResponseEntity;

import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.RequestBody;

import java.util.UUID;

@Service
@Transactional
public class DoctorServiceImpl implements DoctorService {

    private final UsersDao usersDao;
    private final DoctorDao doctorDao;
    private final EmailService emailService;
    private final PasswordEncoder passwordEncoder;

    public DoctorServiceImpl(UsersDao usersDao,
            DoctorDao doctorDao,
            EmailService emailService,
            PasswordEncoder passwordEncoder) {

        this.usersDao = usersDao;
        this.doctorDao = doctorDao;
        this.emailService = emailService;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    public String createDoctor(CreateDoctorRequest request, int hospitalAdminId) {

        Users hospitalAdmin = usersDao.findById(hospitalAdminId)
                .orElseThrow(() -> new ResourceNotFoundException("Hospital Admin not found"));

        // 1. Generate ONE token
        String token = UUID.randomUUID().toString();

        // 2. Create User
        Users doctorUser = new Users();
        doctorUser.setFirstName(request.firstName());
        doctorUser.setLastName(request.lastName());
        doctorUser.setEmail(request.email());
        doctorUser.setMobileNo(request.mobileNo());

        doctorUser.setRole(UserRole.DOCTOR);
        doctorUser.setStatus(UserStatus.APPROVED);

        doctorUser.setPassword("TEMP");

        // IMPORTANT
        doctorUser.setInvitationToken(token);
        doctorUser.setPasswordCreated(false);

        doctorUser.setAddress(request.address() != null ? request.address() : "N/A");
        doctorUser.setShopName("N/A");

        doctorUser = usersDao.save(doctorUser);

        // 3. Doctor entity
        Doctor doctor = new Doctor();
        doctor.setUser(doctorUser);
        doctor.setHospitalAdmin(hospitalAdmin);
        doctor.setQualification(request.qualification());
        doctor.setSpecialization(request.specialization());
        doctor.setExperienceYears(request.experienceYears());

        doctorDao.save(doctor);

        // 4. Email
        String link = "http://localhost:5173/create-password?token=" + token;

        String body = """
                <div style="text-align:center; font-family:Arial,sans-serif; padding:20px;">

                    <img src='cid:logoImage'
                         width='120'
                         style="margin-bottom:15px;"/>

                    <h2 style="color:#2e7d32;">
                        Deopuri Herbal Drugs and Pharmaceuticals
                    </h2>

                    <hr style="width:60%%; margin:15px auto;"/>

                    <h2>Welcome Doctor 👨‍⚕️</h2>

                    <p>Hello Dr. <b>%s %s</b>,</p>

                    <p>Your account has been created successfully by Hospital Admin.</p>

                    <div style="
                        background:#f5f5f5;
                        padding:15px;
                        border-radius:8px;
                        width:80%%;
                        margin:20px auto;">

                        <p><b>Login Email:</b> %s</p>

                        <p>
                            Use the above email address to create your password
                            and login to the system.
                        </p>

                    </div>

                    <p>Click below to create your password:</p>

                    <a href="%s"
                       style="
                       background:#2e7d32;
                       color:white;
                       padding:12px 24px;
                       text-decoration:none;
                       border-radius:5px;
                       font-weight:bold;">
                       Create Password
                    </a>

                    <br/><br/>

                    <p>
                        After creating your password, you can login using
                        your registered email and password.
                    </p>

                    <br/>

                    <p>
                        Regards,<br/>
                        <b>Deopuri Team</b>
                    </p>

                </div>
                """.formatted(
                doctorUser.getFirstName(),
                doctorUser.getLastName(),
                doctorUser.getEmail(),
                link);
        emailService.sendEmail(
                doctorUser.getEmail(),
                "Doctor Account Created",
                body);
        return "New Doctor Register successfully";
    }

    @Override
    public ResponseEntity<String> createPassword(
            @RequestBody CreatePasswordRequest request) {

        Users user = usersDao.findByInvitationToken(request.token())
                .orElseThrow(() -> new RuntimeException("Invalid token"));

        user.setPassword(passwordEncoder.encode(request.password()));
        user.setPasswordCreated(true);
        user.setInvitationToken(null);

        usersDao.save(user);

        return ResponseEntity.ok("Password created successfully");
    }
}