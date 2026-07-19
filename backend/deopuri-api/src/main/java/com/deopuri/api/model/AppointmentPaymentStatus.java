package com.deopuri.api.model;

// Payment state of an appointment. No gateway is involved — the patient pays by UPI/cash
// directly and the hospital verifies, so these are set by the booking + verify flows.
public enum AppointmentPaymentStatus {
    UNPAID,          // no payment yet
    SUBMITTED,       // patient paid by UPI and submitted a reference — awaiting hospital verify
    PAID,            // hospital verified / received the payment
    PAY_AT_HOSPITAL  // patient chose to pay cash at the reception
}
