import { useNavigate } from "react-router-dom";
import { logoutUser } from "../services/api"; // make sure path is correct

const LogoutButton = () => {
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await logoutUser(); // call your backend logout endpoint
    } finally {
      localStorage.removeItem("token"); // remove token from client
      navigate("/login"); // SPA-style navigation to login page
    }
  };

  return <button onClick={handleLogout}>Logout</button>;
};

export default LogoutButton;
