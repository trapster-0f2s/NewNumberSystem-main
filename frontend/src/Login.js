import React, { useState } from "react";
import { loginUser } from "./api";

export default function Login({ onLoginSuccess }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [message, setMessage] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    const response = await loginUser({ email, password });
    if (response.token) {
      setMessage("Login successful!");
      onLoginSuccess && onLoginSuccess(response.token);
    } else {
      setMessage(response.error || "Login failed");
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <h2>Login</h2>
      <input
        type="email"
        placeholder="Email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        required
      />
      <input
        type={showPassword ? "text" : "password"}
        placeholder="Password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        required
      />
      <label style={{ display: "block", marginTop: 8 }}>
        <input
          type="checkbox"
          checked={showPassword}
          onChange={(e) => setShowPassword(e.target.checked)}
        />
        {' '}
        Show password
      </label>
      <button type="submit">Login</button>
      <div>{message}</div>
    </form>
  );
}
