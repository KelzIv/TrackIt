import React, { useState } from "react";
import { registerUser } from "../services/api";

export default function Register() {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const data = await registerUser({ username, email, password });
      setMessage(`User registered: ${data.user.username}`);
    } catch (err) {
      console.error(err);
      setMessage(
        err.response?.data?.error || "Registration failed"
      );
    }
  };

  return (
    <>
      <form onSubmit={handleSubmit}>
        <input
          value={username}
          onChange={e => setUsername(e.target.value)}
          placeholder="Username"
          required
        />
        <input
          value={email}
          onChange={e => setEmail(e.target.value)}
          placeholder="Email"
          type="email"
          required
        />
        <input
          value={password}
          onChange={e => setPassword(e.target.value)}
          placeholder="Password"
          type="password"
          required
        />
        <button type="submit">Register</button>
      </form>

      {message && <p className="auth-message">{message}</p>}
    </>
  );
}
