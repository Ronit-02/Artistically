import { serverEnv } from "@/lib/env";

export type TransactionalEmail = { to: string; subject: string; body: string; eventKey: string };

/** Project-owned email boundary. Configure EMAIL_WEBHOOK_URL for the deployed provider. */
export async function deliverTransactionalEmail(email: TransactionalEmail) {
  if (!serverEnv.EMAIL_WEBHOOK_URL) return { delivered: false as const, reason: "provider_not_configured" as const };
  const response = await fetch(serverEnv.EMAIL_WEBHOOK_URL, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(email),
  });
  if (!response.ok) throw new Error(`Email provider returned ${response.status}`);
  return { delivered: true as const };
}
