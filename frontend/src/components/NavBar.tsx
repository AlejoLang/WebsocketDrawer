import "./NavBar.css";
import { useLocation, useNavigate } from "react-router-dom";

function NavBar() {
  const navigate = useNavigate();
  const location = useLocation();
  const handleLogout = async () => {
    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/user/logout`,
        {
          method: "POST",
          credentials: "include",
        },
      );

      if (response.ok) {
        navigate("/login");
      } else {
        console.error("Logout failed");
      }
    } catch (error) {
      console.error("Error during logout:", error);
    }
  };
  return (
    <nav className="navbar">
      <div className="navbarLeft">
        {location.pathname !== "/" && (
          <a href="/" className="homeLink">
            Home
          </a>
        )}
      </div>
      <div className="navbarRight">
        <button className="logoutButton" onClick={handleLogout}>
          Logout
        </button>
      </div>
    </nav>
  );
}

export default NavBar;

