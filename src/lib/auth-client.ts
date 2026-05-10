/**
 * Client-side auth utilities.
 * These functions call API endpoints since client components can't use
 * server-only modules like cookies() or prisma.
 */

export type ClientUser = {
  id: string;
  email: string;
  role: string;
  full_name: string | null;
};

/** Get the current user from the server (calls /api/auth/me) */
export async function getClientUser(): Promise<ClientUser | null> {
  try {
    const res = await fetch("/api/auth/me", {
      credentials: "include",
    });
    if (!res.ok) return null;
    const data = await res.json();
    return data.user || null;
  } catch {
    return null;
  }
}

/** Sign out (calls /api/auth/signout) */
export async function signOut(): Promise<void> {
  await fetch("/api/auth/signout", {
    method: "POST",
    credentials: "include",
  });
}
