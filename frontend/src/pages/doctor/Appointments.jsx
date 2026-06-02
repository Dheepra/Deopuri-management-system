export default function Appointments() {
  return (
    <div>
      <h2>📅 Appointments</h2>

      <div style={boxStyle}>
        <p>10:00 AM - Rahul Sharma</p>
        <p>11:30 AM - Neha Singh</p>
        <p>01:00 PM - Aman Verma</p>
      </div>
    </div>
  );
}

const boxStyle = {
  marginTop: "15px",
  background: "#fff",
  padding: "15px",
  borderRadius: "10px",
  boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
};