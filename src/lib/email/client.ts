import { Resend } from "resend";

function getClient() {
  const key = process.env.RESEND_API_KEY;
  if (!key) return null;
  return new Resend(key);
}

export async function enviarEmail({
  to,
  subject,
  html,
  text,
}: {
  to: string | string[];
  subject: string;
  html: string;
  text?: string;
}) {
  const resend = getClient();
  if (!resend) {
    console.warn("[email] RESEND_API_KEY ausente, e-mail não enviado:", subject);
    return { error: { message: "RESEND_API_KEY ausente" } } as const;
  }

  return await resend.emails.send({
    from: process.env.RESEND_FROM_EMAIL ?? "erp@anomalohub.com",
    to,
    subject,
    html,
    text,
  });
}
