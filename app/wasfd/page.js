"use client";
import React, { useState } from "react";

const Login = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    alert(`Username: ${username}, Password: ${password}`);
  };

  return (
    <div
      style={{
        maxWidth: "300px",
        margin: "0 auto",
        padding: "1em",
        border: "1px solid #ccc",
        borderRadius: "5px",
      }}
    >
      <h2>Login</h2>
      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: "1em" }}>
          <label
            htmlFor="username"
            style={{ display: "block", marginBottom: ".5em" }}
          >
            Username
          </label>
          <input
            type="text"
            id="username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            style={{ width: "100%", padding: ".5em", boxSizing: "border-box" }}
          />
        </div>
        <div style={{ marginBottom: "1em" }}>
          <label
            htmlFor="password"
            style={{ display: "block", marginBottom: ".5em" }}
          >
            Password
          </label>
          <input
            type="password"
            id="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            style={{ width: "100%", padding: ".5em", boxSizing: "border-box" }}
          />
        </div>
        <button
          type="submit"
          style={{
            width: "100%",
            padding: ".5em",
            backgroundColor: "#007BFF",
            color: "#fff",
            border: "none",
            borderRadius: "5px",
          }}
        >
          Login
        </button>
      </form>
    </div>
  );
};

export default Login;
