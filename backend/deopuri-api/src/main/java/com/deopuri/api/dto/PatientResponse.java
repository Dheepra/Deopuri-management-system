package com.deopuri.api.dto;

/**
 * A patient as seen by the hospital admin. Patients are NOT a separate table — they are derived
 * from the {@code appointments} a hospital admin has received (whoever books an appointment is a
 * patient). One row here = one unique patient (deduped by mobile), summarising their visits.
 */
public record PatientResponse(
        String name,
        String mobile,
        Integer age,
        String gender,
        String doctorName,
        String lastVisit,
        String status,
        long totalVisits) {
}
