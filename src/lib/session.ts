import { cookies } from "next/headers";
import { SignJWT, jwtVerify } from "jose";

const COOKIE = "omerta_staff_session";
const MAX_AGE = 60 * 60 * 8; // 8 heures

export type SessionPayload = {
  userId: string;
  username: string;
  role: string;
};

function secret() {
  const value = process.env.SESSION_SECRET;
  if (!value || value.length < 32) {
    throw new Error(
      "SESSION_SECRET manquant ou trop court (32 caracteres minimum). Voir .env.example.",
    );
  }
  return new TextEncoder().encode(value);
}

export async function createSession(payload: SessionPayload) {
  const token = await new SignJWT({ ...payload })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(`${MAX_AGE}s`)
    .sign(secret());

  (await cookies()).set(COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: MAX_AGE,
  });
}

export async function getSession(): Promise<SessionPayload | null> {
  const token = (await cookies()).get(COOKIE)?.value;
  if (!token) return null;

  try {
    const { payload } = await jwtVerify(token, secret());
    return {
      userId: String(payload.userId),
      username: String(payload.username),
      role: String(payload.role),
    };
  } catch {
    return null;
  }
}

export async function destroySession() {
  (await cookies()).delete(COOKIE);
}
