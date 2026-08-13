import { NextResponse, type NextRequest } from "next/server";
import { SESSION_COOKIE, decryptSession } from "@/lib/session-token";

// Rask forhåndssjekk som bare leser cookien. Den egentlige verifiseringen
// skjer i requireUser() i lib/dal.ts, som slår opp mot databasen.
export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const isLoginPage = pathname === "/login";

  const session = await decryptSession(
    request.cookies.get(SESSION_COOKIE)?.value,
  );

  if (
    !session &&
    !isLoginPage &&
    pathname !== "/personvern" &&
    pathname !== "/support"
  ) {
    return NextResponse.redirect(new URL("/login", request.nextUrl));
  }

  // Ikke redirect login → / her. Det skapte loop når cookien var gyldig JWT
  // men brukeren manglet/var inaktiv i DB (requireUser → /login → proxy → / …).
  // Innloggede brukere sendes videre fra selve login-siden i stedet.

  return NextResponse.next();
}

export const config = {
  // Statiske filer (logo, ikon, OneSignal service worker, …) skal ikke kreve innlogging
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|OneSignalSDKWorker\\.js|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)",
  ],
};
