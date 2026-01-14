import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { auth } from "@/lib/auth/server";
import { SignIn } from "@/components/auth/sign-in";

export const metadata: Metadata = {
  title: "Sign In - Caspers Kitchen",
  description: "Sign in to your Caspers Kitchen account.",
};

export default async function SignInPage() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (session) {
    redirect("/menu");
  }

  return (
    <main className="min-h-dvh flex items-center justify-center p-4 bg-gradient-to-br from-background via-background to-primary/5">
      <SignIn />
    </main>
  );
}
