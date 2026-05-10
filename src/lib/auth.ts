import { SignJWT, jwtVerify } from "jose";
import bcrypt from "bcryptjs";
import { cookies } from "next/headers";
import { prisma } from "@/lib/db";

// ========== CONFIG ==========

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || "fallback-dev-secret-change-in-production",
);
const SESSION_COOKIE = "session_token";
const SESSION_MAX_AGE = 60 * 60 * 24 * 7; // 7 days in seconds

// ========== TYPES ==========

export type SessionUser = {
  id: string;
  email: string;
  role: string;
  full_name: string | null;
};

// ========== JWT ==========

export async function createSessionToken(user: SessionUser): Promise<string> {
  return new SignJWT({
    id: user.id,
    email: user.email,
    role: user.role,
    full_name: user.full_name,
  })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(`${SESSION_MAX_AGE}s`)
    .sign(JWT_SECRET);
}

export async function verifySessionToken(
  token: string,
): Promise<SessionUser | null> {
  try {
    const { payload } = await jwtVerify(token, JWT_SECRET);
    return {
      id: payload.id as string,
      email: payload.email as string,
      role: payload.role as string,
      full_name: (payload.full_name as string) || null,
    };
  } catch {
    return null;
  }
}

// ========== COOKIE MANAGEMENT ==========

export async function setSessionCookie(token: string) {
  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: SESSION_MAX_AGE,
    path: "/",
  });
}

export async function clearSessionCookie() {
  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE, "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 0,
    path: "/",
  });
}

export async function getSessionToken(): Promise<string | null> {
  const cookieStore = await cookies();
  return cookieStore.get(SESSION_COOKIE)?.value || null;
}

// ========== GET CURRENT USER ==========

/** Get the current logged-in user from the session cookie (server-side) */
export async function getUser(): Promise<SessionUser | null> {
  const token = await getSessionToken();
  if (!token) return null;
  return verifySessionToken(token);
}

/** Get the current user, or throw redirect (for protected pages) */
export async function requireUser(): Promise<SessionUser> {
  const user = await getUser();
  if (!user) {
    // We use dynamic import to avoid circular dependency issues
    const { redirect } = await import("next/navigation");
    redirect("/login");
    return null as never;
  }
  return user;
}

/** Get the current admin user, or throw redirect */
export async function requireAdmin(): Promise<SessionUser> {
  const user = await getUser();
  if (!user) {
    const { redirect } = await import("next/navigation");
    redirect("/admin-login");
    return null as never;
  }
  if (user.role !== "admin") {
    const { redirect } = await import("next/navigation");
    redirect(
      `/admin-login?error=not_admin&email=${encodeURIComponent(user.email)}`,
    );
    return null as never;
  }
  return user;
}

// ========== PASSWORD HASHING (Admin) ==========

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 12);
}

export async function verifyPassword(
  password: string,
  hash: string,
): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

// ========== OTP MANAGEMENT ==========

const OTP_LENGTH = 6;
const OTP_EXPIRY_MINUTES = 10;

export function generateOtpCode(): string {
  // Generate a random N-digit code
  const min = Math.pow(10, OTP_LENGTH - 1);
  const max = Math.pow(10, OTP_LENGTH) - 1;
  return String(Math.floor(Math.random() * (max - min + 1)) + min);
}

export async function createOtp(email: string): Promise<string> {
  const code = generateOtpCode();
  const expiresAt = new Date(Date.now() + OTP_EXPIRY_MINUTES * 60 * 1000);

  // Invalidate any existing OTPs for this email
  await prisma.otpCode.updateMany({
    where: { email, used: false },
    data: { used: true },
  });

  // Create new OTP
  await prisma.otpCode.create({
    data: {
      email,
      code,
      expires_at: expiresAt,
    },
  });

  return code;
}

export async function verifyOtp(
  email: string,
  code: string,
): Promise<boolean> {
  const otp = await prisma.otpCode.findFirst({
    where: {
      email,
      code,
      used: false,
      expires_at: { gt: new Date() },
    },
    orderBy: { created_at: "desc" },
  });

  if (!otp) return false;

  // Mark as used
  await prisma.otpCode.update({
    where: { id: otp.id },
    data: { used: true },
  });

  return true;
}

// ========== USER UPSERT (for OTP sign-in) ==========

/** Find or create a user by email (for client OTP login) */
export async function findOrCreateUser(email: string) {
  let user = await prisma.user.findUnique({ where: { email } });

  if (!user) {
    user = await prisma.user.create({
      data: {
        email,
        role: "client",
      },
    });
  }

  return user;
}

/** Sign in user and set session cookie */
export async function signInUser(user: {
  id: string;
  email: string;
  role: string;
  full_name: string | null;
}): Promise<string> {
  const token = await createSessionToken({
    id: user.id,
    email: user.email,
    role: user.role,
    full_name: user.full_name,
  });
  await setSessionCookie(token);
  return token;
}
