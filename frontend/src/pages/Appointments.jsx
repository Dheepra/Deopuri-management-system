import { useEffect, useState } from "react";
import axios from "axios";



export default function AppointmentBooking({
  formData,
  setFormData,
  setReviewData,
  setStep
}){


  const [doctors, setDoctors] = useState([]);
const [hospitals, setHospitals] = useState([]);
  

useEffect(() => {
  axios.get("http://localhost:8080/api/hospitals")
    .then(res => {
      setHospitals(res.data);
    })
    .catch(err => console.log(err));
}, []);


    
useEffect(() => {
  const loadDoctors = async () => {
    if (!formData.hospitalAdminId) return;

    try {
      const response = await axios.get(
        `http://localhost:8080/api/hospital-admin/doctors/hospital/${formData.hospitalAdminId}`
      );

      setDoctors(response.data);
    } catch (error) {
      console.log(error);
    }
  };

  loadDoctors();
}, [formData.hospitalAdminId]);

const handleHospitalChange = async (e) => {

  const hospitalAdminId = e.target.value;

  setFormData({
    ...formData,
    hospitalAdminId,
    doctorId: ""
  });

  try {

    const response = await axios.get(
      `http://localhost:8080/api/hospital-admin/doctors/hospital/${hospitalAdminId}`
    );

    setDoctors(response.data);

  } catch (error) {
    console.log(error);
  }
};

const handleChange = (e) => {
  const { name, value } = e.target;

  if (name === "patientMobile") {
    const mobile = value.replace(/\D/g, "").slice(0, 10);

    setFormData({
      ...formData,
      [name]: mobile
    });
    return;
  }

  setFormData({
    ...formData,
    [name]: value
  });
};

 const handleSubmit = (e) => {
  e.preventDefault();

  setReviewData({
    formData,
    doctors,
    hospitals
  });

  setStep("review");
};




  return (
    <div style={styles.page}>
      <div style={styles.card}>

        <h2 style={styles.title}>Book Appointment</h2>

        <form onSubmit={handleSubmit} style={styles.form}>

          <input
  style={styles.input}
  name="patientName"
  value={formData.patientName}
  placeholder="Patient Name"
  onChange={handleChange}
  required
/>

<input
  style={styles.input}
  name="patientMobile"
  value={formData.patientMobile}
  placeholder="Mobile Number"
  onChange={handleChange}
  pattern="[0-9]{10}"
  maxLength={10}
  required
/>

<input
  style={styles.input}
  type="email"
  name="patientEmail"
  value={formData.patientEmail}
  placeholder="Email Address"
  onChange={handleChange}
  required
/>

<input
  style={styles.input}
  type="number"
  name="patientAge"
  value={formData.patientAge}
  placeholder="Age"
  min="1"
  max="120"
  onChange={handleChange}
  required
/>

<select
  style={styles.input}
  name="patientGender"
  value={formData.patientGender}
  onChange={handleChange}
  required
>
<option value="">Gender</option>
  <option value="Male">Male</option>
  <option value="Female">Female</option>
  <option value="Other">Other</option>
</select>

<select
  style={styles.input}
  name="hospitalAdminId"
  value={formData.hospitalAdminId}
  onChange={handleHospitalChange}
  required
>
  <option value="">Select Hospital</option>

  {hospitals.map((hospital) => (
    <option key={hospital.id} value={hospital.id}>
      {hospital.shopName}
    </option>
  ))}
</select>

<select
  style={styles.input}
  name="doctorId"
  value={formData.doctorId}
  onChange={handleChange}
  required
>
  <option value="">Select Doctor</option>

  {doctors.map((doc) => (
    <option key={doc.id} value={doc.id}>
      Dr. {doc.firstName} {doc.lastName} - {doc.specialization}
    </option>
  ))}
</select>

<input
  style={styles.input}
  type="date"
  name="appointmentDate"
  value={formData.appointmentDate}
  onChange={handleChange}
  required
/>

<input
  style={styles.input}
  type="time"
  name="appointmentTime"
  value={formData.appointmentTime}
  onChange={handleChange}
  required
/>

<textarea
  style={styles.textarea}
  name="notes"
  value={formData.notes}
  placeholder="Write notes (optional)"
  onChange={handleChange}
/>
          <button style={styles.button} type="submit">
             Review Appointment
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
    background: "#157d58",
    color: "#fff",
    border: "none",
    borderRadius: "6px",
    cursor: "pointer",
    fontWeight: "bold"
  }
};