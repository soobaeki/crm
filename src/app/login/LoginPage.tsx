"use client";

import { useState } from "react";

export default function LoginPage() {
  const [adminName, setAdminName] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleLogin = async (e: { preventDefault: () => void }) => {
    e.preventDefault();
    const res = await fetch("/api/admin/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ adminName, password }),
    });
    const data = await res.json();
    if (data.success) {
      localStorage.setItem("token", data.token);
      window.location.href = "/dashboard";
    } else {
      setError(data.message);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-100">
      <form
        onSubmit={handleLogin}
        className="w-96 rounded bg-white p-8 shadow-md"
      >
        <h2 className="mb-4 text-2xl font-bold">Admin Login</h2>
        {error && <p className="mb-2 text-red-500">{error}</p>}
        <input
          type="text"
          placeholder="Admin Name"
          value={adminName}
          onChange={(e) => setAdminName(e.target.value)}
          className="mb-4 w-full rounded border p-2"
          required
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="mb-4 w-full rounded border p-2"
          required
        />
        <button className="w-full rounded bg-blue-600 p-2 text-white hover:bg-blue-700">
          Login
        </button>
      </form>
    </div>
  );
}
