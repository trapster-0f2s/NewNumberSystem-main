import React, { useState } from "react";
import { registerUser } from "./api";

export default function Signup({ onSignupSuccess }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [message, setMessage] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    const response = await registerUser({ email, password });
    if (response.token) {
      setMessage("Signup successful!");
      onSignupSuccess && onSignupSuccess(response.token);
    } else {
      setMessage(response.error || "Signup failed");
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <h2>Sign Up</h2>
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
      <button type="submit">Sign Up</button>
      <div>{message}</div>
    </form>
  );
}
