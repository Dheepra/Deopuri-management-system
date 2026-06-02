export default function MyPatients() {
  return (
    <div>
      <h2>🧑‍🤝‍🧑 My Patients</h2>

      <div style={boxStyle}>
        <p>Rahul Sharma - 35 yrs - Fever</p>
        <p>Neha Singh - 28 yrs - Cold</p>
        <p>Aman Verma - 42 yrs - Diabetes</p>
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