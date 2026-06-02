export default function Reports() {
  return (
    <div>
      <h2>📊 Reports</h2>

      <div style={boxStyle}>
        <p>Blood Test - Completed</p>
        <p>X-Ray - Pending</p>
        <p>ECG - Completed</p>
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