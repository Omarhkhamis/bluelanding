import "server-only";

import crypto from "node:crypto";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { getAdminAuthUserByEmail, getAdminAuthUserById } from "@/lib/cms";

const SESSION_COOKIE = "bm_admin_session";

function getSecret() {
  return process.env.ADMIN_SESSION_SECRET || "bm-dashboard-dev-secret";
}

function sign(value: string) {
  return crypto.createHmac("sha256", getSecret()).update(value).digest("hex");
}

function encodeSession(userId: number) {
  const payload = String(userId);
  return `${payload}.${sign(payload)}`;
}

function decodeSession(value: string | undefined) {
  if (!value) {
    return null;
  }

  const [userId, signature] = value.split(".");
  if (!userId || !signature) {
    return null;
  }

  if (sign(userId) !== signature) {
    return null;
  }

  const parsedId = Number(userId);
  if (!Number.isInteger(parsedId) || parsedId <= 0) {
    return null;
  }

  return parsedId;
}

export async function createAdminSession(userId: number) {
  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE, encodeSession(userId), {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 12
  });
}

export async function clearAdminSession() {
  const cookieStore = await cookies();
  cookieStore.delete(SESSION_COOKIE);
}

export async function getCurrentAdminUser() {
  const cookieStore = await cookies();
  const userId = decodeSession(cookieStore.get(SESSION_COOKIE)?.value);

  if (!userId) {
    return null;
  }

  const user = await getAdminAuthUserById(userId);

  if (!user?.isActive) {
    await clearAdminSession();
    return null;
  }

  return user;
}

export async function requireAdminUser() {
  const user = await getCurrentAdminUser();

  if (!user) {
    redirect("/admin/login");
  }

  return user;
}

export async function authenticateAdmin(email: string, password: string) {
  const admin = await getAdminAuthUserByEmail(email);

  if (!admin || !admin.isActive) {
    return null;
  }

  const bcrypt = await import("bcryptjs");
  const isValid = bcrypt.compareSync(password, admin.passwordHash);

  if (!isValid) {
    return null;
  }

  return admin;
}
