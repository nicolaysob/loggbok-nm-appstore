import { NextResponse } from "next/server";
import { SESSION_COOKIE } from "@/lib/session-token";

/** Sletter ugyldig sesjonscookie og sender brukeren til innlogging. */
export async function GET(request: Request) {
  const url = new URL("/login", request.url);
  const response = NextResponse.redirect(url);
  response.cookies.set(SESSION_COOKIE, "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 0,
  });
  return response;
}
