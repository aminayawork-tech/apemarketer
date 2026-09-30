"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";

export default function EnterPasswordPage() {
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    const res = await fetch("/api/verify-password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password }),
    });

    if (res.ok) {
      const { redirect } = await res.json();
      router.push(redirect || "/");
      router.refresh();
    } else {
      setError("Incorrect password. Try again.");
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-[#F2EDE4] flex flex-col items-center justify-center px-4">
      <div className="mb-8 flex items-center gap-3">
        <Image src="/logo.png" alt="Ape Marketer" width={40} height={40} />
        <span className="font-display font-extrabold text-2xl text-[#0D0D0D]">
          APE <span className="text-[#E05C0A]">MARKETER</span>
        </span>
      </div>

      <form
        onSubmit={handleSubmit}
        className="w-full max-w-xs bg-[#FDFAF6] border border-[#D0C4B8] rounded-xl p-8 flex flex-col gap-4"
      >
        <h1 className="font-display font-extrabold text-2xl text-[#0D0D0D] leading-none">
          ENTER <span className="text-[#E05C0A]">PASSWORD</span>
        </h1>
        <p className="text-[#6B5F57] text-sm">This site is password protected.</p>

        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Password"
          className="border border-[#D0C4B8] bg-white rounded px-3 py-2 text-[#0D0D0D] focus:outline-none focus:border-[#111111]"
          autoFocus
          required
        />

        {error && <p className="text-red-600 text-sm">{error}</p>}

        <button
          type="submit"
          disabled={loading}
          className="bg-[#111111] hover:bg-[#2a2a2a] text-[#F2EDE4] font-bold tracking-widest uppercase text-xs rounded py-3 disabled:opacity-50"
        >
          {loading ? "Checking..." : "Enter"}
        </button>
      </form>
    </div>
  );
}
