package com.deopuri.service.service;

import java.time.LocalDate;
import java.util.List;

import com.deopuri.api.dto.StaffAttendanceRow;
import com.deopuri.api.dto.StaffRequest;
import com.deopuri.api.dto.StaffResponse;

public interface StaffService {

    List<StaffResponse> getMyStaff();

    StaffResponse create(StaffRequest request);

    StaffResponse update(Long id, StaffRequest request);

    void delete(Long id);

    // PRESENT / LEAVE / ABSENT for each of the current admin's staff on the given day.
    List<StaffAttendanceRow> getAttendanceRoster(LocalDate date);

    // Monthly attendance matrix (per staff × day) as CSV, for payroll. month = "yyyy-MM".
    String exportAttendanceCsv(String month);
}
