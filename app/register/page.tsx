"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function RegisterPage() {
  const router = useRouter();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();

    if (!name || !email || !password) {
      alert("Please fill in all fields.");
      return;
    }

    // Get existing users
    const users = JSON.parse(localStorage.getItem("users") || "[]");

    // Check if email already exists
    const existingUser = users.find(
      (user: any) => user.email === email
    );

    if (existingUser) {
      alert("An account with this email already exists.");
      return;
    }

    // Add new user
    users.push({
      name,
      email,
      password,
    });

    // Save users
    localStorage.setItem("users", JSON.stringify(users));

    alert("Registration successful!");

    // Redirect to Login
    window.location.href = "/login";
  };

  return (
    <div className="max-w-md mx-auto py-32 px-6">
      <h1 className="text-4xl font-bold text-pink-600 mb-8 text-center">
        Register
      </h1>

      <form onSubmit={handleRegister} className="space-y-5">

        {/* Full Name */}
        <input
          type="text"
          placeholder="Full Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full border rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-pink-500"
        />

        {/* Email */}
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full border rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-pink-500"
        />

        {/* Password */}
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full border rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-pink-500"
        />

        {/* Register Button */}
        <button
          type="submit"
          className="w-full bg-pink-600 text-white py-3 rounded-lg hover:bg-pink-700 transition"
        >
          Create Account
        </button>
      </form>

      {/* Login Link */}
      <p className="text-center mt-6 text-gray-600">
        Already have an account?{" "}
        <Link
          href="/login"
          className="text-pink-600 font-semibold hover:underline"
        >
          Login
        </Link>
      </p>
    </div>
  );
}