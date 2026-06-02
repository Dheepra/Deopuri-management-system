import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";

export default function CreatePassword() {
  const navigate = useNavigate();
  const location = useLocation();

  const userId = location.state?.userId;

  console.log("LOCATION STATE =", location.state);
  console.log("USER ID =", userId);

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!password || !confirmPassword) {
      alert("Please fill all fields");
      return;
    }

    if (password !== confirmPassword) {
      alert("Passwords do not match");
      return;
    }

    if (!userId) {
      alert("Invalid access. Please login again.");
      navigate("/login");
      return;
    }

    try {
      setLoading(true);

      console.log("CREATE PASSWORD REQUEST =", {
        userId,
        password,
      });

      const response = await fetch(
        `http://localhost:8080/api/auth/create-password/${userId}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            userId,
            password,
          }),
        }
      );

      console.log("RESPONSE STATUS =", response.status);

      const text = await response.text();
      console.log("RESPONSE BODY =", text);

      if (response.ok) {
        alert("Password created successfully");
        navigate("/login");
      } else {
        alert(text || "Failed to create password");
      }
    } catch (error) {
      console.error("CREATE PASSWORD ERROR =", error);
      alert("Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
  style={{
    minHeight: "100vh",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    background: "linear-gradient(135deg, #e0f2f1, #f5f5f5)",
    fontFamily: "Arial, sans-serif",
  }}
>
  <div
    style={{
      width: "100%",
      maxWidth: "420px",
      background: "#fff",
      padding: "35px",
      borderRadius: "14px",
      boxShadow: "0 8px 25px rgba(0,0,0,0.1)",
      borderTop: "5px solid #2e7d32",
    }}
  >
    <h2
      style={{
        textAlign: "center",
        marginBottom: "25px",
        color: "#2e7d32",
        fontSize: "24px",
        fontWeight: "600",
      }}
    >
      🔐 Create Your Password
    </h2>

    <form onSubmit={handleSubmit}>
      {/* Password */}
      <div style={{ marginBottom: "18px" }}>
        <label style={{ fontSize: "14px", color: "#555" }}>
          New Password
        </label>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Enter new password"
          style={{
            width: "100%",
            padding: "12px",
            marginTop: "6px",
            borderRadius: "8px",
            border: "1px solid #ccc",
            outline: "none",
            transition: "0.3s",
          }}
        />
      </div>

      {/* Confirm Password */}
      <div style={{ marginBottom: "22px" }}>
        <label style={{ fontSize: "14px", color: "#555" }}>
          Confirm Password
        </label>
        <input
          type="password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          placeholder="Re-enter password"
          style={{
            width: "100%",
            padding: "12px",
            marginTop: "6px",
            borderRadius: "8px",
            border: "1px solid #ccc",
            outline: "none",
          }}
        />
      </div>

      {/* Button */}
      <button
        type="submit"
        disabled={loading}
        style={{
          width: "100%",
          padding: "12px",
          background: loading ? "#a5d6a7" : "#2e7d32",
          color: "#fff",
          border: "none",
          borderRadius: "8px",
          fontSize: "16px",
          cursor: loading ? "not-allowed" : "pointer",
          transition: "0.3s",
        }}
      >
        {loading ? "Creating Password..." : "Create Password"}
      </button>
    </form>
  </div>
</div>
  );
}