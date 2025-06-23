"use client";
import { useState } from "react";
import { useAuthModal } from "@/context/AuthModalContext";

export default function RegisterForm() {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { setModalView } = useAuthModal();

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (username.length <= 2) {
      setError("Username must be longer than 2 characters.");
      return;
    }
    if (password.length <= 6) {
      setError("Password must be longer than 6 characters.");
      return;
    }
    const specialCharRegex = /[!@#$%^&*(),.?":{}|<>]/;
    if (!specialCharRegex.test(password)) {
      setError("Password must contain at least one special character.");
      return;
    }
    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setError("");
    setLoading(true);
    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, email, password }),
      });

      if (res.ok) {
        setModalView("login");
      } else {
        const data = await res.json();
        setError(data.message || "Something went wrong.");
      }
    } catch (error) {
      setError("An error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label
            htmlFor="register-username"
            className="block text-sm font-medium text-gray-300 mb-2"
          >
            Username
          </label>
          <input
            type="text"
            id="register-username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
            className="w-full px-4 py-2 bg-slate-800 border border-slate-600 rounded-md text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
            placeholder="YourUsername"
          />
        </div>
        <div>
          <label
            htmlFor="register-email"
            className="block text-sm font-medium text-gray-300 mb-2"
          >
            Email
          </label>
          <input
            type="email"
            id="register-email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="w-full px-4 py-2 bg-slate-800 border border-slate-600 rounded-md text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
            placeholder="you@example.com"
          />
        </div>
        <div>
          <label
            htmlFor="register-password"
            className="block text-sm font-medium text-gray-300 mb-2"
          >
            Password
          </label>
          <input
            type="password"
            id="register-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="w-full px-4 py-2 bg-slate-800 border border-slate-600 rounded-md text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
            placeholder="••••••••"
          />
        </div>
        <div>
          <label
            htmlFor="register-confirm-password"
            className="block text-sm font-medium text-gray-300 mb-2"
          >
            Confirm Password
          </label>
          <input
            type="password"
            id="register-confirm-password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
            className="w-full px-4 py-2 bg-slate-800 border border-slate-600 rounded-md text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
            placeholder="••••••••"
          />
        </div>
        {error && (
          <p className="text-sm bg-red-500/10 text-red-500 border border-red-500/20 rounded-md p-3 text-center">
            {error}
          </p>
        )}
        <button
          type="submit"
          disabled={loading}
          className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-teal-600 hover:bg-teal-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? "Creating account..." : "Register"}
        </button>
      </form>
      <p className="text-center text-sm text-gray-400">
        Already have an account?{" "}
        <button
          onClick={() => setModalView("login")}
          className="font-medium text-teal-400 hover:text-teal-300"
        >
          Login
        </button>
      </p>
    </div>
  );
}
