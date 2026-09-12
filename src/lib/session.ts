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

/// Le cookie de session est marque `Secure` des que le site tourne en
/// production — un navigateur refuse alors de le conserver sur une origine en
/// clair, et la connexion staff boucle sur elle-meme.
///
/// `COOKIE_NON_SECURISE=1` leve ce drapeau, uniquement pour une instance de
/// developpement servie en http sur une IP de LAN. **A ne jamais poser sur la
/// VM de production** : le jeton de session circulerait alors en clair.
function cookieSecurise(): boolean {
  if (process.env.COOKIE_NON_SECURISE === "1") return false;
  return process.env.NODE_ENV === "production";
}

export async function createSession(payload: SessionPayload) {
  const token = await new SignJWT({ ...payload })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(`${MAX_AGE}s`)
    .sign(secret());

  (await cookies()).set(COOKIE, token, {
    httpOnly: true,
    secure: cookieSecurise(),
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
