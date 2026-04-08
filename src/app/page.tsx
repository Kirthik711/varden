"use client";

import { useState } from "react";

const USER_CREDENTIALS: Record<string, { id: string; pass: string }> = {
  alpha: { id: "user1", pass: "alpha0001" },
  beta: { id: "user2", pass: "beta0002" },
  gamma: { id: "user3", pass: "gamma0003" },
  delta: { id: "user4", pass: "delta0004" },
};

export default function LoginPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();

    const lowerUser = username.toLowerCase().trim();
    const userMatch = USER_CREDENTIALS[lowerUser];

    if (userMatch && password === userMatch.pass) {
      localStorage.setItem("varden_user", userMatch.id);
      window.location.href = "/portal.html";
    } else {
      alert("Invalid username or password. Please try again.");
    }
  };

  return (
    <div className="auth-box">
      <div className="logo hero-logo">VARDEN</div>
      <form className="login-container" onSubmit={handleLogin}>
        <input
          type="text"
          className="login-input"
          placeholder="USERNAME (alpha, beta...)"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          required
        />

        <input
          type="password"
          className="login-input"
          placeholder="PASSWORD"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />

        <button type="submit" className="submit-btn">
          Login
        </button>
      </form>
    </div>
  );
}
