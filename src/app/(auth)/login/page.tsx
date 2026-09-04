"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import { useAppStore } from "@/store/useAppStore";
import { login as loginApi, register as registerApi } from "@/lib/api/auth";
import { authKeys } from "@/hooks/useCurrentUser";
import { cartKeys } from "@/hooks/useCart";
import { wishlistKeys } from "@/hooks/useWishlist";
import { ApiClientError } from "@/lib/api/client";
import Button from "@/components/ui/Button";
import Logo from "@/components/ui/Logo";
import type { UserRole } from "@/types";

export default function LoginPage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { setAuthUser } = useAppStore();
  const [mode, setMode] = useState<"login" | "signup">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [role, setRole] = useState<UserRole>("collector");
  const [error, setError] = useState("");
  const [fieldErrors, setFieldErrors] = useState<Record<string, string[]>>({});

  const handleSubmit = async () => {
    setFieldErrors({});
    if (!email || !password) { setError("Please fill in all fields."); return; }
    if (mode === "signup" && !name) { setError("Please enter your name."); return; }
    setError("");
    try {
      const [firstName, ...lastNameParts] = name.trim().split(/\s+/);
      const user = mode === "login"
        ? await loginApi({ email, password })
        : await registerApi({ email, password, firstName, lastName: lastNameParts.join(" ") || firstName });
      setAuthUser({
        id: user.id,
        email: user.email,
        name: `${user.firstName} ${user.lastName}`.trim(),
        role: user.role === "ARTIST" ? "artist" : "collector",
      });
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: authKeys.currentUser }),
        queryClient.invalidateQueries({ queryKey: cartKeys.all }),
        queryClient.invalidateQueries({ queryKey: wishlistKeys.all }),
      ]);
      router.push(user.role === "ARTIST" ? "/artist-portal" : "/");
    } catch (err) {
      if (err instanceof ApiClientError) {
        setError(err.message);
        setFieldErrors(err.fields ?? {});
      } else {
        setError("Unable to complete sign in. Please try again.");
      }
    }
  };

  const fieldLabels: Record<string, string> = {
    email: "Email",
    password: "Password",
    firstName: "First name",
    lastName: "Last name",
  };
  const fieldErrorMessages = Object.entries(fieldErrors).flatMap(([field, messages]) =>
    messages.map((message) => `${fieldLabels[field] ?? field}: ${message}`),
  );

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
              type="button"
              aria-pressed={mode === m}
              onClick={() => { setMode(m); setError(""); setFieldErrors({}); }}
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
                  type="button"
                  aria-pressed={role === opt.value}
                  onClick={() => setRole(opt.value)}
                  className={`flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all cursor-pointer bg-transparent ${
                    role === opt.value
                      ? "border-gray-900 bg-gray-50"
                      : "border-gray-100 hover:border-gray-200"
                  }`}
                >
                  <svg className={`w-6 h-6 ${role === opt.value ? "text-[#111]" : "text-gray-500"}`} fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d={opt.icon} />
                  </svg>
                  <span className={`text-sm font-medium ${role === opt.value ? "text-[#111]" : "text-gray-700"}`}>{opt.label}</span>
                  <span className="text-[12px] text-gray-500">{opt.desc}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        <form onSubmit={(event) => { event.preventDefault(); void handleSubmit(); }}>
        <div className="space-y-3">
          {mode === "signup" && (
            <>
              <label htmlFor="auth-name" className="sr-only">Full name</label>
              <input id="auth-name" type="text" placeholder="Full Name" value={name} onChange={(e) => setName(e.target.value)} className={inputClass} />
            </>
          )}
          <label htmlFor="auth-email" className="sr-only">Email address</label>
          <input id="auth-email" type="email" placeholder="Email address" value={email} onChange={(e) => setEmail(e.target.value)} className={inputClass} />
          <label htmlFor="auth-password" className="sr-only">Password</label>
          <input id="auth-password" type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} className={inputClass} />
        </div>

        {mode === "signup" && (
          <p className="text-xs text-gray-500 mt-2">Use at least 8 characters, including one uppercase letter and one number.</p>
        )}

        {(error || fieldErrorMessages.length > 0) && (
          <div role="alert" className="text-sm text-red-500 mt-3 space-y-1">
            {error && <p>{error}</p>}
            {fieldErrorMessages.map((message) => <p key={message}>{message}</p>)}
          </div>
        )}

        {mode === "login" && (
          <div className="text-right mt-2">
            <Link href="/contact" className="text-[13px] text-[#111] hover:underline">Need help signing in?</Link>
          </div>
        )}

        <Button type="submit" variant="primary" fullWidth className="mt-5">
          {mode === "login" ? "Sign In" : "Create Account"}
        </Button>
        </form>

        <p className="text-center text-sm text-gray-500 mt-4">
          {mode === "login" ? "Don't have an account? " : "Already have an account? "}
           <button type="button" onClick={() => setMode(mode === "login" ? "signup" : "login")} className="inline-flex min-h-11 items-center text-[#111] font-medium hover:underline bg-transparent border-none cursor-pointer p-0">
            {mode === "login" ? "Sign up" : "Sign in"}
          </button>
        </p>

        <div className="mt-6 text-center">
          <Link href="/" className="text-sm text-gray-500 hover:text-gray-600 transition-colors">← Back to Home</Link>
        </div>
      </div>
    </div>
  );
}
