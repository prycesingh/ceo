import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";

function getGoogleRedirectUri(req: NextRequest) {
  const explicitUri = process.env.GOOGLE_REDIRECT_URI?.trim();
  if (explicitUri) return explicitUri;

  const appUrl = process.env.APP_URL?.trim().replace(/\/$/, "");
  const origin = appUrl || req.nextUrl.origin;
  return `${origin}/api/auth/google/callback`;
}

export async function GET(req: NextRequest) {
  const state = crypto.randomUUID();

  // Store state in cookie for CSRF verification in callback
  const cookieStore = await cookies();
  cookieStore.set("google_oauth_state", state, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 60 * 10, // 10 minutes
    path: "/",
  });

  const params = new URLSearchParams({
    client_id: process.env.GOOGLE_CLIENT_ID!,
    redirect_uri: getGoogleRedirectUri(req),
    response_type: "code",
    scope: "openid email profile",
    state,
    access_type: "online",
    prompt: "select_account",
  });

  return NextResponse.redirect(
    `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`,
  );
}
