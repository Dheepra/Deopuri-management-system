export default function Prescriptions() {
  return (
    <div>
      <h2>💊 Prescriptions</h2>

      <textarea
        placeholder="Write prescription..."
        style={{
          width: "100%",
          height: "200px",
          marginTop: "15px",
          padding: "10px",
          
        }}
      />

      <button
        style={{
          marginTop: "10px",
          padding: "10px 20px",
          background: "#2e7d32",
          color: "#fff",
          border: "none",
          borderRadius: "6px",
        }}
      >
        Save
      </button>
    </div>
  );
}