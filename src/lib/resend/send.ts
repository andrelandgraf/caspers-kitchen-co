import { resend } from "./client";
import { resendConfig } from "./config";

type SendEmailParams = {
  to: string | string[];
  subject: string;
  react: React.ReactElement;
  from?: string;
};

export async function sendEmail({ to, subject, react, from }: SendEmailParams) {
  if (!resendConfig.server.apiKey) {
    console.warn("RESEND_API_KEY not configured - skipping email send to:", to);
    return null;
  }

  const { data, error } = await resend.emails.send({
    from: from ?? resendConfig.server.fromEmail,
    to: Array.isArray(to) ? to : [to],
    subject,
    react,
  });

  if (error) {
    throw new Error(`Failed to send email: ${error.message}`);
  }

  return data;
}
