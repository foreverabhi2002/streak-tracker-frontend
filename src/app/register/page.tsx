"use client";

import { register } from "@/lib/api";
import { Eye, EyeOff } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function RegisterPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [username, setUsername] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await register(email, password, username);
      router.push("/");
    } catch (err: any) {
      setError(err.response?.data?.message || err.message);
    }
  };

  return (
    <div className="max-w-sm mx-auto mt-20 p-6 bg-background border border-border rounded-xl shadow-sm">
      <h1 className="text-2xl font-bold mb-2 text-center">Sign Up</h1>
      {/* <p className="text-xs text-muted-foreground text-center mb-6">
        * A random 6-character suffix will be added to your username. Buy premium to customize it freely!
      </p> */}
      {error && <div className="text-red-500 mb-4 text-sm text-center">{error}</div>}
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <div>
          <label className="block text-sm font-medium mb-1">Username</label>
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="w-full p-2 border border-border rounded-md bg-background focus:outline-none focus:ring-2 focus:ring-accent"
            placeholder="e.g. johndoe"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Email</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full p-2 border border-border rounded-md bg-background focus:outline-none focus:ring-2 focus:ring-accent"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Password</label>
          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full p-2 border border-border rounded-md bg-background focus:outline-none focus:ring-2 focus:ring-accent pr-10"
              required
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
            >
              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
        </div>
        <button type="submit" className="w-full py-2 px-4 bg-primary text-primary-foreground font-semibold rounded-md hover:opacity-90 transition-opacity mt-2">
          Create Account
        </button>
      </form>
      <div className="mt-6 text-sm text-center text-muted-foreground">
        <p>Already have an account? <Link href="/login" className="text-accent hover:underline">Log in</Link></p>
      </div>
    </div>
  );
}
