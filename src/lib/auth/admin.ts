import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { auth } from "./server";

export type UserRole = "user" | "admin";

/**
 * Gets the current session and checks if the user is an admin.
 * Returns null if no session exists.
 */
export async function getAdminSession() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    return null;
  }

  const isAdmin = session.user.role === "admin";

  return {
    ...session,
    isAdmin,
  };
}

/**
 * Checks if the current user is an admin.
 * Returns false if no session exists.
 */
export async function isAdmin(): Promise<boolean> {
  const session = await getAdminSession();
  return session?.isAdmin ?? false;
}

/**
 * Requires admin access. Redirects to sign-in if not authenticated,
 * or to home if authenticated but not an admin.
 */
export async function requireAdmin(redirectTo = "/") {
  const session = await getAdminSession();

  if (!session) {
    redirect("/sign-in");
  }

  if (!session.isAdmin) {
    redirect(redirectTo);
  }

  return session;
}
