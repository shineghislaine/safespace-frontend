import React, { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";

export default function VerifyCode() {
  const location = useLocation();
  const navigate = useNavigate();
  const email = location.state?.email || "";

  const [code, setCode] = useState("");
  const [message, setMessage] = useState("");
  const [resending, setResending] = useState(false);

  const API_URL = import.meta.env.VITE_API_URL;

  const handleVerify = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch(`${API_URL}/auth/verify`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, code }),
      });

      const data = await res.json();
      if (res.ok) {
        setMessage("✅ Verified! You can now login.");
        navigate("/login");
      } else {
        setMessage(data.message);
      }
    } catch {
      setMessage("❌ Server error. Try again.");
    }
  };

  const handleResend = async () => {
    setResending(true);
    try {
      const res = await fetch(`${API_URL}/auth/resend-code`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      const data = await res.json();
      setMessage(res.ok ? "✅ New code sent to your email." : data.message);
    } catch {
      setMessage("❌ Failed to resend code.");
    } finally {
      setResending(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <h2>Email Verification</h2>
        <p className="subtitle">Enter the 6-digit code sent to {email}</p>

        <form className="auth-form" onSubmit={handleVerify}>
          <div className="form-group">
            <label>Verification Code</label>
            <input
              type="text"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              placeholder="Enter your code"
              maxLength={6}
              required
            />
          </div>

          <button type="submit" className="auth-btn">Verify</button>
        </form>

        <button
          onClick={handleResend}
          className="auth-btn secondary-btn"
          disabled={resending}
          style={{ marginTop: "10px" }}
        >
          {resending ? "Resending..." : "Resend Code"}
        </button>

        {message && <p style={{ marginTop: "10px" }}>{message}</p>}
      </div>
    </div>
  );
}
