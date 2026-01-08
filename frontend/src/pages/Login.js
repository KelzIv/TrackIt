// src/pages/Login.js
import { useState } from "react";
import { loginUser } from "../services/api";

export default function Login({ setToken }) {
  const [form, setForm] = useState({ username: "", password: "" });
  const [message, setMessage] = useState("");

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const data = await loginUser(form);
      setToken(data.token); // Save JWT in parent component or localStorage
      setMessage("Login successful!");
    } catch (err) {
      setMessage("Login failed. Check credentials.");
    }
  };

  return (
    <>
      <form onSubmit={handleSubmit}>
        <input
          name="username"
          placeholder="Username"
          value={form.username}
          onChange={handleChange}
          required
        />
        <input
          name="password"
          type="password"
          placeholder="Password"
          value={form.password}
          onChange={handleChange}
          required
        />
        <button type="submit">Login</button>
      </form>

      {message && <p className="auth-message">{message}</p>}
    </>
  );
}
