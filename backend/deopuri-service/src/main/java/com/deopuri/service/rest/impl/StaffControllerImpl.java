package com.deopuri.service.rest.impl;

import com.deopuri.api.dto.StaffAttendanceRow;
import com.deopuri.api.dto.StaffRequest;
import com.deopuri.api.dto.StaffResponse;
import com.deopuri.api.rest.StaffController;
import com.deopuri.service.service.StaffService;

import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.RestController;

import java.time.LocalDate;
import java.util.List;

@RestController
public class StaffControllerImpl implements StaffController {

    private final StaffService staffService;

    public StaffControllerImpl(StaffService staffService) {
        this.staffService = staffService;
    }

    @Override
    public ResponseEntity<List<StaffResponse>> getMyStaff() {
        return ResponseEntity.ok(staffService.getMyStaff());
    }

    @Override
    public ResponseEntity<StaffResponse> create(@Valid StaffRequest request) {
        return ResponseEntity.ok(staffService.create(request));
    }

    @Override
    public ResponseEntity<StaffResponse> update(Long id, @Valid StaffRequest request) {
        return ResponseEntity.ok(staffService.update(id, request));
    }

    @Override
    public ResponseEntity<Void> delete(Long id) {
        staffService.delete(id);
        return ResponseEntity.noContent().build();
    }

    @Override
    public ResponseEntity<List<StaffAttendanceRow>> getAttendanceRoster(LocalDate date) {
        return ResponseEntity.ok(staffService.getAttendanceRoster(date));
    }

    @Override
    public ResponseEntity<String> exportAttendance(String month) {
        String csv = staffService.exportAttendanceCsv(month);
        String fname = "attendance-" + (month != null && !month.isBlank() ? month : "current") + ".csv";
        return ResponseEntity.ok()
                .header("Content-Disposition", "attachment; filename=\"" + fname + "\"")
                .header("Content-Type", "text/csv; charset=utf-8")
                .body(csv);
    }
}
