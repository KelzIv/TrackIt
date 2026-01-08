// import { useState } from "react";
// import Login from "./Login";
// import Register from "./Register";
// import "./Auth.css";
// import { loginUser } from "../services/api";

// export default function Auth({ setToken }) {
//   const [mode, setMode] = useState("login"); // "login" | "register"
//    const handleLogin = async (e) => {
//     e.preventDefault();
//     try {
//       const data = await loginUser({ username, password });
//       const jwt = data.token; // your backend returns { token }
//       localStorage.setItem("token", jwt);
//       setToken(jwt); // tell App we’re logged in
//     } catch (err) {
//       console.error("Login failed", err);
//     }
//   return (
//     <div className="auth-container">
//       <div className="auth-card">
//         <h2>{mode === "login" ? "Welcome Back" : "Create Account"}</h2>

//         {mode === "login" ? (
//           <Login setToken={setToken} />
//         ) : (
//           <Register />
//         )}

//         <button
//           className="auth-switch"
//           onClick={() =>
//             setMode(mode === "login" ? "register" : "login")
//           }
//         >
//           {mode === "login"
//             ? "Don’t have an account? Register"
//             : "Already have an account? Login"}
//         </button>
//       </div>
//     </div>
//   );
// }
// }
import { useState } from "react";
import { loginUser, registerUser } from "../services/api";

export default function Auth({ setToken }) {
  
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [email, setEmail] = useState(""); 
  const [isLogin, setIsLogin] = useState(true); 
  const [error, setError] = useState("");

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    
    try {
      const data = await loginUser({ username, password });
      const jwt = data.token;
      localStorage.setItem("token", jwt);
      setToken(jwt);
    } catch (err) {
      setError(err.response?.data?.error || "Login failed");
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setError("");
    
    try {
      const data = await registerUser({ username, email, password });
      localStorage.setItem("token", data.token || data.user.token); 
      setToken(data.token || data.user.token);
    } catch (err) {
      setError(err.response?.data?.error || "Registration failed");
    }
  };

  return (
    <div className="auth-container">
      <h1>{isLogin ? "Login" : "Register"}</h1>
      
      {error && <p className="error">{error}</p>}
      
      <form onSubmit={isLogin ? handleLogin : handleRegister}>
        {!isLogin && (
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        )}
        
        <input
          type="text"
          placeholder="Username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          required
        />
        
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        
        <button type="submit">
          {isLogin ? "Login" : "Register"}
        </button>
      </form>
      
      <p>
        {isLogin ? "No account?" : "Have account?"}
        <button 
          type="button" 
          onClick={() => {
            setIsLogin(!isLogin);
            setError("");
          }}
        >
          {isLogin ? "Register" : "Login"}
        </button>
      </p>
    </div>
  );
}
