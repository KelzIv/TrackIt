import { useState } from "react";
import Auth from "./pages/Auth";
import MediaTracker from "./pages/MediaTracker";
import "./App.css";

function App() {
  // Initialize token from localStorage so refresh keeps login
  const [token, setToken] = useState(
    localStorage.getItem("token") || ""
  );

  return (
    <div>
      {!token ? (
        <Auth setToken={setToken} />
      ) : (
        <MediaTracker token={token} setToken={setToken} />
      )}
    </div>
  );
}

export default App;
