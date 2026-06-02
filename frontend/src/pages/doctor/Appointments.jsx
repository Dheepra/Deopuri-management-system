import { useEffect, useState } from "react";
import axios from "axios";

export default function AppointmentBooking() {

  const [doctors, setDoctors] = useState([]);

  const [formData, setFormData] = useState({
    patientName: "",
    patientMobile: "",
    patientEmail: "",
    patientAge: "",
    patientGender: "Male",
    doctorId: "",
    appointmentDate: "",
    appointmentTime: "",
    notes: ""
  });

  useEffect(() => {
  axios.get("http://localhost:8080/api/hospital-admin/doctors")
    .then(res => {
      console.log("DOCTORS:", res.data);
      setDoctors(res.data);
    })
    .catch(err => console.log(err));
}, []);
    

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      await axios.post("http://localhost:8080/api/appointments", formData);
      alert("Appointment Booked Successfully!");
        setFormData({
      patientName: "",
      patientMobile: "",
      patientEmail: "",
      patientAge: "",
      patientGender: "Male",
      doctorId: "",
      appointmentDate: "",
      appointmentTime: "",
      notes: ""
    });
    } catch (error) {
      console.log(error);
      alert("Error booking appointment");
    }
  };

  return (
    <div style={styles.page}>
      <div style={styles.card}>

        <h2 style={styles.title}>Book Appointment</h2>

        <form onSubmit={handleSubmit} style={styles.form}>

          <input style={styles.input}
            name="patientName"
            placeholder="Patient Name"
            onChange={handleChange}
          />

          <input style={styles.input}
            name="patientMobile"
            placeholder="Mobile Number"
            onChange={handleChange}
          />

          <input style={styles.input}
            name="patientEmail"
            placeholder="Email Address"
            onChange={handleChange}
          />

          <input style={styles.input}
            name="patientAge"
            placeholder="Age"
            onChange={handleChange}
          />

          <select style={styles.input}
            name="patientGender"
            onChange={handleChange}
          >
            <option>Male</option>
            <option>Female</option>
            <option>Other</option>
          </select>

          {/* 🔥 DOCTOR DROPDOWN */}
          <select name="doctorId" onChange={handleChange}>
  <option value="">Select Doctor</option>

  {doctors.map(doc => (
    <option key={doc.id} value={doc.id}>
      Dr. {doc.firstName} {doc.lastName} — {doc.specialization}
    </option>
  ))}
</select>
          <input style={styles.input}
            type="date"
            name="appointmentDate"
            onChange={handleChange}
          />

          <input style={styles.input}
            type="time"
            name="appointmentTime"
            onChange={handleChange}
          />

          <textarea style={styles.textarea}
            name="notes"
            placeholder="Write notes (optional)"
            onChange={handleChange}
          />

          <button style={styles.button} type="submit">
            Book Appointment
          </button>

        </form>
      </div>
    </div>
  );
}

const styles = {
  page: {
    minHeight: "100vh",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    background: "#f4f6f8"
  },

  card: {
    width: "450px",
    background: "#fff",
    padding: "25px",
    borderRadius: "12px",
    boxShadow: "0 8px 20px rgba(0,0,0,0.1)"
  },

  title: {
    textAlign: "center",
    marginBottom: "20px",
    color: "#2e7d32"
  },

  form: {
    display: "flex",
    flexDirection: "column",
    gap: "12px"
  },

  input: {
    padding: "10px",
    borderRadius: "6px",
    border: "1px solid #ccc",
    outline: "none"
  },

  textarea: {
    padding: "10px",
    borderRadius: "6px",
    border: "1px solid #ccc",
    minHeight: "80px"
  },

  button: {
    padding: "12px",
    background: "#2e7d32",
    color: "#fff",
    border: "none",
    borderRadius: "6px",
    cursor: "pointer",
    fontWeight: "bold"
  }
};