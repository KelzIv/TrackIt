// src/App.js
import { useState } from "react";
import Auth from "./pages/Auth";
import MediaTracker from "./pages/MediaTracker";
import "./App.css";

function App() {
  const [token, setToken] = useState("");

  return (
    <div>
      {!token ? (
        <>
          <Auth setToken={setToken} />
        </>
      ) : (
        <MediaTracker token={token} />
      )}
    </div>
  );
}

export default App;
