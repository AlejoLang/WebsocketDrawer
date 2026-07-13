import "./App.css";
import { Navigate, Route, Routes, useLocation } from "react-router-dom";
import CanvasRoomPage from "./pages/CanvasRoomPage.tsx";
import HomePage from "./pages/HomePage.tsx";
import LoginPage from "./pages/LoginPage.tsx";
import NavBar from "./components/NavBar.tsx";
import { useAuth } from "./context/userContext/index.tsx";

function App() {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!user && location.pathname !== "/login") {
    return <Navigate to="/login" replace />;
  }

  return (
    <div className="app">
      {location.pathname !== "/login" && <NavBar />}
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/room/:roomId" element={<CanvasRoomPage />} />
        <Route path="/login" element={<LoginPage />} />
      </Routes>
    </div>
  );
}

export default App;

