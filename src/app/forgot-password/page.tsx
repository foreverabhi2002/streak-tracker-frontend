"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { requestOTP } from "@/lib/api";
import Link from "next/link";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await requestOTP(email);
      // In a real app, send the email in state or query param
      router.push(`/forgot-password/otp?email=${encodeURIComponent(email)}`);
    } catch (err: any) {
      setError(err.response?.data?.message || err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-sm mx-auto mt-20 p-6 bg-background border border-border rounded-xl shadow-sm">
      <h1 className="text-2xl font-bold mb-2 text-center">Forgot Password</h1>
      <p className="text-sm text-muted-foreground text-center mb-6">
        Enter your email address and we'll send you a 6-digit OTP.
      </p>
      {error && <div className="text-red-500 mb-4 text-sm text-center">{error}</div>}
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
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
        <button type="submit" disabled={loading} className="w-full py-2 px-4 bg-primary text-primary-foreground font-semibold rounded-md hover:opacity-90 transition-opacity mt-2 disabled:opacity-50">
          {loading ? "Sending..." : "Send OTP"}
        </button>
      </form>
      <div className="mt-6 text-sm text-center text-muted-foreground">
        <Link href="/login" className="hover:text-foreground hover:underline">Back to Login</Link>
      </div>
    </div>
  );
}
