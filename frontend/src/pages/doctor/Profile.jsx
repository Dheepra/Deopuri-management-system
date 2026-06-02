export default function Profile() {
  return (
    <div>
      <h2>👤 Doctor Profile</h2>

      <div style={boxStyle}>
        <p>Name: Dr. Sharma</p>
        <p>Specialization: Cardiology</p>
        <p>Experience: 8 Years</p>
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