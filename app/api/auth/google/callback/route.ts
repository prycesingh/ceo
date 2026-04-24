import { createMoodleUser, enrollUser, getUserByEmail } from "@/lib/moodle";
import { createSession } from "@/lib/session";
import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";

const courseIds = (process.env.MOODLE_COURSE_IDS ?? "")
  .split(",")
  .map((s) => parseInt(s.trim(), 10))
  .filter(Boolean);

function getGoogleRedirectUri(req: NextRequest) {
  const explicitUri = process.env.GOOGLE_REDIRECT_URI?.trim();
  if (explicitUri) return explicitUri;

  const appUrl = process.env.APP_URL?.trim().replace(/\/$/, "");
  const origin = appUrl || req.nextUrl.origin;
  return `${origin}/api/auth/google/callback`;
}

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl;
  const code = searchParams.get("code");
  const state = searchParams.get("state");
  const error = searchParams.get("error");

  // User denied access
  if (error) {
    return NextResponse.redirect(
      new URL("/login?error=google_denied", req.nextUrl),
    );
  }

  // Verify CSRF state
  const cookieStore = await cookies();
  const savedState = cookieStore.get("google_oauth_state")?.value;
  cookieStore.delete("google_oauth_state");

  if (!code || !state || state !== savedState) {
    return NextResponse.redirect(
      new URL("/login?error=invalid_state", req.nextUrl),
    );
  }

  try {
    // Exchange code for access token
    const tokenRes = await fetch("https://oauth2.googleapis.com/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        client_id: process.env.GOOGLE_CLIENT_ID!,
        client_secret: process.env.GOOGLE_CLIENT_SECRET!,
        code,
        grant_type: "authorization_code",
        redirect_uri: getGoogleRedirectUri(req),
      }),
    });

    const tokenData = await tokenRes.json();
    if (!tokenData.access_token) {
      return NextResponse.redirect(
        new URL("/login?error=token_failed", req.nextUrl),
      );
    }

    // Get Google user profile
    const profileRes = await fetch(
      "https://www.googleapis.com/oauth2/v2/userinfo",
      {
        headers: { Authorization: `Bearer ${tokenData.access_token}` },
      },
    );
    const profile = await profileRes.json();
    const { email, given_name, family_name, name } = profile;

    if (!email) {
      return NextResponse.redirect(
        new URL("/login?error=no_email", req.nextUrl),
      );
    }

    // Find or create Moodle user
    let moodleUser = await getUserByEmail(email);

    if (!moodleUser) {
      // Generate a secure random password — user will always sign in via Google
      const randomPassword = `Itbd@${crypto.randomUUID().replace(/-/g, "").slice(0, 12)}1`;
      moodleUser = await createMoodleUser(
        given_name || name?.split(" ")[0] || "User",
        family_name || name?.split(" ").slice(1).join(" ") || "User",
        email,
        randomPassword,
      );
    }

    // Enroll in all configured courses
    for (const courseId of courseIds) {
      try {
        await enrollUser(moodleUser.id, courseId);
      } catch {
        // Already enrolled — safe to ignore
      }
    }

    // Create session
    await createSession(
      moodleUser.id,
      moodleUser.fullname || name || email,
      email,
    );

    return NextResponse.redirect(new URL("/feed", req.nextUrl));
  } catch (err) {
    console.error("Google OAuth error:", err);
    return NextResponse.redirect(
      new URL("/login?error=oauth_failed", req.nextUrl),
    );
  }
}
