package com.deopuri.api.rest;

import java.time.LocalDate;
import java.util.List;

import com.deopuri.api.dto.StaffAttendanceRow;
import com.deopuri.api.dto.StaffRequest;
import com.deopuri.api.dto.StaffResponse;

import jakarta.validation.Valid;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;

// Staff management is available to both hospital and medical admins — each only ever sees the staff
// they created (scoped by the owning admin in the service).
@RequestMapping("/deopuri/hospital-admin")
public interface StaffController {

    @PreAuthorize("hasAnyRole('HOSPITAL_ADMIN','MEDICAL_ADMIN')")
    @GetMapping("/staff")
    ResponseEntity<List<StaffResponse>> getMyStaff();

    @PreAuthorize("hasAnyRole('HOSPITAL_ADMIN','MEDICAL_ADMIN')")
    @PostMapping("/staff")
    ResponseEntity<StaffResponse> create(@Valid @RequestBody StaffRequest request);

    @PreAuthorize("hasAnyRole('HOSPITAL_ADMIN','MEDICAL_ADMIN')")
    @PutMapping("/staff/{id}")
    ResponseEntity<StaffResponse> update(@PathVariable Long id, @Valid @RequestBody StaffRequest request);

    @PreAuthorize("hasAnyRole('HOSPITAL_ADMIN','MEDICAL_ADMIN')")
    @DeleteMapping("/staff/{id}")
    ResponseEntity<Void> delete(@PathVariable Long id);

    // Attendance roster for a given day: who was PRESENT / LEAVE / ABSENT among my staff.
    @PreAuthorize("hasAnyRole('HOSPITAL_ADMIN','MEDICAL_ADMIN')")
    @GetMapping("/staff/attendance")
    ResponseEntity<List<StaffAttendanceRow>> getAttendanceRoster(
            @RequestParam(required = false)
            @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date);

    // Monthly attendance matrix as a downloadable CSV (payroll). month = "yyyy-MM" (defaults to current).
    @PreAuthorize("hasAnyRole('HOSPITAL_ADMIN','MEDICAL_ADMIN')")
    @GetMapping(value = "/staff/attendance/export", produces = "text/csv")
    ResponseEntity<String> exportAttendance(@RequestParam(required = false) String month);
}
