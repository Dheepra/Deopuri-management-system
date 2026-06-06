import DoctorAppointments from "./DoctorAppointments";

export default function DoctorDashboard() {
  return (
    <>
      {/* Header */}
      <div style={{ marginBottom: "30px" }}>
        <div
          style={{
            fontSize: "14px",
            letterSpacing: "3px",
            color: "#0f8b5f",
            fontWeight: "600",
          }}
        >
          DOCTOR CONSOLE
        </div>

        <h1
          style={{
            fontSize: "52px",
            margin: "10px 0",
            color: "#08152F",
          }}
        >
          Good morning, Doctor
        </h1>

        <p
          style={{
            color: "#56657A",
            fontSize: "18px",
          }}
        >
          Here is your daily practice overview.
        </p>
      </div>

      {/* Stats */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(6,1fr)",
          gap: "18px",
        }}
      >
        <Card title="MY PATIENTS" value="45" />
        <Card title="TODAY APPTS" value="12" />
        <Card title="PRESCRIPTIONS" value="18" />
        <Card title="PENDING REPORTS" value="4" />
        <Card title="FOLLOW UPS" value="6" />
        <Card title="COMPLETED" value="9" />
      </div>

      {/* Quick Actions */}
      <div
        style={{
          background: "#fff",
          borderRadius: "22px",
          padding: "26px",
          marginTop: "30px",
        }}
      >
        <h2>Quick Actions</h2>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(4,1fr)",
            gap: "18px",
            marginTop: "20px",
          }}
        >
          <ActionCard
            title="New Prescription"
            desc="Create a prescription"
          />

          <ActionCard
            title="View Patients"
            desc="Check patient records"
          />

          

          <ActionCard
            title="Upload Report"
            desc="Attach patient reports"
          />
        </div>
      </div>

      {/* Tables */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "2fr 1fr",
          gap: "25px",
          marginTop: "30px",
        }}
      >
        <div
          style={{
            background: "#fff",
            padding: "24px",
            borderRadius: "20px",
          }}
        >
          <h2>Today's Patients</h2>

          <table width="100%">
            <thead>
              <tr>
                <th align="left">Patient</th>
                <th align="left">Disease</th>
                <th align="left">Time</th>
              </tr>
            </thead>

            <tbody>
              <tr>
                <td>Rahul Sharma</td>
                <td>Fever</td>
                <td>10:00 AM</td>
              </tr>

              <tr>
                <td>Neha Singh</td>
                <td>Cold</td>
                <td>11:00 AM</td>
              </tr>

              <tr>
                <td>Aman Verma</td>
                <td>Diabetes</td>
                <td>12:00 PM</td>
              </tr>
            </tbody>
          </table>
        </div>

        <div
          style={{
            background: "#fff",
            padding: "24px",
            borderRadius: "20px",
          }}
        >
          <h2>Recent Prescriptions</h2>

          <p>Rahul - PCM</p>
          <p>Neha - Azithromycin</p>
          <p>Aman - Metformin</p>
        </div>
      </div>
    </>
  );
}

function Card({ title, value }) {
  return (
    <div
      style={{
        background: "#fff",
        borderRadius: "20px",
        padding: "22px",
      }}
    >
      <div
        style={{
          color: "#65748B",
          fontSize: "13px",
          marginBottom: "10px",
        }}
      >
        {title}
      </div>

      <div
        style={{
          fontSize: "42px",
          fontWeight: "700",
        }}
      >
        {value}
      </div>
    </div>
  );
}

function ActionCard({ title, desc }) {
  return (
    <div
      style={{
        border: "1px solid #E6EAF0",
        borderRadius: "16px",
        padding: "20px",
      }}
    >
      <h3>{title}</h3>
      <p style={{ color: "#6B7280" }}>{desc}</p>
    </div>
  );
}