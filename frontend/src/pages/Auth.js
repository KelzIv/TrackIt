import { useState } from "react";
import Login from "./Login";
import Register from "./Register";
import "./Auth.css";

export default function Auth({ setToken }) {
  const [mode, setMode] = useState("login"); // "login" | "register"

  return (
    <div className="auth-container">
      <div className="auth-card">
        <h2>{mode === "login" ? "Welcome Back" : "Create Account"}</h2>

        {mode === "login" ? (
          <Login setToken={setToken} />
        ) : (
          <Register />
        )}

        <button
          className="auth-switch"
          onClick={() =>
            setMode(mode === "login" ? "register" : "login")
          }
        >
          {mode === "login"
            ? "Don’t have an account? Register"
            : "Already have an account? Login"}
        </button>
      </div>
    </div>
  );
}
