import axios from "axios";

export default function AppointmentReview({
  reviewData,
  setStep,
  setShowAppointmentForm,
  setReviewData,
  resetAppointmentFlow
}){
  if (!reviewData?.formData) {
    return <p>No Data Found</p>;
  }

  const { formData, doctors = [], hospitals = [] } = reviewData;

  const doctor = doctors.find(
    d => d.id === Number(formData.doctorId)
  );

  const hospital = hospitals.find(
    h => h.id === Number(formData.hospitalAdminId)
  );

  const handleConfirm = async () => {
    try {
      const payload = {
        ...formData,
        doctorId: Number(formData.doctorId),
        hospitalAdminId: Number(formData.hospitalAdminId)
      };

      console.log("FINAL PAYLOAD:", payload);

      await axios.post(
        "http://localhost:8080/api/appointments",
        payload
      );

      alert("Appointment Booked Successfully");

      // ✅ FULL RESET AFTER SUCCESS


  resetAppointmentFlow();


    } catch (error) {
      console.log(error.response?.data || error);
      alert("Error booking appointment");
    }
  };

  const handleEdit = () => {
    setStep("form"); // keep data safe
  };

  return (
    <div style={styles.card}>
      <h2 style={styles.title}>Review Appointment</h2>

      <div style={styles.field}>
        <label style={styles.label}>Patient Name</label>
        <input style={styles.input} value={formData.patientName} readOnly />
      </div>

      <div style={styles.field}>
        <label style={styles.label}>Mobile Number</label>
        <input style={styles.input} value={formData.patientMobile} readOnly />
      </div>

      <div style={styles.field}>
        <label style={styles.label}>Email</label>
        <input style={styles.input} value={formData.patientEmail} readOnly />
      </div>

      <div style={styles.field}>
        <label style={styles.label}>Age</label>
        <input style={styles.input} value={formData.patientAge} readOnly />
      </div>

      <div style={styles.field}>
        <label style={styles.label}>Gender</label>
        <input style={styles.input} value={formData.patientGender} readOnly />
      </div>

      <div style={styles.field}>
        <label style={styles.label}>Hospital</label>
        <input style={styles.input} value={hospital?.shopName || ""} readOnly />
      </div>

      <div style={styles.field}>
        <label style={styles.label}>Doctor</label>
        <input
          style={styles.input}
          value={`Dr. ${doctor?.firstName || ""} ${doctor?.lastName || ""}`}
          readOnly
        />
      </div>

      <div style={styles.field}>
        <label style={styles.label}>Appointment Date</label>
        <input style={styles.input} value={formData.appointmentDate} readOnly />
      </div>

      <div style={styles.field}>
        <label style={styles.label}>Appointment Time</label>
        <input style={styles.input} value={formData.appointmentTime} readOnly />
      </div>

      <div style={styles.field}>
        <label style={styles.label}>Notes</label>
        <textarea style={styles.textarea} value={formData.notes} readOnly />
      </div>

      <div style={styles.buttonContainer}>
        <button style={styles.backButton} onClick={handleEdit}>
          Edit Details
        </button>

        <button style={styles.confirmButton} onClick={handleConfirm}>
          Confirm Appointment
        </button>
      </div>
    </div>
  );
}
const styles = {
  page: {
    minHeight: "100vh",
    background: "#f4f6f8",
    display: "flex",
    justifyContent: "center",
    alignItems: "center"
  },

  card: {
    width: "500px",
    background: "#fff",
    padding: "25px",
    borderRadius: "12px",
    boxShadow: "0 8px 20px rgba(0,0,0,0.1)"
  },

  title: {
    textAlign: "center",
    marginBottom: "20px",
    color: "#157d58"
  },

  field: {
    display: "flex",
    flexDirection: "column",
    marginBottom: "12px"
  },

  label: {
    marginBottom: "5px",
    fontWeight: "600"
  },

  input: {
    padding: "10px",
    border: "1px solid #ccc",
    borderRadius: "6px",
    background: "#f9f9f9"
  },

  textarea: {
    padding: "10px",
    border: "1px solid #ccc",
    borderRadius: "6px",
    minHeight: "80px",
    background: "#f9f9f9"
  },

  buttonContainer: {
    display: "flex",
    justifyContent: "space-between",
    marginTop: "20px"
  },

  backButton: {
    padding: "10px 20px",
    background: "#6c757d",
    color: "#fff",
    border: "none",
    borderRadius: "6px",
    cursor: "pointer"
  },

  confirmButton: {
    padding: "10px 20px",
    background: "#157d58",
    color: "#fff",
    border: "none",
    borderRadius: "6px",
    cursor: "pointer"
  }
};