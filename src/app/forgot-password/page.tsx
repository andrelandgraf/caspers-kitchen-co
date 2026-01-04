import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { auth } from "@/lib/auth/server";
import { ForgotPassword } from "@/components/auth/forgot-password";

export const metadata: Metadata = {
  title: "Forgot Password - Caspers Kitchen",
  description:
    "Reset your password by entering your email address. We'll send you a link to create a new one.",
};

export default async function ForgotPasswordPage() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (session) {
    redirect("/");
  }

  return (
    <main className="min-h-dvh flex items-center justify-center p-4 bg-gradient-to-br from-background via-background to-primary/5">
      <ForgotPassword />
    </main>
  );
}
