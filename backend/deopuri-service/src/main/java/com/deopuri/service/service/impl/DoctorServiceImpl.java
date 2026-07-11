package com.deopuri.service.service.impl;

import com.deopuri.api.dto.CreateDoctorRequest;
import com.deopuri.api.dto.CreatePasswordRequest;
import com.deopuri.api.dto.DoctorResponse;
import com.deopuri.api.model.Doctor;
import com.deopuri.api.model.UserRole;
import com.deopuri.api.model.UserStatus;
import com.deopuri.api.model.Users;
import com.deopuri.service.dao.DoctorDao;
import com.deopuri.service.dao.UsersDao;
import com.deopuri.service.service.DoctorService;
import com.deopuri.service.service.EmailService;
import com.deopuri.exception.ResourceNotFoundException;
import com.deopuri.exception.BusinessException;
import org.springframework.http.ResponseEntity;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import java.util.List;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;



@Service
@Transactional
public class DoctorServiceImpl implements DoctorService {

    private static final Logger log = LoggerFactory.getLogger(DoctorServiceImpl.class);

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
        //String token = UUID.randomUUID().toString();

        // 2. Create User
        Users doctorUser = new Users();
        doctorUser.setFirstName(request.firstName());
        doctorUser.setLastName(request.lastName());
        doctorUser.setEmail(request.email());
        doctorUser.setMobileNo(request.mobileNo());

        doctorUser.setRole(UserRole.DOCTOR);
        doctorUser.setStatus(UserStatus.APPROVED);

        // Random, per-doctor temporary password — never a shared constant. It is emailed to the
        // doctor (below) and replaced on first login. A shared "Temp@123" let anyone log in as any
        // freshly-created doctor.
        String tempPassword = "Dp@" + java.util.UUID.randomUUID().toString().replace("-", "").substring(0, 12);

        doctorUser.setPassword(
                passwordEncoder.encode(tempPassword));

        doctorUser.setPasswordCreated(false);

        // Single-use invitation token — required by create-password so only the invited doctor
        // (who received this token by email, or logged in with the temp password) can set the password.
        String invitationToken = java.util.UUID.randomUUID().toString();
        doctorUser.setInvitationToken(invitationToken);

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
        String link = "http://localhost:5173/login?userId=" + doctorUser.getId()
                + "&token=" + invitationToken;

        String body = """
                <div style="font-family:Arial,sans-serif; padding:20px; text-align:center;">

                    <!-- OUTER CENTER WRAPPER -->
                    <div style="
                        max-width:600px;
                        margin:0 auto;
                        border:1px solid #ddd;
                        border-radius:10px;
                        padding:20px;
                        text-align:center;
                        background:#ffffff;
                    ">

                        <img src='cid:logoImage' width='120' style="margin-bottom:15px;"/>

                        <h2 style="color:#2e7d32;">Deopuri Herbal Drugs and Pharmaceuticals</h2>

                        <hr style="width:60%%; margin:15px auto;"/>

                        <h2>Welcome Doctor 👨‍⚕️</h2>

                        <p>Hello Dr. <b>%s %s</b>,</p>

                        <p>Your account has been created successfully by Hospital Admin.</p>

                        <!-- LOGIN BOX -->
                        <div style="
                            background:#f5f5f5;
                            padding:15px;
                            border-radius:8px;
                            width:100%%;
                            margin:20px auto;
                            text-align:center;
                        ">

                            <p><b>Login Email:</b> %s</p>
                            <p><b>Temporary Password:</b> %s</p>

                        </div>

                        <p>Click below to create your password:</p>

                        <!-- CENTER BUTTON -->
                        <a href="%s"
                           style="
                           display:inline-block;
                           background:#2e7d32;
                           color:white;
                           padding:12px 24px;
                           text-decoration:none;
                           border-radius:5px;
                           font-weight:bold;
                           margin-top:10px;">
                           Create Password
                        </a>

                        <br/><br/>

                        <p>After creating your password, you can login using your registered email and password.</p>

                        <p>Regards,<br/><b>Deopuri Team</b></p>

                    </div>

                </div>
                """.formatted(
                doctorUser.getFirstName(),
                doctorUser.getLastName(),
                doctorUser.getEmail(),
                tempPassword,
                link);
        emailService.sendEmail(
                doctorUser.getEmail(),
                "Doctor Account Created",
                body);
        return "New Doctor Register successfully";
    }

    @Override
    @Transactional
    public ResponseEntity<String> createPassword(Integer userId, CreatePasswordRequest request) {

        log.info("CREATE PASSWORD START userId={}", userId);

        if (userId == null || request == null || request.password() == null || request.password().trim().isEmpty()) {
            throw new BusinessException("password_required", "Password is required");
        }

        Users user = usersDao.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("Doctor not found"));

        // 🔥 IMPORTANT CHECK
        if (Boolean.TRUE.equals(user.getPasswordCreated())) {
            throw new BusinessException("password_already_created", "Password already created");
        }

        // 🔒 Bind this call to the invitation: the caller must present the single-use token that was
        // emailed to the doctor (or returned on first-time login). Without this, anyone could set a
        // password for any not-yet-activated user by guessing the userId (account takeover).
        String presentedToken = request.token();
        if (presentedToken == null || presentedToken.isBlank()
                || user.getInvitationToken() == null
                || !presentedToken.equals(user.getInvitationToken())) {
            throw new BusinessException("invalid_password_setup_link", "Invalid or expired password-setup link");
        }

        String encodedPassword = passwordEncoder.encode(request.password().trim());

        user.setPassword(encodedPassword);
        user.setPasswordCreated(true);
        // Single-use: burn the token so the link can't be replayed.
        user.setInvitationToken(null);

        usersDao.save(user);

        log.info("CREATE PASSWORD SUCCESS for userId={}", userId);

        return ResponseEntity.ok("Password created successfully");
    }

    @Override
public List<Doctor> getAllDoctors() {
    return doctorDao.findAll();
}
@Override
public List<DoctorResponse> getDoctorsByHospital(Integer hospitalAdminId) {

    return doctorDao.findByHospitalAdminId(hospitalAdminId)
            .stream()
            .map(doctor -> new DoctorResponse(
                    doctor.getId(),
                    doctor.getUser().getFirstName(),
                    doctor.getUser().getLastName(),
                    doctor.getSpecialization()
            ))
            .toList();
}

@Override
public DoctorResponse getDoctorByUserId(Integer userId) {

    Doctor doctor = doctorDao.findByUserId(userId)
            .orElseThrow(() ->
                    new ResourceNotFoundException("Doctor not found"));

    return new DoctorResponse(
            doctor.getId(),
            doctor.getUser().getFirstName(),
            doctor.getUser().getLastName(),
            doctor.getSpecialization()
    );
}
}