import { useState } from "react";
import "./LoginPage.css";

function LoginPage() {
  const [showLoginForm, setShowLoginForm] = useState(true);

  const handleLogin = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const username = formData.get("username") as string;
    const password = formData.get("password") as string;

    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/user/login`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
          body: JSON.stringify({ username, password }),
        },
      );

      if (response.ok) {
        const data = await response.json();
        console.log("Login successful:", data);
        window.location.href = "/";
      } else {
        const error = await response.json();
        console.error("Login failed:", error);
        alert(error.error || "Login failed");
      }
    } catch (error) {
      console.error("Login error:", error);
      alert("An error occurred during login");
    }
  };

  const handleRegister = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const username = formData.get("username") as string;
    const password = formData.get("password") as string;

    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/user/register`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
          body: JSON.stringify({ username, password }),
        },
      );

      if (response.ok) {
        const data = await response.json();
        console.log("Registration successful:", data);
        setShowLoginForm(true);
      } else {
        const error = await response.json();
        console.error("Registration failed:", error);
        alert(error.error || "Registration failed");
      }
    } catch (error) {
      console.error("Registration error:", error);
      alert("An error occurred during registration");
    }
  };

  return (
    <div className="loginPage">
      {showLoginForm ? (
        <>
          <form
            className="loginForm"
            action={`${import.meta.env.VITE_API_URL}/user/login`}
            method="POST"
            onSubmit={handleLogin}
          >
            <h2>Login</h2>
            <input
              type="text"
              name="username"
              placeholder="Username"
              required
            />
            <input
              type="password"
              name="password"
              placeholder="Password"
              required
            />
            <button type="submit">Login</button>
          </form>
          <button onClick={() => setShowLoginForm(false)} className="switchFormButton">
            Don't have an account? Register
          </button>
        </>
      ) : (
        <>
        <form
          className="loginForm"
          action={`${import.meta.env.VITE_API_URL}/user/register`}
          method="POST"
          onSubmit={handleRegister}
        >
          <h2>Register</h2>
          <input type="text" name="username" placeholder="Username" required />
          <input
            type="password"
            name="password"
            placeholder="Password"
            required
          />
          <button type="submit">Register</button>
        </form>
        <button onClick={() => setShowLoginForm(true)} className="switchFormButton">
            Login
          </button>
        </>
      )}
    </div>
  );
}

export default LoginPage;

