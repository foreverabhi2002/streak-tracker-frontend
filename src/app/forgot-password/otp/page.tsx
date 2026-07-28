"use client";

import { PageLoader } from "@/components/PageLoader";
import { verifyOTP } from "@/lib/api";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";

function OTPForm() {
  const [code, setCode] = useState("");
  const [error, setError] = useState("");
  const router = useRouter();
  const searchParams = useSearchParams();
  const email = searchParams.get("email");

  useEffect(() => {
    if (!email) router.push("/forgot-password");
  }, [email, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    try {
      const token = await verifyOTP(email, code);
      router.push(`/forgot-password/reset?email=${encodeURIComponent(email)}&token=${encodeURIComponent(token)}`);
    } catch (err: any) {
      setError(err.response?.data?.message || err.message);
    }
  };

  return (
    <div className="max-w-sm mx-auto mt-20 p-6 bg-background border border-border rounded-xl shadow-sm">
      <h1 className="text-2xl font-bold mb-2 text-center">Enter OTP</h1>
      <p className="text-sm text-muted-foreground text-center mb-6">
        Enter the 6-digit code sent to {email}
      </p>
      {error && <div className="text-red-500 mb-4 text-sm text-center">{error}</div>}
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <div>
          <label className="block text-sm font-medium mb-1">OTP Code</label>
          <input
            type="text"
            value={code}
            onChange={(e) => setCode(e.target.value)}
            className="w-full p-2 border border-border rounded-md bg-background focus:outline-none focus:ring-2 focus:ring-accent text-center tracking-widest text-lg"
            maxLength={6}
            required
          />
        </div>
        <button type="submit" className="w-full py-2 px-4 bg-primary text-primary-foreground font-semibold rounded-md hover:opacity-90 transition-opacity mt-2">
          Verify OTP
        </button>
      </form>
    </div>
  );
}

export default function OTPPage() {
  return (
    <Suspense fallback={<PageLoader />}>
      <OTPForm />
    </Suspense>
  );
}
