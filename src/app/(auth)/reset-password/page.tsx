"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import type { FormEvent} from "react";
import { useState } from "react";
import { apiRequest, ApiClientError } from "@/lib/api/client";
import Button from "@/components/ui/Button";

export default function ResetPasswordPage() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPending(true); setError(""); setMessage("");
    try {
      if (token) {
        const response = await apiRequest<{ message: string }>("/api/auth/password-reset/confirm", { method: "POST", body: JSON.stringify({ token, password }) });
        setMessage(response.message);
      } else {
        const response = await apiRequest<{ message: string }>("/api/auth/password-reset/request", { method: "POST", body: JSON.stringify({ email }) });
        setMessage(response.message);
      }
    } catch (caught) {
      setError(caught instanceof ApiClientError ? caught.message : "We could not complete that request. Please try again.");
    } finally { setPending(false); }
  }

  return <main className="mx-auto flex min-h-[70vh] w-full max-w-md items-center px-4 py-12"><section className="w-full rounded-xl border border-gray-200 bg-white p-6">
    <h1 className="text-2xl font-semibold text-gray-900">{token ? "Set a new password" : "Reset your password"}</h1>
    <p className="mt-2 text-sm text-gray-600">{token ? "Choose a new password with at least eight characters, an uppercase letter, and a number." : "Enter your email and we’ll send a reset link if an account exists."}</p>
    <form className="mt-6 space-y-4" onSubmit={submit}>
      {!token ? <label className="block text-sm font-medium text-gray-700" htmlFor="reset-email">Email<input id="reset-email" required type="email" value={email} onChange={(event) => setEmail(event.target.value)} className="mt-1 min-h-11 w-full rounded-lg border border-gray-300 px-3" /></label> : <label className="block text-sm font-medium text-gray-700" htmlFor="reset-password">New password<input id="reset-password" required type="password" value={password} onChange={(event) => setPassword(event.target.value)} className="mt-1 min-h-11 w-full rounded-lg border border-gray-300 px-3" /></label>}
      {error && <p role="alert" className="text-sm text-red-700">{error}</p>}
      {message && <p role="status" className="text-sm text-green-700">{message}</p>}
      <Button type="submit" fullWidth loading={pending}>{token ? "Save password" : "Send reset link"}</Button>
    </form>
    <Link className="mt-5 inline-flex min-h-11 items-center text-sm text-gray-700 underline" href="/login">Back to sign in</Link>
  </section></main>;
}
