import React, { useState } from "react";
import Login from "./Login";
import Signup from "./Signup";

function App() {
  const [showLogin, setShowLogin] = useState(true);
  const [token, setToken] = useState(null);

  const handleLoginSuccess = (token) => {
    setToken(token);
    // Optional: localStorage.setItem('token', token);
  };

  const handleLogout = () => {
    setToken(null);
    // Optional: localStorage.removeItem('token');
  };

  return (
    <div style={{ maxWidth: 400, margin: "0 auto", padding: "1rem" }}>
      <h1>Hello, React App is Working!</h1>
      {!token ? (
        <>
          <div style={{ marginBottom: "1rem" }}>
            <button
              onClick={() => setShowLogin(true)}
              disabled={showLogin}
              style={{ marginRight: "0.5rem" }}
            >
              Login
            </button>
            <button onClick={() => setShowLogin(false)} disabled={!showLogin}>
              Sign Up
            </button>
          </div>
          {showLogin ? (
            <Login onLoginSuccess={handleLoginSuccess} />
          ) : (
            <Signup onSignupSuccess={handleLoginSuccess} />
          )}
        </>
      ) : (
        <div>
          <h2>Welcome! You are logged in.</h2>
          <button onClick={handleLogout}>Logout</button>
        </div>
      )}
    </div>
  );
}

export default App;
