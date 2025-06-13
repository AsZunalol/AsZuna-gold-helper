"use client";
import { useState } from "react";
import { useAuthModal } from "@/context/AuthModalContext";

export default function RegisterForm() {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const { openModal } = useAuthModal();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, email, password }),
      });

      if (res.ok) {
        openModal("login"); // Switch to login view on successful registration
      } else {
        const data = await res.json();
        setError(data.message || "Something went wrong.");
      }
    } catch (error) {
      setError("An error occurred. Please try again.");
    }
  };

  return (
    <div>
      <h2>Create Account</h2>
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="register-username">Username</label>
          <input
            type="text"
            id="register-username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
          />
        </div>
        <div className="form-group">
          <label htmlFor="register-email">Email</label>
          <input
            type="email"
            id="register-email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>
        <div className="form-group">
          <label htmlFor="register-password">Password</label>
          <input
            type="password"
            id="register-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>
        {error && <p className="error-message">{error}</p>}
        <button type="submit" className="form-button">
          Register
        </button>
      </form>
      <p className="modal-switch-text">
        Already have an account?{" "}
        <a href="#" onClick={() => openModal("login")}>
          Login
        </a>
      </p>
    </div>
  );
}
