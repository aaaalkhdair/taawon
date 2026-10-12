import "server-only";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { SignJWT, jwtVerify } from "jose";
import { eq } from "drizzle-orm";
import { db, schema } from "@/db";
import type { Role, User } from "@/db/schema";

const COOKIE = "taawon_session";
const secret = new TextEncoder().encode(
  process.env.AUTH_SECRET ?? "taawon-dev-secret-change-me-in-production-please"
);

type SessionPayload = { uid: string; role: Role };

export async function createSession(user: Pick<User, "id" | "role">) {
  const token = await new SignJWT({ uid: user.id, role: user.role } satisfies SessionPayload)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("7d")
    .sign(secret);
  const jar = await cookies();
  jar.set(COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 7,
  });
}

export async function destroySession() {
  const jar = await cookies();
  jar.delete(COOKIE);
  jar.delete("active_child");
}

async function readSession(): Promise<SessionPayload | null> {
  const jar = await cookies();
  const token = jar.get(COOKIE)?.value;
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, secret);
    return payload as unknown as SessionPayload;
  } catch {
    return null;
  }
}

/** Returns the logged-in user or null. */
export async function getCurrentUser(): Promise<User | null> {
  const s = await readSession();
  if (!s) return null;
  const user = await db.query.users.findFirst({ where: eq(schema.users.id, s.uid) });
  return user ?? null;
}

export function homeFor(role: Role) {
  return role === "admin" ? "/admin" : role === "specialist" ? "/specialist" : "/parent";
}

/** Ensures a logged-in user with one of the given roles, otherwise redirects. */
export async function requireUser(...roles: Role[]): Promise<User> {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  if (roles.length && !roles.includes(user.role)) redirect(homeFor(user.role));
  return user;
}
