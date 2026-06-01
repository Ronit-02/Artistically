"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAppStore } from "@/store/useAppStore";
import Button from "@/components/ui/Button";
import Logo from "@/components/ui/Logo";
import type { UserRole } from "@/types";

export default function LoginPage() {
  const router = useRouter();
  const { login } = useAppStore();
  const [mode, setMode] = useState<"login" | "signup">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [role, setRole] = useState<UserRole>("collector");
  const [error, setError] = useState("");

  const handleSubmit = () => {
    if (!email || !password) { setError("Please fill in all fields."); return; }
    if (mode === "signup" && !name) { setError("Please enter your name."); return; }
    login(email, password, role);
    router.push(role === "artist" ? "/artist-portal" : "/");
  };

  const inputClass = "w-full border border-gray-200 rounded-lg px-4 py-3 text-sm text-gray-700 outline-none focus:border-gray-400 focus:ring-2 focus:ring-gray-100 transition-all";

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="flex justify-center mb-3">
            <Logo size={40} />
          </div>
          <p className="text-sm text-gray-500">
            {mode === "login" ? "Welcome back" : "Create your account"}
          </p>
        </div>

        {/* Tabs */}
        <div className="flex bg-gray-100 rounded-xl p-1 mb-6">
          {(["login", "signup"] as const).map((m) => (
            <button
              key={m}
              onClick={() => { setMode(m); setError(""); }}
              className={`flex-1 py-2.5 text-sm font-medium rounded-lg transition-all capitalize border-none cursor-pointer ${
                mode === m ? "bg-white text-gray-900 shadow-sm" : "text-gray-500 bg-transparent"
              }`}
            >
              {m === "login" ? "Sign In" : "Sign Up"}
            </button>
          ))}
        </div>

        {/* Role selector (signup only) */}
        {mode === "signup" && (
          <div className="mb-5">
            <p className="text-xs font-medium text-gray-600 mb-2">I want to join as</p>
            <div className="grid grid-cols-2 gap-3">
              {([
                { value: "collector", label: "Collector", desc: "Browse & buy art", icon: "M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" },
                { value: "artist", label: "Artist", desc: "Sell your artworks", icon: "M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" },
              ] as const).map((opt) => (
                <button
                  key={opt.value}
                  onClick={() => setRole(opt.value)}
                  className={`flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all cursor-pointer bg-transparent ${
                    role === opt.value
                      ? "border-gray-900 bg-gray-50"
                      : "border-gray-100 hover:border-gray-200"
                  }`}
                >
                  <svg className={`w-6 h-6 ${role === opt.value ? "text-[#111]" : "text-gray-400"}`} fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d={opt.icon} />
                  </svg>
                  <span className={`text-sm font-medium ${role === opt.value ? "text-[#111]" : "text-gray-700"}`}>{opt.label}</span>
                  <span className="text-[11px] text-gray-400">{opt.desc}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        <div className="space-y-3">
          {mode === "signup" && (
            <input type="text" placeholder="Full Name" value={name} onChange={(e) => setName(e.target.value)} className={inputClass} />
          )}
          <input type="email" placeholder="Email address" value={email} onChange={(e) => setEmail(e.target.value)} className={inputClass} />
          <input type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} className={inputClass} />
        </div>

        {error && <p className="text-sm text-red-500 mt-3">{error}</p>}

        {mode === "login" && (
          <div className="text-right mt-2">
            <button className="text-xs text-[#111] hover:underline bg-transparent border-none cursor-pointer p-0">
              Forgot password?
            </button>
          </div>
        )}

        <Button variant="primary" fullWidth onClick={handleSubmit} className="mt-5">
          {mode === "login" ? "Sign In" : "Create Account"}
        </Button>

        <p className="text-center text-sm text-gray-500 mt-4">
          {mode === "login" ? "Don't have an account? " : "Already have an account? "}
          <button onClick={() => setMode(mode === "login" ? "signup" : "login")} className="text-[#111] font-medium hover:underline bg-transparent border-none cursor-pointer p-0">
            {mode === "login" ? "Sign up" : "Sign in"}
          </button>
        </p>

        <div className="mt-6 text-center">
          <Link href="/" className="text-sm text-gray-400 hover:text-gray-600 transition-colors">← Back to Home</Link>
        </div>
      </div>
    </div>
  );
}
